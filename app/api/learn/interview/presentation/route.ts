import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { presentationPrompt } from "@/lib/interview/prompts";
import type { PresentationFeedback } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  job: z.object({
    companyName: z.string().min(1).max(120),
    roleTitle: z.string().min(1).max(140),
    seniority: z.string().max(40).optional(),
    jobDescription: z.string().min(50).max(20_000),
  }),
  candidateProfile: z
    .object({
      fullName: z.string().max(120).optional(),
      cvText: z.string().max(20_000).optional(),
      linkedinUrl: z.string().url().max(300).optional(),
      yearsExperience: z.number().int().min(0).max(80).optional(),
      mainTech: z.array(z.string().max(40)).max(40).optional(),
      mainLeadership: z.string().max(2000).optional(),
    })
    .optional(),
  presentationText: z.string().min(10).max(10_000),
  durationSeconds: z.number().int().min(1).max(900),
  language: z.string().min(2).max(20).optional(),
});

/**
 * POST /api/learn/interview/presentation
 *
 * Scores a 5-minute self-presentation against the JD and CV. Returns
 * PresentationFeedback (clarity / structure / role-relevance / confidence +
 * improved script). Falls back to a deterministic skeleton on AI failure.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`pitch:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many presentation scores requested.");

  const body = BodySchema.parse(await req.json());

  try {
    const messages = presentationPrompt({
      job: body.job as never,
      profile: body.candidateProfile,
      presentationText: body.presentationText,
      durationSeconds: body.durationSeconds,
      language: body.language,
    });
    const feedback = await jsonChat<PresentationFeedback>(messages, { maxTokens: 1200 });
    return ok({ feedback: normalise(feedback, body.durationSeconds) });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({
        feedback: degradedFeedback(body.durationSeconds, err.message),
        degraded: true,
        reason: err.message,
      });
    }
    throw err;
  }
});

function normalise(f: PresentationFeedback, durationSec: number): PresentationFeedback {
  const c0to10 = (n: unknown) => Math.max(0, Math.min(10, Math.round(Number(n ?? 0))));
  return {
    durationSec,
    score0to10: c0to10(f?.score0to10),
    clarity: c0to10(f?.clarity),
    structure: c0to10(f?.structure),
    roleRelevance: c0to10(f?.roleRelevance),
    confidence: c0to10(f?.confidence),
    timingFeedback: f?.timingFeedback ?? "",
    strengths: Array.isArray(f?.strengths) ? f.strengths.slice(0, 6) : [],
    weaknesses: Array.isArray(f?.weaknesses) ? f.weaknesses.slice(0, 6) : [],
    missingPoints: Array.isArray(f?.missingPoints) ? f.missingPoints.slice(0, 6) : [],
    improvedScript: typeof f?.improvedScript === "string" ? f.improvedScript : "",
  };
}

function degradedFeedback(durationSec: number, reason: string): PresentationFeedback {
  return {
    durationSec,
    score0to10: 5,
    clarity: 5,
    structure: 5,
    roleRelevance: 5,
    confidence: 5,
    timingFeedback:
      durationSec < 240
        ? "Too short — aim for closer to 5 minutes."
        : durationSec > 360
          ? "A little long — try to land closer to 5 minutes."
          : "Timing is on target.",
    strengths: [],
    weaknesses: [`AI provider unavailable (${reason}). Re-try for full feedback.`],
    missingPoints: [],
    improvedScript: "",
  };
}
