import type { LearnerStage } from "./stages";

/**
 * The ten learning methods LearnAI implements — drawn from the historical
 * record (Greek, Soviet, Japanese, German, modern cognitive science) and
 * chosen for being both *simple* and *evidence-backed*.
 *
 * Each method maps to one or more steps of the LearnAI Loop:
 *   Hook → Explain → Practice → Feedback → Reflect → Evolve.
 */

export type LoopStepId =
  | "hook"
  | "explain"
  | "practice"
  | "feedback"
  | "reflect"
  | "evolve";

export type LearningMethodId =
  | "socratic"
  | "memory_palace"
  | "spaced_repetition"
  | "active_recall"
  | "worked_example"
  | "interleaving"
  | "feynman"
  | "kumon_ladder"
  | "zpd_adaptive"
  | "shatalov_signal";

export type LearningMethod = {
  id: LearningMethodId;
  name: string;
  /** Cultural / scientific origin. */
  origin: string;
  /** Who coined or codified it. */
  attribution: string;
  /** Year or rough era. */
  year: string;
  /** One-sentence description. */
  oneLiner: string;
  /** Why it works — short paragraph. */
  why: string;
  /** Loop steps this method shines in. */
  loopSteps: LoopStepId[];
  /** Stages this method is well-suited to. Empty = applies everywhere. */
  stages?: LearnerStage[];
  /** Emoji for visual identification in UI. */
  emoji: string;
};

export const METHODS: LearningMethod[] = [
  {
    id: "socratic",
    name: "Socratic dialogue",
    origin: "Ancient Greece",
    attribution: "Socrates / Plato",
    year: "5th c. BCE",
    oneLiner: "Learn by answering a sequence of probing questions.",
    why: "Questions move responsibility for thinking onto the learner. Each answer surfaces the next gap, building understanding from the inside out — the original 'active' learning.",
    loopSteps: ["hook", "feedback"],
    emoji: "❓",
  },
  {
    id: "memory_palace",
    name: "Method of Loci (memory palace)",
    origin: "Ancient Greece",
    attribution: "Simonides of Ceos",
    year: "~500 BCE",
    oneLiner: "Anchor abstract items to a familiar spatial route.",
    why: "Human memory is spatial. Placing facts along a remembered path turns brittle recall into a vivid, sequenced walk — still used by world memory champions today.",
    loopSteps: ["explain", "evolve"],
    stages: ["EXPLORER", "BUILDER", "SCHOLAR", "UNIVERSITY", "PROFESSIONAL", "SENIOR"],
    emoji: "🏛️",
  },
  {
    id: "spaced_repetition",
    name: "Spaced repetition",
    origin: "Germany",
    attribution: "Hermann Ebbinghaus",
    year: "1885",
    oneLiner: "Review at expanding intervals timed to the forgetting curve.",
    why: "Forgetting is exponential; a single well-timed review flattens the curve. Reviewing just-before-you-forget multiplies retention with minimal time spent.",
    loopSteps: ["evolve"],
    emoji: "🔁",
  },
  {
    id: "active_recall",
    name: "Active recall (testing effect)",
    origin: "Modern cognitive science",
    attribution: "Roediger & Karpicke",
    year: "2006",
    oneLiner: "Retrieving a fact strengthens it more than re-reading it.",
    why: "The act of pulling information out of memory rewires the retrieval path. Quizzes and self-tests outperform highlighting and re-reading by a wide margin.",
    loopSteps: ["practice", "feedback"],
    emoji: "🎯",
  },
  {
    id: "worked_example",
    name: "Worked example → twin problem",
    origin: "Australia / Cognitive load theory",
    attribution: "John Sweller",
    year: "1985",
    oneLiner: "Show one fully solved example, then ask for a near-twin.",
    why: "Novices learn fastest by studying complete solutions before attempting their own. Twin problems then transfer the pattern without overloading working memory.",
    loopSteps: ["explain", "practice"],
    emoji: "🧮",
  },
  {
    id: "interleaving",
    name: "Interleaving",
    origin: "USA / Bjork lab",
    attribution: "Robert Bjork",
    year: "1990s",
    oneLiner: "Mix related topics within one session instead of blocking them.",
    why: "Switching between A, B, C forces the brain to choose the right method each time. Counter-intuitive (feels harder) but produces dramatically stronger long-term mastery.",
    loopSteps: ["practice"],
    emoji: "🎲",
  },
  {
    id: "feynman",
    name: "Feynman technique",
    origin: "USA",
    attribution: "Richard Feynman",
    year: "1960s",
    oneLiner: "If you can't explain it simply, you don't understand it.",
    why: "Forcing the learner to teach back in plain words exposes every gap. The act of simplification is itself the learning — it's where confusion becomes clarity.",
    loopSteps: ["feedback", "reflect"],
    emoji: "🗣️",
  },
  {
    id: "kumon_ladder",
    name: "Kumon mastery ladder",
    origin: "Japan",
    attribution: "Toru Kumon",
    year: "1958",
    oneLiner: "Tiny daily problems; advance only on a 100% pass.",
    why: "Self-paced micro-mastery removes failure as a stigma. Frequent small wins compound; each rung is small enough to be guaranteed, building durable confidence.",
    loopSteps: ["practice"],
    emoji: "🪜",
  },
  {
    id: "zpd_adaptive",
    name: "Zone of Proximal Development",
    origin: "Soviet Union",
    attribution: "Lev Vygotsky",
    year: "1934",
    oneLiner: "Pick the next problem just past what the learner can do alone.",
    why: "Too easy = bored, too hard = stuck. The sweet spot — solvable with a hint or peer — is where new structure forms. AI is a perfect ZPD partner: it can recalibrate every turn.",
    loopSteps: ["practice"],
    emoji: "📈",
  },
  {
    id: "shatalov_signal",
    name: "Shatalov reference signal",
    origin: "Soviet Union",
    attribution: "Viktor Shatalov",
    year: "1970s",
    oneLiner: "Compress a topic into a single visual mind-map.",
    why: "A one-page reference signal forces the learner to find the structure of the topic. Re-drawing it on demand is a memory aid AND a misconception detector.",
    loopSteps: ["reflect"],
    emoji: "🗺️",
  },
];

const LOOP_STEP_TO_INDEX: Record<LoopStepId, number> = {
  hook: 0,
  explain: 1,
  practice: 2,
  feedback: 3,
  reflect: 4,
  evolve: 5,
};

export function methodById(id: LearningMethodId): LearningMethod {
  const found = METHODS.find((m) => m.id === id);
  if (!found) throw new Error(`Unknown method: ${id}`);
  return found;
}

/**
 * Methods well-suited to a given Loop step, optionally filtered by stage.
 */
export function methodsForStep(
  step: LoopStepId,
  stage?: LearnerStage,
): LearningMethod[] {
  return METHODS.filter((m) => {
    if (!m.loopSteps.includes(step)) return false;
    if (m.stages && stage && !m.stages.includes(stage)) return false;
    return true;
  });
}

/**
 * A default Loop plan — one method per Loop step, recommended for most
 * learners. Stage-specific overrides are merged on top.
 */
export const DEFAULT_PLAN: Record<LoopStepId, LearningMethodId> = {
  hook: "socratic",
  explain: "worked_example",
  practice: "kumon_ladder",
  feedback: "feynman",
  reflect: "shatalov_signal",
  evolve: "spaced_repetition",
};

const STAGE_PLANS: Partial<Record<LearnerStage, Partial<Record<LoopStepId, LearningMethodId>>>> = {
  // Tiny ones learn by showing, doing, and recalling — not by Socratic chains.
  LITTLE_LEARNER: {
    hook: "active_recall",
    explain: "worked_example",
    practice: "kumon_ladder",
    feedback: "active_recall",
    reflect: "memory_palace",
  },
  EXPLORER: {
    hook: "socratic",
    explain: "memory_palace",
    practice: "interleaving",
  },
  BUILDER: {
    explain: "worked_example",
    practice: "zpd_adaptive",
  },
  SCHOLAR: {
    practice: "interleaving",
    reflect: "shatalov_signal",
  },
  UNIVERSITY: {
    practice: "interleaving",
  },
  PROFESSIONAL: {
    practice: "interleaving",
  },
  SENIOR: {
    hook: "active_recall",
    practice: "kumon_ladder",
    feedback: "feynman",
  },
};

/**
 * Resolved method plan for a stage. Returns one method id per Loop step.
 */
export function planForStage(stage: LearnerStage): Record<LoopStepId, LearningMethodId> {
  const override = STAGE_PLANS[stage] ?? {};
  return { ...DEFAULT_PLAN, ...override };
}

export function compareLoopOrder(a: LoopStepId, b: LoopStepId): number {
  return LOOP_STEP_TO_INDEX[a] - LOOP_STEP_TO_INDEX[b];
}
