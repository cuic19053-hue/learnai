/**
 * Protocol-specific chat implementations. Two wire formats:
 *
 *   - openai-compat: OpenAI, OllaBridge, xAI Grok, Ollama-local, Custom.
 *     `POST /v1/chat/completions` with the OpenAI body shape.
 *
 *   - anthropic: Claude's `POST /v1/messages` — different headers, body,
 *     and response shape.
 *
 * Each implementation throws a typed `AiProviderError` so the caller
 * (lib/ai/provider) can decide whether to fall back to the next
 * provider in the chain.
 */

import "server-only";
import { PROVIDER_CATALOGUE, type ProviderConfig } from "./providers";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  /** Abort after this many ms. Default 25 s. */
  timeoutMs?: number;
};

export class AiProviderError extends Error {
  status: number;
  /** Which provider raised the error (set by the caller). */
  providerId?: string;
  constructor(message: string, status = 502) {
    super(message);
    this.name = "AiProviderError";
    this.status = status;
  }
}

/**
 * Call a single configured provider. Picks the wire protocol from the
 * catalogue. Surface-area-thin so the fallback chain can wrap it.
 */
export async function chatViaProvider(
  config: ProviderConfig,
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const entry = PROVIDER_CATALOGUE[config.id];
  if (!entry) {
    throw new AiProviderError(`Unknown provider id: ${config.id}`, 500);
  }
  if (entry.protocol === "anthropic") {
    return chatAnthropic(config, messages, options);
  }
  return chatOpenAICompat(config, messages, options);
}

/* ── OpenAI-compatible (OpenAI, OllaBridge, xAI Grok, Ollama, Custom) ── */
async function chatOpenAICompat(
  config: ProviderConfig,
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  const base = config.baseUrl.replace(/\/$/, "");
  // Tolerate "https://host" and "https://host/v1" alike — auto-append
  // /v1 when the base doesn't already end with a version segment.
  // Matches what OllaBridge's dashboard tells admins to paste.
  const versioned = /\/v\d+(?:\.\d+)?$/.test(base) ? base : `${base}/v1`;
  const url = `${versioned}/chat/completions`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);

  try {
    const headers: Record<string, string> = { "content-type": "application/json" };
    if (config.apiKey) headers["authorization"] = `Bearer ${config.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model ?? config.model,
        messages,
        max_tokens: options.maxTokens ?? 600,
        temperature: options.temperature ?? 0.4,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new AiProviderError(
        `${config.id} responded ${res.status}: ${text.slice(0, 200)}`,
        res.status >= 500 ? 502 : res.status
      );
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new AiProviderError(
        `${config.id} returned empty content (model: ${config.model}).`,
        502
      );
    }
    return content;
  } catch (err) {
    if (err instanceof AiProviderError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new AiProviderError(`${config.id} timed out`, 504);
    }
    throw new AiProviderError(`${config.id} failure: ${(err as Error).message}`, 502);
  } finally {
    clearTimeout(timeout);
  }
}

/* ── Anthropic /v1/messages ────────────────────────────────────────── */
async function chatAnthropic(
  config: ProviderConfig,
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  const base = config.baseUrl.replace(/\/$/, "");
  const url = `${base}/v1/messages`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 25_000);

  // Anthropic wants a top-level `system` string + an array without
  // system roles in `messages`.
  const system = messages
    .filter((m) => m.role === "system")
    .map((m) => m.content)
    .join("\n\n");
  const nonSystem = messages.filter((m) => m.role !== "system");

  try {
    if (!config.apiKey) {
      throw new AiProviderError("Anthropic requires an API key", 401);
    }
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: options.model ?? config.model,
        max_tokens: options.maxTokens ?? 600,
        temperature: options.temperature ?? 0.4,
        system: system || undefined,
        messages: nonSystem.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new AiProviderError(
        `anthropic responded ${res.status}: ${text.slice(0, 200)}`,
        res.status >= 500 ? 502 : res.status
      );
    }
    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content
      ?.map((c) => (c.type === "text" ? (c.text ?? "") : ""))
      .join("")
      .trim();
    if (!text) {
      throw new AiProviderError("anthropic returned empty content", 502);
    }
    return text;
  } catch (err) {
    if (err instanceof AiProviderError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new AiProviderError("anthropic timed out", 504);
    }
    throw new AiProviderError(`anthropic failure: ${(err as Error).message}`, 502);
  } finally {
    clearTimeout(timeout);
  }
}

/** Probe a provider with a tiny ping prompt. Used by the admin UI. */
export async function probeProvider(
  config: ProviderConfig
): Promise<{ ok: true; latencyMs: number; sample: string } | { ok: false; message: string }> {
  const start = Date.now();
  try {
    const sample = await chatViaProvider(
      config,
      [
        { role: "system", content: "You are a connection probe. Reply with the single word: pong" },
        { role: "user", content: "ping" },
      ],
      { maxTokens: 8, temperature: 0, timeoutMs: 12_000 }
    );
    return { ok: true, latencyMs: Date.now() - start, sample: sample.slice(0, 80) };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message.slice(0, 200) : "Unknown probe failure",
    };
  }
}
