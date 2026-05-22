import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { readinessReportPrompt } from "@/lib/interview/prompts";
import type { ReadinessReport } from "@/lib/interview/types";

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
  trainingAttempts: z
    .array(z.object({ question: z.string(), score: z.number() }))
    .max(80)
    .default([]),
  presentationScore: z.number().min(0).max(10).optional(),
  history: z
    .array(
      z.object({
        index: z.number(),
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
    .max(60)
    .default([]),
  language: z.string().min(2).max(20).optional(),
});

/**
 * POST /api/learn/interview/report
 *
 * Synthesises the final readiness report. Runs once, can afford a richer
 * model (administrator-configurable via OLLABRIDGE_MODEL).
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`report:${clientIp(req)}`, { limit: 6, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many report syntheses.");

  const body = BodySchema.parse(await req.json());

  try {
    const messages = readinessReportPrompt({
      job: body.job as never,
      profile: body.candidateProfile,
      trainingAttempts: body.trainingAttempts,
      presentationScore: body.presentationScore,
      history: body.history as never,
      language: body.language,
    });
    const report = await jsonChat<ReadinessReport>(messages, { maxTokens: 1400 });
    return ok({ report: normalise(report, body) });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({ report: deterministicReport(body), degraded: true, reason: err.message });
    }
    throw err;
  }
});

function clamp(n: unknown) {
  return Math.max(0, Math.min(10, Math.round(Number(n ?? 0))));
}

function normalise(r: ReadinessReport, body: z.infer<typeof BodySchema>): ReadinessReport {
  return {
    overallReadiness: clamp(r?.overallReadiness),
    technicalReadiness: clamp(r?.technicalReadiness),
    leadershipReadiness: clamp(r?.leadershipReadiness),
    communicationReadiness: clamp(r?.communicationReadiness),
    strongAreas: arr(r?.strongAreas, 8),
    weakAreas: arr(r?.weakAreas, 8),
    topRisks: arr(r?.topRisks, 6),
    bestAnswers: Array.isArray(r?.bestAnswers)
      ? r.bestAnswers
          .filter((b) => b && typeof b.question === "string" && typeof b.quote === "string")
          .slice(0, 3)
      : [],
    nextTrainingRecommendations: arr(r?.nextTrainingRecommendations, 6),
    finalAdvice:
      typeof r?.finalAdvice === "string" && r.finalAdvice
        ? r.finalAdvice
        : defaultAdvice(body),
  };
}

function deterministicReport(body: z.infer<typeof BodySchema>): ReadinessReport {
  const avgTraining =
    body.trainingAttempts.length === 0
      ? 0
      : body.trainingAttempts.reduce((a, t) => a + t.score, 0) / body.trainingAttempts.length;
  const avgSim =
    body.history.length === 0
      ? 0
      : body.history.reduce((a, t) => a + t.score0to10, 0) / body.history.length;
  const overall = clamp((avgTraining + avgSim + (body.presentationScore ?? 0)) / 3);
  return {
    overallReadiness: overall,
    technicalReadiness: clamp(avgSim),
    leadershipReadiness: clamp(avgSim),
    communicationReadiness: clamp(body.presentationScore ?? 5),
    strongAreas: [],
    weakAreas: [],
    topRisks: ["AI provider unavailable when generating the report."],
    bestAnswers: [],
    nextTrainingRecommendations: [
      "Re-run the report once the AI provider is healthy.",
      "Drill weakest bank one more pass.",
      "Re-record your 5-minute pitch.",
    ],
    finalAdvice: defaultAdvice(body),
  };
}

function defaultAdvice(body: z.infer<typeof BodySchema>) {
  return `Keep practising. Focus on the ${body.job.companyName} ${body.job.roleTitle} brief and aim for measurable, specific answers.`;
}

function arr<T>(v: T[] | undefined, max: number): T[] {
  return Array.isArray(v) ? v.slice(0, max) : [];
}
