/**
 * GET /api/builder/recommendations
 *
 * Returns Nova's recommendation for the dashboard's right-rail card.
 * The default response is a static, design-aligned suggestion so the
 * page renders instantly without an LLM round-trip. When the user
 * appends `?live=1`, we call the multi-provider AI chain to synthesize
 * a personalized variant from the user's recent BuilderStepProgress.
 *
 * Personalized calls are rate-limited and never block rendering —
 * they're optional sparkle, not required for the page to load.
 */

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { chat, AiProviderError } from "@/lib/ai/provider";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STATIC_RECOMMENDATION = {
  title: "Try a logic puzzle before today's mission",
  body: "Yesterday's session showed you flew through patterns but slowed on edge cases. A 10-minute warm-up sharpens both.",
  ctaLabel: "Start warm-up",
  ctaHref: "/learn/lesson/builder?mission=logic-gates",
  source: "static" as const,
};

export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const live = url.searchParams.get("live") === "1";

  if (!live) return ok({ recommendation: STATIC_RECOMMENDATION });

  // Live LLM-personalized path — gated tighter to bound spend.
  const limit = rateLimit(`builder:recs:live:${clientIp(req)}`, { limit: 12, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many personalized requests, try again shortly.");

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  if (!userId) return ok({ recommendation: STATIC_RECOMMENDATION });

  let recentTypes: string[] = [];
  try {
    const recent = await prisma.builderStepProgress.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 10,
      include: { step: { select: { type: true, title: true } } },
    });
    recentTypes = recent.map((p) => p.step.type);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[builder.recs] history lookup failed, using static", err);
    return ok({ recommendation: STATIC_RECOMMENDATION });
  }

  if (recentTypes.length === 0) {
    return ok({ recommendation: STATIC_RECOMMENDATION });
  }

  try {
    const text = await chat(
      [
        {
          role: "system",
          content:
            'You are Nova, a calm, friendly AI teacher for ages 12-15 in the Builder Academy. Output strict JSON with keys "title" (max 8 words) and "body" (max 32 words). No markdown, no code fences, no preamble. The recommendation is a 10-minute warm-up tied to the learner\'s recent loop activity.',
        },
        {
          role: "user",
          content: `Recent loop steps completed (oldest→newest): ${recentTypes.join(", ")}. Suggest a single 10-minute warm-up that sharpens the weakest of those step types.`,
        },
      ],
      { maxTokens: 240, temperature: 0.4 }
    );
    const parsed = safeParseRec(text);
    if (!parsed) return ok({ recommendation: STATIC_RECOMMENDATION });
    return ok({
      recommendation: {
        title: parsed.title,
        body: parsed.body,
        ctaLabel: "Start warm-up",
        ctaHref: "/learn/lesson/builder?mission=logic-gates",
        source: "ai" as const,
      },
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({ recommendation: STATIC_RECOMMENDATION });
    }
    throw err;
  }
});

function safeParseRec(text: string): { title: string; body: string } | null {
  try {
    // Strip code-fences defensively in case the model wraps JSON.
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/i, "")
      .trim();
    const obj = JSON.parse(cleaned) as unknown;
    if (
      obj &&
      typeof obj === "object" &&
      "title" in obj &&
      "body" in obj &&
      typeof (obj as { title: unknown }).title === "string" &&
      typeof (obj as { body: unknown }).body === "string"
    ) {
      const o = obj as { title: string; body: string };
      return { title: o.title.slice(0, 120), body: o.body.slice(0, 320) };
    }
    return null;
  } catch {
    return null;
  }
}
