/**
 * POST /api/certification-sessions/:sessionId/answers
 *
 * Submit one answer. The handler grades the attempt server-side
 * (never trust the client), upserts on (sessionId, questionId) so a
 * re-answer replaces the prior selection, and returns the correct
 * answers + explanation + official references for the learner's
 * feedback card.
 *
 * Works for both DB-backed sessions and legacy in-memory sessions
 * via the shared `submitLegacyAnswer` helper.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isCorrectAnswer } from "@/lib/certifications/scoring";
import { isLegacySessionId, SessionError, submitLegacyAnswer } from "@/lib/certifications/sessions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  questionId: z.string().min(1).max(200),
  selectedAnswers: z.array(z.string().min(1).max(16)).min(1).max(8),
  timeSpentMs: z
    .number()
    .int()
    .min(0)
    .max(60 * 60_000)
    .optional(),
  selfRating: z.enum(["known", "review", "unsure"]).optional(),
});

export const POST = handler(
  async (req: Request, ctx: { params: Promise<{ sessionId: string }> }) => {
    const { sessionId } = await ctx.params;
    const body = BodySchema.parse(await req.json());

    // ── Legacy in-memory session ───────────────────────────────────
    if (isLegacySessionId(sessionId)) {
      try {
        const result = await submitLegacyAnswer({
          sessionId,
          questionId: body.questionId,
          selectedAnswers: body.selectedAnswers,
          timeSpentMs: body.timeSpentMs,
          selfRating: body.selfRating,
        });
        return ok({
          source: "legacy",
          result: {
            isCorrect: result.isCorrect,
            correctAnswers: result.correctAnswers,
            explanation: result.explanation,
            officialRefs: result.officialRefs,
          },
        });
      } catch (err) {
        if (err instanceof SessionError) return fail(err.status, err.message);
        throw err;
      }
    }

    // ── DB-backed session ──────────────────────────────────────────
    const quizSession = await prisma.certificationSession.findUnique({ where: { id: sessionId } });
    if (!quizSession) return fail(404, "Session not found.");
    if (quizSession.status !== "IN_PROGRESS") return fail(409, "Session is already completed.");
    if (!quizSession.questionIds.includes(body.questionId)) {
      return fail(400, "Question is not part of this session.");
    }

    const auth = await getServerSession(authOptions).catch(() => null);
    const userId = (auth?.user as { id?: string } | undefined)?.id ?? null;
    if (quizSession.userId && quizSession.userId !== userId) {
      return fail(403, "You don't have access to this session.");
    }

    const question = await prisma.certificationQuestion.findUnique({
      where: { id: body.questionId },
      select: { id: true, correctAnswers: true, explanation: true, officialRefs: true },
    });
    if (!question) return fail(404, "Question not found.");

    const correct = isCorrectAnswer(body.selectedAnswers, question.correctAnswers);

    const answer = await prisma.certificationAnswer.upsert({
      where: { sessionId_questionId: { sessionId, questionId: body.questionId } },
      create: {
        sessionId,
        userId: quizSession.userId ?? null,
        questionId: body.questionId,
        selectedAnswers: body.selectedAnswers,
        isCorrect: correct,
        timeSpentMs: body.timeSpentMs ?? null,
        selfRating: body.selfRating ?? null,
      },
      update: {
        selectedAnswers: body.selectedAnswers,
        isCorrect: correct,
        timeSpentMs: body.timeSpentMs ?? null,
        selfRating: body.selfRating ?? null,
        answeredAt: new Date(),
      },
    });

    const answeredCount = await prisma.certificationAnswer.count({ where: { sessionId } });
    await prisma.certificationSession.update({
      where: { id: sessionId },
      data: { currentIndex: Math.min(answeredCount, quizSession.totalQuestions - 1) },
    });

    return ok({
      source: "db",
      answer: { id: answer.id, isCorrect: answer.isCorrect },
      result: {
        isCorrect: correct,
        correctAnswers: question.correctAnswers,
        explanation: question.explanation,
        officialRefs: question.officialRefs,
      },
    });
  }
);
