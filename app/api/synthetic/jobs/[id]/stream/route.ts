/**
 * GET /api/synthetic/jobs/:id/stream
 *
 * Server-Sent Events stream of `JobEvent`s for one synthetic-quiz
 * generation job. Events:
 *   - plan          (chunk count, est duration, title)
 *   - progress      (done / total / failed)
 *   - question      (each accepted question as it's emitted)
 *   - chunk_failed  (per-chunk failure reason)
 *   - done          (final CanonicalQuiz)
 *   - error         (terminal error)
 *
 * The endpoint replays every buffered event on connect, so a client
 * that reconnects mid-stream catches up without re-running anything.
 *
 * Auth: the job owner only — same rule as the JSON snapshot endpoint.
 */

import { fail, handler } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { getJob, isJobOwner } from "@/lib/synthetic/jobs/registry";
import { sseResponseForJob } from "@/lib/synthetic/jobs/sse";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return fail(404, "Job not found or has expired.");

  const owner = await resolveOwner(req);
  if (!isJobOwner(job, owner.id)) {
    return fail(403, "You don't have access to this job.");
  }

  return sseResponseForJob(id, req.signal);
});
