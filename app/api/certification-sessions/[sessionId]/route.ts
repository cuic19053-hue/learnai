/**
 * GET /api/certification-sessions/:sessionId
 *
 * Snapshot the current state of a session: status, plan, the frozen
 * question list, accepted-so-far answers (without revealing the
 * correct answer keys for unanswered questions), and the final score
 * when the session is complete.
 *
 * Works for both DB-backed sessions and legacy in-memory sessions
 * via the same envelope.
 */

import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getLegacySession, isLegacySessionId } from "@/lib/certifications/sessions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (_req: Request, ctx: { params: Promise<{ sessionId: string }> }) => {
    const { sessionId } = await ctx.params;

    if (isLegacySessionId(sessionId)) {
      const session = getLegacySession(sessionId);
      if (!session) return fail(404, "Session not found or expired.");
      return ok({
        source: "legacy",
        session: {
          id: session.id,
          mode: session.mode,
          status: session.status,
          currentIndex: session.currentIndex,
          totalQuestions: session.questions.length,
          passingPercent: session.passingPercent,
          startedAt: session.startedAt,
          completedAt: session.completedAt ?? null,
          certificationSlug: session.slug,
        },
        questions: session.questions.map((q) => q.public),
        answers: Array.from(session.attempts.entries()).map(([questionId, att]) => ({
          questionId,
          selectedAnswers: att.selectedAnswers,
          isCorrect: att.isCorrect,
          timeSpentMs: att.timeSpentMs,
          selfRating: att.selfRating,
          answeredAt: att.answeredAt,
        })),
      });
    }

    const sess = await prisma.certificationSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: true,
        certification: { select: { slug: true } },
      },
    });
    if (!sess) return fail(404, "Session not found.");

    // Ownership check: signed-in owner, OR guest sessions are public
    // by id (the guest "secret" is the cuid itself — same trust model
    // as the synthetic-quiz jobs).
    const auth = await getServerSession(authOptions).catch(() => null);
    const userId = (auth?.user as { id?: string } | undefined)?.id ?? null;
    if (sess.userId && sess.userId !== userId) {
      return fail(403, "You don't have access to this session.");
    }

    return ok({
      source: "db",
      session: {
        id: sess.id,
        mode: sess.mode,
        status: sess.status,
        currentIndex: sess.currentIndex,
        totalQuestions: sess.totalQuestions,
        passingPercent: sess.passingPercent,
        correctCount: sess.correctCount,
        incorrectCount: sess.incorrectCount,
        skippedCount: sess.skippedCount,
        scorePercent: sess.scorePercent,
        startedAt: sess.startedAt,
        completedAt: sess.completedAt,
        certificationSlug: sess.certification.slug,
      },
      answers: sess.answers.map((a) => ({
        questionId: a.questionId,
        selectedAnswers: a.selectedAnswers,
        isCorrect: a.isCorrect,
        timeSpentMs: a.timeSpentMs,
        selfRating: a.selfRating,
        answeredAt: a.answeredAt,
      })),
    });
  }
);
