/**
 * Rubric-grade a candidate answer against the question, persona,
 * and source snippets the question was anchored to.
 *
 * Two outputs:
 *   1. RubricFeedback {score 0-5, strengths[], gaps[], followUp?}
 *      attached to the DefenseRound row.
 *   2. Updated grounding citations — which sources the answer
 *      should have referenced. The readiness report uses this to
 *      compute per-source coverage.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import type { ChatMessage } from "@/lib/ai/provider";
import type { CommitteePersona, RubricFeedback } from "./types";
import { renderSnippetsForPrompt, type SourceSnippet } from "./source-snippets";

const GradeSchema = z.object({
  score: z.number().min(0).max(5),
  strengths: z.array(z.string().min(1).max(400)).max(6).default([]),
  gaps: z.array(z.string().min(1).max(400)).max(6).default([]),
  followUp: z.string().max(400).optional(),
  citedSourceIds: z.array(z.string().min(1).max(60)).max(8).default([]),
});

export class DefenseGradeError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "DefenseGradeError";
  }
}

export type GradeInput = {
  persona: CommitteePersona;
  question: string;
  answer: string;
  snippets: SourceSnippet[];
};

export async function gradeDefenseAnswer(input: GradeInput): Promise<{
  feedback: RubricFeedback;
  citedSourceIds: string[];
}> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a fair, rigorous examiner grading a candidate's spoken or written answer to a thesis-defense question. " +
        "Score 0-5 holistically: 0 = no answer or wrong; 3 = adequate; 5 = excellent (anchored in sources, addresses limitations). " +
        "Never invent sources. List which supplied sources the candidate effectively cited (by sourceId). " +
        "Reply JSON only.",
    },
    {
      role: "user",
      content: [
        `Examiner persona: ${input.persona.name} (${input.persona.role}).`,
        `Question asked: "${input.question}"`,
        "",
        "Candidate answer:",
        '"""',
        input.answer.slice(0, 4_000),
        '"""',
        "",
        "Source kit the question was grounded on:",
        renderSnippetsForPrompt(input.snippets),
        "",
        "Reply JSON exactly:",
        "{",
        '  "score": 0..5,',
        '  "strengths": ["..."],',
        '  "gaps": ["..."],',
        '  "followUp": "optional next question",',
        '  "citedSourceIds": ["sourceId-of-each-source-the-answer-anchored-on"]',
        "}",
      ].join("\n"),
    },
  ];

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: 700,
      temperature: 0.25,
      timeoutMs: 30_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) throw new DefenseGradeError(err.message, err.status);
    throw err;
  }
  const parsed = GradeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DefenseGradeError("Examiner grading returned malformed JSON.", 502);
  }
  return {
    feedback: {
      score: Math.round(parsed.data.score * 10) / 10,
      strengths: parsed.data.strengths,
      gaps: parsed.data.gaps,
      followUp: parsed.data.followUp,
    },
    citedSourceIds: parsed.data.citedSourceIds,
  };
}
