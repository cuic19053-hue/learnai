import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { probeProvider } from "@/lib/ai/chat-impl";
import { listProviders, upsertProvider } from "@/lib/ai/config-store";
import { PROVIDER_IDS } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

const TestSchema = z.object({
  id: z.enum(PROVIDER_IDS as [typeof PROVIDER_IDS[number], ...Array<typeof PROVIDER_IDS[number]>]),
});

/**
 * POST /api/admin/providers/test
 *   { id: "ollabridge" | "openai" | ... }
 *
 * Sends a tiny "ping → pong" prompt to verify connectivity. The result
 * is written back to the config-store so the admin UI can show a green
 * dot without re-probing.
 */
export const POST = handler(async (req: Request) => {
  const { id } = TestSchema.parse(await req.json());
  const cfg = listProviders().find((p) => p.id === id);
  if (!cfg) return fail(404, "Provider not configured");

  const result = await probeProvider(cfg);
  const patched = {
    ...cfg,
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: result.ok ? ("ok" as const) : ("error" as const),
    lastTestMessage: result.ok ? undefined : result.message,
  };
  upsertProvider(patched);

  return ok({
    id,
    ok: result.ok,
    latencyMs: result.ok ? result.latencyMs : undefined,
    sample: result.ok ? result.sample : undefined,
    message: result.ok ? undefined : result.message,
  });
});
