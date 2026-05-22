import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fail, handler } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/export
 *
 * GDPR Article 20 — "Right to data portability". Returns a single JSON
 * document containing every row tied to the caller's userId, served
 * as an attachment so browsers offer to save it.
 *
 * Everything we hold for the user fits in one file: the User row, any
 * linked OAuth accounts (without tokens), Projects, UserPreferences,
 * UserProgress. We don't ship Sessions because JWT strategy means we
 * have no per-session rows, and we don't ship the password hash —
 * exporting one is dangerous and serves no purpose to the data subject.
 */
export const GET = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to export your data.");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      tokenVersion: true,
      // OAuth providers — only the metadata, never the bearer tokens.
      accounts: {
        select: {
          provider: true,
          type: true,
          providerAccountId: true,
        },
      },
      studentProfile: true,
      teacherProfile: true,
      projects: true,
      preferences: true,
      progress: true,
    },
  });
  if (!user) return fail(404, "User record missing.");

  const payload = {
    exportedAt: new Date().toISOString(),
    spec: "LearnAI personal data export · v1",
    notes:
      "This file contains every row LearnAI holds for your account. Authentication tokens and password hashes are intentionally omitted.",
    user,
  };

  const filename = `learnai-export-${user.id}-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      // Don't cache exports — they're user-specific and contain PII.
      "cache-control": "no-store, max-age=0",
    },
  });
});
