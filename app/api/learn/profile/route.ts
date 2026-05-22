import { z } from "zod";
import {
  clearProfile,
  defaultAttentionMinutes,
  readProfile,
  writeProfile,
} from "@/lib/learn/profile";
import { ensureGuestId } from "@/lib/learn/guest";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";

export const dynamic = "force-dynamic";

const StageEnum = z.enum([
  "LITTLE_LEARNER",
  "EXPLORER",
  "BUILDER",
  "SCHOLAR",
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
  return ok({ profile });
});

export const DELETE = handler(async () => {
  await clearProfile();
  return ok({});
});
