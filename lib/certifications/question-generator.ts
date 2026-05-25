/**
 * AI-driven question generator for the certifications hub.
 *
 * Uses the project's existing multi-provider AI chain
 * (`lib/ai/provider.ts`) instead of importing a single SDK directly,
 * so generation inherits the same OllaBridge default + fallback
 * behavior every other LearnAI feature uses.
 *
 * Provenance is non-negotiable: every generated question must cite
 * at least one vendor-owned official source from the certification's
 * `CertificationSource` table. The source-policy module
 * (`source-policy.ts`) gates which URLs are acceptable. Questions
 * are persisted with `isReviewed=false, isPublished=false` so an
 * admin must approve them before learners see them.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import type { ChatMessage } from "@/lib/ai/provider";
import { prisma } from "@/lib/prisma";
import { filterAllowedRefs } from "./source-policy";
import type { QuestionOption } from "./types";
import type { QuestionDifficulty, QuestionType } from "@prisma/client";

const MAX_TOKENS = 2_400;

const RawQuestionSchema = z.object({
  questionType: z
    .enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE", "SCENARIO"])
    .default("SINGLE_CHOICE"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  prompt: z.string().min(10).max(2_000),
  options: z
    .array(
      z.object({
        key: z.string().min(1).max(2),
        text: z.string().min(1).max(400),
      })
    )
    .min(2)
    .max(6),
  correctAnswers: z.array(z.string().min(1).max(2)).min(1).max(4),
  explanation: z.string().min(10).max(2_000),
  officialRefs: z
    .array(
      z.object({
        title: z.string().min(1).max(400),
        url: z.string().url(),
        sourceId: z.string().optional(),
      })
    )
    .min(1)
    .max(5),
  tags: z.array(z.string().min(1).max(60)).max(10).default([]),
});

const RawResponseSchema = z.object({
  questions: z.array(RawQuestionSchema).max(50),
});

export class QuestionGenerationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "QuestionGenerationError";
  }
}

export type GenerateQuestionsInput = {
  certificationId: string;
  count: number;
  difficulty: QuestionDifficulty;
  /** When set, generated questions are linked to this domain. */
  domainId?: string;
};

export type GeneratedQuestionRow = {
  id: string;
  prompt: string;
  difficulty: QuestionDifficulty;
  questionType: QuestionType;
  isReviewed: boolean;
  isPublished: boolean;
};

export async function generateQuestionsForCertification(
  input: GenerateQuestionsInput
): Promise<GeneratedQuestionRow[]> {
  const certification = await prisma.certification.findUnique({
    where: { id: input.certificationId },
    include: { sources: true, domains: true },
  });
  if (!certification) throw new QuestionGenerationError("Certification not found.", 404);

  const officialSources = certification.sources.filter((s) => s.vendorOwned);
  if (officialSources.length === 0) {
    throw new QuestionGenerationError(
      "Certification has no vendor-owned sources. Seed sources first.",
      400
    );
  }

  // Validate the optional domain belongs to this certification.
  if (input.domainId) {
    const domain = certification.domains.find((d) => d.id === input.domainId);
    if (!domain) {
      throw new QuestionGenerationError("Domain does not belong to this certification.", 400);
    }
  }

  const messages = buildPrompt({
    title: certification.title,
    code: certification.code,
    vendor: certification.vendor,
    level: certification.level,
    sources: officialSources,
    count: input.count,
    difficulty: input.difficulty,
  });

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: MAX_TOKENS,
      temperature: 0.35,
      timeoutMs: 45_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new QuestionGenerationError(err.message, err.status);
    }
    throw err;
  }

  const parsed = RawResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new QuestionGenerationError(
      "AI returned malformed JSON. Try again with a smaller batch.",
      502
    );
  }

  const allowedSourceUrls = new Set(officialSources.map((s) => s.url));
  const created: GeneratedQuestionRow[] = [];

  for (const q of parsed.data.questions.slice(0, input.count)) {
    // Source-policy gate (defense in depth — the prompt also instructs
    // the model, but we never trust the model alone).
    const refs = filterAllowedRefs(q.officialRefs).map((r) => {
      // Best-effort link to a source row id so we can later jump from
      // a question to its source.
      const match = officialSources.find((s) => s.url === r.url);
      return { ...r, sourceId: match?.id ?? r.sourceId };
    });
    if (refs.length === 0) continue;
    // Require at least one cited URL to actually match one of the
    // configured sources — model citations must trace to known refs.
    if (!refs.some((r) => allowedSourceUrls.has(r.url))) continue;

    // Per-type shape validation beyond the schema.
    if (!validatePerKindShape(q)) continue;

    const row = await prisma.certificationQuestion.create({
      data: {
        certificationId: certification.id,
        domainId: input.domainId ?? null,
        questionType: q.questionType,
        difficulty: q.difficulty,
        prompt: q.prompt.trim(),
        options: q.options.map<QuestionOption>((o) => ({
          key: o.key.toUpperCase(),
          text: o.text.trim(),
        })) as unknown as object,
        correctAnswers: q.correctAnswers.map((a) => a.toUpperCase()),
        explanation: q.explanation.trim(),
        officialRefs: refs as unknown as object,
        tags: q.tags ?? [],
        isAiGenerated: true,
        isReviewed: false,
        isPublished: false,
      },
      select: {
        id: true,
        prompt: true,
        difficulty: true,
        questionType: true,
        isReviewed: true,
        isPublished: true,
      },
    });
    created.push(row);
  }

  return created;
}

function validatePerKindShape(q: z.infer<typeof RawQuestionSchema>): boolean {
  const keys = new Set(q.options.map((o) => o.key.toUpperCase()));
  if (keys.size !== q.options.length) return false;
  for (const correct of q.correctAnswers) {
    if (!keys.has(correct.toUpperCase())) return false;
  }
  if (q.questionType === "SINGLE_CHOICE" && q.correctAnswers.length !== 1) return false;
  if (q.questionType === "TRUE_FALSE" && q.options.length !== 2) return false;
  return true;
}

function buildPrompt(args: {
  title: string;
  code: string;
  vendor: string;
  level: string;
  sources: ReadonlyArray<{ title: string; url: string }>;
  count: number;
  difficulty: QuestionDifficulty;
}): ChatMessage[] {
  const sourceList = args.sources.map((s) => `- ${s.title}: ${s.url}`).join("\n");

  const system =
    "You are an exam-question writer who produces ORIGINAL practice questions " +
    "grounded ONLY in the supplied vendor-owned official sources. " +
    "You never copy real exam questions, exam dumps, or third-party brain dumps. " +
    "You never claim a question is from a real exam. " +
    "If you cannot generate a grounded question, return an empty array.";

  const user = [
    `Certification: ${args.title} (${args.code})`,
    `Vendor: ${args.vendor}`,
    `Level: ${args.level}`,
    "",
    "Vendor-owned official sources (use ONLY these):",
    sourceList,
    "",
    `Generate up to ${args.count} ORIGINAL practice questions at ${args.difficulty} difficulty.`,
    "",
    "Hard rules:",
    "- Each question is a SINGLE_CHOICE with exactly 4 options unless the topic",
    "  naturally suits MULTI_CHOICE (2-4 correct), TRUE_FALSE (2 options), or",
    "  SCENARIO (a paragraph + 4 options).",
    "- Distractors must be plausible and drawn from the same vendor's domain.",
    "- Each `officialRefs[].url` MUST appear in the list above.",
    "- Explanation is 1-3 sentences and references the cited source.",
    "- DO NOT mention 'real exam' or 'actual exam'.",
    "",
    "Reply with JSON only — no commentary, no markdown fence:",
    "{",
    '  "questions": [',
    "    {",
    '      "questionType": "SINGLE_CHOICE" | "MULTI_CHOICE" | "TRUE_FALSE" | "SCENARIO",',
    '      "difficulty": "EASY" | "MEDIUM" | "HARD",',
    '      "prompt": "string",',
    '      "options": [{ "key": "A", "text": "..." }, ...],',
    '      "correctAnswers": ["A"],',
    '      "explanation": "string",',
    '      "officialRefs": [{ "title": "...", "url": "https://..." }],',
    '      "tags": ["..."]',
    "    }",
    "  ]",
    "}",
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
