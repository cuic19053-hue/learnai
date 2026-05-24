/**
 * Sync an in-progress (or completed) WikiTest attempt to the server.
 *
 *   POST /api/wiki/tests/:id/attempt
 *     Body: { attempt: WikiAttempt, attemptId?: string, finalize?: boolean }
 *     - If finalize=false (default), upsert the attempt and return the row id.
 *       Refreshes don't lose state, signed-in users get cross-device sync.
 *     - If finalize=true, also grade the attempt and persist the score
 *       + per-section summary. The full grading report is returned.
 *
 *   GET /api/wiki/tests/:id/attempt?attemptId=<cuid>
 *     Load a prior attempt (own only).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getCachedTest } from "@/lib/wiki/cache";
import {
  finalizeAttempt,
  gradeAttempt,
  loadAttempt,
  loadTestSnapshot,
  persistTest,
  upsertAttempt,
} from "@/lib/wiki/grading";
import { resolveWikiOwner } from "@/lib/wiki/owner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AnswerSchema = z.object({
  questionId: z.string().min(1).max(80),
  response: z.string().min(0).max(2_000),
  correct: z.boolean().nullable(),
  flaggedForReview: z.boolean().optional(),
});

const BodySchema = z.object({
  attemptId: z.string().cuid().optional(),
  finalize: z.boolean().default(false),
  attempt: z.object({
    testId: z.string().min(8).max(64),
    startedAt: z.string().min(10).max(40),
    finishedAt: z.string().min(10).max(40).optional(),
    answers: z.array(AnswerSchema).max(200),
  }),
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id: testId } = await ctx.params;
  const body = BodySchema.parse(await req.json());
  if (body.attempt.testId !== testId) {
    return fail(400, "Attempt testId does not match the route param.");
  }
  const owner = await resolveWikiOwner(req);

  // Make sure a snapshot exists in the DB before we attach an
  // attempt to it. The in-memory cache (24 h) is the authoritative
  // source when /generate ran in this process.
  let snapshot = await loadTestSnapshot(testId).catch(() => null);
  if (!snapshot) {
    const cached = getCachedTest(testId);
    if (cached) {
      await persistTest({ test: cached, userId: owner.userId }).catch(() => undefined);
      snapshot = cached;
    }
  }
  if (!snapshot) return fail(404, "Test snapshot not found. Re-generate the test from its URL.");

  // Upsert the attempt row.
  let row;
  try {
    row = await upsertAttempt({
      testId,
      attemptId: body.attemptId,
      userId: owner.userId,
      guestId: owner.guestId,
      attempt: body.attempt,
    });
  } catch (err) {
    return fail(503, `Could not persist attempt: ${(err as Error).message}`);
  }

  if (!body.finalize) {
    return ok({ attemptId: row.id, status: "saved" });
  }

  // Finalize: grade + persist score.
  const report = gradeAttempt(snapshot, {
    ...body.attempt,
    finishedAt: body.attempt.finishedAt ?? new Date().toISOString(),
  });
  await finalizeAttempt({
    attemptId: row.id,
    userId: owner.userId,
    guestId: owner.guestId,
    report,
    attempt: { ...body.attempt, finishedAt: body.attempt.finishedAt ?? new Date().toISOString() },
  });
  return ok({ attemptId: row.id, status: "finalized", report });
});

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id: testId } = await ctx.params;
  const url = new URL(req.url);
  const attemptId = url.searchParams.get("attemptId");
  if (!attemptId) return fail(400, "Missing attemptId query parameter.");
  const owner = await resolveWikiOwner(req);

  const row = await loadAttempt(attemptId);
  if (!row || row.testId !== testId) return fail(404, "Attempt not found.");
  if (owner.userId && row.userId && row.userId !== owner.userId) {
    return fail(403, "Not your attempt.");
  }
  if (!owner.userId && row.guestId && row.guestId !== owner.guestId) {
    return fail(403, "Not your attempt.");
  }

  return ok({
    attempt: {
      id: row.id,
      payload: row.payload,
      scorePercent: row.scorePercent,
      correctCount: row.correctCount,
      totalQuestions: row.totalQuestions,
      finishedAt: row.finishedAt?.toISOString() ?? null,
      sectionSummary: row.sectionSummary,
    },
  });
});
