/**
 * Owner identification for synthetic-quiz jobs.
 *
 * Authenticated learners are scoped by IAM user id. Guests are scoped
 * by `guest:<ip>` so a single IP can poll and cancel its own jobs
 * without sign-in but cannot peek at another guest's job by id alone.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp } from "@/lib/api";

export async function resolveOwner(
  req: Request
): Promise<{ id: string; userId: string | null; isGuest: boolean }> {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (userId) {
    return { id: userId, userId, isGuest: false };
  }
  return { id: `guest:${clientIp(req)}`, userId: null, isGuest: true };
}
