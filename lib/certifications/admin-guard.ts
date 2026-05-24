/**
 * Tiny shared helper for the admin certifications routes.
 *
 * Centralises the "require ADMIN role" check so every admin route
 * uses the same envelope and never accidentally trusts an
 * unauthenticated request.
 */

import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AdminGuardResult =
  | { ok: true; userId: string }
  | { ok: false; status: number; message: string };

export async function requireAdmin(): Promise<AdminGuardResult> {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false, status: 403, message: "Admin only." };
  return { ok: true, userId: user.id };
}
