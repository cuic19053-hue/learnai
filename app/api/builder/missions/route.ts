/**
 * GET /api/GRADE_8/missions
 *
 * Lists every published GRADE_8 mission with this user's progress
 * stitched in. Returns the static seed list when the DB is empty.
 *
 * Anonymous callers get the catalog with progress counts zeroed; no
 * auth required for read-only listing.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { listMissions } from "@/lib/GRADE_8/missions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request) => {
  const limit = rateLimit(`GRADE_8:missions:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many requests.");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const missions = await listMissions(userId);
  return ok({ missions });
});
