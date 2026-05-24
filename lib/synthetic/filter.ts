/**
 * Per-chunk quality filter for synthetic questions.
 *
 * Every question coming out of the LLM goes through this pipeline.
 * Each step is a small predicate so the runner can log *why* a
 * question was rejected and so we can unit-test rules independently.
 *
 * Rules, in order:
 *   1. Shape sanity per `kind` (zod-validated upstream; this is the
 *      pedagogical pass).
 *   2. Citation integrity: the `citation` field MUST appear verbatim
 *      in the producing chunk's text (after whitespace normalization).
 *   3. MCQ shape: 2-5 distinct options, `correctIndex` in range, no
 *      option that is a substring of another.
 *   4. Length sanity: prompt 10-800 chars, explanation 20-800 chars.
 *   5. Deduplication against previously-accepted questions, using a
 *      cheap 3-gram Jaccard similarity over normalized prompts.
 */

import type { Chunk, SynthQuestion } from "./types";

export type FilterReason =
  | "ok"
  | "bad_shape"
  | "missing_citation"
  | "citation_not_in_chunk"
  | "options_too_few"
  | "options_too_many"
  | "options_not_distinct"
  | "options_substring_overlap"
  | "correct_index_oob"
  | "prompt_too_short"
  | "prompt_too_long"
  | "explanation_too_short"
  | "explanation_too_long"
  | "duplicate_of_prior"
  | "empty_expected_answer";

export type FilterResult =
  | { ok: true; question: SynthQuestion }
  | { ok: false; reason: FilterReason; detail?: string };

const PROMPT_MIN = 10;
const PROMPT_MAX = 800;
const EXPL_MIN = 20;
const EXPL_MAX = 800;
const SIMILARITY_THRESHOLD = 0.75;

function normalizeForCitation(s: string): string {
  return s.replace(/\s+/g, " ").trim().toLowerCase();
}

function normalizeForDedup(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trigrams(s: string): Set<string> {
  const norm = normalizeForDedup(s);
  const tokens = norm.split(" ").filter((t) => t.length > 0);
  const out = new Set<string>();
  if (tokens.length < 3) {
    if (norm.length >= 3) out.add(norm);
    return out;
  }
  for (let i = 0; i <= tokens.length - 3; i++) {
    out.add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let intersect = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const x of small) if (large.has(x)) intersect++;
  return intersect / (a.size + b.size - intersect);
}

/**
 * Stateful filter — a single instance per job tracks accepted prompts
 * so the dedup check can run in O(N) over accepted-so-far rather than
 * O(N²) over all chunks.
 */
export class JobFilter {
  private accepted: Array<Set<string>> = [];

  evaluate(raw: SynthQuestion, chunk: Chunk): FilterResult {
    // 1 + 4: shape + length sanity (zod has already enforced the
    // schema; these are the pedagogical checks).
    const prompt = raw.prompt?.trim() ?? "";
    if (prompt.length < PROMPT_MIN) return { ok: false, reason: "prompt_too_short" };
    if (prompt.length > PROMPT_MAX) return { ok: false, reason: "prompt_too_long" };
    const explanation = raw.explanation?.trim() ?? "";
    if (explanation.length < EXPL_MIN) return { ok: false, reason: "explanation_too_short" };
    if (explanation.length > EXPL_MAX) return { ok: false, reason: "explanation_too_long" };

    // 2: citation must be a verbatim substring of the producing chunk.
    if (!raw.citation || raw.citation.trim().length === 0) {
      return { ok: false, reason: "missing_citation" };
    }
    const citation = normalizeForCitation(raw.citation);
    const haystack = normalizeForCitation(chunk.text);
    if (!haystack.includes(citation)) {
      return { ok: false, reason: "citation_not_in_chunk", detail: citation.slice(0, 80) };
    }

    // 3: kind-specific shape rules.
    if (raw.kind === "multiple_choice" || raw.kind === "true_false") {
      const options = raw.options ?? [];
      if (options.length < 2) return { ok: false, reason: "options_too_few" };
      if (options.length > 5) return { ok: false, reason: "options_too_many" };
      const distinct = new Set(options.map((o) => o.trim().toLowerCase()));
      if (distinct.size !== options.length) return { ok: false, reason: "options_not_distinct" };
      // Substring overlap heuristic: "Paris" vs "Paris, France" is a
      // bad distractor pair because it telegraphs the answer.
      for (let i = 0; i < options.length; i++) {
        for (let j = 0; j < options.length; j++) {
          if (i === j) continue;
          const a = options[i]!.trim().toLowerCase();
          const b = options[j]!.trim().toLowerCase();
          if (a.length >= 4 && b !== a && b.includes(a)) {
            return { ok: false, reason: "options_substring_overlap", detail: `${a} ⊂ ${b}` };
          }
        }
      }
      const ci = raw.correctIndex ?? -1;
      if (ci < 0 || ci >= options.length) return { ok: false, reason: "correct_index_oob" };
    } else if (raw.kind === "short_answer") {
      const ea = raw.expectedAnswer?.trim() ?? "";
      if (ea.length === 0) return { ok: false, reason: "empty_expected_answer" };
    }

    // 5: dedup against previously accepted prompts in this job.
    const grams = trigrams(prompt);
    for (const prior of this.accepted) {
      if (jaccard(grams, prior) >= SIMILARITY_THRESHOLD) {
        return { ok: false, reason: "duplicate_of_prior" };
      }
    }
    this.accepted.push(grams);

    return {
      ok: true,
      question: {
        kind: raw.kind,
        prompt,
        options: raw.options?.map((o) => o.trim()),
        correctIndex: raw.correctIndex,
        expectedAnswer: raw.expectedAnswer?.trim(),
        explanation,
        citation: raw.citation.trim(),
        sourceChunkId: chunk.id,
      },
    };
  }
}
