/**
 * Owner identification for LetterForge child-facing routes.
 *
 * The `learnerId` is a parent-managed profile identifier (Sofia, Lily…).
 * One signed-in parent can have several kids — we don't want to bind
 * progress to the parent's `userId` alone.
 *
 *   - signed-in parent: `learnerId` from body, owner.userId from session
 *   - guest device:     `learnerId` from cookie, owner.guestId = guest:<ip>
 *
 * The child-facing screens themselves never see this — it's purely a
 * server concern.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp } from "@/lib/api";

export async function resolveLearnerOwner(req: Request): Promise<{
  userId: string | null;
  guestId: string | null;
  isGuest: boolean;
}> {
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id ?? null;
  if (userId) return { userId, guestId: null, isGuest: false };
  return { userId: null, guestId: `guest:${clientIp(req)}`, isGuest: true };
}
