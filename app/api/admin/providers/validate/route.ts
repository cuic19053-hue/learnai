/**
 * POST /api/admin/providers/validate
 *
 * Validate a paid-provider API key by probing its `/models` endpoint
 * BEFORE the admin clicks save. Lets the AddProviderModal show a
 * red/green pill while the admin is still in the modal.
 *
 *   Body: { providerId: "xai" | "openai" | "anthropic", apiKey, baseUrl? }
 *
 * Never persists. Probing is read-only against the upstream and uses
 * the provider's documented "list models" endpoint (which is the
 * cheapest auth-needing call for each vendor):
 *   - xAI       : GET https://api.x.ai/v1/models           Authorization: Bearer
 *   - OpenAI    : GET https://api.openai.com/v1/models     Authorization: Bearer
 *   - Anthropic : GET https://api.anthropic.com/v1/models  x-api-key + anthropic-version
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  providerId: z.enum(["xai", "openai", "anthropic"]),
  apiKey: z.string().min(8).max(400),
  baseUrl: z.string().url().max(400).optional(),
});

const ANTHROPIC_VERSION = "2023-06-01";
const DEFAULTS: Record<string, string> = {
  xai: "https://api.x.ai/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com",
};

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const body = BodySchema.parse(await req.json());

  const base = (body.baseUrl ?? DEFAULTS[body.providerId])!.replace(/\/+$/, "");
  const url = `${base}/models`;

  let modelCount = 0;
  let sample: string[] = [];
  const start = Date.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12_000);
    const resp = await fetch(url, {
      method: "GET",
      headers:
        body.providerId === "anthropic"
          ? {
              "x-api-key": body.apiKey,
              "anthropic-version": ANTHROPIC_VERSION,
              Accept: "application/json",
            }
          : { Authorization: `Bearer ${body.apiKey}`, Accept: "application/json" },
      signal: ctrl.signal,
    });
    clearTimeout(timer);
    if (resp.status === 401 || resp.status === 403) {
      return ok({ valid: false, status: resp.status, message: "Provider rejected the API key." });
    }
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return ok({
        valid: false,
        status: resp.status,
        message: `Provider returned ${resp.status}: ${text.slice(0, 160)}`,
      });
    }
    const json = (await resp.json().catch(() => ({}))) as { data?: Array<{ id?: string }> };
    if (Array.isArray(json.data)) {
      modelCount = json.data.length;
      sample = json.data.slice(0, 5).map((m) => m.id ?? "?");
    }
    return ok({
      valid: true,
      providerId: body.providerId,
      latencyMs: Date.now() - start,
      modelCount,
      sample,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      return ok({ valid: false, status: 504, message: "Provider request timed out." });
    }
    return ok({
      valid: false,
      status: 502,
      message: (err as Error).message,
    });
  }
});
