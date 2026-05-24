/**
 * POST /api/projects/preview-plan
 *
 * Step 4 of the project wizard: generate the AI study plan from the
 * wizard inputs without persisting a Project row. The learner can
 * then accept the plan (calls POST /api/projects with the same body)
 * or tweak inputs and re-preview.
 *
 * Auth: open to guests too — previewing should not require sign-in.
 * Rate-limited per IP since generation hits the AI provider chain.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { generatePlanPreview, PlanPreviewError } from "@/lib/projects/plan-preview";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  worldSlug: z.enum(["kids", "explorer", "builder", "scholar", "adult", "senior"]),
  topic: z.string().min(2).max(200),
  outcome: z.string().max(800).optional(),
  sources: z.array(z.string().min(1).max(400)).max(10).optional(),
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerDay: z.number().int().min(5).max(180),
  deadline: z.string().min(8).max(40).optional(),
  prefs: z.array(z.string().min(1).max(40)).max(8).optional(),
  variant: z.enum(["standard", "parent", "calm"]).optional(),
});

export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`projects:preview:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail(429, "Too many preview generations. Try again in a minute.");
  }

  const body = BodySchema.parse(await req.json());
  try {
    const plan = await generatePlanPreview({
      worldSlug: body.worldSlug,
      topic: body.topic.trim(),
      outcome: body.outcome?.trim(),
      sources: body.sources ?? [],
      daysPerWeek: body.daysPerWeek,
      minutesPerDay: body.minutesPerDay,
      deadline: body.deadline,
      prefs: body.prefs ?? [],
      variant: body.variant,
    });
    return ok({ plan });
  } catch (err) {
    if (err instanceof PlanPreviewError) return fail(err.status, err.message);
    throw err;
  }
});
