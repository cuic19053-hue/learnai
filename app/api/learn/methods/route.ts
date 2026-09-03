import { METHODS, planForStage } from "@/lib/learn/methods";
import type { LearnerStage } from "@/lib/learn/stages";
import { handler, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

const VALID: LearnerStage[] = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

/**
 * GET /api/learn/methods
 *   → { methods: LearningMethod[] }
 *
 * GET /api/learn/methods?stage=GRADE_8
 *   → { methods, plan: { hook: "...", explain: "...", ... } }
 *
 * Surfaces the learning-methods catalog and the recommended Loop plan
 * for a given stage. Used by the lesson generator and any future UI
 * that wants to show "the science behind this lesson".
 */
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const stageParam = url.searchParams.get("stage");
  const stage =
    stageParam && (VALID as string[]).includes(stageParam) ? (stageParam as LearnerStage) : null;

  return ok({
    methods: METHODS,
    plan: stage ? planForStage(stage) : null,
  });
});
