/**
 * GET /api/v1/lesson/next?learnerId=…&lang=en&world=GRADE_6
 *
 * Returns the next glyph due for a learner. Simple curated sequence:
 * walk in difficulty order, preferring glyphs without a sticker yet.
 * No spaced repetition — the 3-year-old just keeps going through the
 * alphabet. The frontend uses this to populate the tracing screen
 * without any business logic of its own.
 */

import { fail, handler, ok } from "@/lib/api";
import { nextLesson } from "@/lib/letterforge/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const learnerId = url.searchParams.get("learnerId");
  if (!learnerId || learnerId.length < 2 || learnerId.length > 64) {
    return fail(400, "learnerId is required.");
  }
  const result = await nextLesson({
    learnerId,
    language: url.searchParams.get("lang") ?? "en",
    world: url.searchParams.get("world") ?? "GRADE_6",
  });
  if (!result) return fail(404, "No glyphs available for this language yet.");
  return ok(result);
});
