import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * DELETE /api/me
 *
 * Hard-deletes the caller's User row. Foreign keys cascade so every
 * Project / UserPreferences / UserProgress / Account / Session row
 * tied to this user goes with it. No soft-delete, no recovery — the
 * privacy page promises hard deletion on request.
 *
 * Caller must include their email in the JSON body as a confirmation
 * token, matching the row being deleted. This keeps an accidental
 * `curl -X DELETE` from wiping the wrong account when an admin is
 * impersonating a user.
 */
const BodySchema = z.object({
  confirmEmail: z.string().email(),
});

export const DELETE = handler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to delete your account.");

  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true },
  });
  if (!me) return fail(404, "User record missing.");
  if (me.email !== body.confirmEmail) {
    return fail(
      400,
      "The confirmation email doesn't match the signed-in account. Type your account email exactly to confirm."
    );
  }

  await prisma.user.delete({ where: { id: me.id } });
  return ok({ deleted: true });
});
