import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import {
  createUserProject,
  isMissingProjectTable,
  listUserProjects,
} from "@/lib/projects/db-store";
import { newDraftId, saveDraft } from "@/lib/projects/store";
import type { ProjectDraft } from "@/lib/projects/wizard-config";
import type { WorldSlug } from "@/lib/learn/worlds";

export const dynamic = "force-dynamic";

const WorldEnum = z.enum(["kids", "explorer", "builder", "scholar", "adult", "senior"]);

const BodySchema = z.object({
  worldSlug: WorldEnum,
  topic: z.string().min(2).max(200),
  outcome: z.string().min(0).max(800).default(""),
  sources: z.array(z.string().min(1).max(400)).max(10).default([]),
  daysPerWeek: z.number().int().min(1).max(7),
  minutesPerDay: z.number().int().min(5).max(180),
  deadline: z.string().min(8).max(40).optional(),
  prefs: z.array(z.string().min(1).max(40)).max(8).default([]),
});

/**
 * GET /api/projects[?world=builder]
 *
 * Lists the caller's drafts. Returns `[]` for guests and for signed-in
 * users with no drafts yet — never falls back to seed/demo data here,
 * the UI takes care of mixing those in for guests only.
 */
export const GET = handler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return ok({ projects: [] });

  const { searchParams } = new URL(req.url);
  const worldParam = searchParams.get("world");
  const world =
    worldParam && WorldEnum.safeParse(worldParam).success ? (worldParam as WorldSlug) : undefined;

  try {
    const projects = await listUserProjects(session.user.id, world);
    return ok({ projects });
  } catch (err) {
    if (isMissingProjectTable(err)) {
      return fail(
        503,
        "Project storage isn't ready — the database hasn't finished provisioning. Try again in a minute."
      );
    }
    throw err;
  }
});

/**
 * POST /api/projects
 *
 * Creates a project draft from the wizard. Signed-in users get a DB-
 * backed row; guests get an in-memory draft that's only valid until
 * the lambda recycles (acceptable — guests are encouraged to sign in).
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`projects:create:${clientIp(req)}`, {
    limit: 20,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail(429, "Too many projects created in a short window — try again in a minute.");
  }

  const body = BodySchema.parse(await req.json());
  const session = await getServerSession(authOptions);

  if (session?.user?.id) {
    try {
      const project = await createUserProject(session.user.id, {
        worldSlug: body.worldSlug,
        topic: body.topic.trim(),
        outcome: body.outcome.trim(),
        sources: body.sources,
        daysPerWeek: body.daysPerWeek,
        minutesPerDay: body.minutesPerDay,
        deadline: body.deadline,
        prefs: body.prefs,
      });
      return ok({ project });
    } catch (err) {
      if (isMissingProjectTable(err)) {
        return fail(
          503,
          "Project storage isn't ready — the database hasn't finished provisioning. Try again in a minute."
        );
      }
      throw err;
    }
  }

  // Guest fallback — same shape as a stored draft, just kept in-memory
  // on the current lambda. Survives for as long as the worker stays
  // warm, which is plenty for a single onboarding session.
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
