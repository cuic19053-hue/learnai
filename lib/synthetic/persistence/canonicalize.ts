/**
 * Map internal `SynthQuestion` → public `CanonicalQuestion`.
 *
 * This is the *only* place that knows the canonical certifications
 * schema, so any tweak to the public format lives in one file.
 *
 * Letter prefixes ("A. ...", "B. ...") match the convention used by
 * the existing cert-pack JSON so the Lesson Player renders synthetic
 * quizzes identically to bundled packs.
 */

import { createHash } from "node:crypto";
import type {
  CanonicalQuestion,
  CanonicalQuiz,
  Chunk,
  QuizConfig,
  ExtractedSource,
  SourceInput,
  SynthQuestion,
} from "../types";

const LETTERS = ["A", "B", "C", "D", "E"] as const;

function withLetters(options: string[]): string[] {
  return options.map((opt, i) => {
    // If the upstream LLM already prefixed with "A.", "A)" etc., keep it.
    if (/^[A-E][.)]\s/.test(opt.trim())) return opt.trim();
    const letter = LETTERS[i] ?? `Q${i + 1}`;
    return `${letter}. ${opt.trim()}`;
  });
}

export function canonicalizeQuestion(
  q: SynthQuestion,
  chunk: Pick<Chunk, "id" | "anchorHeading">
): CanonicalQuestion {
  if (q.kind === "short_answer") {
    return {
      question: q.prompt,
      options: [],
      correct: "",
      explanation: q.explanation,
      references: q.citation,
      meta: {
        kind: "short_answer",
        expectedAnswer: q.expectedAnswer,
        sourceChunkId: chunk.id,
        sourceHeading: chunk.anchorHeading,
      },
    };
  }

  const lettered = withLetters(q.options ?? []);
  const idx = q.correctIndex ?? 0;
  const correct = lettered[idx] ?? lettered[0] ?? "";
  return {
    question: q.prompt,
    options: lettered,
    correct,
    explanation: q.explanation,
    references: q.citation,
    meta: {
      kind: q.kind,
      sourceChunkId: chunk.id,
      sourceHeading: chunk.anchorHeading,
    },
  };
}

/**
 * Build the public `CanonicalQuiz` from a finished job's
 * accepted questions. The id is deterministic over
 * (source fingerprint + config) — the same input always
 * produces the same id, mirroring the wiki-test cache behavior.
 */
export function buildCanonicalQuiz(args: {
  source: ExtractedSource;
  sourceInput: SourceInput;
  config: QuizConfig;
  questions: CanonicalQuestion[];
}): CanonicalQuiz {
  const { source, sourceInput, config, questions } = args;
  const id = quizIdFor(source.fingerprint, config);
  return {
    id,
    title: source.title,
    source: {
      kind: sourceInput.kind,
      canonicalUrl: source.canonicalUrl,
      filename: sourceInput.kind === "upload" ? sourceInput.filename : undefined,
      fingerprint: source.fingerprint,
    },
    config,
    questions,
    generatedAt: new Date().toISOString(),
    estDurationMin: estimateDurationMin(questions),
  };
}

export function quizIdFor(fingerprint: string, config: QuizConfig): string {
  return createHash("sha256")
    .update(
      [
        fingerprint,
        config.difficulty,
        config.types.slice().sort().join(","),
        String(config.count),
        String(config.questionsPerChunk),
        config.language,
        (config.focusKeywords ?? []).slice().sort().join(","),
      ].join("|")
    )
    .digest("hex")
    .slice(0, 24);
}

function estimateDurationMin(qs: CanonicalQuestion[]): number {
  const seconds = qs.reduce((acc, q) => acc + (q.meta?.kind === "short_answer" ? 120 : 60), 0);
  return Math.max(5, Math.ceil(seconds / 60));
}
