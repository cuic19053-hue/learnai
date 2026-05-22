import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/sessions
 *
 * Returns a high-level view of "where am I signed in". Because we run
 * NextAuth with JWT strategy (cookie is the session, no DB-side
 * Session rows), we can't enumerate every device individually. We
 * instead surface the linked providers + the current tokenVersion,
 * which is what powers the "Sign out everywhere" action.
 */
export const GET = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to view your sessions.");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      tokenVersion: true,
      createdAt: true,
      accounts: {
        select: {
          provider: true,
        },
      },
    },
  });
  if (!user) return fail(404, "User record missing.");

  return ok({
    tokenVersion: user.tokenVersion,
    accountCreatedAt: user.createdAt.toISOString(),
    providers: user.accounts.map((a) => a.provider),
  });
});

/**
 * DELETE /api/me/sessions
 *
 * "Sign out everywhere." Increments the User's tokenVersion, which
 * makes every previously-issued JWT (on every device) fail the next
 * version check in lib/auth.ts → jwt(). Subsequent calls to
 * getServerSession return null until the user signs in again.
 *
 * The current session is also invalidated; the client should call
 * signOut() right after this resolves so the local cookie is cleared
 * and the user sees the sign-in page immediately.
 */
export const DELETE = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to invalidate your sessions.");

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { tokenVersion: { increment: 1 } },
    select: { tokenVersion: true },
  });

  return ok({ tokenVersion: updated.tokenVersion });
});
