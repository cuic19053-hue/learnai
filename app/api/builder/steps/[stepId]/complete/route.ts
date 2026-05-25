/**
 * POST /api/builder/steps/[stepId]/complete
 *
 * Marks a Builder Academy step as completed for the signed-in user.
 * Awards step XP, enforces sequential unlocking, and grants the
 * mission's bonus XP when the final EVOLVE step lands.
 *
 * Auth is required — anonymous callers get 401.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { completeStep } from "@/lib/builder/missions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req: Request, ctx: { params: Promise<{ stepId: string }> }) => {
  const limit = rateLimit(`builder:step:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many requests.");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return fail(401, "Sign in to record progress.");

  const { stepId } = await ctx.params;

  try {
    const result = await completeStep({ userId, stepId });
    return ok(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Could not complete step";
    return fail(400, msg);
  }
});
