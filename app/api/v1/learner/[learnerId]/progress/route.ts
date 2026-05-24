/**
 * GET /api/v1/learner/:learnerId/progress
 *
 * Parent dashboard read. Returns the warm, high-level summary:
 *   - glyphs tried / mastered / total attempts
 *   - last-seen timestamp
 *   - per-glyph row (character, language, attempts, stars, sticker, last)
 *
 * Sign-in required so a parent only sees their own kid's data. We
 * also accept guests when they own the data on the same device — the
 * `guestId` is matched against the cookie/IP-derived owner.
 */

import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveLearnerOwner } from "@/lib/letterforge/owner";
import { learnerProgress } from "@/lib/letterforge/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (req: Request, ctx: { params: Promise<{ learnerId: string }> }) => {
    const { learnerId } = await ctx.params;
    if (!learnerId || learnerId.length < 2 || learnerId.length > 64) {
      return fail(400, "Invalid learnerId.");
    }
    const owner = await resolveLearnerOwner(req);

    // Owner check: at least one progress row for this learner must
    // belong to this owner. Protects against scraping by enumerating
    // common learnerIds (e.g., "sofia").
    const anyOwned = await prisma.letterforgeProgress.findFirst({
      where: {
        learnerId,
        ...(owner.userId ? { userId: owner.userId } : { guestId: owner.guestId }),
      },
      select: { id: true },
    });
    if (!anyOwned) return fail(403, "No data for this learner under this account.");

    const summary = await learnerProgress(learnerId);
    return ok(summary);
  }
);
