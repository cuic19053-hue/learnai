/**
 * Owner identification for WikiTest endpoints.
 *
 * Signed-in users own snapshots and attempts by IAM id; guests own by
 * a per-IP guest id so they can list and grade their own attempts
 * without an account. Same pattern as `lib/synthetic/jobs/owner.ts`.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp } from "@/lib/api";

export async function resolveWikiOwner(req: Request): Promise<{
  userId: string | null;
  guestId: string | null;
  isGuest: boolean;
}> {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (userId) return { userId, guestId: null, isGuest: false };
  return { userId: null, guestId: `guest:${clientIp(req)}`, isGuest: true };
}
