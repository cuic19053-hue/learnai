/**
 * GET /api/synthetic/jobs/:id
 *   Snapshot of the job state — current status, plan, accepted
 *   questions so far, and (when status === "done") the final quiz.
 *
 *   This is what clients without SSE support poll; it also lets SSE
 *   clients verify the final quiz after the stream closes.
 *
 * DELETE /api/synthetic/jobs/:id
 *   Drop the job from the in-memory registry (best-effort). Doesn't
 *   delete a persisted quiz — that lives on `/api/synthetic/quizzes/:id`.
 */

import { fail, handler, ok } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { cancelJob, getJob, isJobOwner } from "@/lib/synthetic/jobs/registry";

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

  // Strip the listener-side ring buffer (events) from the snapshot —
  // the SSE channel is the source of truth for the live stream.
  // Callers that want the questions can read them off `quiz.questions`.
  const acceptedQuestions = job.events
    .filter((e) => e.type === "question")
    .map((e) => (e.type === "question" ? e.question : null))
    .filter((q): q is NonNullable<typeof q> => q !== null);

  return ok({
    id: job.id,
    status: job.status,
    createdAt: new Date(job.createdAt).toISOString(),
    updatedAt: new Date(job.updatedAt).toISOString(),
    source: {
      title: job.source.title,
      language: job.source.language,
      canonicalUrl: job.source.canonicalUrl,
    },
    config: job.config,
    plan: {
      totalChunks: job.chunks.length,
    },
    progress: {
      done:
        job.events.filter((e) => e.type === "progress").length > 0
          ? Math.max(
              ...job.events
                .filter((e) => e.type === "progress")
                .map((e) => (e.type === "progress" ? e.done : 0))
            )
          : 0,
      total: job.chunks.length,
      failed: job.events.filter((e) => e.type === "chunk_failed").length,
    },
    acceptedQuestions,
    quiz: job.quiz ?? null,
    error: job.error ?? null,
  });
});

export const DELETE = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const job = getJob(id);
  if (!job) return fail(404, "Job not found.");

  const owner = await resolveOwner(req);
  if (!isJobOwner(job, owner.id)) {
    return fail(403, "You don't have access to this job.");
  }

  cancelJob(id);
  return ok({ cancelled: true });
});
