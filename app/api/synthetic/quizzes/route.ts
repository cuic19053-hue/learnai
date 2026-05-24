/**
 * GET /api/synthetic/quizzes
 *
 * List the signed-in user's saved synthetic quizzes (id, title,
 * source kind/ref, createdAt). The wizard "Continue where you left
 * off" UI calls this on mount.
 *
 * Guests get an empty list — they should read their own quizzes
 * from localStorage instead.
 */

import { fail, handler, ok } from "@/lib/api";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { listQuizzes } from "@/lib/synthetic/persistence/quiz-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request) => {
  const owner = await resolveOwner(req);
  if (owner.isGuest || !owner.userId) {
    return ok({ quizzes: [] });
  }
  try {
    const rows = await listQuizzes(owner.userId);
    return ok({
      quizzes: rows.map((row) => ({
        id: row.id,
        title: row.title,
        sourceKind: row.sourceKind,
        sourceRef: row.sourceRef,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("does not exist")) {
      return fail(503, "Database is missing the GeneratedQuiz table. Run `prisma migrate deploy`.");
    }
    throw err;
  }
});
