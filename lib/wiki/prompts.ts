/**
 * Prompt builders for WikiTest. Every prompt ends with a strict
 * "JSON only, schema below" instruction so the response is parseable
 * by the generator and validatable by Zod.
 */

import type { ChatMessage } from "@/lib/ai/provider";
import type { ArticleSection, Difficulty, Format } from "./types";

const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  undergrad:
    "First or second-year undergraduate. Test definitions, named concepts, and clear cause→effect from the article. Avoid trick wording.",
  intermediate:
    "Third or fourth-year undergraduate. Test the relationship between concepts and one-step derivations. Distractors should reflect plausible misconceptions, not nonsense.",
  advanced:
    "Master's or PhD audience. Test conceptual integration, multi-step reasoning, and edge cases. Distractors must be defensible and require the source text to rule out.",
};

const FORMAT_HINTS: Record<Format, string> = {
  multiple_choice:
    'Use "multiple_choice" only. Each question has exactly 4 options. correctIndex 0–3.',
  true_false:
    'Use "true_false" only. Each question has options ["True","False"]; correctIndex is 0 or 1.',
  short_answer:
    'Use "short_answer" only. expectedAnswer is one sentence (≤ 25 words). Omit choices/correctIndex.',
  mixed:
    'Mix multiple_choice, true_false, and short_answer questions roughly 5:2:3 by count. Each item follows the rules for its own kind.',
};

const SHARED_RULES = `\
Rules — every question must follow ALL of these:
  1. Answerable strictly from the supplied article text. Never invent
     dates, names, equations, or quantities not present in the source.
  2. sourceSection MUST equal one of the section headings provided
     (case-insensitive match). If you can't cite a section, drop the
     question — quality over quantity.
  3. Explanation is one or two sentences, cites the source section.
  4. No multi-question prompts ("which of the following…"). One claim
     per question.
  5. Do not quote long stretches of the article verbatim — paraphrase.
  6. Skip questions about references, see-also, or external links.
  7. JSON only. No prose. No code fence. No commentary.`;

const SCHEMA = `\
{
  "questions": [
    {
      "id": "<short slug>",
      "kind": "multiple_choice" | "true_false" | "short_answer",
      "prompt": "string",
      "choices": ["string", ...]      // present for multiple_choice / true_false
      "correctIndex": number,           // present for multiple_choice / true_false
      "expectedAnswer": "string",       // present for short_answer
      "explanation": "string",
      "sourceSection": "string"         // must match a supplied section heading
    }
  ]
}`;

/**
 * Build the chat messages for `jsonChat<{ questions: WikiQuestion[] }>`.
 * Article sections are flattened into a numbered text block with a
 * total char budget bound by lib/wiki/extract.ts MAX_TOTAL_CHARS.
 */
export function testFromArticlePrompt(input: {
  title: string;
  summary: string;
  sections: ArticleSection[];
  difficulty: Difficulty;
  format: Format;
  count: number;
  language?: string;
}): ChatMessage[] {
  const headings = input.sections.map((s) => s.heading).join(", ");
  const articleBlock = input.sections
    .map(
      (s, i) =>
        `## Section ${i + 1} — ${s.heading}\n${s.text}`,
    )
    .join("\n\n");

  const system = `You write factual, single-source tests from a provided Wikipedia article. \
You output strict JSON that matches the supplied schema. \
You never invent information not present in the source.`;

  const user = `Generate EXACTLY ${input.count} questions for an exam on this article.

DIFFICULTY: ${input.difficulty} — ${DIFFICULTY_HINTS[input.difficulty]}

FORMAT: ${input.format} — ${FORMAT_HINTS[input.format]}

LANGUAGE: ${input.language ?? "auto — match the article's language"}.

${SHARED_RULES}

SCHEMA — return EXACTLY this shape, top-level "questions":
${SCHEMA}

ARTICLE TITLE: ${input.title}

ARTICLE SUMMARY: ${input.summary}

AVAILABLE SOURCE SECTION HEADINGS (use these verbatim for sourceSection):
${headings}

ARTICLE SECTIONS:
${articleBlock}

Now produce the JSON. ${input.count} questions. JSON only.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
