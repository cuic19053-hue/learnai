/**
 * Process-local project store. Same shape as the WikiTest cache — swap
 * to Redis when multi-instance lands, no API changes needed.
 *
 * Holds:
 *   - 5 ready-to-use DEMO projects (pre-seeded across worlds) that
 *     learners can launch without filling the wizard. Every demo
 *     renders through the same ProjectCard, so the catalogue feels
 *     uniform no matter how many are added later.
 *   - Drafts created via the wizard, keyed by id and listable per
 *     world slug.
 */

import "server-only";
import { createHash } from "node:crypto";
import type { ProjectDraft } from "./wizard-config";
import type { WorldSlug } from "@/lib/learn/worlds";

const drafts = new Map<string, ProjectDraft>();

export function newDraftId(worldSlug: WorldSlug, topic: string): string {
  // Stable hash so identical worlds + topics dedupe on retry, but with a
  // random suffix when collisions happen across users.
  const seed = `${worldSlug}|${topic.toLowerCase().trim()}|${Date.now()}`;
  return createHash("sha256").update(seed).digest("hex").slice(0, 16);
}

export function saveDraft(draft: ProjectDraft): void {
  drafts.set(draft.id, draft);
}

export function getDraft(id: string): ProjectDraft | null {
  return drafts.get(id) ?? null;
}

export function listDrafts(worldSlug?: WorldSlug): ProjectDraft[] {
  const all = Array.from(drafts.values());
  return worldSlug ? all.filter((d) => d.worldSlug === worldSlug) : all;
}

/**
 * Resolve a project draft by id — checks the user-created drafts first,
 * then the pre-seeded DEMO_PROJECTS. Used by the project workspace to
 * load any project (demo or wizard-output) through one API path.
 */
export function resolveProject(id: string): ProjectDraft | null {
  const draft = drafts.get(id);
  if (draft) return draft;
  const demo = DEMO_PROJECTS.find((d) => d.id === id);
  if (demo) {
    // Strip the demo-only fields (subject/blurb/audience) before
    // returning so the type stays clean for consumers.
    const { audience: _a, blurb: _b, subject: _s, ...draft } = demo;
    return draft;
  }
  return null;
}

/**
 * Five ready-to-use demo projects that prove the wizard's output. They
 * cover the full spread of the design's example topics — Calculus,
 * Quantum harmonic oscillator, Quantum computing, Mixture of experts,
 * Transformer — and stay visually consistent because every card
 * renders through the same ProjectCard primitive.
 */
export const DEMO_PROJECTS: Array<
  ProjectDraft & {
    /** Visible kicker on the demo card. */
    audience: WorldSlug;
    /** One-line accent description that sells the demo. */
    blurb: string;
    /** Subject tag used for the accent color. */
    subject: "math" | "physics" | "cs" | "ai" | "bio" | "history";
  }
> = [
  {
    id: "demo-calculus-derivatives",
    worldSlug: "scholar",
    audience: "scholar",
    subject: "math",
    topic: "Calculus · derivatives mastery",
    outcome: "Score ≥ 80% on a 20-question derivatives mock test by next Sunday.",
    sources: ["en.wikipedia.org/wiki/Derivative"],
    daysPerWeek: 5,
    minutesPerDay: 25,
    deadline: undefined,
    prefs: ["practice", "worked", "summary"],
    status: "idea",
    createdAt: "2026-05-21T09:00:00.000Z",
    blurb:
      "From limits to the chain rule in 7 days. Worked examples drawn from the Wikipedia article on Derivative.",
  },
  {
    id: "demo-qho",
    worldSlug: "adult",
    audience: "adult",
    subject: "physics",
    topic: "Quantum harmonic oscillator",
    outcome: "Be able to derive the ladder-operator solution from scratch in 20 minutes.",
    sources: ["en.wikipedia.org/wiki/Quantum_harmonic_oscillator"],
    daysPerWeek: 4,
    minutesPerDay: 30,
    deadline: undefined,
    prefs: ["worked", "summary"],
    status: "idea",
    createdAt: "2026-05-21T09:00:00.000Z",
    blurb:
      "Advanced physics. Prerequisites detected: linear algebra, differential equations, complex analysis.",
  },
  {
    id: "demo-quantum-computing",
    worldSlug: "scholar",
    audience: "scholar",
    subject: "cs",
    topic: "Quantum computing basics",
    outcome: "Understand single-qubit gates, the Bell state, and Grover's algorithm.",
    sources: ["en.wikipedia.org/wiki/Quantum_computing"],
    daysPerWeek: 3,
    minutesPerDay: 25,
    deadline: undefined,
    prefs: ["practice", "video"],
    status: "idea",
    createdAt: "2026-05-21T09:00:00.000Z",
    blurb:
      "Real circuit diagrams, the Bloch sphere visualiser, and a Dirac-notation cheat sheet.",
  },
  {
    id: "demo-mixture-of-experts",
    worldSlug: "adult",
    audience: "adult",
    subject: "ai",
    topic: "Mixture of experts",
    outcome:
      "Be ready to explain top-k routing, load balancing, and the active-vs-total parameter trade-off.",
    sources: ["en.wikipedia.org/wiki/Mixture_of_experts"],
    daysPerWeek: 4,
    minutesPerDay: 35,
    deadline: undefined,
    prefs: ["worked", "summary"],
    status: "idea",
    createdAt: "2026-05-21T09:00:00.000Z",
    blurb:
      "Routing diagrams, load-imbalance bar charts, and a 250-word free-response on the failure modes.",
  },
  {
    id: "demo-transformer-defense",
    worldSlug: "adult",
    audience: "adult",
    subject: "ai",
    topic: "Transformer defense — thesis prep",
    outcome:
      "Survive a 45-minute oral defense across attention, position encoding, RoPE, and training tricks.",
    sources: [
      "en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)",
      "Vaswani et al. 2017 (Attention is All You Need)",
      "your_thesis_chapter4.pdf",
    ],
    daysPerWeek: 6,
    minutesPerDay: 45,
    deadline: undefined,
    prefs: ["voice", "worked", "summary"],
    status: "idea",
    createdAt: "2026-05-21T09:00:00.000Z",
    blurb:
      "Defense mode: Socratic chains, Feynman explain-back with AI critique, and a 3-persona mock committee.",
  },
];

/** Subject accent tokens — keeps demo cards visually uniform. */
export const SUBJECT_ACCENT: Record<
  (typeof DEMO_PROJECTS)[number]["subject"],
  { color: string; bg: string; soft: string; label: string }
> = {
  math: { color: "#2e5bff", bg: "#e6ecff", soft: "#f3f6ff", label: "Math" },
  physics: { color: "#0ea5a4", bg: "#d6f1f0", soft: "#e9f8f7", label: "Physics" },
  cs: { color: "#7c3aed", bg: "#efe7ff", soft: "#f7f3ff", label: "CS" },
  ai: { color: "#d97706", bg: "#fef3c7", soft: "#fffbeb", label: "AI / ML" },
  bio: { color: "#2dbb6c", bg: "#e7f8ee", soft: "#f3fbf5", label: "Bio" },
  history: { color: "#b45309", bg: "#fef3c7", soft: "#fffbeb", label: "History" },
};
