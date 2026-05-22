import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { listProviders, upsertProvider } from "@/lib/ai/config-store";
import { probeProvider } from "@/lib/ai/chat-impl";
import { PROVIDER_CATALOGUE } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

const ClaimSchema = z.object({
  /** The pairing code as displayed in the OllaBridge dashboard. */
  code: z.string().min(4).max(32),
  /** Optional base URL override — defaults to the catalogue URL. */
  baseUrl: z.string().url().max(400).optional(),
  /** Optional model override. */
  model: z.string().min(1).max(120).optional(),
});

/**
 * POST /api/admin/providers/pairing
 *   { code: "FYNS-1159", baseUrl?: "…", model?: "…" }
 *
 * The admin gets a pairing code from their OllaBridge dashboard at
 * https://ruslanmv-ollabridge.hf.space and pastes it here. We persist
 * it on the OllaBridge ProviderConfig (as both the API key and the
 * pairingDeviceId) and immediately probe the connection so the admin
 * sees a ✓ healthy / ✕ failed result without a second click.
 *
 * The code carries any spend/quota policy OllaBridge associates with
 * the paired account — premium models, higher rate limits, etc.
 */
export const POST = handler(async (req: Request) => {
  const body = ClaimSchema.parse(await req.json());
  const normalisedCode = body.code.toUpperCase().replace(/[^A-Z0-9-]/g, "");

  const current = listProviders().find((p) => p.id === "ollabridge");
  const base =
    body.baseUrl?.trim() || current?.baseUrl || PROVIDER_CATALOGUE.ollabridge.defaultBaseUrl;
  const model = body.model?.trim() || current?.model || PROVIDER_CATALOGUE.ollabridge.defaultModel;

  const patched = {
    id: "ollabridge" as const,
    baseUrl: base,
    model,
    apiKey: normalisedCode,
    pairingDeviceId: normalisedCode,
    priority: current?.priority ?? 1,
    enabled: true,
    monthlyCapUsd: current?.monthlyCapUsd,
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: "untested" as const,
  };

  // Probe the connection so the admin gets immediate feedback.
  const probe = await probeProvider(patched);
  upsertProvider({
    ...patched,
    lastTestStatus: probe.ok ? "ok" : "error",
    lastTestMessage: probe.ok ? undefined : probe.message,
  });

  return ok({
    code: normalisedCode,
    probe,
  });
});

/**
 * DELETE /api/admin/providers/pairing — clear the current pairing.
 * Disables the API key on OllaBridge; the provider stays enabled but
 * falls back to the unauthenticated public endpoint.
 */
export const DELETE = handler(async () => {
  const current = listProviders().find((p) => p.id === "ollabridge");
  if (!current) return fail(404, "OllaBridge provider not found");
  upsertProvider({
    ...current,
    apiKey: undefined,
    pairingDeviceId: undefined,
    lastTestStatus: "untested",
    lastTestMessage: undefined,
  });
  return ok({ unpaired: true });
});
