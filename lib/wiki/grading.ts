/**
 * WikiTest grading + persistence.
 *
 * The in-memory cache in `lib/wiki/cache.ts` is fine for "make a test
 * once and play it once", but a real library needs DB persistence so
 * tests + attempts survive past 24 hours and across devices.
 *
 * Grading is a pure function: given the test snapshot + the attempt
 * payload, score each answer and produce per-section accuracy. The
 * caller persists the result.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { WikiAttempt, WikiQuestion, WikiTest } from "./types";

// ─── Grading ────────────────────────────────────────────────────────

export type PerQuestionResult = {
  questionId: string;
  picked: string; // letter for MCQ/TF, free text for short_answer
  correctLetter?: string;
  expectedAnswer?: string;
  correct: boolean;
  sourceSection: string;
};

export type SectionScore = {
  section: string;
  correct: number;
  total: number;
  accuracy: number; // 0-100
};

export type GradingReport = {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  byQuestion: PerQuestionResult[];
  bySection: SectionScore[];
  weakSections: string[]; // < 70%
  durationMin?: number;
};

const LETTER_RE = /^([A-D])\b/i;

function indexFromLetter(letter: string): number {
  const m = letter.trim().match(LETTER_RE);
  if (!m) return -1;
  return m[1]!.toUpperCase().charCodeAt(0) - 65;
}

function shortAnswerMatches(picked: string, expected: string): boolean {
  // Normalize: collapse whitespace, lowercase, strip basic punctuation.
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const p = norm(picked);
  const e = norm(expected);
  if (!p || !e) return false;
  if (p === e) return true;
  // Accept if every token of the expected answer appears in the picked text.
  // This is forgiving — short answers vary in word order and articles.
  const tokens = e.split(" ").filter((t) => t.length > 2);
  if (tokens.length === 0) return false;
  return tokens.every((t) => p.includes(t));
}

export function gradeAttempt(test: WikiTest, attempt: WikiAttempt): GradingReport {
  const byQuestion: PerQuestionResult[] = [];
  let correctCount = 0;

  const questionById = new Map(test.questions.map((q) => [q.id, q]));

  for (const ans of attempt.answers) {
    const q = questionById.get(ans.questionId) as WikiQuestion | undefined;
    if (!q) continue;
    let correct = false;
    if (q.kind === "multiple_choice" || q.kind === "true_false") {
      const pickedIdx = indexFromLetter(ans.response);
      correct = pickedIdx >= 0 && pickedIdx === q.correctIndex;
    } else if (q.kind === "short_answer") {
      correct = q.expectedAnswer ? shortAnswerMatches(ans.response, q.expectedAnswer) : false;
    }
    if (correct) correctCount++;
    byQuestion.push({
      questionId: q.id,
      picked: ans.response,
      correctLetter:
        q.correctIndex != null && (q.kind === "multiple_choice" || q.kind === "true_false")
          ? String.fromCharCode(65 + q.correctIndex)
          : undefined,
      expectedAnswer: q.expectedAnswer,
      correct,
      sourceSection: q.sourceSection,
    });
  }

  // Per-section roll-up.
  const sections = new Map<string, { correct: number; total: number }>();
  for (const r of byQuestion) {
    const bucket = sections.get(r.sourceSection) ?? { correct: 0, total: 0 };
    bucket.total += 1;
    if (r.correct) bucket.correct += 1;
    sections.set(r.sourceSection, bucket);
  }
  const bySection: SectionScore[] = [];
  for (const [section, bucket] of sections) {
    bySection.push({
      section,
      correct: bucket.correct,
      total: bucket.total,
      accuracy: bucket.total === 0 ? 0 : Math.round((bucket.correct / bucket.total) * 10_000) / 100,
    });
  }
  bySection.sort((a, b) => a.accuracy - b.accuracy);

  const total = test.questions.length;
  const scorePercent = total === 0 ? 0 : Math.round((correctCount / total) * 10_000) / 100;

  // Duration if both timestamps available.
  let durationMin: number | undefined;
  if (attempt.startedAt && attempt.finishedAt) {
    const ms = new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime();
    if (Number.isFinite(ms) && ms >= 0) durationMin = Math.round(ms / 60_000);
  }

  return {
    scorePercent,
    correctCount,
    totalQuestions: total,
    byQuestion,
    bySection,
    weakSections: bySection.filter((s) => s.accuracy < 70).map((s) => s.section),
    durationMin,
  };
}

// ─── Persistence ───────────────────────────────────────────────────

export async function persistTest(args: { test: WikiTest; userId?: string | null }): Promise<void> {
  const { test, userId } = args;
  await prisma.wikiTestSnapshot.upsert({
    where: { id: test.id },
    create: {
      id: test.id,
      userId: userId ?? null,
      title: test.article.title,
      language: test.article.lang,
      canonicalUrl: test.article.canonicalUrl,
      payload: test as unknown as object,
      questionCount: test.questions.length,
      difficulty: test.difficulty,
      format: test.format,
    },
    update: {
      // Re-saving an existing snapshot only refreshes attribution when
      // the prior row was a guest's snapshot and we now know the user.
      userId: userId ?? undefined,
      payload: test as unknown as object,
      questionCount: test.questions.length,
      difficulty: test.difficulty,
      format: test.format,
    },
  });
}

export async function loadTestSnapshot(testId: string): Promise<WikiTest | null> {
  const row = await prisma.wikiTestSnapshot.findUnique({ where: { id: testId } });
  return (row?.payload ?? null) as WikiTest | null;
}

export type LibraryItem = {
  id: string;
  title: string;
  language: string;
  canonicalUrl: string | null;
  questionCount: number;
  difficulty: string;
  format: string;
  createdAt: string;
  lastAttempt: {
    id: string;
    scorePercent: number | null;
    finishedAt: string | null;
  } | null;
};

export async function listLibrary(args: {
  userId?: string | null;
  guestId?: string | null;
  limit?: number;
}): Promise<LibraryItem[]> {
  const { userId, guestId } = args;
  if (!userId && !guestId) return [];
  const take = Math.min(Math.max(1, args.limit ?? 50), 100);

  // For signed-in users we walk both their snapshots and the attempts
  // table to surface the most recent attempt per test.
  const tests = userId
    ? await prisma.wikiTestSnapshot.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take,
      })
    : [];

  // Guests don't own snapshots (they're keyed by user) but their
  // attempts still surface. Fall back to listing every test they
  // attempted as a guest.
  if (!userId && guestId) {
    const attempts = await prisma.wikiAttemptRow.findMany({
      where: { guestId },
      orderBy: { createdAt: "desc" },
      take,
      include: { test: true },
    });
    const seen = new Set<string>();
    const items: LibraryItem[] = [];
    for (const a of attempts) {
      if (seen.has(a.testId)) continue;
      seen.add(a.testId);
      items.push({
        id: a.test.id,
        title: a.test.title,
        language: a.test.language,
        canonicalUrl: a.test.canonicalUrl,
        questionCount: a.test.questionCount,
        difficulty: a.test.difficulty,
        format: a.test.format,
        createdAt: a.test.createdAt.toISOString(),
        lastAttempt: {
          id: a.id,
          scorePercent: a.scorePercent,
          finishedAt: a.finishedAt?.toISOString() ?? null,
        },
      });
    }
    return items;
  }

  const lastAttempts = await prisma.wikiAttemptRow.findMany({
    where: { userId, testId: { in: tests.map((t) => t.id) } },
    orderBy: { createdAt: "desc" },
  });
  const latestByTest = new Map<string, (typeof lastAttempts)[number]>();
  for (const a of lastAttempts) {
    if (!latestByTest.has(a.testId)) latestByTest.set(a.testId, a);
  }
  return tests.map((t) => {
    const last = latestByTest.get(t.id);
    return {
      id: t.id,
      title: t.title,
      language: t.language,
      canonicalUrl: t.canonicalUrl,
      questionCount: t.questionCount,
      difficulty: t.difficulty,
      format: t.format,
      createdAt: t.createdAt.toISOString(),
      lastAttempt: last
        ? {
            id: last.id,
            scorePercent: last.scorePercent,
            finishedAt: last.finishedAt?.toISOString() ?? null,
          }
        : null,
    };
  });
}

// ─── Attempt persistence ───────────────────────────────────────────

export async function upsertAttempt(args: {
  testId: string;
  attemptId?: string;
  userId?: string | null;
  guestId?: string | null;
  attempt: WikiAttempt;
}) {
  const { testId, userId, guestId, attempt } = args;
  if (args.attemptId) {
    return prisma.wikiAttemptRow.update({
      where: { id: args.attemptId },
      data: { payload: attempt as unknown as object },
    });
  }
  return prisma.wikiAttemptRow.create({
    data: {
      testId,
      userId: userId ?? null,
      guestId: userId ? null : (guestId ?? null),
      payload: attempt as unknown as object,
    },
  });
}

export async function finalizeAttempt(args: {
  attemptId: string;
  userId?: string | null;
  guestId?: string | null;
  report: GradingReport;
  attempt: WikiAttempt;
}) {
  const sectionSummary = args.report.bySection.map((s) => ({
    section: s.section,
    accuracy: s.accuracy,
  }));
  return prisma.wikiAttemptRow.update({
    where: { id: args.attemptId },
    data: {
      payload: args.attempt as unknown as object,
      scorePercent: args.report.scorePercent,
      correctCount: args.report.correctCount,
      totalQuestions: args.report.totalQuestions,
      finishedAt: args.attempt.finishedAt ? new Date(args.attempt.finishedAt) : new Date(),
      sectionSummary: sectionSummary as unknown as object,
    },
  });
}

export async function loadAttempt(attemptId: string) {
  return prisma.wikiAttemptRow.findUnique({ where: { id: attemptId } });
}
