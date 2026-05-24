/**
 * POST /api/v1/session/find
 *
 * The "Find the apple" minigame. The child picked one of 3-4 image
 * tiles. This route just records the outcome — there's no losing
 * state. A wrong tap is logged as a try, the screen plays a gentle
 * encouragement, and the child taps again.
 *
 * Body: { learnerId, glyphId, picked: "apple" | "ant" | …, correct: boolean }
 */

import { z } from "zod";
import { handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveLearnerOwner } from "@/lib/letterforge/owner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  learnerId: z.string().min(2).max(64),
  glyphId: z.string().cuid(),
  picked: z.string().min(1).max(80),
  correct: z.boolean(),
});

export const POST = handler(async (req: Request) => {
  const body = BodySchema.parse(await req.json());
  const owner = await resolveLearnerOwner(req);

  // The find-minigame is logged via the attempts table with a special
  // `result` so the parent dashboard can show "found the apple ✓".
  await prisma.letterforgeAttempt
    .create({
      data: {
        glyphId: body.glyphId,
        learnerId: body.learnerId,
        userId: owner.userId,
        guestId: owner.guestId,
        payload: { kind: "find", picked: body.picked } as unknown as object,
        result: body.correct ? "find_correct" : "find_keep_trying",
        stars: body.correct ? 1 : 0,
      },
    })
    .catch(() => undefined);

  // Always encouragement — no losing state.
  return ok({
    message: body.correct ? "You found it! 🎉" : "Nice try — keep looking!",
    sticker_progress: body.correct ? 1 : 0,
  });
});
