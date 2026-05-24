/**
 * POST /api/v1/session/hear
 *
 * The "🔊 Hear it" button was tapped. Non-blocking — fires a write
 * to a counter on LetterforgeProgress so the parent dashboard can
 * show engagement, but always returns 204 immediately (the kid
 * shouldn't wait on the network).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveLearnerOwner } from "@/lib/letterforge/owner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  learnerId: z.string().min(2).max(64),
  glyphId: z.string().cuid(),
});

export const POST = handler(async (req: Request) => {
  const body = BodySchema.parse(await req.json());
  const owner = await resolveLearnerOwner(req);
  // Fire-and-forget. If the progress row doesn't exist yet, create
  // a blank one so the "hear" tap still counts as engagement.
  prisma.letterforgeProgress
    .upsert({
      where: { learnerId_glyphId: { learnerId: body.learnerId, glyphId: body.glyphId } },
      create: {
        learnerId: body.learnerId,
        glyphId: body.glyphId,
        userId: owner.userId,
        guestId: owner.guestId,
        timesAttempted: 0,
        bestStars: 0,
        stickerEarned: false,
        lastAttemptAt: new Date(),
      },
      update: { lastAttemptAt: new Date() },
    })
    .catch(() => undefined);
  // Best-effort — we don't block the child on a 200.
  return ok({ logged: true });
});

export const GET = handler(async () => fail(405, "POST only."));
