import { handler, ok, fail } from "@/lib/api";
import { AiProviderError, chat } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";

/**
 * GET /api/ai/ping — live smoke test for the AI provider chain.
 *
 * Sends a tiny "ping → pong" prompt through the configured fallback
 * chain (OllaBridge default → admin's added providers). Returns the
 * provider that actually answered + the latency, so the admin can
 * verify their /admin/providers setup without leaving the dashboard.
 *
 * Safe to expose publicly — the prompt + response are constant and
 * carry no learner data. Use this from a smoke test or uptime monitor.
 */
export const GET = handler(async () => {
  const start = Date.now();
  try {
    const sample = await chat(
      [
        {
          role: "system",
          content: "You are a connection probe. Reply with the single word: pong",
        },
        { role: "user", content: "ping" },
      ],
      { maxTokens: 8, temperature: 0, timeoutMs: 12_000 }
    );
    return ok({
      reachable: true,
      latencyMs: Date.now() - start,
      sample: sample.slice(0, 80),
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return fail(err.status, err.message, {
        reachable: false,
        latencyMs: Date.now() - start,
      });
    }
    throw err;
  }
});
