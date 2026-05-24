/**
 * POST /api/v1/session/trace
 *
 * The tracing attempt — the heart of Milo Letters. The body carries
 * the child's stroke points (x, y, timestamp). We:
 *
 *   1. Load the glyph the child was tracing.
 *   2. Run the Gentle Judge (lib/letterforge/evaluator) → soft result.
 *   3. Persist a LetterforgeAttempt row (append-only) for parent review.
 *   4. Upsert LetterforgeProgress (counters + sticker flag).
 *   5. Return the encouragement message + stars + Milo animation.
 *
 * Latency budget: < 200 ms. The evaluator is pure-CPU; the two DB
 * writes happen in a transaction.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { resolveLearnerOwner } from "@/lib/letterforge/owner";
import { ATTEMPT_LIMITS, evaluateAttempt, trimAttempt } from "@/lib/letterforge/evaluator";
import { getGlyphById, recordAttempt } from "@/lib/letterforge/store";
import type { Attempt } from "@/lib/letterforge/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PointSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  timestamp: z.number().int().min(0),
});

const StrokeSchema = z.object({
  stroke_order: z.number().int().min(1).max(12),
  points: z.array(PointSchema).min(1).max(ATTEMPT_LIMITS.maxPointsPerStroke),
});

const BodySchema = z.object({
  learnerId: z.string().min(2).max(64),
  glyphId: z.string().cuid(),
  attempt: z.object({
    strokes: z.array(StrokeSchema).min(1).max(ATTEMPT_LIMITS.maxStrokes),
  }),
});

export const POST = handler(async (req: Request) => {
  // Rate-limit so a stuck client can't flood: 60 attempts/min per IP
  // is generous for a 3-year-old's pace.
  const limit = rateLimit(`lf:trace:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Slow down a little 🐢");

  const body = BodySchema.parse(await req.json());
  const owner = await resolveLearnerOwner(req);

  const glyph = await getGlyphById(body.glyphId);
  if (!glyph) return fail(404, "Glyph not found.");

  const attempt = trimAttempt(body.attempt as Attempt);
  const evaluation = evaluateAttempt(glyph, attempt);

  // Persist atomically — log + progress upsert.
  await recordAttempt({
    glyphId: body.glyphId,
    learnerId: body.learnerId,
    userId: owner.userId,
    guestId: owner.guestId,
    payload: attempt as unknown as object,
    result: evaluation.result,
    stars: evaluation.stars,
    evalDetail: evaluation.detail as unknown as object,
  }).catch((err) => {
    // The child should not feel a DB blip — log and continue with
    // the encouragement response so the screen always shows stars.
    // eslint-disable-next-line no-console
    console.warn("[letterforge] recordAttempt failed (non-fatal):", err);
  });

  return ok({
    result: evaluation.result,
    stars: evaluation.stars,
    feedback_message: evaluation.feedback_message,
    milo_animation: evaluation.milo_animation,
  });
});
