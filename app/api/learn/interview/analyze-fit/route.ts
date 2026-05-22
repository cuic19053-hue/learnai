import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { analyzeFitPrompt } from "@/lib/interview/prompts";
import { detectFocusAreas } from "@/lib/interview/focusAreas";
import type { FitAnalysis } from "@/lib/interview/types";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  companyName: z.string().min(1).max(120),
  roleTitle: z.string().min(1).max(140),
  seniority: z.string().max(40).optional(),
  jobDescription: z.string().min(50).max(20_000),
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
 * POST /api/learn/interview/analyze-fit
 *
 * Returns a FitAnalysis. Stateless — caller supplies the JD + profile.
 * Falls back to a deterministic skeleton if the AI provider is unreachable
 * (so the wizard never blocks on an outage).
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`fit:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many fit analyses. Try again in a minute.");

  const body = BodySchema.parse(await req.json());

  // Always compute the deterministic focus areas — used as a backbone in the
  // prompt and as a fallback when the LLM call fails.
  const focusAreas = detectFocusAreas(body.jobDescription).slice(0, 12);
  const focusLabels = focusAreas.map((f) => f.label);

  try {
    const messages = analyzeFitPrompt({
      job: {
        companyName: body.companyName,
        roleTitle: body.roleTitle,
        seniority: body.seniority as never,
        jobDescription: body.jobDescription,
      },
      profile: body.candidateProfile,
      language: body.language,
    });

    const analysis = await jsonChat<FitAnalysis>(messages, { maxTokens: 900 });

    // Defensive merge — make sure required arrays exist even if the model
    // skipped a key.
    const merged: FitAnalysis = {
      jobSummary: analysis.jobSummary ?? "",
      keyRequirements: dedupe([...(analysis.keyRequirements ?? []), ...focusLabels]).slice(0, 12),
      candidateStrengths: analysis.candidateStrengths ?? [],
      candidateGaps: analysis.candidateGaps ?? [],
      riskAreas: analysis.riskAreas ?? [],
      likelyTopics: dedupe([...(analysis.likelyTopics ?? []), ...focusLabels]).slice(0, 12),
      recommendedPath: analysis.recommendedPath ?? [],
    };

    return ok({ analysis: merged, focusAreas });
  } catch (err) {
    if (err instanceof AiProviderError) {
      // Graceful skeleton — the wizard can proceed and the user can try again
      // for richer copy later.
      const skeleton: FitAnalysis = {
        jobSummary: `${body.roleTitle} at ${body.companyName}.`,
        keyRequirements: focusLabels,
        candidateStrengths: [],
        candidateGaps: [],
        riskAreas: [],
        likelyTopics: focusLabels,
        recommendedPath: [
          "Drill the top 5 questions in the AI / LLM bank.",
          "Prepare 3 STAR-format leadership stories.",
          "Rehearse your 5-minute self-presentation.",
          "Run a full mock interview simulation.",
        ],
      };
      return ok({ analysis: skeleton, focusAreas, degraded: true, reason: err.message });
    }
    throw err;
  }
});

function dedupe(arr: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    const key = s.trim().toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      out.push(s.trim());
    }
  }
  return out;
}
