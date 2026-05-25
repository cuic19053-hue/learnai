/**
 * GET /api/builder/missions/[missionId]
 *
 * Returns one mission with all six loop steps and the requesting
 * user's progress. The `locked` flag on each step encodes the
 * sequential gate — the client doesn't have to recompute it.
 */

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { resolveActiveMission, STEP_ICONS } from "@/lib/builder/missions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (req: Request, ctx: { params: Promise<{ missionId: string }> }) => {
    const limit = rateLimit(`builder:mission:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
    if (!limit.allowed) return fail(429, "Too many requests.");

    const { missionId } = await ctx.params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id ?? null;

    // Special case: the seed mission (used before any DB seeding) is
    // returned by id == "active" or by the seed slug.
    if (missionId === "active") {
      const mission = await resolveActiveMission(userId);
      return ok({ mission });
    }

    try {
      const mission = await prisma.builderMission.findFirst({
        where: { OR: [{ id: missionId }, { slug: missionId }], isPublished: true },
        include: {
          steps: {
            orderBy: { order: "asc" },
            include: {
              progress: {
                where: userId ? { userId } : { userId: "__anon__" },
                select: { status: true },
              },
            },
          },
        },
      });
      if (!mission) return fail(404, `Mission not found: ${missionId}`);

      const steps = mission.steps.map((s, idx) => {
        const status = s.progress[0]?.status ?? "NOT_STARTED";
        const prev = idx > 0 ? mission.steps[idx - 1] : null;
        const prevStatus = prev?.progress[0]?.status ?? "NOT_STARTED";
        return {
          id: s.id,
          order: s.order,
          type: s.type,
          title: s.title,
          xp: s.xp,
          status,
          icon: STEP_ICONS[s.type],
          locked: prev !== null && prevStatus !== "COMPLETED",
        };
      });

      return ok({
        mission: {
          id: mission.id,
          slug: mission.slug,
          title: mission.title,
          description: mission.description,
          category: mission.category,
          xpReward: mission.xpReward,
          estimatedMinutes: mission.estimatedMinutes,
          steps,
        },
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("[builder.mission.GET] db unavailable, returning seed", err);
      const mission = await resolveActiveMission(userId);
      return ok({ mission });
    }
  }
);
