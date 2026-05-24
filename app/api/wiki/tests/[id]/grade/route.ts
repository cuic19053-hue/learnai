/**
 * POST /api/wiki/tests/:id/grade
 *
 * Pure-grading endpoint. Takes a complete attempt payload and returns
 * the grading report without persisting anything. Useful for the
 * report page when the attempt lives in client storage only and the
 * learner doesn't want to save to their library.
 *
 * For the "save and grade in one call" path, use
 * `POST /api/wiki/tests/:id/attempt` with `finalize: true`.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getCachedTest } from "@/lib/wiki/cache";
import { gradeAttempt, loadTestSnapshot } from "@/lib/wiki/grading";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const AnswerSchema = z.object({
  questionId: z.string().min(1).max(80),
  response: z.string().min(0).max(2_000),
  correct: z.boolean().nullable(),
  flaggedForReview: z.boolean().optional(),
});

const BodySchema = z.object({
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

  // Prefer in-memory cache (zero LLM spend, no DB hit) and fall back
  // to the DB snapshot. If neither has the test, the report page
  // should redirect back to /api/wiki/generate.
  let snapshot = getCachedTest(testId);
  if (!snapshot) snapshot = await loadTestSnapshot(testId).catch(() => null);
  if (!snapshot) {
    return fail(
      404,
      "This test has expired or was never generated. Re-paste the Wikipedia URL to recreate it."
    );
  }

  const report = gradeAttempt(snapshot, {
    ...body.attempt,
    finishedAt: body.attempt.finishedAt ?? new Date().toISOString(),
  });
  return ok({ report });
});
