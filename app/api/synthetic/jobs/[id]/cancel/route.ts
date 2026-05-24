/**
 * POST /api/synthetic/jobs/:id/cancel
 *
 * Cooperatively cancel a running job. In-flight LLM calls finish
 * (we can't abort them at the provider) but no further chunks are
 * scheduled, and the SSE stream closes with an `error` event of
 * status 499.
 */

import { fail, handler, ok } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { cancelJob, getJob, isJobOwner } from "@/lib/synthetic/jobs/registry";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return fail(404, "Job not found or has expired.");

  const owner = await resolveOwner(req);
  if (!isJobOwner(job, owner.id)) {
    return fail(403, "You don't have access to this job.");
  }

  const cancelled = cancelJob(id);
  return ok({ cancelled });
});
