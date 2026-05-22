/**
 * Server-side helper for the welcome-banner across world home pages.
 *
 * When a learner is signed in we greet them by the first token of their
 * NextAuth `session.user.name` (so "Ruslan Magana" → "Ruslan"). Guests
 * see "Guest" — there's no faked persona name, ever.
 *
 * Pages that call this must be `async` server components (they already
 * are — the world routes don't have any client-only escape hatches).
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getLearnerFirstName(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    const raw = session?.user?.name?.trim();
    if (!raw) return null;
    // First whitespace-delimited token. Handles "Ada Lovelace" → "Ada"
    // and single-word names without crashing.
    const first = raw.split(/\s+/)[0];
    return first || null;
  } catch {
    // Session reads can fail when NEXTAUTH_SECRET is unset in local dev;
    // treat any error as "not signed in" so the page still renders.
    return null;
  }
}

/** Returns the learner's first name, or "Guest" when no session. */
export async function getLearnerDisplayName(): Promise<string> {
  return (await getLearnerFirstName()) ?? "Guest";
}
