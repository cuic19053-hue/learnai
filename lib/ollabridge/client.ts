/**
 * OllaBridge Cloud client — single source of truth for hitting the
 * real OllaBridge FastAPI surface.
 *
 * Canonical host : https://api.ollabridge.com  (DNS alias once bound)
 * Live fallback  : https://ruslanmv-ollabridge.hf.space
 * Local install  : http://localhost:11435      (same contract)
 *
 * Both `/v1/*` and `/ollama/v1/*` resolve to the OpenAI-compatible
 * surface; we prefer `/v1` for clarity. The Space wakes lazily —
 * the first request after idle commonly takes ~10 s, which we
 * surface to callers as a recoverable "warming up" signal.
 *
 * Server-only so admin device-pairing flows stay off the browser
 * (the device_token issued at pair time is a sensitive credential
 * we never want shipped to the client).
 */

import "server-only";

// ─── Config ─────────────────────────────────────────────────────────

export type OllabridgeConfig = {
  /** Canonical base URL. Strip the trailing slash if present. */
  baseUrl: string;
  /** Reachable fallback when the canonical host isn't DNS-bound yet. */
  baseUrlFallback?: string;
  /** Optional device token issued by the pairing flow. */
  deviceToken?: string;
  /** Identifies the calling product for telemetry segmentation. */
  clientType?: string;
  /** Scopes relay/GPU routing to a specific user's devices. */
  userId?: string;
  /** Per-request timeout. Default 25 s — generous to ride out cold-start. */
  timeoutMs?: number;
};

export const DEFAULT_CONFIG: OllabridgeConfig = {
  baseUrl: process.env.OLLABRIDGE_URL?.trim() || "https://api.ollabridge.com",
  baseUrlFallback: "https://ruslanmv-ollabridge.hf.space",
  clientType: "learnai-server",
  timeoutMs: 25_000,
};

function resolveBase(c: OllabridgeConfig): string {
  return (c.baseUrl || c.baseUrlFallback || DEFAULT_CONFIG.baseUrlFallback!).replace(/\/+$/, "");
}

function fallbackBase(c: OllabridgeConfig): string | undefined {
  return c.baseUrlFallback?.replace(/\/+$/, "");
}

function withHeaders(c: OllabridgeConfig, extra: Record<string, string> = {}): Headers {
  const h = new Headers({ Accept: "application/json", ...extra });
  if (!extra["Content-Type"] && extra["body"] !== "") h.set("Content-Type", "application/json");
  if (c.clientType) h.set("X-Client-Type", c.clientType);
  if (c.userId) h.set("X-User-Id", c.userId);
  if (c.deviceToken) h.set("Authorization", `Bearer ${c.deviceToken}`);
  return h;
}

export class OllabridgeError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    /** Set when the upstream is a cold-starting Space ("warming up"). */
    public readonly waking = false
  ) {
    super(message);
    this.name = "OllabridgeError";
  }
}

/**
 * Fetch helper with timeout, fallback host, and cold-start detection.
 * Tries the canonical base first; if the request is a connect error or
 * a 502/503/504, retries against the fallback. A 503 with a
 * Space-warming-up body becomes a recoverable `waking: true` error so
 * the UI can say "first answer in ~10 s" instead of "broken".
 */
async function callJson<T>(
  c: OllabridgeConfig,
  path: string,
  init: RequestInit & { absoluteUrl?: string } = {}
): Promise<T> {
  const url = init.absoluteUrl ?? `${resolveBase(c)}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), c.timeoutMs ?? DEFAULT_CONFIG.timeoutMs);
  let resp: Response;
  try {
    resp = await fetch(url, {
      ...init,
      signal: ctrl.signal,
      headers: withHeaders(c, (init.headers as Record<string, string>) ?? {}),
    });
  } catch (err) {
    clearTimeout(timer);
    // Retry on the fallback host once if the canonical base fails for
    // any network reason (DNS not bound, TLS handshake error, etc.).
    const fb = fallbackBase(c);
    if (fb && !init.absoluteUrl && fb !== resolveBase(c)) {
      return callJson<T>(c, path, { ...init, absoluteUrl: `${fb}${path}` });
    }
    if ((err as { name?: string }).name === "AbortError") {
      throw new OllabridgeError("OllaBridge request timed out.", 504);
    }
    throw new OllabridgeError(`OllaBridge unreachable: ${(err as Error).message}`, 502);
  }
  clearTimeout(timer);
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    const waking = resp.status === 503 && /warm|wak|starting|booting/i.test(text);
    if ((resp.status === 502 || resp.status === 503 || resp.status === 504) && !init.absoluteUrl) {
      const fb = fallbackBase(c);
      if (fb && fb !== resolveBase(c)) {
        return callJson<T>(c, path, { ...init, absoluteUrl: `${fb}${path}` });
      }
    }
    throw new OllabridgeError(
      `OllaBridge returned ${resp.status}: ${text.slice(0, 200)}`,
      resp.status,
      waking
    );
  }
  return resp.json() as Promise<T>;
}

// ─── /v1/models ─────────────────────────────────────────────────────

export type ModelInfo = {
  id: string;
  object: "model";
  created: number;
  owned_by: string;
};

export async function listModels(c: OllabridgeConfig = DEFAULT_CONFIG): Promise<ModelInfo[]> {
  const res = await callJson<{ object: "list"; data: ModelInfo[] }>(c, "/v1/models", {
    method: "GET",
  });
  return res.data ?? [];
}

// ─── /v1/chat/completions ──────────────────────────────────────────

export type OllabridgeChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatRequest = {
  model: string;
  messages: OllabridgeChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
};

export async function chat(req: ChatRequest, c: OllabridgeConfig = DEFAULT_CONFIG) {
  return callJson<{
    id: string;
    choices: Array<{ message: { role: string; content: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  }>(c, "/v1/chat/completions", {
    method: "POST",
    body: JSON.stringify({ ...req, stream: false }),
  });
}

// ─── Pairing — capability probe ────────────────────────────────────

export type PairInfo = {
  auth_mode: "pairing" | "apikey" | "anonymous";
  pairing_enabled: boolean;
  pairing_available: boolean;
  device_count: number;
};

export async function pairInfo(c: OllabridgeConfig = DEFAULT_CONFIG): Promise<PairInfo> {
  return callJson<PairInfo>(c, "/pair/info", { method: "GET" });
}

// ─── Pairing — device flow ─────────────────────────────────────────

export type DeviceStartResponse = {
  user_code: string; // "ABCD-1234" — show to admin
  device_code: string; // server-secret; pass back to /poll only
  verification_url: string;
  expires_in: number; // seconds (typ. 600)
};

export type DevicePollResponse = {
  status: "pending" | "approved" | "expired";
  device_id?: string;
  device_token?: string; // present iff status === "approved"
};

/**
 * Step 1 of headless pairing: a PC (or this admin UI in
 * "generate code" mode) asks the cloud for a fresh code.
 * Returns the user-visible `user_code` to display + the secret
 * `device_code` to poll with.
 */
export async function deviceStart(
  c: OllabridgeConfig = DEFAULT_CONFIG
): Promise<DeviceStartResponse> {
  return callJson<DeviceStartResponse>(c, "/device/start", { method: "POST" });
}

/**
 * Step 2 (PC-initiated): the browser admin types the `user_code`
 * shown on the PC and confirms. Requires X-User-Id so the cloud
 * can scope the relay to this admin's devices.
 */
export async function deviceConfirm(
  userCode: string,
  c: OllabridgeConfig = DEFAULT_CONFIG
): Promise<{ ok: true }> {
  return callJson<{ ok: true }>(c, "/device/confirm", {
    method: "POST",
    body: JSON.stringify({ user_code: userCode.toUpperCase() }),
  });
}

/**
 * Step 3 (PC-side polling): poll until status flips from "pending"
 * to "approved" (returns a device_token) or "expired".
 */
export async function devicePoll(
  deviceCode: string,
  c: OllabridgeConfig = DEFAULT_CONFIG
): Promise<DevicePollResponse> {
  return callJson<DevicePollResponse>(c, "/device/poll", {
    method: "POST",
    body: JSON.stringify({ device_code: deviceCode }),
  });
}

// ─── Health probe ───────────────────────────────────────────────────

export async function health(
  c: OllabridgeConfig = DEFAULT_CONFIG
): Promise<{ status: string; version?: string }> {
  try {
    return await callJson<{ status: string; version?: string }>(c, "/health", { method: "GET" });
  } catch (err) {
    if (err instanceof OllabridgeError) {
      return { status: err.waking ? "waking" : "unreachable" };
    }
    return { status: "unreachable" };
  }
}

// ─── Format helpers (used by both server + UI) ──────────────────────

const USER_CODE_RE = /^[A-Z]{4}-[0-9]{4}$/;

/**
 * The cloud emits user_codes in `[A-Z]{4}-[0-9]{4}` format
 * (e.g. ECOS-5373). Validate before sending to /device/confirm to
 * give the admin a sharp 400 instead of a network round-trip.
 */
export function isValidUserCode(code: string): boolean {
  return USER_CODE_RE.test(code.trim().toUpperCase());
}

export function normaliseUserCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "");
}
