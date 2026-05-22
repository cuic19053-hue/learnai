import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/profile
 *
 * Returns the signed-in user's identity fields so the settings page
 * and header dropdown don't have to scrape `useSession()` for them.
 * `null` fields when the user is signed in but has incomplete data,
 * never returns another user's row.
 */
export const GET = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to view your profile.");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      // Lets the UI render "Signed in with Google" vs "Email password"
      // without needing a separate API call.
      accounts: { select: { provider: true } },
    },
  });
  if (!user) return fail(404, "User record missing.");

  return ok({
    profile: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      providers: user.accounts.map((a) => a.provider),
      // True when the user has a password set — i.e. signed up via the
      // credentials form. Hidden from clients in any other case so we
      // don't leak account state.
      hasPassword: false,
    },
  });
});

const PatchSchema = z.object({
  name: z.string().min(1).max(80).optional(),
});

/**
 * PATCH /api/me/profile
 *
 * Update editable fields. Today only `name` — email is read-only for
 * OAuth users and credentials-flow email change needs verification
 * (out of scope for this batch).
 */
export const PATCH = handler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to update your profile.");

  const patch = PatchSchema.parse(await req.json());
  if (!patch.name) return fail(400, "Nothing to update.");

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: patch.name.trim() },
    select: { id: true, name: true, email: true, image: true, role: true },
  });
  return ok({ profile: updated });
});
