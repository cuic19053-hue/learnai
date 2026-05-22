import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { scoreAttemptPrompt } from "@/lib/interview/prompts";
import type { AnswerScore } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  question: z.string().min(3).max(1000),
  answer: z.string().min(3).max(8000),
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
  language: z.string().min(2).max(20).optional(),
});

/**
 * POST /api/learn/interview/score-attempt
 *
 * Scores one drill answer. Returns AnswerScore. If the AI is down, returns
 * a neutral pass-through so the UI stays usable.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`drill:${clientIp(req)}`, { limit: 40, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many drill submissions.");

  const body = BodySchema.parse(await req.json());

  try {
    const messages = scoreAttemptPrompt({
      question: body.question,
      answer: body.answer,
      job: body.job as never,
      profile: body.candidateProfile,
      language: body.language,
    });
    const score = await jsonChat<AnswerScore>(messages, { maxTokens: 700 });
    return ok({ score: clamp(score) });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({
        score: {
          score0to10: 5,
          signal: "average",
          strengths: [],
          weaknesses: ["AI provider is temporarily unavailable — re-try to get scoring."],
          improvedAnswer: "",
        } as AnswerScore,
        degraded: true,
        reason: err.message,
      });
    }
    throw err;
  }
});

function clamp(s: AnswerScore): AnswerScore {
  const score = Math.max(0, Math.min(10, Math.round(Number(s?.score0to10 ?? 0))));
  return {
    score0to10: score,
    signal: s?.signal ?? (score <= 4 ? "weak" : score <= 7 ? "average" : "strong"),
    strengths: Array.isArray(s?.strengths) ? s.strengths.slice(0, 6) : [],
    weaknesses: Array.isArray(s?.weaknesses) ? s.weaknesses.slice(0, 6) : [],
    improvedAnswer: typeof s?.improvedAnswer === "string" ? s.improvedAnswer : "",
    star: s?.star,
  };
}
