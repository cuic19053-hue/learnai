/**
 * WikiTest generator — orchestrates parse → LLM call → validate → cache.
 *
 * Workflow:
 *   1. Hash (url + lang + difficulty + format + count) → testId.
 *   2. If a cached test exists for that id, return it. Zero LLM spend.
 *   3. Otherwise call jsonChat with testFromArticlePrompt.
 *   4. Zod-validate the response.
 *   5. Discard any question whose sourceSection doesn't actually exist
 *      in the supplied article (citation integrity rule from the spec).
 *   6. Assemble a WikiTest, persist in cache, return.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { testFromArticlePrompt } from "./prompts";
import { getStoredTest, hashKey, putCachedTest, type StoredWikiTest } from "./cache";
import type {
  Difficulty,
  Format,
  WikiArticle,
  WikiQuestion,
  WikiTest,
} from "./types";

/** Minimum number of citation-valid questions to accept a generated test. */
const MIN_ACCEPTABLE = 3;
/** Slug-safe id from prompt + index. */
const ID_RE = /[^a-z0-9-]/gi;

const RawQuestionSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  kind: z.enum(["multiple_choice", "true_false", "short_answer"]),
  prompt: z.string().min(4).max(2_000),
  choices: z.array(z.string().min(1).max(500)).max(8).optional(),
  correctIndex: z.number().int().min(0).max(7).optional(),
  expectedAnswer: z.string().min(1).max(800).optional(),
  explanation: z.string().min(1).max(2_000),
  sourceSection: z.string().min(1).max(200),
});

const RawTestSchema = z.object({
  questions: z.array(RawQuestionSchema).min(1).max(60),
});

export class WikiGenerationError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "WikiGenerationError";
  }
}

export type GenerateInput = {
  article: WikiArticle;
  url: string;
  difficulty: Difficulty;
  format: Format;
  count: number;
  language?: string;
};

export async function generateTest(input: GenerateInput): Promise<WikiTest> {
  // 1. Cache lookup ----------------------------------------------------
  const id = hashKey({
    url: input.url,
    lang: input.article.lang,
    difficulty: input.difficulty,
    format: input.format,
    count: input.count,
  });
  const cached = getStoredTest(id);
  if (cached) {
    const { sections: _sections, ...publicTest } = cached;
    return publicTest;
  }

  // 2. LLM call --------------------------------------------------------
  const messages = testFromArticlePrompt({
    title: input.article.title,
    summary: input.article.summary,
    sections: input.article.sections,
    difficulty: input.difficulty,
    format: input.format,
    count: input.count,
    language: input.language ?? input.article.lang,
  });

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      // A bit more head-room than the default — long articles + 40
      // questions need it.
      maxTokens: 2_400,
      temperature: 0.3,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new WikiGenerationError(
        `AI provider unavailable: ${err.message}`,
        err.status,
      );
    }
    throw err;
  }

  const parsed = RawTestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new WikiGenerationError(
      "AI returned malformed JSON. Try again — picking a different difficulty often helps.",
      502,
    );
  }

  // 3. Citation integrity + per-kind shape checks ---------------------
  const headings = new Set(
    input.article.sections.map((s) => s.heading.toLowerCase()),
  );

  const valid: WikiQuestion[] = [];
  for (const [i, q] of parsed.data.questions.entries()) {
    if (!headings.has(q.sourceSection.toLowerCase())) continue;

    if (q.kind === "multiple_choice") {
      if (!q.choices || q.choices.length < 2 || q.choices.length > 5) continue;
      if (q.correctIndex == null || q.correctIndex >= q.choices.length) continue;
    } else if (q.kind === "true_false") {
      if (!q.choices || q.choices.length !== 2) continue;
      if (q.correctIndex !== 0 && q.correctIndex !== 1) continue;
    } else if (q.kind === "short_answer") {
      if (!q.expectedAnswer) continue;
    }

    valid.push({
      id: slugId(q.id ?? `${id}-${i + 1}`),
      kind: q.kind,
      prompt: q.prompt.trim(),
      choices: q.choices,
      correctIndex: q.correctIndex,
      expectedAnswer: q.expectedAnswer,
      explanation: q.explanation.trim(),
      sourceSection: q.sourceSection.trim(),
    } as WikiQuestion);
  }

  if (valid.length < MIN_ACCEPTABLE) {
    throw new WikiGenerationError(
      `Generated test only had ${valid.length} citation-valid questions — try again or pick a different article.`,
      422,
    );
  }

  // 4. Persist + return -----------------------------------------------
  const finalQuestions = valid.slice(0, input.count);
  const stored: StoredWikiTest = {
    id,
    article: {
      title: input.article.title,
      lang: input.article.lang,
      canonicalUrl: input.article.canonicalUrl,
      summary: input.article.summary,
    },
    difficulty: input.difficulty,
    format: input.format,
    questions: finalQuestions,
    generatedAt: new Date().toISOString(),
    estDurationMin: estimateDurationMin(finalQuestions),
    sections: input.article.sections,
  };

  putCachedTest(stored);
  const { sections: _sections, ...publicTest } = stored;
  return publicTest;
}

function slugId(s: string): string {
  return s.replace(ID_RE, "-").replace(/-{2,}/g, "-").slice(0, 60) || "q";
}

function estimateDurationMin(qs: WikiQuestion[]): number {
  // 1 min per MCQ / TF, 2 min per short answer — rounded up to 5 min.
  const seconds = qs.reduce((acc, q) => {
    return acc + (q.kind === "short_answer" ? 120 : 60);
  }, 0);
  return Math.max(5, Math.ceil(seconds / 60));
}
