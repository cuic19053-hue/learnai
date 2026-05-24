/**
 * GET /api/wiki/tests
 *
 * Returns the current owner's WikiTest library. Signed-in users see
 * the snapshots they own; guests see the snapshots they've attempted
 * (indexed by guest IP). Each item carries the most recent attempt's
 * score so the library can render badges without a second round-trip.
 */

import { handler, ok } from "@/lib/api";
import { listLibrary } from "@/lib/wiki/grading";
import { resolveWikiOwner } from "@/lib/wiki/owner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request) => {
  const owner = await resolveWikiOwner(req);
  try {
    const items = await listLibrary({
      userId: owner.userId,
      guestId: owner.guestId,
    });
    return ok({ items, owner: owner.isGuest ? "guest" : "user" });
  } catch (err) {
    // If the DB isn't reachable or the migration hasn't run, return
    // an empty list rather than 500 — the wiki feature still works
    // in guest-mode against the in-memory cache, just with no library.
    if (err instanceof Error && err.message.includes("does not exist")) {
      return ok({
        items: [],
        owner: owner.isGuest ? "guest" : "user",
        warning: "library_table_missing",
      });
    }
    throw err;
  }
});
