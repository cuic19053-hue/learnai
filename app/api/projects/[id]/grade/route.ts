import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { getCachedLesson, gradeShortAnswer } from "@/lib/projects/lesson";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  exerciseId: z.string().min(1).max(40),
  response: z.string().min(1).max(4_000),
});

/**
 * POST /api/projects/[id]/grade
 *   { exerciseId, response }
 *
 * Grades a free-text answer (short_answer or explain_back) against the
 * lesson's expected answer + concept excerpt. Returns a 0..3 score with
 * one-sentence feedback. MCQ/TF grading happens client-side.
 *
 * Rate limit: 30/min per IP — heavier than wiki/parse since this is
 * called per-question and per-retry.
 */
export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const limit = rateLimit(`projects:grade:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail(429, "Too many grades in a row — pause for a minute.");
  }

  const { id } = await ctx.params;
  const body = BodySchema.parse(await req.json());

  const lesson = getCachedLesson(id);
  if (!lesson) {
    return fail(404, "Lesson expired. Reload the project page to regenerate it.");
  }

  const exercise = lesson.exercises.find((e) => e.id === body.exerciseId);
  if (!exercise) {
    return fail(404, "Exercise not found in this lesson.");
  }
  if (exercise.kind !== "short_answer" && exercise.kind !== "explain_back") {
    return fail(
      400,
      "This exercise is multiple-choice — grade it client-side from `correctIndex`."
    );
  }
  if (!exercise.expectedAnswer) {
    return fail(500, "Exercise is missing its expected answer.");
  }

  const grade = await gradeShortAnswer({
    prompt: exercise.prompt,
    expectedAnswer: exercise.expectedAnswer,
    conceptExcerpt: lesson.concept,
    response: body.response,
    method: exercise.method,
  });

  return ok({ grade });
});
