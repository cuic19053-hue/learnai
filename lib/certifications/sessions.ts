/**
 * Session helpers for the certifications quiz flow.
 *
 * Two backends in one surface:
 *   - DB-backed sessions (the normal path) read/write the
 *     CertificationSession + CertificationAnswer Prisma models.
 *   - Legacy file-pack sessions are kept entirely in-process via a
 *     small TTL'd registry, so guests can take a quick drill against
 *     a legacy pack without requiring Postgres.
 *
 * The session route handlers branch on a session id prefix:
 *   - DB sessions: cuid (no prefix).
 *   - Legacy sessions: `leg_<random>` so the route knows to look in
 *     the registry instead.
 *
 * Both paths produce the same response envelope, so the frontend
 * sees one contract.
 */

import "server-only";
import { randomUUID } from "node:crypto";
import { isCorrectAnswer, scorePercent } from "./scoring";
import {
  legacyBuildSessionQuestions,
  legacyFindQuestionById,
  legacyToAnswerableQuestion,
} from "./legacy-bridge";
import type { OfficialRef, QuestionOption } from "./types";

// ─── Shared types ───────────────────────────────────────────────────

export type SessionMode = "QUICK_DRILL" | "REVIEW" | "FULL_EXAM" | "CUSTOM";
export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export type SessionQuestionPublic = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  questionType: "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE" | "SCENARIO";
  difficulty: QuestionDifficulty;
  domain: { id: string; name: string } | null;
  tags: string[];
};

export type SessionEnvelope = {
  id: string;
  mode: SessionMode;
  status: SessionStatus;
  totalQuestions: number;
  currentIndex: number;
  passingPercent: number;
  certificationSlug: string;
};

// ─── Legacy in-memory session registry ──────────────────────────────

const LEGACY_PREFIX = "leg_";
const LEGACY_TTL_MS = 4 * 60 * 60_000;
const GC_MS = 5 * 60_000;

type LegacyAnsweredQuestion = {
  public: SessionQuestionPublic;
  correctAnswers: string[];
  explanation: string;
  officialRefs: OfficialRef[];
};

type LegacyAttempt = {
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpentMs?: number;
  selfRating?: string;
  answeredAt: string;
};

type LegacySession = {
  id: string;
  slug: string;
  mode: SessionMode;
  status: SessionStatus;
  currentIndex: number;
  questions: LegacyAnsweredQuestion[];
  /** questionId -> attempt */
  attempts: Map<string, LegacyAttempt>;
  passingPercent: number;
  startedAt: string;
  completedAt?: string;
  expiresAt: number;
};

const legacySessions = new Map<string, LegacySession>();
let gcStarted = false;

function startGc(): void {
  if (gcStarted || typeof globalThis.setInterval !== "function") return;
  gcStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [id, s] of legacySessions) {
      if (s.expiresAt <= now) legacySessions.delete(id);
    }
  }, GC_MS);
  (timer as unknown as { unref?: () => void }).unref?.();
}

export function isLegacySessionId(id: string): boolean {
  return id.startsWith(LEGACY_PREFIX);
}

export async function createLegacySession(args: {
  slug: string;
  mode: SessionMode;
  size: number;
  difficulty?: QuestionDifficulty;
}): Promise<{ envelope: SessionEnvelope; questions: SessionQuestionPublic[] }> {
  startGc();
  const enriched = await legacyBuildSessionQuestions(args.slug, args.size, args.difficulty);
  if (enriched.length === 0) {
    throw new SessionError(404, `No questions available for certification: ${args.slug}`);
  }
  const id = `${LEGACY_PREFIX}${randomUUID()}`;
  const now = new Date();
  const session: LegacySession = {
    id,
    slug: args.slug,
    mode: args.mode,
    status: "IN_PROGRESS",
    currentIndex: 0,
    questions: enriched.map((e) => ({
      public: {
        id: e.public.id,
        prompt: e.public.prompt,
        options: e.public.options,
        questionType: e.public.questionType,
        difficulty: e.public.difficulty,
        domain: e.public.domain,
        tags: e.public.tags,
      },
      correctAnswers: e.correctAnswers,
      explanation: e.explanation,
      officialRefs: e.officialRefs,
    })),
    attempts: new Map(),
    passingPercent: 70,
    startedAt: now.toISOString(),
    expiresAt: Date.now() + LEGACY_TTL_MS,
  };
  legacySessions.set(id, session);
  return {
    envelope: legacyEnvelope(session),
    questions: session.questions.map((q) => q.public),
  };
}

function legacyEnvelope(s: LegacySession): SessionEnvelope {
  return {
    id: s.id,
    mode: s.mode,
    status: s.status,
    totalQuestions: s.questions.length,
    currentIndex: s.currentIndex,
    passingPercent: s.passingPercent,
    certificationSlug: s.slug,
  };
}

export type LegacyAnswerResult = {
  isCorrect: boolean;
  correctAnswers: string[];
  explanation: string;
  officialRefs: OfficialRef[];
};

export async function submitLegacyAnswer(args: {
  sessionId: string;
  questionId: string;
  selectedAnswers: string[];
  timeSpentMs?: number;
  selfRating?: string;
}): Promise<LegacyAnswerResult> {
  const session = legacySessions.get(args.sessionId);
  if (!session) throw new SessionError(404, "Session not found or expired.");
  if (session.status !== "IN_PROGRESS") {
    throw new SessionError(409, "Session is already completed.");
  }
  const q = session.questions.find((qq) => qq.public.id === args.questionId);
  if (!q) {
    // Try to refresh the question by looking it up in the pack (some
    // ids change if the pack was re-shuffled mid-session).
    const raw = await legacyFindQuestionById(session.slug, args.questionId);
    if (!raw) throw new SessionError(400, "Question is not part of this session.");
    const refreshed = legacyToAnswerableQuestion(raw);
    session.questions.push({
      public: {
        id: refreshed.public.id,
        prompt: refreshed.public.prompt,
        options: refreshed.public.options,
        questionType: refreshed.public.questionType,
        difficulty: refreshed.public.difficulty,
        domain: refreshed.public.domain,
        tags: refreshed.public.tags,
      },
      correctAnswers: refreshed.correctAnswers,
      explanation: refreshed.explanation,
      officialRefs: refreshed.officialRefs,
    });
    return submitLegacyAnswer(args);
  }
  const correct = isCorrectAnswer(args.selectedAnswers, q.correctAnswers);
  session.attempts.set(args.questionId, {
    selectedAnswers: args.selectedAnswers,
    isCorrect: correct,
    timeSpentMs: args.timeSpentMs,
    selfRating: args.selfRating,
    answeredAt: new Date().toISOString(),
  });
  session.currentIndex = Math.min(session.attempts.size, session.questions.length - 1);
  return {
    isCorrect: correct,
    correctAnswers: q.correctAnswers,
    explanation: q.explanation,
    officialRefs: q.officialRefs,
  };
}

export type LegacyFinishSummary = {
  sessionId: string;
  scorePercent: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  totalQuestions: number;
  passed: boolean;
};

export async function finishLegacySession(sessionId: string): Promise<LegacyFinishSummary> {
  const session = legacySessions.get(sessionId);
  if (!session) throw new SessionError(404, "Session not found or expired.");
  let correct = 0;
  let incorrect = 0;
  for (const att of session.attempts.values()) {
    if (att.isCorrect) correct++;
    else incorrect++;
  }
  const skipped = session.questions.length - session.attempts.size;
  const score = scorePercent(correct, session.questions.length);
  session.status = "COMPLETED";
  session.completedAt = new Date().toISOString();
  return {
    sessionId,
    scorePercent: score,
    correctCount: correct,
    incorrectCount: incorrect,
    skippedCount: skipped,
    totalQuestions: session.questions.length,
    passed: score >= session.passingPercent,
  };
}

export function getLegacySession(id: string): LegacySession | undefined {
  return legacySessions.get(id);
}

// ─── Shared error type ──────────────────────────────────────────────

export class SessionError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "SessionError";
  }
}
