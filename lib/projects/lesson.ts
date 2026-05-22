/**
 * Project lesson — AI-generated structured worksheet.
 *
 * Pipeline:
 *   1. Take a ProjectDraft (topic + outcome + sources + pace + prefs)
 *   2. Build a pedagogically-grounded prompt (concept first, then 3
 *      exercises spread across the Loop — Explain → Practice → Reflect)
 *   3. Call jsonChat with a strict JSON schema
 *   4. Zod-validate. Drop malformed exercises. Require at least 1 left.
 *   5. Cache by project id for 24h so repeat opens are instant.
 *
 * Free-text answers are graded by a second LLM call in /grade —
 * MCQ/TF/numeric grades happen client-side from the lesson itself.
 */

import "server-only";
import { z } from "zod";
import { AiProviderError, jsonChat, type ChatMessage } from "@/lib/ai/provider";
import type { ProjectDraft } from "./wizard-config";

/* ── Schema ────────────────────────────────────────────────────────── */

export type ExerciseKind = "multiple_choice" | "true_false" | "short_answer" | "explain_back";

export type Exercise = {
  id: string;
  kind: ExerciseKind;
  /** What the learner is asked. Markdown is OK. */
  prompt: string;
  /** Filled for multiple_choice / true_false. */
  choices?: string[];
  /** Index of the correct choice for MCQ/TF. */
  correctIndex?: number;
  /** Short canonical answer for short_answer (≤ 60 chars). */
  expectedAnswer?: string;
  /** One-sentence explanation revealed after answering. */
  explanation: string;
  /** Pedagogical hint shown if the learner asks for one. */
  hint?: string;
  /** Method tag — Active recall / Worked example / Feynman / etc. */
  method?: string;
};

export type ProjectLesson = {
  id: string;
  projectId: string;
  /** Display title of the lesson — usually mirrors the project topic. */
  title: string;
  /** 2-4 short paragraphs of plain language concept. Markdown OK. */
  concept: string;
  /** Optional bullet list of key terms. */
  keyTerms?: Array<{ term: string; definition: string }>;
  exercises: Exercise[];
  /** Cited source URLs from the project draft. */
  sources: string[];
  generatedAt: string;
};

const ExerciseSchema = z.object({
  id: z.string().min(1).max(40),
  kind: z.enum(["multiple_choice", "true_false", "short_answer", "explain_back"]),
  prompt: z.string().min(4).max(2_000),
  choices: z.array(z.string().min(1).max(400)).max(6).optional(),
  correctIndex: z.number().int().min(0).max(5).optional(),
  expectedAnswer: z.string().min(1).max(400).optional(),
  explanation: z.string().min(1).max(1_500),
  hint: z.string().min(1).max(400).optional(),
  method: z.string().min(1).max(40).optional(),
});

const LessonSchema = z.object({
  title: z.string().min(2).max(200),
  concept: z.string().min(40).max(8_000),
  keyTerms: z
    .array(
      z.object({
        term: z.string().min(1).max(80),
        definition: z.string().min(1).max(400),
      })
    )
    .max(8)
    .optional(),
  exercises: z.array(ExerciseSchema).min(1).max(6),
});

export class ProjectLessonError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ProjectLessonError";
  }
}

/* ── Prompt ────────────────────────────────────────────────────────── */

const DIFFICULTY_FOR_PREFS = (prefs: string[]): string => {
  if (prefs.includes("worked") && prefs.includes("practice")) {
    return "intermediate — pair a worked example with a twin problem at the same level";
  }
  if (prefs.includes("voice") || prefs.includes("video")) {
    return "approachable — explanations should sound natural when read aloud";
  }
  return "intermediate — clear, concrete, no jargon without a definition";
};

const METHODS_HINT = `Tag each exercise with one named method in "method":
Active recall · Worked example → twin · Socratic · Feynman · Spaced repetition · Interleaving.`;

const SAFETY = `Stay factual and pedagogical. No politics, violence, or off-topic content.`;

const SCHEMA_DOC = `Return ONLY this JSON, no markdown fence:
{
  "title": "2-12 words",
  "concept": "2-3 short paragraphs of plain language",
  "keyTerms": [{ "term": "...", "definition": "1 sentence" }],
  "exercises": [
    {
      "id": "ex1",
      "kind": "multiple_choice" | "true_false" | "short_answer" | "explain_back",
      "prompt": "the question",
      "choices": ["A","B","C","D"],         // MCQ only (2-5)
      "correctIndex": 0,                    // MCQ / TF only
      "expectedAnswer": "<= 60 chars",      // short_answer / explain_back
      "explanation": "one sentence",
      "hint": "optional one-line nudge",
      "method": "Active recall"
    }
  ]
}

Hard rules:
- EXACTLY 3 exercises: one Active Recall, one Worked Example → twin, one Feynman explain_back.
- For true_false: choices = ["True","False"].
- For explain_back: expectedAnswer is the 1-sentence canonical answer the learner should produce.`;

function topicHint(topic: string): string {
  return topic.length > 200 ? topic.slice(0, 200) + "…" : topic;
}

export function lessonPrompt(draft: ProjectDraft): ChatMessage[] {
  const lines: string[] = [];
  lines.push(`# Project context`);
  lines.push(`Topic: ${topicHint(draft.topic)}`);
  if (draft.outcome) lines.push(`Outcome: ${draft.outcome}`);
  lines.push(`Audience: ${draft.worldSlug} world`);
  lines.push(`Pace: ${draft.daysPerWeek} days/week × ${draft.minutesPerDay} min/day`);
  if (draft.sources.length) {
    lines.push(`Sources the learner attached:`);
    for (const s of draft.sources) lines.push(`  • ${s}`);
  }
  if (draft.deadline) lines.push(`Deadline: ${draft.deadline}`);
  lines.push(`Difficulty tuning: ${DIFFICULTY_FOR_PREFS(draft.prefs)}`);

  return [
    {
      role: "system",
      content: [
        "You are LearnAI's lesson generator.",
        "Produce a single, short, pedagogically-sound lesson the learner can finish in 10-20 minutes.",
        "",
        METHODS_HINT,
        "",
        SAFETY,
        "",
        SCHEMA_DOC,
      ].join("\n"),
    },
    { role: "user", content: lines.join("\n") },
  ];
}

/* ── Generator ─────────────────────────────────────────────────────── */

export async function generateLesson(draft: ProjectDraft): Promise<ProjectLesson> {
  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(lessonPrompt(draft), {
      // Keep payload tight — small bundled models stall on huge token
      // budgets and the lesson barely needs more than this.
      maxTokens: 1_100,
      temperature: 0.4,
      // Big upgrade over the 25s default — lesson generation on a 1.5B
      // bundled model legitimately takes 30-45s for a complex topic.
      timeoutMs: 75_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new ProjectLessonError(`AI provider unavailable: ${err.message}`, err.status);
    }
    throw err;
  }

  const parsed = LessonSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ProjectLessonError(
      "AI returned a malformed lesson. Try a slightly more specific topic or retry.",
      502
    );
  }

  // Per-kind shape validation + id rewrite for stability.
  const valid: Exercise[] = [];
  for (const [i, q] of parsed.data.exercises.entries()) {
    if (q.kind === "multiple_choice") {
      if (!q.choices || q.choices.length < 2 || q.choices.length > 5) continue;
      if (q.correctIndex == null || q.correctIndex >= q.choices.length) continue;
    } else if (q.kind === "true_false") {
      if (!q.choices || q.choices.length !== 2) {
        // Allow the model to omit choices for TF; fill them in.
        q.choices = ["True", "False"];
      }
      if (q.correctIndex !== 0 && q.correctIndex !== 1) continue;
    } else if (q.kind === "short_answer") {
      if (!q.expectedAnswer) continue;
    } else if (q.kind === "explain_back") {
      if (!q.expectedAnswer) {
        // Synthesize a canonical from the explanation if missing.
        q.expectedAnswer = q.explanation.split(/[.!?]/)[0]?.trim() || q.explanation.slice(0, 80);
      }
    }
    valid.push({
      id: q.id || `ex${i + 1}`,
      kind: q.kind,
      prompt: q.prompt.trim(),
      choices: q.choices,
      correctIndex: q.correctIndex,
      expectedAnswer: q.expectedAnswer,
      explanation: q.explanation.trim(),
      hint: q.hint?.trim(),
      method: q.method?.trim(),
    });
  }

  if (valid.length < 1) {
    throw new ProjectLessonError(
      "Generated lesson had no valid exercises. Pick a more substantial topic.",
      422
    );
  }

  return {
    id: `lesson-${draft.id}`,
    projectId: draft.id,
    title: parsed.data.title.trim(),
    concept: parsed.data.concept.trim(),
    keyTerms: parsed.data.keyTerms,
    exercises: valid,
    sources: draft.sources,
    generatedAt: new Date().toISOString(),
  };
}

/* ── Free-text grader (used by /grade endpoint) ───────────────────── */

const GradeSchema = z.object({
  score: z.number().min(0).max(3),
  verdict: z.enum(["correct", "partial", "wrong"]),
  feedback: z.string().min(1).max(800),
  citation: z.string().min(0).max(300).optional(),
});

export type GradeResult = z.infer<typeof GradeSchema>;

export async function gradeShortAnswer(input: {
  prompt: string;
  expectedAnswer: string;
  conceptExcerpt: string;
  response: string;
  method?: string;
}): Promise<GradeResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: [
        "You are LearnAI's exercise grader.",
        "Score the learner's response 0..3 where:",
        "  3 = correct or essentially equivalent to the expected answer",
        "  2 = partially correct; misses a key piece",
        "  1 = on-topic but wrong on the central point",
        "  0 = off-topic, blank, or factually wrong",
        "Be kind. One-sentence feedback that points to the missing piece, not just 'wrong'.",
        "If the kind hint is 'Feynman', score the *clarity and completeness* of the explain-back, not literal string match.",
        "",
        "Return EXACTLY this JSON, no markdown fence:",
        `{ "score": 0|1|2|3, "verdict": "correct" | "partial" | "wrong", "feedback": "<one sentence>", "citation": "<optional reference to the concept>" }`,
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        `Concept excerpt:`,
        input.conceptExcerpt.slice(0, 800),
        ``,
        `Question: ${input.prompt}`,
        `Expected answer: ${input.expectedAnswer}`,
        input.method ? `Method tag: ${input.method}` : "",
        ``,
        `Learner response:`,
        input.response.slice(0, 1500),
      ]
        .filter(Boolean)
        .join("\n"),
    },
  ];

  try {
    const raw = await jsonChat<unknown>(messages, {
      maxTokens: 240,
      temperature: 0.1,
    });
    const parsed = GradeSchema.safeParse(raw);
    if (!parsed.success) {
      // Fall back to a "partial" verdict if the grader misbehaves —
      // never block the learner.
      return {
        score: 1,
        verdict: "partial",
        feedback: "Couldn't grade automatically — your answer was recorded. Move on or retry.",
      };
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof AiProviderError) {
      return {
        score: 1,
        verdict: "partial",
        feedback: "Grader temporarily unavailable. Your answer was recorded; try again later.",
      };
    }
    throw err;
  }
}

/* ── Cache ─────────────────────────────────────────────────────────── */

const TTL_MS = 24 * 60 * 60 * 1000;
type Entry = { value: ProjectLesson; expiresAt: number };
const byProjectId = new Map<string, Entry>();

export function getCachedLesson(projectId: string): ProjectLesson | null {
  const hit = byProjectId.get(projectId);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    byProjectId.delete(projectId);
    return null;
  }
  return hit.value;
}

export function putCachedLesson(lesson: ProjectLesson): void {
  byProjectId.set(lesson.projectId, {
    value: lesson,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function clearCachedLesson(projectId: string): void {
  byProjectId.delete(projectId);
}
