import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { tutorReply } from "@/lib/ai/tutor";

export const dynamic = "force-dynamic";

const TurnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  text: z.string().min(1).max(4_000),
});

const BodySchema = z.object({
  history: z.array(TurnSchema).min(0).max(20),
  context: z.object({
    kind: z.enum([
      "world-home",
      "lesson",
      "wiki-hub",
      "wiki-detail",
      "wiki-train",
      "wiki-quiz",
      "wiki-report",
      "library",
      "missions",
      "achievements",
      "languages",
      "certifications",
    ]),
    topic: z.string().max(200).optional(),
    worldLabel: z.string().max(60).optional(),
    worldSlug: z.string().max(20).optional(),
    teacherName: z.string().max(60).optional(),
  }),
});

/**
 * POST /api/tutor/chat
 *   { history: [{role,text}, …], context: { kind, topic?, worldLabel?, worldSlug?, teacherName? } }
 *
 * The backend for the persistent tutor rail. Sends `history + ctx`
 * through the configured AI provider chain and returns a plain-text
 * reply. Falls back to a sensible static reply when the chain fails so
 * the rail is never silent.
 *
 * Rate-limited to 30 messages per minute per IP — generous, since the
 * rail is a per-session conversation and chat history is the primary
 * UX.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`tutor:chat:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail(429, "Pause for a minute — the tutor is rate-limited per IP.");
  }

  const body = BodySchema.parse(await req.json());
  const result = await tutorReply(body.history, body.context);
  return ok({
    reply: result.reply,
    source: result.source,
    latencyMs: result.latencyMs,
    aiError: result.aiError,
  });
});
