import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { simulationTurnPrompt } from "@/lib/interview/prompts";

export const dynamic = "force-dynamic";

const TurnSchema = z.object({
  round: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  question: z.string().min(3).max(2000),
  userAnswer: z.string().min(1).max(8000),
  history: z
    .array(
      z.object({
        index: z.number().int().min(0),
        round: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        question: z.string(),
        answer: z.string(),
        score0to10: z.number(),
        signal: z.enum(["weak", "average", "strong"]),
        feedbackBullets: z.array(z.string()).default([]),
        strengths: z.array(z.string()).default([]),
        weaknesses: z.array(z.string()).default([]),
        improvedAnswer: z.string().default(""),
        communication: z.object({
          clarity: z.number(),
          structure: z.number(),
          confidence: z.number(),
          relevance: z.number(),
        }),
      }),
    )
    .max(50)
    .default([]),
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

type RawTurnResult = {
  feedbackBullets?: string[];
  strengths?: string[];
  weaknesses?: string[];
  improvedAnswer?: string;
  score0to10?: number;
  signal?: "weak" | "average" | "strong";
  nextQuestion?: string;
  tags?: string[];
  communication?: {
    clarity?: number;
    structure?: number;
    confidence?: number;
    relevance?: number;
  };
};

/**
 * POST /api/learn/interview/simulation-turn
 *
 * Stateless. Accepts the question that was just asked + the candidate's
 * answer + the full prior history + the round. Returns scoring AND the
 * next question (or null if the round is full — the client advances).
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`sim:${clientIp(req)}`, { limit: 40, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many simulation turns.");

  const body = TurnSchema.parse(await req.json());

  try {
    const messages = simulationTurnPrompt({
      job: body.job as never,
      profile: body.candidateProfile,
      history: body.history as never,
      userAnswer: body.userAnswer,
      round: body.round,
      language: body.language,
    });
    const raw = await jsonChat<RawTurnResult>(messages, { maxTokens: 900 });
    return ok({ turn: normaliseTurn(raw, body) });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({
        turn: degradedTurn(body),
        degraded: true,
        reason: err.message,
      });
    }
    throw err;
  }
});

function normaliseTurn(raw: RawTurnResult, body: z.infer<typeof TurnSchema>) {
  const clamp = (n: unknown) =>
    Math.max(0, Math.min(10, Math.round(Number(n ?? 0))));
  const score = clamp(raw.score0to10);
  return {
    index: body.history.length,
    round: body.round,
    question: body.question,
    answer: body.userAnswer,
    score0to10: score,
    signal: raw.signal ?? (score <= 4 ? "weak" : score <= 7 ? "average" : "strong"),
    feedbackBullets: arr(raw.feedbackBullets, 6),
    strengths: arr(raw.strengths, 6),
    weaknesses: arr(raw.weaknesses, 6),
    improvedAnswer: typeof raw.improvedAnswer === "string" ? raw.improvedAnswer : "",
    nextQuestion: typeof raw.nextQuestion === "string" ? raw.nextQuestion : "",
    tags: arr(raw.tags, 8),
    communication: {
      clarity: clamp(raw.communication?.clarity),
      structure: clamp(raw.communication?.structure),
      confidence: clamp(raw.communication?.confidence),
      relevance: clamp(raw.communication?.relevance),
    },
  };
}

function degradedTurn(body: z.infer<typeof TurnSchema>) {
  return {
    index: body.history.length,
    round: body.round,
    question: body.question,
    answer: body.userAnswer,
    score0to10: 5,
    signal: "average" as const,
    feedbackBullets: [
      "AI provider temporarily unavailable — answer recorded, no live scoring.",
    ],
    strengths: [],
    weaknesses: [],
    improvedAnswer: "",
    nextQuestion: "",
    tags: [],
    communication: { clarity: 5, structure: 5, confidence: 5, relevance: 5 },
  };
}

function arr<T>(v: T[] | undefined, max: number): T[] {
  return Array.isArray(v) ? v.slice(0, max) : [];
}
