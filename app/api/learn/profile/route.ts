import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import {
  clearProfile,
  defaultAttentionMinutes,
  readProfile,
  writeProfile,
} from "@/lib/learn/profile";
import { ensureGuestId } from "@/lib/learn/guest";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const StageEnum = z.enum([
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
]);

const ProfileSchema = z.object({
  id: z.string().min(1).max(64).optional(),
  name: z.string().min(1).max(80),
  stage: StageEnum,
  age: z.number().int().min(0).max(120).optional(),
  language: z.string().min(2).max(10).default("en"),
  attentionMinutes: z.number().int().min(1).max(120).optional(),
  interests: z.array(z.string().max(40)).max(20).default([]),
});

export const GET = handler(async () => {
  const profile = await readProfile();
  return ok({ profile });
});

export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`profile:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many profile updates. Slow down.");

  const body = ProfileSchema.parse(await req.json());
  const guestId = await ensureGuestId();
  const profile = {
    id: body.id ?? guestId,
    name: body.name,
    stage: body.stage,
    age: body.age,
    language: body.language,
    attentionMinutes: body.attentionMinutes ?? defaultAttentionMinutes(body.stage),
    interests: body.interests,
  };
  await writeProfile(profile);

  // For signed-in users, also mirror the name into the User row so the
  // header dropdown, welcome banner, and tutor greetings all pick up
  // the onboarding answer immediately — instead of saying "Welcome
  // back, ruslan.mv" (the email-derived fallback) on the first lesson.
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const current = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true },
      });
      // Only set the name when it's empty / a stub — never overwrite
      // a value the user explicitly edited on /settings/profile.
      const stub = !current?.name || current.name.trim().length === 0;
      if (stub) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { name: body.name.trim() },
        });
      }
    }
  } catch (err) {
    // Non-fatal: cookie write already succeeded above. If the DB write
    // failed (table missing, Prisma error) the onboarding still
    // completes; the next /settings/profile visit will let them retry.
    if (!(err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021")) {
      // eslint-disable-next-line no-console
      console.error("[profile] failed to mirror name to User row:", err);
    }
  }

  return ok({ profile });
});

export const DELETE = handler(async () => {
  await clearProfile();
  return ok({});
});
