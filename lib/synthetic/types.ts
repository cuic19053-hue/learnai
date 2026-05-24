/**
 * Synthetic question wizard — shared types.
 *
 * Single source of truth for the data shapes that flow through every
 * stage of the pipeline (extract → chunk → generate → filter → emit).
 *
 * The output shape `CanonicalQuestion`/`CanonicalQuiz` mirrors the
 * certifications pack schema (`certifications/README.md`) so the
 * existing Lesson Player can render synthetic quizzes through the
 * same component path. New fields are additive (`meta`) and won't
 * confuse older consumers that ignore them.
 */

// ─── Source / input ─────────────────────────────────────────────────

export type SourceInput =
  | { kind: "wiki"; url: string; language?: string }
  | { kind: "upload"; uploadId: string; mime: string; filename: string }
  | { kind: "text"; body: string; title?: string };

export type Paragraph = {
  /** Nearest preceding section heading, if any. */
  heading?: string;
  text: string;
  /** Character offset from the start of the document. Used for citation back-resolution. */
  charOffset: number;
};

export type ExtractedSource = {
  title: string;
  language: string;
  /** Stable URL when applicable (wiki). Absent for uploads / pasted text. */
  canonicalUrl?: string;
  paragraphs: Paragraph[];
  charCount: number;
  /** ISO timestamp the source was fetched/parsed. */
  fetchedAt: string;
  /** Fingerprint of the *content* for caching. Excludes the timestamp. */
  fingerprint: string;
};

// ─── Chunker ────────────────────────────────────────────────────────

export type ChunkerConfig = {
  /** Soft target per chunk. */
  targetTokens: number;
  /** Sliding-window overlap. */
  overlapTokens: number;
  /** Hard ceiling on the number of chunks emitted. */
  maxChunks: number;
};

export const DEFAULT_CHUNKER: ChunkerConfig = {
  targetTokens: 350,
  overlapTokens: 70,
  maxChunks: 50,
};

export type Chunk = {
  /** Stable hash of the normalized text. */
  id: string;
  /** 0-based position in the document. */
  index: number;
  text: string;
  charOffset: number;
  anchorHeading?: string;
};

// ─── Generation config ──────────────────────────────────────────────

export type QuestionKind = "multiple_choice" | "true_false" | "short_answer";
export type Difficulty = "easy" | "medium" | "hard";

export type QuizConfig = {
  /** Total questions the learner wants (best-effort; depends on chunk supply). */
  count: number;
  /** Allowed question types. The generator picks one per chunk. */
  types: QuestionKind[];
  difficulty: Difficulty;
  /** Optional keywords to bias the AI toward certain topics. */
  focusKeywords?: string[];
  /** BCP-47-ish language code; defaults to the source's language. */
  language: string;
  /** Max questions to ask per chunk (cap 3 to keep prompts cheap). */
  questionsPerChunk: number;
};

export const DEFAULT_QUESTIONS_PER_CHUNK = 1;

// ─── Internal synth question (pre-canonicalization) ─────────────────

/**
 * Shape returned by the per-chunk LLM call after zod validation.
 * Kept separate from the canonical output so the filter pipeline
 * has a typed input and the canonicalizer is the one place that
 * rewrites into the certifications shape.
 */
export type SynthQuestion = {
  kind: QuestionKind;
  prompt: string;
  /** Filled for multiple_choice / true_false. */
  options?: string[];
  /** Index into `options` (multiple_choice / true_false). */
  correctIndex?: number;
  /** Free-text canonical answer for short_answer. */
  expectedAnswer?: string;
  explanation: string;
  /** Verbatim substring of the source chunk. */
  citation: string;
  /** Producing chunk — for citation back-resolution and dedup scoping. */
  sourceChunkId: string;
};

// ─── Canonical output (matches certifications schema) ───────────────

/**
 * The shape the Lesson Player consumes — both for cert packs and for
 * synthetic quizzes. `meta` is the only new field and is namespaced so
 * older consumers can ignore it safely.
 *
 * @see certifications/README.md for the original schema definition.
 */
export type CanonicalQuestion = {
  question: string;
  /** "A. ...", "B. ..." style. Empty array for short_answer. */
  options: string[];
  /**
   * Exact match of one entry in `options` for MCQ / TF.
   * Empty string for short_answer (the canonical answer lives in `meta.expectedAnswer`).
   */
  correct: string;
  explanation: string;
  /**
   * Citation snippet from the source. Re-uses the existing optional
   * `references` field rather than introducing a new key.
   */
  references?: string;
  meta?: {
    kind: QuestionKind;
    expectedAnswer?: string;
    sourceChunkId: string;
    sourceHeading?: string;
  };
};

export type CanonicalQuiz = {
  /** Deterministic hash: same source + config produces the same id. */
  id: string;
  title: string;
  source: {
    kind: SourceInput["kind"];
    canonicalUrl?: string;
    filename?: string;
    fingerprint: string;
  };
  config: QuizConfig;
  questions: CanonicalQuestion[];
  generatedAt: string;
  /** Wall-clock estimate, minutes. */
  estDurationMin: number;
};

// ─── Jobs ───────────────────────────────────────────────────────────

export type JobStatus = "pending" | "running" | "done" | "error" | "cancelled";

export type JobPlan = {
  totalChunks: number;
  estDurationSec: number;
  sourceTitle: string;
};

export type JobEvent =
  | { type: "plan"; plan: JobPlan }
  | { type: "progress"; done: number; total: number; failed: number }
  | { type: "question"; index: number; question: CanonicalQuestion }
  | { type: "chunk_failed"; index: number; reason: string }
  | { type: "done"; quiz: CanonicalQuiz }
  | { type: "error"; status: number; message: string };

export type JobState = {
  id: string;
  status: JobStatus;
  createdAt: number;
  updatedAt: number;
  /** Owner identifier — IAM user id when signed in, "guest:<ip>" otherwise. */
  ownerId: string;
  source: ExtractedSource;
  config: QuizConfig;
  chunks: Chunk[];
  /** Ring buffer of past events; replayed on SSE reconnect. */
  events: JobEvent[];
  /** Set when status === "done". */
  quiz?: CanonicalQuiz;
  /** Set when status === "error". */
  error?: { status: number; message: string };
};
