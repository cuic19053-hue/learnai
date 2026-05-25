/**
 * Signed-in guard for the user-facing "Create your own pack" flow.
 *
 * Mirrors `requireAdmin()` in shape but only requires a session — any
 * authenticated learner can create a community pack. The pack stays in
 * DRAFT until the creator (or an admin) publishes it; aggressive
 * rate-limiting upstream keeps abuse bounded.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type UserGuardResult =
  | { ok: true; userId: string; role: string }
  | { ok: false; status: number; message: string };

export async function requireSignedIn(): Promise<UserGuardResult> {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false, status: 401, message: "Sign in required." };
  return { ok: true, userId: user.id, role: user.role ?? "USER" };
}
