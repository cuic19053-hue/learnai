/**
 * Compute the transcript-grounded readiness report for a defense
 * session. Takes the full list of rounds + the source kit and
 * produces:
 *
 *   - scorePercent: rubric average rescaled to 0-100
 *   - sourceCoverage[]: 0..1 per source (proportion of rounds that
 *     effectively cited it, taken from the per-round grading output)
 *   - weakAreas[]: topics flagged by the LLM based on the gaps[]
 *     entries across rounds
 *   - narrative: short markdown summary
 *
 * The narrative is the only LLM-generated piece — the other fields
 * are arithmetic so the report is reproducible and explainable.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import type { ChatMessage } from "@/lib/ai/provider";
import type { DefenseSource, RubricFeedback, SourceCoverage, WeakArea } from "./types";

const NarrativeSchema = z.object({
  narrative: z.string().min(20).max(4_000),
  weakAreas: z
    .array(
      z.object({
        topic: z.string().min(1).max(200),
        why: z.string().min(1).max(400),
        suggested: z.string().min(1).max(400),
      })
    )
    .max(6)
    .default([]),
});

export type ReadinessInput = {
  thesisTitle: string;
  thesisAbstract?: string;
  sources: DefenseSource[];
  rounds: Array<{
    personaName: string;
    question: string;
    answer: string | null;
    feedback: RubricFeedback | null;
    citedSourceIds: string[];
  }>;
};

export type ReadinessOutput = {
  scorePercent: number;
  sourceCoverage: SourceCoverage[];
  weakAreas: WeakArea[];
  narrative: string;
};

export class DefenseReadinessError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "DefenseReadinessError";
  }
}

export async function computeReadiness(input: ReadinessInput): Promise<ReadinessOutput> {
  const scored = input.rounds.filter((r) => r.feedback);
  const scoreAvg =
    scored.length === 0
      ? 0
      : scored.reduce((acc, r) => acc + (r.feedback?.score ?? 0), 0) / scored.length;
  const scorePercent = Math.round((scoreAvg / 5) * 10_000) / 100;

  // Source coverage.
  const sourceCoverage: SourceCoverage[] = input.sources.map((s) => {
    const cited = scored.filter((r) => r.citedSourceIds.includes(s.id)).length;
    const coverage = scored.length === 0 ? 0 : Math.round((cited / scored.length) * 1_000) / 1_000;
    return { sourceId: s.id, name: s.title, coverage };
  });

  // Aggregated gaps for the LLM narrative.
  const gapBag = scored
    .flatMap((r) => r.feedback?.gaps ?? [])
    .filter(Boolean)
    .slice(0, 40);

  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You write a fair, encouraging, transcript-grounded readiness report for a thesis defense rehearsal. " +
        "Use ONLY the supplied data; never invent quotes, sources, or scores. Markdown narrative + structured weakAreas. Reply JSON only.",
    },
    {
      role: "user",
      content: [
        `Thesis: ${input.thesisTitle}`,
        input.thesisAbstract ? `Abstract: ${input.thesisAbstract}` : null,
        "",
        `Rounds answered: ${scored.length} of ${input.rounds.length}.`,
        `Average rubric score: ${scoreAvg.toFixed(2)} / 5.`,
        "",
        "Per-source coverage (0..1):",
        sourceCoverage.map((c) => `- ${c.name}: ${c.coverage}`).join("\n"),
        "",
        "Aggregated gaps from each round's grading:",
        gapBag.map((g) => `- ${g}`).join("\n") || "(none captured)",
        "",
        "Reply JSON exactly:",
        "{",
        '  "narrative": "Markdown summary (200-600 words). Cover: overall readiness, ',
        "                strongest areas (with examples from sources), 2-3 weak areas, ",
        '                concrete next-rehearsal steps. Do NOT fabricate scores or quotes.",',
        '  "weakAreas": [{ "topic": "...", "why": "...", "suggested": "..." }]',
        "}",
      ]
        .filter((l): l is string => Boolean(l))
        .join("\n"),
    },
  ];

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: 1_400,
      temperature: 0.3,
      timeoutMs: 35_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) throw new DefenseReadinessError(err.message, err.status);
    throw err;
  }
  const parsed = NarrativeSchema.safeParse(raw);
  if (!parsed.success) {
    throw new DefenseReadinessError("Readiness report returned malformed JSON.", 502);
  }
  return {
    scorePercent,
    sourceCoverage,
    weakAreas: parsed.data.weakAreas,
    narrative: parsed.data.narrative,
  };
}
