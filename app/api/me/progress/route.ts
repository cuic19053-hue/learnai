import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fail, handler, ok } from "@/lib/api";
import {
  getUserProgress,
  isMissingProgressTable,
  upsertUserProgress,
} from "@/lib/me/progress-store";
import { PROGRESS_VERSION, type ProgressState } from "@/lib/progress/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/progress
 *
 * Returns the caller's full progress blob. Empty defaults if they've
 * never written one — caller can detect that case via `xp === 0 &&
 * updatedAt === epoch` and decide whether to push their local cookie
 * state up as the initial value.
 */
export const GET = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to load your progress.");

  try {
    const progress = (await getUserProgress(session.user.id)) ?? {
      v: PROGRESS_VERSION,
      xp: 0,
      streak: { current: 0, longest: 0, lastActive: null },
      worlds: {},
      achievements: [],
      updatedAt: new Date(0).toISOString(),
    };
    return ok({ progress });
  } catch (err) {
    if (isMissingProgressTable(err)) {
      return fail(503, "Progress storage isn't ready — try again in a minute.");
    }
    throw err;
  }
});

/**
 * PUT /api/me/progress
 *
 * Full-state write. The client computes the next state via its reducer
 * (the canonical source of streak / XP rules), then pushes the whole
 * blob here. Partial updates would force us to duplicate the streak
 * arithmetic on the server — not worth it for a single-user metric.
 */
const WorldProgressSchema = z.object({
  xp: z.number().int().nonnegative().max(10_000_000),
  lessonsCompleted: z.number().int().nonnegative().max(100_000),
  lastSeen: z.string().nullable(),
});

const ProgressSchema = z.object({
  v: z.number().int(),
  xp: z.number().int().nonnegative().max(10_000_000),
  streak: z.object({
    current: z.number().int().nonnegative().max(10_000),
    longest: z.number().int().nonnegative().max(10_000),
    lastActive: z.string().nullable(),
  }),
  worlds: z.record(z.string().max(40), WorldProgressSchema),
  achievements: z.array(z.string().max(120)).max(500),
  updatedAt: z.string(),
});

export const PUT = handler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to save your progress.");

  const body = ProgressSchema.parse(await req.json()) as ProgressState;

  try {
    const saved = await upsertUserProgress(session.user.id, body);
    return ok({ progress: saved });
  } catch (err) {
    if (isMissingProgressTable(err)) {
      return fail(503, "Progress storage isn't ready — try again in a minute.");
    }
    throw err;
  }
});
