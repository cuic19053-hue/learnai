import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { newDraftId, saveDraft } from "@/lib/projects/store";
import type { ProjectDraft } from "@/lib/projects/wizard-config";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  worldSlug: z.enum(["kids", "explorer", "builder", "scholar", "adult", "senior"]),
  topic: z.string().min(2).max(200),
  outcome: z.string().min(0).max(800).default(""),
  sources: z.array(z.string().min(1).max(400)).max(10).default([]),
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerDay: z.number().int().min(5).max(180),
  deadline: z.string().min(8).max(40).optional(),
  prefs: z.array(z.string().min(1).max(40)).max(8).default([]),
});

/**
 * POST /api/projects
 *
 * Creates a project draft from the wizard. Returns the new id so the
 * client can route to the project detail page. Process-local store
 * today; swaps to Redis / database with no API change.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`projects:create:${clientIp(req)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.allowed) return fail(429, "Too many projects created in a short window — try again in a minute.");

  const body = BodySchema.parse(await req.json());

  const id = newDraftId(body.worldSlug, body.topic);
  const draft: ProjectDraft = {
    id,
    worldSlug: body.worldSlug,
    topic: body.topic.trim(),
    outcome: body.outcome.trim(),
    sources: body.sources,
    daysPerWeek: body.daysPerWeek,
    minutesPerDay: body.minutesPerDay,
    deadline: body.deadline,
    prefs: body.prefs,
    status: "idea",
    createdAt: new Date().toISOString(),
  };
  saveDraft(draft);

  return ok({ project: draft });
});
