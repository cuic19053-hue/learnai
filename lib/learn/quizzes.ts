/**
 * Quiz / exercise generators — one per learning method. Each generator
 * accepts (topic, stage) and returns a typed Exercise. The exercises
 * here are deterministic stubs that the future AI layer can swap with
 * model-generated content while keeping the type contract stable.
 */

import type { LearnerStage } from "./stages";
import type { LearningMethodId, LoopStepId } from "./methods";

/* ────────────────────────────────────────────────────────────────────── */
/*  Exercise types — discriminated union                                  */
/* ────────────────────────────────────────────────────────────────────── */

interface ExerciseBase {
  method: LearningMethodId;
  loopStep: LoopStepId;
  /** Friendly title shown above the exercise. */
  title?: string;
}

export type OpenQuestion = ExerciseBase & {
  kind: "open_question";
  prompt: string;
  rubric?: string[];
};

export type MultipleChoice = ExerciseBase & {
  kind: "multiple_choice";
  prompt: string;
  choices: string[];
  correctIndex: number;
  explanation?: string;
};

export type FillBlank = ExerciseBase & {
  kind: "fill_blank";
  /** Sentence with `___` placeholders. */
  sentence: string;
  answers: string[];
};

export type Matching = ExerciseBase & {
  kind: "matching";
  pairs: Array<{ left: string; right: string }>;
};

export type Ordering = ExerciseBase & {
  kind: "ordering";
  items: string[];
  /** Indices into `items` in the correct order. */
  correctOrder: number[];
};

export type ExplainBack = ExerciseBase & {
  kind: "explain_back";
  prompt: string;
  /** Audience to explain to, e.g. "a 10-year-old". */
  audience: string;
  minWords?: number;
};

export type TwinProblem = ExerciseBase & {
  kind: "twin_problem";
  example: { problem: string; solution: string };
  twin: string;
};

export type SpacedCard = ExerciseBase & {
  kind: "spaced_card";
  front: string;
  back: string;
  /** Days until next review under SM-2-style scheduling. */
  intervalDays: number;
};

export type SummarySignal = ExerciseBase & {
  kind: "summary_signal";
  /** Topic the learner should reduce to a one-page mind-map. */
  topic: string;
  /** Anchor nouns the map should include. */
  mustInclude: string[];
};

export type LociAnchor = ExerciseBase & {
  kind: "loci_anchor";
  /** Familiar scene the learner already knows (kitchen, school path…). */
  place: string;
  /** Items to anchor at distinct waypoints inside `place`. */
  items: string[];
};

export type Exercise =
  | OpenQuestion
  | MultipleChoice
  | FillBlank
  | Matching
  | Ordering
  | ExplainBack
  | TwinProblem
  | SpacedCard
  | SummarySignal
  | LociAnchor;

/* ────────────────────────────────────────────────────────────────────── */
/*  Per-method generators                                                 */
/* ────────────────────────────────────────────────────────────────────── */

type Ctx = { topic: string; stage: LearnerStage };

const SOCRATIC_OPENERS = [
  "What do you already know about",
  "Why do you think people care about",
  "What surprised you most about",
  "Where in your daily life do you see",
];

export function generateForMethod(
  method: LearningMethodId,
  loopStep: LoopStepId,
  ctx: Ctx
): Exercise {
  switch (method) {
    case "socratic": {
      const opener = SOCRATIC_OPENERS[ctx.topic.length % SOCRATIC_OPENERS.length];
      return {
        kind: "open_question",
        method,
        loopStep,
        title: "Socratic question",
        prompt: `${opener} ${ctx.topic.toLowerCase()}?`,
        rubric: ["1 sentence is fine", "no right or wrong yet"],
      };
    }

    case "active_recall":
      return {
        kind: "multiple_choice",
        method,
        loopStep,
        title: "Quick recall",
        prompt: `Which statement best describes ${ctx.topic}?`,
        choices: [
          `${ctx.topic} is the central concept of today's lesson.`,
          `${ctx.topic} is unrelated to today's lesson.`,
          `${ctx.topic} is only used in advanced contexts.`,
          `${ctx.topic} has no examples in real life.`,
        ],
        correctIndex: 0,
        explanation: "Retrieving the idea — even when it's easy — strengthens the memory.",
      };

    case "worked_example":
      return {
        kind: "twin_problem",
        method,
        loopStep,
        title: "Worked example, then your turn",
        example: {
          problem: `Sample: a basic exercise about ${ctx.topic}.`,
          solution: `Step-by-step: identify the key idea, apply it, check the answer.`,
        },
        twin: `Now try a near-twin problem about ${ctx.topic} — same shape, new numbers.`,
      };

    case "kumon_ladder":
      return {
        kind: "fill_blank",
        method,
        loopStep,
        title: "Mastery rung — 100% to advance",
        sentence: `${ctx.topic} matters because ___ and is used to ___.`,
        answers: ["it solves a real problem", "build the next idea"],
      };

    case "zpd_adaptive":
      return {
        kind: "ordering",
        method,
        loopStep,
        title: "Order the steps (just one rung above easy)",
        items: [
          `Define ${ctx.topic}`,
          `Spot ${ctx.topic} in an example`,
          `Apply ${ctx.topic} to a new problem`,
          `Explain ${ctx.topic} to someone else`,
        ],
        correctOrder: [0, 1, 2, 3],
      };

    case "interleaving":
      return {
        kind: "matching",
        method,
        loopStep,
        title: "Match each idea to its example (mixed order)",
        pairs: [
          { left: `${ctx.topic} — definition`, right: "the core idea in one line" },
          { left: `${ctx.topic} — counter-example`, right: "what it is NOT" },
          { left: `${ctx.topic} — application`, right: "where you'd use it" },
          { left: `${ctx.topic} — pitfall`, right: "the most common mistake" },
        ],
      };

    case "feynman":
      return {
        kind: "explain_back",
        method,
        loopStep,
        title: "Explain it back — in plain words",
        prompt: `In your own words, explain ${ctx.topic} to ${audienceFor(ctx.stage)}.`,
        audience: audienceFor(ctx.stage),
        minWords: ctx.stage === "LITTLE_LEARNER" ? 5 : 25,
      };

    case "shatalov_signal":
      return {
        kind: "summary_signal",
        method,
        loopStep,
        title: "One-page reference signal",
        topic: ctx.topic,
        mustInclude: ["definition", "example", "common mistake", "when to use"],
      };

    case "spaced_repetition":
      return {
        kind: "spaced_card",
        method,
        loopStep,
        title: "Add to your review deck",
        front: `What is ${ctx.topic}?`,
        back: `${ctx.topic} — a single-sentence definition you'd give a friend.`,
        intervalDays: 1,
      };

    case "memory_palace":
      return {
        kind: "loci_anchor",
        method,
        loopStep,
        title: "Place it in your memory palace",
        place: "your kitchen",
        items: [
          `definition of ${ctx.topic}`,
          `one good example of ${ctx.topic}`,
          `a common mistake about ${ctx.topic}`,
        ],
      };
  }
}

function audienceFor(stage: LearnerStage): string {
  switch (stage) {
    case "LITTLE_LEARNER":
      return "your favourite toy";
    case "EXPLORER":
      return "your best friend";
    case "BUILDER":
      return "a younger sibling";
    case "SCHOLAR":
      return "a curious 10-year-old";
    case "UNIVERSITY":
    case "PROFESSIONAL":
      return "a smart colleague new to the topic";
    case "SENIOR":
      return "your grandchild";
  }
}
