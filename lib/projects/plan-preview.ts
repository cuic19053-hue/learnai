/**
 * AI-driven project plan preview.
 *
 * Generates a short structured study plan from the wizard inputs
 * (topic, outcome, sources, pace, prefs) BEFORE the learner commits
 * to creating the project. The output is shown on Step 4 of the
 * Scholar wizard ("AI plan preview") and never persisted on the
 * preview path — once the learner clicks Save the regular
 * POST /api/projects flow takes over.
 *
 * Uses the shared AI provider chain so OllaBridge default + fallback
 * apply automatically.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import type { ChatMessage } from "@/lib/ai/provider";

export type PlanPreviewInput = {
  worldSlug: string;
  topic: string;
  outcome?: string;
  sources?: string[];
  daysPerWeek: number;
  minutesPerDay: number;
  deadline?: string;
  prefs?: string[];
  variant?: "standard" | "parent" | "calm";
};

export type PlanDay = {
  day: number; // 1-indexed within the plan
  title: string;
  minutes: number;
  activities: string[];
};

export type PlanWeek = {
  week: number;
  theme: string;
  days: PlanDay[];
};

export type PlanPreview = {
  summary: string;
  estimatedTotalMinutes: number;
  weeks: PlanWeek[];
  successCriteria: string[];
  warnings: string[];
};

const PlanSchema = z.object({
  summary: z.string().min(10).max(800),
  estimatedTotalMinutes: z.number().int().min(5).max(50_000),
  weeks: z
    .array(
      z.object({
        week: z.number().int().min(1).max(52),
        theme: z.string().min(1).max(200),
        days: z
          .array(
            z.object({
              day: z.number().int().min(1).max(7),
              title: z.string().min(1).max(200),
              minutes: z.number().int().min(5).max(300),
              activities: z.array(z.string().min(1).max(300)).min(1).max(8),
            })
          )
          .min(1)
          .max(7),
      })
    )
    .min(1)
    .max(8),
  successCriteria: z.array(z.string().min(1).max(200)).min(1).max(8),
  warnings: z.array(z.string().min(1).max(200)).max(5).default([]),
});

export class PlanPreviewError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "PlanPreviewError";
  }
}

const VARIANT_TONE: Record<NonNullable<PlanPreviewInput["variant"]>, string> = {
  standard: "Voice: warm, direct, motivating. Use clear adult phrasing. Cite sources if provided.",
  parent:
    "Audience: a parent setting this up for a young learner (under 8). Voice: friendly, calm, " +
    "concrete. Avoid jargon. Suggest joint activities the parent can do with the child.",
  calm:
    "Audience: a senior learner. Voice: calm, unhurried, patient. Prefer short sentences, " +
    "concrete daily steps, and a clear stopping point each day. No achievement gamification.",
};

function buildPrompt(input: PlanPreviewInput): ChatMessage[] {
  const sources = (input.sources ?? []).filter(Boolean);
  const prefs = (input.prefs ?? []).filter(Boolean);
  const variant = input.variant ?? "standard";

  const totalMinutes = input.daysPerWeek * input.minutesPerDay;

  const system =
    "You are an expert learning designer. Produce a short, realistic, day-by-day study plan " +
    "for the learner. Plans must respect the pace (days per week and minutes per day) and " +
    "feel achievable. NEVER promise outcomes you can't ground in the topic and sources " +
    "supplied. Reply with JSON only — no commentary, no code fence.";

  const user = [
    `World: ${input.worldSlug}`,
    `Topic: ${input.topic}`,
    `Outcome: ${input.outcome || "(none specified)"}`,
    `Sources: ${sources.length > 0 ? sources.join("; ") : "(none — generate from topic)"}`,
    `Pace: ${input.daysPerWeek} days/week × ${input.minutesPerDay} min/day = ${totalMinutes} min/week`,
    `Deadline: ${input.deadline ?? "(none)"}`,
    `Preferences/flags: ${prefs.length > 0 ? prefs.join(", ") : "(none)"}`,
    "",
    VARIANT_TONE[variant],
    "",
    "Return JSON exactly in this shape:",
    "{",
    '  "summary": "1-3 sentence overview of the approach",',
    '  "estimatedTotalMinutes": <integer total across all days>,',
    '  "weeks": [',
    "    {",
    '      "week": 1,',
    '      "theme": "what this week is about",',
    '      "days": [',
    "        {",
    '          "day": 1,                          // 1..7 within the week',
    '          "title": "lesson title",',
    `          "minutes": ${input.minutesPerDay},`,
    '          "activities": ["concrete step", "concrete step", ...]',
    "        }",
    "      ]",
    "    }",
    "  ],",
    '  "successCriteria": ["learner can ...", "learner can ..."],',
    '  "warnings": ["optional: anything risky about the plan or sources"]',
    "}",
    "",
    "Rules:",
    `- Each day in "days" must have minutes <= ${input.minutesPerDay}.`,
    `- Total weeks * days * minutes should be close to a realistic completion budget for this topic.`,
    '- Activities are concrete (do X, read Y, write Z) — not vague ("study X").',
    "- 1-3 weeks for short topics, more for deep ones. Never more than 8 weeks.",
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export async function generatePlanPreview(input: PlanPreviewInput): Promise<PlanPreview> {
  const messages = buildPrompt(input);
  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: 1_400,
      temperature: 0.35,
      timeoutMs: 35_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new PlanPreviewError(err.message, err.status);
    }
    throw err;
  }
  const parsed = PlanSchema.safeParse(raw);
  if (!parsed.success) {
    throw new PlanPreviewError("AI returned malformed plan JSON. Try again.", 502);
  }

  // Per-day minute sanity (LLMs occasionally exceed the requested cap).
  for (const week of parsed.data.weeks) {
    for (const day of week.days) {
      if (day.minutes > input.minutesPerDay) day.minutes = input.minutesPerDay;
    }
  }

  return parsed.data;
}
