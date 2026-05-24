/**
 * Generate a single committee question for a defense session.
 *
 * Used by:
 *   - Socratic study (item 35): persona = "tutor"
 *   - Mock defense  (item 36): persona = one of the 3-panel committee
 *
 * Returns just the question text + any source citations the persona
 * is anchoring on. Grading the candidate's answer is a separate call
 * (`grade.ts`) so the UI can render the question, capture the answer
 * (typed or via STT), and only then submit for grading.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import type { ChatMessage } from "@/lib/ai/provider";
import { personaSystemPrompt } from "./personas";
import { renderSnippetsForPrompt, type SourceSnippet } from "./source-snippets";
import type { CommitteePersona, GroundingCitation } from "./types";

const AskSchema = z.object({
  question: z.string().min(8).max(1_500),
  citations: z
    .array(z.object({ sourceId: z.string(), snippet: z.string().min(1).max(400) }))
    .max(5)
    .default([]),
});

export class DefenseAskError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "DefenseAskError";
  }
}

export type AskInput = {
  persona: CommitteePersona;
  thesisTitle: string;
  thesisAbstract?: string;
  snippets: SourceSnippet[];
  /** Previous Q+A turns for continuity. */
  history?: Array<{ question: string; answer?: string; personaName: string }>;
  /** If supplied, force the next question to drill into this topic. */
  followUpTopic?: string;
};

export async function askDefenseQuestion(input: AskInput): Promise<{
  question: string;
  citations: GroundingCitation[];
}> {
  const history = (input.history ?? []).slice(-6);
  const messages: ChatMessage[] = [
    { role: "system", content: personaSystemPrompt(input.persona) },
    {
      role: "user",
      content: [
        `Candidate thesis title: ${input.thesisTitle}`,
        input.thesisAbstract ? `Abstract: ${input.thesisAbstract}` : null,
        "",
        "Sources the candidate is defending on:",
        renderSnippetsForPrompt(input.snippets),
        "",
        history.length > 0 ? "Prior exchange (most recent first):" : "",
        ...history
          .slice()
          .reverse()
          .map(
            (h, i) =>
              `- (${i + 1}) ${h.personaName} asked: "${h.question}". Candidate ${
                h.answer ? `replied: "${h.answer.slice(0, 600)}"` : "did not answer."
              }`
          ),
        "",
        input.followUpTopic
          ? `Drill specifically into: "${input.followUpTopic}".`
          : "Pick ONE area you'd press hardest on next.",
        "",
        "Reply JSON exactly:",
        '{ "question": "string (your single next question)", ',
        '  "citations": [{ "sourceId": "id from the source list", "snippet": "short anchor text" }] }',
      ]
        .filter((l): l is string => Boolean(l))
        .join("\n"),
    },
  ];

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: 600,
      temperature: 0.6,
      timeoutMs: 25_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new DefenseAskError(err.message, err.status);
    }
    throw err;
  }
  const parsed = AskSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DefenseAskError("Examiner returned malformed JSON.", 502);
  }
  return {
    question: parsed.data.question.trim(),
    citations: parsed.data.citations,
  };
}
