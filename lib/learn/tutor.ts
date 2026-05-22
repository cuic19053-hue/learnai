/**
 * Persistent AI tutor — page-context type, memory derivation, and the
 * pedagogical prompt presets that the rail surfaces on every screen.
 *
 * Why this exists:
 *   The tutor needs to feel like it knows what page you're on, what
 *   you've been working on, and which study-guide technique fits the
 *   current moment. Hard-coding that in every page is a maintenance
 *   trap; centralising it here lets us evolve the rail behaviour in
 *   one place when memory + RAG land.
 *
 * Best-practice rules followed:
 *   - Every suggested prompt is anchored to a *named* learning
 *     technique (Socratic, Feynman, active recall, spaced
 *     repetition, interleaving) — not generic chat suggestions.
 *   - Memory chips are short, declarative, and reversible (every
 *     chip has a clear "forget about me" path).
 *   - No promises the backend can't keep: prompts hint at actions
 *     the existing engine already supports.
 */

import type { Journey } from "./journeys";

/** Where the learner is in the app — drives prompt selection. */
export type PageContextKind =
  | "world-home"
  | "lesson"
  | "wiki-hub"
  | "wiki-detail"
  | "wiki-train"
  | "wiki-quiz"
  | "wiki-report"
  | "library"
  | "missions"
  | "achievements"
  | "languages"
  | "certifications";

export type PageContext = {
  kind: PageContextKind;
  /** Human-readable topic the learner is on, if known. */
  topic?: string;
  /** Free-form world label for the memory ribbon, e.g. "Scholar". */
  worldLabel?: string;
};

/** What the tutor "remembers" about the learner — surfaced as chips. */
export type TutorMemory = {
  /** Long-term goal, if the learner set one in onboarding. */
  goal?: string;
  /** Current weak area derived from progress (placeholder until SRS lands). */
  weakArea?: string;
  /** Where we left off — topic name + a short cue. */
  lastTopic?: string;
};

/**
 * Tagged pedagogical method — each suggested prompt declares which
 * study-guide technique it implements so the learner can pattern-match
 * across sessions. Visible labels build trust ("oh, that's Feynman
 * technique, I've seen it before — it works").
 */
export type Method =
  | "socratic"
  | "feynman"
  | "active-recall"
  | "spaced-repetition"
  | "interleaving"
  | "worked-example"
  | "metacognition";

export type SuggestedPrompt = {
  method: Method;
  label: string;
  prompt: string;
};

export const METHOD_META: Record<Method, { icon: string; name: string; hint: string }> = {
  socratic: {
    icon: "❓",
    name: "Socratic",
    hint: "Tutor asks the next question, you reason out the answer.",
  },
  feynman: {
    icon: "💬",
    name: "Feynman",
    hint: "Explain it back in plain language — gaps surface fast.",
  },
  "active-recall": {
    icon: "🧠",
    name: "Active recall",
    hint: "Retrieve before review — the highest-leverage technique.",
  },
  "spaced-repetition": {
    icon: "🔁",
    name: "Spaced repetition",
    hint: "Tutor schedules reviews against the forgetting curve.",
  },
  interleaving: {
    icon: "🔀",
    name: "Interleaving",
    hint: "Switch topics mid-session — better transfer than blocked practice.",
  },
  "worked-example": {
    icon: "🪜",
    name: "Worked example",
    hint: "Walk through a solved problem before trying your own.",
  },
  metacognition: {
    icon: "🪞",
    name: "Reflect",
    hint: "Name what you know and what you don't — that itself is a skill.",
  },
};

/**
 * Page-context-aware prompt set. Two anchors per kind keeps the rail
 * tight; three is the visual ceiling before it starts feeling like a
 * launcher rather than a teacher.
 */
export function promptsForContext(ctx: PageContext): SuggestedPrompt[] {
  const topic = ctx.topic ?? "this";
  switch (ctx.kind) {
    case "world-home":
      return [
        {
          method: "metacognition",
          label: "What should I work on?",
          prompt: "Look at my recent activity and tell me what to focus on today, and why.",
        },
        {
          method: "active-recall",
          label: "Quiz me on yesterday",
          prompt: "Give me 3 retrieval questions on what I covered yesterday.",
        },
      ];
    case "lesson":
      return [
        {
          method: "feynman",
          label: "I'll explain it back",
          prompt: `Let me explain ${topic} in my own words — point out the gaps.`,
        },
        {
          method: "worked-example",
          label: "Show me a worked example",
          prompt: `Walk through one full worked example of ${topic} step by step.`,
        },
        {
          method: "socratic",
          label: "Ask me the next question",
          prompt: `Don't explain — ask me the question that would expose what I don't yet understand about ${topic}.`,
        },
      ];
    case "wiki-hub":
      return [
        {
          method: "metacognition",
          label: "Pick a topic for me",
          prompt:
            "Recommend a Wikipedia article that fits what I'm trying to learn and explain the choice.",
        },
        {
          method: "worked-example",
          label: "Show me how it works",
          prompt: "Walk me through what a WikiTest session looks like, end to end.",
        },
      ];
    case "wiki-detail":
      return [
        {
          method: "metacognition",
          label: "Should I train first?",
          prompt: `Based on my history, should I train ${topic} first or jump straight to the test?`,
        },
        {
          method: "active-recall",
          label: "Pre-test me",
          prompt: `Ask me 3 questions on ${topic} so I can gauge where I'm starting from.`,
        },
      ];
    case "wiki-train":
      return [
        {
          method: "feynman",
          label: "Let me explain this section",
          prompt: `I'll explain this section of ${topic} in plain language — score me and point out gaps.`,
        },
        {
          method: "socratic",
          label: "Ask me a deeper question",
          prompt: `Ask me a one-step-harder question about ${topic} than the check-in.`,
        },
      ];
    case "wiki-quiz":
      return [
        {
          method: "metacognition",
          label: "How should I pace myself?",
          prompt:
            "Given the time left and how many I've answered, tell me how to pace the rest of this test.",
        },
      ];
    case "wiki-report":
      return [
        {
          method: "spaced-repetition",
          label: "Schedule reviews",
          prompt: `Schedule spaced-repetition reviews for the questions I missed on ${topic}.`,
        },
        {
          method: "interleaving",
          label: "Mix in a related topic",
          prompt: `Suggest an adjacent Wikipedia article so I can interleave with ${topic}.`,
        },
      ];
    case "library":
      return [
        {
          method: "spaced-repetition",
          label: "What's due for review?",
          prompt: "List the topics that are due for a spaced-repetition review today.",
        },
        {
          method: "interleaving",
          label: "Mix two topics",
          prompt:
            "Pick two topics from my library that interleave well and build me a 20-minute session.",
        },
      ];
    case "missions":
      return [
        {
          method: "metacognition",
          label: "Which mission first?",
          prompt: "Look at my open missions and tell me which one to do first, and why.",
        },
      ];
    case "achievements":
      return [
        {
          method: "metacognition",
          label: "What's my next badge?",
          prompt: "Show me the achievement closest to unlocking and what I need to do to earn it.",
        },
      ];
    case "languages":
      return [
        {
          method: "active-recall",
          label: "Quiz me on yesterday",
          prompt: "Give me a 5-item recall quiz on the vocabulary I saw yesterday.",
        },
        {
          method: "spaced-repetition",
          label: "Words due now",
          prompt: "Which words are due for review today, ordered by urgency?",
        },
      ];
    case "certifications":
      return [
        {
          method: "active-recall",
          label: "Quiz me cold",
          prompt: "Pick 5 exam-grade questions across my weakest domains and quiz me cold.",
        },
        {
          method: "metacognition",
          label: "Am I ready?",
          prompt: "Based on my scores, am I ready to take the real exam? Cite the data.",
        },
      ];
  }
}

/**
 * Builds a context-appropriate greeting line — used as the first bubble
 * in the chat thread so the tutor doesn't open every page with the
 * same generic welcome. Keeps the rail feeling alive.
 */
export function greetingFor(ctx: PageContext, teacherName: string): string {
  const topic = ctx.topic ?? "today's topic";
  switch (ctx.kind) {
    case "world-home":
      return `Hey — I'm ${teacherName}. Want me to recommend where to start today, or just pick up where you left off?`;
    case "lesson":
      return `${topic} ahead. I can explain it, quiz you on it, or walk a worked example — your call.`;
    case "wiki-hub":
      return `Paste a Wikipedia link and I'll walk you through it, then grade you. Or ask me to pick a topic for you.`;
    case "wiki-detail":
      return `${topic} loaded. Train first or test now? I can pre-test you in 3 questions if you want a baseline.`;
    case "wiki-train":
      return `Section by section — I'll cite every claim. Tell me when you want to skip ahead or slow down.`;
    case "wiki-quiz":
      return `Quiet mode while you take the test — but ping me if you want help pacing.`;
    case "wiki-report":
      return `Results in. Want me to schedule the misses on a spaced-repetition queue, or pick a related article to interleave with?`;
    case "library":
      return `Your full catalogue. Ask me to find a topic, or which lessons are due for a review.`;
    case "missions":
      return `Open missions on the left — want me to pick the highest-leverage one given your data?`;
    case "achievements":
      return `Closest unlock first. Ask me what would tip the next badge over the line.`;
    case "languages":
      return `Words due today are queued. Ask me to drill them, or to test you cold.`;
    case "certifications":
      return `Pick a vendor track and I'll diagnose your weakest domain — or quiz you across all four.`;
  }
}

/** Stable demo memory until the per-learner store ships. */
export const DEMO_MEMORY_BY_WORLD: Record<string, TutorMemory> = {
  kids: {
    goal: "Read confidently",
    weakArea: "Letter sounds",
    lastTopic: "Counting to 5",
  },
  explorer: {
    goal: "Curious about the world",
    weakArea: "Fractions",
    lastTopic: "Why volcanoes erupt",
  },
  builder: {
    goal: "Build my first game",
    weakArea: "Logic gates",
    lastTopic: "Python: functions",
  },
  scholar: {
    goal: "Pass the calculus final by June",
    weakArea: "Trigonometry · 42% mastery",
    lastTopic: "Sine and cosine basics",
  },
  adult: {
    goal: "AWS Solutions Architect by Q3",
    weakArea: "VPC Networking · 50% mastery",
    lastTopic: "IAM policies in practice",
  },
  senior: {
    goal: "Stay sharp",
    weakArea: "—",
    lastTopic: "Spotting scam messages",
  },
};

export function memoryForWorld(slug: string | undefined): TutorMemory {
  if (!slug) return {};
  return DEMO_MEMORY_BY_WORLD[slug] ?? {};
}

/** Tone helper — the journey accent colour the rail should use. */
export function accentForJourney(journey: Journey): string {
  return journey.color;
}
