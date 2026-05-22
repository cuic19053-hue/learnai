import { z } from "zod";
import { generateLesson } from "@/lib/learn/lessons";
import { defaultTeacherForStage } from "@/lib/learn/teachers";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const StageEnum = z.enum([
  "LITTLE_LEARNER",
  "EXPLORER",
  "BUILDER",
  "SCHOLAR",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
]);

const BodySchema = z.object({
  stage: StageEnum,
  goal: z.string().min(2).max(200),
  language: z.string().min(2).max(10).optional(),
  teacherName: z.string().min(1).max(80).optional(),
});

export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`lesson:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) {
    return fail(429, "Too many lesson requests. Try again in a minute.");
  }
  const body = BodySchema.parse(await req.json());
  const teacherName = body.teacherName ?? defaultTeacherForStage(body.stage).name;
  const lesson = generateLesson({
    stage: body.stage,
    goal: body.goal,
    language: body.language,
    teacherName,
  });
  return ok({ lesson });
});
