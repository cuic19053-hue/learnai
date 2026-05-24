/**
 * POST /api/synthetic/jobs/:id/save
 *
 * Persist a finished job's quiz to Postgres for the signed-in
 * learner. The quiz lives forever (no TTL) under the canonical id,
 * letting the wizard surface a "saved quizzes" list.
 *
 * Guests get a 401 — they should store the quiz in localStorage
 * client-side instead.
 */

import { fail, handler, ok } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { getJob, isJobOwner } from "@/lib/synthetic/jobs/registry";
import { saveQuiz } from "@/lib/synthetic/persistence/quiz-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveOwner(req);
  if (owner.isGuest || !owner.userId) {
    return fail(401, "Sign in to save quizzes.");
  }

  const job = getJob(id);
  if (!job) return fail(404, "Job not found or has expired.");
  if (!isJobOwner(job, owner.id)) return fail(403, "You don't have access to this job.");
  if (job.status !== "done" || !job.quiz) {
    return fail(409, `Job is not finished yet (status: ${job.status}).`);
  }

  await saveQuiz({ userId: owner.userId, quiz: job.quiz });
  return ok({ saved: true, quizId: job.quiz.id });
});
