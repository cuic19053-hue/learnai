import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { trainingPlanPrompt } from "@/lib/interview/prompts";
import type { TrainingBank } from "@/lib/interview/types";

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

const DEFAULT_BANKS: TrainingBank[] = [
  {
    id: "recruiter",
    title: "Recruiter screen",
    description: "Self-pitch, motivation, fit, salary.",
    questions: [
      "Tell me about yourself.",
      "Why this company?",
      "Walk me through your most relevant project for this role.",
      "What salary range are you expecting?",
    ],
  },
  {
    id: "ai_llm",
    title: "AI / LLM technical",
    description: "Production AI features, evals, hallucinations, cost.",
    questions: [
      "Walk me through an LLM feature you shipped in production.",
      "How did you evaluate it? What was the eval set?",
      "How do you detect hallucinations in production?",
      "How do you reason about LLM cost and latency?",
      "RAG vs fine-tuning — when do you pick which?",
    ],
  },
  {
    id: "system_design",
    title: "System design",
    description: "Architecture at scale, trade-offs.",
    questions: [
      "Design a system that needs strong idempotency under concurrent retries.",
      "Design a RAG over a slowly-changing knowledge base.",
      "How would you make a high-traffic API cost-bounded?",
    ],
  },
  {
    id: "leadership",
    title: "Leadership",
    description: "People decisions, performance, hiring.",
    questions: [
      "Tell me about turning around an under-performer.",
      "A hire you regretted — what did you miss?",
      "Tell me about a time you pushed back on Product.",
      "Mentored a junior to senior — what did you change?",
    ],
  },
  {
    id: "behavioural",
    title: "Behavioural",
    description: "Incidents, ambiguity, working style.",
    questions: [
      "Tell me about a production incident you led.",
      "How do you handle ambiguity?",
      "Time you shipped fast at a quality cost — what was the lesson?",
    ],
  },
  {
    id: "salary",
    title: "Salary & motivation",
    description: "Number, range, what else matters.",
    questions: ["What's your range and why?", "If we can't meet your number, what else matters?"],
  },
];

/**
 * POST /api/learn/interview/training-plan
 *
 * Stateless. Returns six question banks tailored to the JD. Falls back to
 * a deterministic default plan if the AI provider fails.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`plan:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many training-plan requests.");

  const body = BodySchema.parse(await req.json());

  try {
    const messages = trainingPlanPrompt({
      job: {
        companyName: body.companyName,
        roleTitle: body.roleTitle,
        seniority: body.seniority as never,
        jobDescription: body.jobDescription,
      },
      profile: body.candidateProfile,
      language: body.language,
    });

    const result = await jsonChat<{ banks: TrainingBank[] }>(messages, { maxTokens: 1400 });
    const banks = sanitizeBanks(result?.banks ?? []);
    return ok({ banks });
  } catch (err) {
    if (err instanceof AiProviderError) {
      return ok({ banks: DEFAULT_BANKS, degraded: true, reason: err.message });
    }
    throw err;
  }
});

function sanitizeBanks(banks: TrainingBank[]): TrainingBank[] {
  if (!Array.isArray(banks) || banks.length === 0) return DEFAULT_BANKS;
  // Merge model output with the default skeleton so every expected id is present.
  const byId = new Map(DEFAULT_BANKS.map((b) => [b.id, { ...b }]));
  for (const b of banks) {
    if (!b?.id || !byId.has(b.id)) continue;
    const existing = byId.get(b.id)!;
    byId.set(b.id, {
      ...existing,
      title: b.title?.trim() || existing.title,
      description: b.description?.trim() || existing.description,
      questions: Array.isArray(b.questions)
        ? b.questions
            .map((q) => (typeof q === "string" ? q.trim() : ""))
            .filter(Boolean)
            .slice(0, 8)
        : existing.questions,
    });
  }
  return Array.from(byId.values());
}
