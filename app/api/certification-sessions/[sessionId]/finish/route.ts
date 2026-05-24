/**
 * POST /api/certification-sessions/:sessionId/finish
 *
 * Mark a session COMPLETED and produce the final summary. For
 * signed-in DB sessions, also updates the learner's
 * `CertificationProgress` row (best/average/last score, totals,
 * weak/strong domains).
 *
 * Legacy in-memory sessions only return the summary — no progress
 * persistence (guests should sign in to track history).
 */

import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scorePercent } from "@/lib/certifications/scoring";
import {
  finishLegacySession,
  isLegacySessionId,
  SessionError,
} from "@/lib/certifications/sessions";
import type { DomainAccuracy } from "@/lib/certifications/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(
  async (_req: Request, ctx: { params: Promise<{ sessionId: string }> }) => {
    const { sessionId } = await ctx.params;

    // ── Legacy ───────────────────────────────────────────────────────
    if (isLegacySessionId(sessionId)) {
      try {
        const summary = await finishLegacySession(sessionId);
        return ok({ source: "legacy", summary });
      } catch (err) {
        if (err instanceof SessionError) return fail(err.status, err.message);
        throw err;
      }
    }

    // ── DB ───────────────────────────────────────────────────────────
    const quizSession = await prisma.certificationSession.findUnique({
      where: { id: sessionId },
      include: {
        answers: {
          include: {
            question: { select: { domainId: true, domain: { select: { id: true, name: true } } } },
          },
        },
      },
    });
    if (!quizSession) return fail(404, "Session not found.");

    const auth = await getServerSession(authOptions).catch(() => null);
    const userId = (auth?.user as { id?: string } | undefined)?.id ?? null;
    if (quizSession.userId && quizSession.userId !== userId) {
      return fail(403, "You don't have access to this session.");
    }

    // Idempotent: if already COMPLETED, return the prior summary.
    if (quizSession.status === "COMPLETED") {
      return ok({
        source: "db",
        summary: {
          sessionId: quizSession.id,
          scorePercent: quizSession.scorePercent ?? 0,
          correctCount: quizSession.correctCount,
          incorrectCount: quizSession.incorrectCount,
          skippedCount: quizSession.skippedCount,
          totalQuestions: quizSession.totalQuestions,
          passed: (quizSession.scorePercent ?? 0) >= quizSession.passingPercent,
        },
        alreadyCompleted: true,
      });
    }

    const correctCount = quizSession.answers.filter((a) => a.isCorrect).length;
    const incorrectCount = quizSession.answers.filter((a) => !a.isCorrect).length;
    const skippedCount = Math.max(0, quizSession.totalQuestions - quizSession.answers.length);
    const finalScore = scorePercent(correctCount, quizSession.totalQuestions);

    const completed = await prisma.certificationSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        correctCount,
        incorrectCount,
        skippedCount,
        scorePercent: finalScore,
        completedAt: new Date(),
      },
    });

    // Per-user progress: only persist for signed-in learners.
    if (quizSession.userId) {
      const domains = computeDomainAccuracies(quizSession.answers);
      await upsertCertificationProgress({
        userId: quizSession.userId,
        certificationId: quizSession.certificationId,
        score: finalScore,
        correctCount,
        totalQuestions: quizSession.totalQuestions,
        domains,
      });
    }

    return ok({
      source: "db",
      summary: {
        sessionId: completed.id,
        scorePercent: finalScore,
        correctCount,
        incorrectCount,
        skippedCount,
        totalQuestions: completed.totalQuestions,
        passed: finalScore >= completed.passingPercent,
      },
    });
  }
);

// ─── Domain accuracy + progress upsert ──────────────────────────────

type AnswerWithDomain = {
  isCorrect: boolean;
  question: { domainId: string | null; domain: { id: string; name: string } | null };
};

function computeDomainAccuracies(answers: AnswerWithDomain[]): DomainAccuracy[] {
  type Bucket = { name: string; total: number; correct: number };
  const buckets = new Map<string, Bucket>();
  for (const a of answers) {
    const id = a.question.domainId;
    const name = a.question.domain?.name;
    if (!id || !name) continue;
    const bucket = buckets.get(id) ?? { name, total: 0, correct: 0 };
    bucket.total += 1;
    if (a.isCorrect) bucket.correct += 1;
    buckets.set(id, bucket);
  }
  const out: DomainAccuracy[] = [];
  for (const [domainId, bucket] of buckets) {
    out.push({
      domainId,
      name: bucket.name,
      accuracy: scorePercent(bucket.correct, bucket.total),
    });
  }
  return out;
}

async function upsertCertificationProgress(args: {
  userId: string;
  certificationId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  domains: DomainAccuracy[];
}): Promise<void> {
  const { userId, certificationId, score, correctCount, totalQuestions, domains } = args;

  const weak = domains.filter((d) => d.accuracy < 70).sort((a, b) => a.accuracy - b.accuracy);
  const strong = domains.filter((d) => d.accuracy >= 70).sort((a, b) => b.accuracy - a.accuracy);

  const existing = await prisma.certificationProgress.findUnique({
    where: { userId_certificationId: { userId, certificationId } },
  });
  if (!existing) {
    await prisma.certificationProgress.create({
      data: {
        userId,
        certificationId,
        totalSessions: 1,
        completedSessions: 1,
        bestScore: score,
        averageScore: score,
        lastScore: score,
        questionsSeen: totalQuestions,
        questionsCorrect: correctCount,
        weakDomains: weak as unknown as object,
        strongDomains: strong as unknown as object,
        lastPracticedAt: new Date(),
      },
    });
    return;
  }
  const completedSessions = existing.completedSessions + 1;
  const oldAverage = existing.averageScore ?? 0;
  const newAverage = (oldAverage * existing.completedSessions + score) / completedSessions;
  await prisma.certificationProgress.update({
    where: { userId_certificationId: { userId, certificationId } },
    data: {
      totalSessions: { increment: 1 },
      completedSessions: { increment: 1 },
      bestScore: Math.max(existing.bestScore ?? 0, score),
      averageScore: newAverage,
      lastScore: score,
      questionsSeen: { increment: totalQuestions },
      questionsCorrect: { increment: correctCount },
      weakDomains: weak as unknown as object,
      strongDomains: strong as unknown as object,
      lastPracticedAt: new Date(),
    },
  });
}
