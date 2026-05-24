/**
 * GET /api/synthetic/quizzes/:id
 *   Load a single saved quiz by id for the signed-in user.
 *   Returns 404 for guests and for any quiz that belongs to another user.
 *
 * DELETE /api/synthetic/quizzes/:id
 *   Remove the quiz from the database. Idempotent — second call
 *   returns 404.
 */

import { fail, handler, ok } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { deleteQuiz, loadQuiz } from "@/lib/synthetic/persistence/quiz-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveOwner(req);
  if (owner.isGuest || !owner.userId) {
    return fail(401, "Sign in to load saved quizzes.");
  }
  const quiz = await loadQuiz({ userId: owner.userId, quizId: id });
  if (!quiz) return fail(404, "Quiz not found.");
  return ok({ quiz });
});

export const DELETE = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveOwner(req);
  if (owner.isGuest || !owner.userId) {
    return fail(401, "Sign in to delete saved quizzes.");
  }
  const removed = await deleteQuiz({ userId: owner.userId, quizId: id });
  if (!removed) return fail(404, "Quiz not found.");
  return ok({ deleted: true });
});
