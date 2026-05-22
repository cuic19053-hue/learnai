import { fail, handler, ok } from "@/lib/api";
import { getCachedTest } from "@/lib/wiki/cache";

export const dynamic = "force-dynamic";

/**
 * GET /api/wiki/tests/[id]
 *
 * Resolves a previously generated WikiTest by id. Tests live in the
 * 24h in-memory cache populated by /api/wiki/generate. A miss simply
 * 404s; the client should redirect back to the URL-paste flow which
 * will regenerate (and re-cache) under the same deterministic id.
 */
export const GET = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  if (!id || id.length < 8 || id.length > 64 || !/^[a-f0-9]+$/i.test(id)) {
    return fail(400, "Invalid test id.");
  }
  const test = getCachedTest(id);
  if (!test) {
    return fail(
      404,
      "This test has expired or was never generated. Paste the Wikipedia URL again to recreate it."
    );
  }
  return ok({ test });
});
