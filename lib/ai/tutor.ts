/**
 * Tutor reply — the AI surface behind every learner page's chat rail.
 *
 * Differs from jsonChat / generateLesson:
 *   - Returns free-form text, not structured JSON
 *   - Takes a small chat history so the tutor can remember the last
 *     few turns inside a session (no DB, just what the client sends)
 *   - System prompt is *page-aware* — the rail tells the tutor what
 *     the learner is looking at so the answer can cite that surface
 *   - Per-world tutor persona + per-method nudges baked into the
 *     system message so the response shape matches the rest of the app
 */

import "server-only";
import { AiProviderError, chat, type ChatMessage } from "@/lib/ai/provider";
import type { PageContextKind } from "@/lib/learn/tutor";

/** Compact context the rail forwards to the backend on every send. */
export type TutorRequestContext = {
  /** Where the learner is on the page tree. */
  kind: PageContextKind;
  /** Optional concrete topic (lesson title, article name, project topic). */
  topic?: string;
  /** Human-readable world label — "GRADE_9", "Professional", "Senior Learner". */
  worldLabel?: string;
  /** World slug — drives the persona + safety profile. */
  worldSlug?: string;
  /** Persona name to greet as. Falls back to "the tutor" if absent. */
  teacherName?: string;
};

const WORLD_SAFETY: Record<string, string> = {
  kids: "Audience: children ages 3-6. Use short sentences (≤ 8 words). No abstract jargon. No mention of anything outside numbers, letters, colors, animals, feelings, shapes, stories, or simple music. Always invite a small action.",
  GRADE_7:
    "Audience: children ages 7-11. Frame answers as discovery. Use one concrete example per concept. No internet links.",
  GRADE_8:
    "Audience: pre-teens 12-15. Encourage shipping. One example, one twin problem, one stretch goal.",
  GRADE_9:
    "Audience: high-schoolers 16-18 prepping for exams. Be concrete, cite reasoning, and tag the named teaching method (Active recall · Worked example · Feynman · Spaced repetition · Interleaving).",
  adult:
    "Audience: working professional. Be precise and respectful of their time. Lead with the answer, then the reasoning, then a citation if you have one.",
  senior:
    "Audience: senior learner. Be calm and patient. Short sentences. Avoid technical jargon. Offer to repeat any step.",
};

const PAGE_HINT: Record<PageContextKind, string> = {
  "world-home":
    "The learner is on their world's home screen. Suggest the highest-leverage next step based on the named methods, not a generic 'keep learning' line.",
  lesson:
    "The learner is inside the lesson player. Help them through the current step — explain a concept, walk a worked example, or quiz them with one short question.",
  "wiki-hub":
    "The learner is on the WikiTest hub about to paste a Wikipedia URL. Help them pick or refine a topic.",
  "wiki-detail":
    "The learner is on a WikiTest detail page. Help them decide whether to train first or take the test.",
  "wiki-train":
    "The learner is training on a Wikipedia article section. Cite the section heading when you answer.",
  "wiki-quiz": "The learner is mid-test. Stay quiet unless they ask for pacing help.",
  "wiki-report":
    "The learner just finished a WikiTest. Help them schedule spaced reviews or pick a related article.",
  library: "The learner is on the library. Help them find a topic or pick a lesson due for review.",
  missions:
    "The learner is on their missions screen. Help them pick the highest-leverage open mission.",
  achievements:
    "The learner is on the achievements screen. Tell them the badge closest to unlocking.",
  languages: "The learner is on their language track. Offer recall or spaced-rep drills.",
  certifications: "The learner is in cert prep. Quiz them across their weakest domain.",
};

const SAFETY_RAILS = [
  "Refuse anything political, sexual, violent, or off-topic.",
  "Never invent citations. If you don't have a source, say so plainly.",
  "Stay in the named teaching method when one is tagged. Don't switch to lecturing when the learner asked for a Socratic question.",
  "Keep replies under 180 words unless the learner explicitly asks for more.",
  "End with one concrete next action the learner can take in 60 seconds.",
].join("\n");

function buildSystemMessage(ctx: TutorRequestContext): string {
  const world = ctx.worldSlug ?? "GRADE_9";
  const lines: string[] = [];
  lines.push(`You are ${ctx.teacherName ?? "the tutor"} — LearnAI's AI teacher.`);
  if (ctx.worldLabel) lines.push(`World: ${ctx.worldLabel}.`);
  if (ctx.topic) lines.push(`Current topic: ${ctx.topic}.`);
  lines.push("");
  lines.push(WORLD_SAFETY[world] ?? WORLD_SAFETY.GRADE_9);
  lines.push("");
  lines.push(PAGE_HINT[ctx.kind] ?? PAGE_HINT["world-home"]);
  lines.push("");
  lines.push("Rules:");
  lines.push(SAFETY_RAILS);
  return lines.join("\n");
}

export type TutorTurn = { role: "user" | "assistant"; text: string };

export type TutorReply = {
  reply: string;
  /** Provider chain reported as much for transparency on the rail. */
  source: "ai" | "fallback";
  latencyMs: number;
  /** Optional fallback reason — populated when source === "fallback". */
  aiError?: string;
};

const FALLBACK_REPLIES: Partial<Record<PageContextKind, string>> = {
  "world-home":
    "Want a 5-minute warm-up before the next mission? I can pull two retrieval questions from yesterday's session.",
  lesson:
    "Pause for a second — explain this step in your own words. I'll point out the gap. That's the Feynman move.",
  "wiki-hub":
    "Paste a Wikipedia URL or pick a sample. I'll cite every claim back to a section heading.",
  "wiki-detail":
    "Train first if you're under 60% confident; take the test cold if you want a baseline. Your call.",
  "wiki-train":
    "If you can re-state the section heading without scrolling up, you're ready for the next one. If not, re-read the first paragraph.",
  "wiki-quiz":
    "Quiet mode while you test — but ping me if you want pacing help on the last few questions.",
  "wiki-report":
    "Schedule the ones you missed on a spaced-repetition queue. The forgetting curve is steepest in the next 24 h.",
  missions:
    "Pick the one whose weak area scored lowest in your last drill. That's the highest-leverage 25 minutes.",
};

/**
 * One round-trip with the AI provider chain. Returns a plain string
 * reply. Has a graceful fallback so the tutor rail is never broken —
 * the AI is the upgrade, not the load-bearing wall.
 */
export async function tutorReply(
  history: TutorTurn[],
  ctx: TutorRequestContext
): Promise<TutorReply> {
  if (history.length === 0) {
    return {
      reply: FALLBACK_REPLIES[ctx.kind] ?? "Ask me anything — I'll cite where it came from.",
      source: "fallback",
      latencyMs: 0,
    };
  }

  const messages: ChatMessage[] = [
    { role: "system", content: buildSystemMessage(ctx) },
    ...history.map<ChatMessage>((t) => ({ role: t.role, content: t.text })),
  ];

  const t0 = Date.now();
  try {
    const reply = await chat(messages, {
      maxTokens: 360,
      temperature: 0.55,
      timeoutMs: 30_000,
    });
    return { reply, source: "ai", latencyMs: Date.now() - t0 };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    // eslint-disable-next-line no-console
    console.error(`[tutor] reply failed kind=${ctx.kind} world=${ctx.worldSlug}: ${message}`);
    if (err instanceof AiProviderError) {
      return {
        reply:
          (FALLBACK_REPLIES[ctx.kind] ??
            "I can't reach the model right now — but the page you're on has everything you need to take the next step.") +
          " (AI is offline; using the static reply.)",
        source: "fallback",
        latencyMs: Date.now() - t0,
        aiError: message.slice(0, 200),
      };
    }
    throw err;
  }
}
