/**
 * Owner identification for defense routes. Same pattern as the wiki
 * and synthetic owners — userId for signed-in callers, guest:<ip>
 * for anonymous so multi-step flows still survive within an IP.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp } from "@/lib/api";

export async function resolveDefenseOwner(req: Request): Promise<{
  userId: string | null;
  guestId: string | null;
  isGuest: boolean;
}> {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (userId) return { userId, guestId: null, isGuest: false };
  return { userId: null, guestId: `guest:${clientIp(req)}`, isGuest: true };
}
