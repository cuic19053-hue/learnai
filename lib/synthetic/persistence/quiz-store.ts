/**
 * Signed-in persistence for generated quizzes.
 *
 * Backed by the Prisma `GeneratedQuiz` model. The whole quiz is
 * stored as a single JSON payload — same trade-off as
 * `UserProgress.worldStats`: read whole, write whole, no migrations
 * for schema iteration.
 *
 * Guest persistence lives in the browser (localStorage) and is the
 * frontend's responsibility — the API surface here is server-side only.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { CanonicalQuiz } from "../types";

export async function saveQuiz(args: { userId: string; quiz: CanonicalQuiz }): Promise<void> {
  const { userId, quiz } = args;
  const sourceRef = quiz.source.canonicalUrl ?? quiz.source.filename ?? null;
  await prisma.generatedQuiz.upsert({
    where: { id: quiz.id },
    create: {
      id: quiz.id,
      userId,
      title: quiz.title,
      sourceKind: quiz.source.kind,
      sourceRef,
      payload: quiz as unknown as object,
    },
    update: {
      title: quiz.title,
      sourceKind: quiz.source.kind,
      sourceRef,
      payload: quiz as unknown as object,
    },
  });
}

export async function loadQuiz(args: {
  userId: string;
  quizId: string;
}): Promise<CanonicalQuiz | null> {
  const row = await prisma.generatedQuiz.findFirst({
    where: { id: args.quizId, userId: args.userId },
    select: { payload: true },
  });
  return (row?.payload ?? null) as CanonicalQuiz | null;
}

export async function listQuizzes(
  userId: string,
  limit = 25
): Promise<
  Array<{
    id: string;
    title: string;
    sourceKind: string;
    sourceRef: string | null;
    createdAt: Date;
  }>
> {
  return prisma.generatedQuiz.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: Math.max(1, Math.min(100, limit)),
    select: { id: true, title: true, sourceKind: true, sourceRef: true, createdAt: true },
  });
}

export async function deleteQuiz(args: { userId: string; quizId: string }): Promise<boolean> {
  const result = await prisma.generatedQuiz.deleteMany({
    where: { id: args.quizId, userId: args.userId },
  });
  return result.count > 0;
}
