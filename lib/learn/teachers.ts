import type { LearnerStage } from "./stages";

const ALL_STAGES: LearnerStage[] = [
  "LITTLE_LEARNER",
  "EXPLORER",
  "BUILDER",
  "SCHOLAR",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

export type Teacher = {
  id: string;
  name: string;
  emoji: string;
  /** One-line personality tag, e.g. "Patient & curious". */
  tag: string;
  /** Longer style description shown on the teacher card. */
  style: string;
  /** "Warm · Inquisitive" tone hint. */
  tone: string;
  /** Voice description, e.g. "Soft, slow". */
  voice: string;
  /** Stages this teacher is appropriate for. Universal teachers list every stage. */
  stages: LearnerStage[];
  /** Universal teachers are offered to every learner. Specialists target one stage. */
  universal?: boolean;
  /** Short focus blurb for the teacher catalog page. */
  focus: string;
};

/**
 * Universal teacher personas from the design handoff. Each one teaches the
 * same curriculum, but with a different voice, pace, and personality.
 */
export const UNIVERSAL_TEACHERS: Teacher[] = [
  {
    id: "nova",
    name: "Nova",
    emoji: "🦉",
    tag: "Patient & curious",
    style: "Loves to ask “what if?”. Great for projects.",
    tone: "Warm · Inquisitive",
    voice: "Soft, slow",
    stages: ALL_STAGES,
    universal: true,
    focus: "Universal · Patient & curious",
  },
  {
    id: "rex",
    name: "Rex",
    emoji: "🦊",
    tag: "Quick & playful",
    style: "Energetic and game-loving. Best for streaks.",
    tone: "Fast · Encouraging",
    voice: "Bright, punchy",
    stages: ALL_STAGES,
    universal: true,
    focus: "Universal · Quick & playful",
  },
  {
    id: "sage",
    name: "Sage",
    emoji: "🐢",
    tag: "Calm & methodical",
    style: "Walks step by step. Great for big ideas.",
    tone: "Calm · Structured",
    voice: "Steady, measured",
    stages: ALL_STAGES,
    universal: true,
    focus: "Universal · Calm & methodical",
  },
  {
    id: "pixel",
    name: "Pixel",
    emoji: "🤖",
    tag: "Project-focused",
    style: "Builds real things with you. Loves shipping.",
    tone: "Direct · Pragmatic",
    voice: "Crisp, clear",
    stages: ALL_STAGES,
    universal: true,
    focus: "Universal · Project-focused",
  },
];

/**
 * Stage-specialist teachers — kept for the catalog page so families can pick a
 * persona that's tuned to a single age range when they want one.
 */
export const SPECIALIST_TEACHERS: Teacher[] = [
  {
    id: "milo",
    name: "Milo the Owl",
    emoji: "🦉",
    tag: "Playful storyteller",
    style: "Playful stories, counting, and gentle voice.",
    tone: "Warm · Slow",
    voice: "Gentle, sing-song",
    stages: ["LITTLE_LEARNER"],
    focus: "Ages 3–6",
  },
  {
    id: "luna",
    name: "Luna",
    emoji: "📚",
    tag: "Reading & imagination",
    style: "Reading, imagination, and curiosity quests.",
    tone: "Bright · Curious",
    voice: "Lively",
    stages: ["EXPLORER"],
    focus: "Ages 7–11",
  },
  {
    id: "ada-jr",
    name: "Ada Jr.",
    emoji: "🛠️",
    tag: "Coding missions",
    style: "Coding missions, logic, and project hints.",
    tone: "Direct · Hands-on",
    voice: "Crisp",
    stages: ["BUILDER"],
    focus: "Ages 12–15",
  },
  {
    id: "mentor-max",
    name: "Mentor Max",
    emoji: "🎓",
    tag: "Exam coach",
    style: "Exam prep, weak-area focus, teach-until-learned.",
    tone: "Focused · Patient",
    voice: "Steady",
    stages: ["SCHOLAR"],
    focus: "Ages 16–18",
  },
  {
    id: "professor-turing",
    name: "Professor Turing",
    emoji: "💼",
    tag: "CS & certification",
    style: "CS, AI, cloud, and certification tracks.",
    tone: "Precise · Rigorous",
    voice: "Authoritative",
    stages: ["UNIVERSITY", "PROFESSIONAL"],
    focus: "Ages 18+",
  },
  {
    id: "sofia",
    name: "Sofia",
    emoji: "🌿",
    tag: "Patient digital helper",
    style: "Patient, slow, voice-first digital literacy.",
    tone: "Calm · Reassuring",
    voice: "Slow, warm",
    stages: ["SENIOR"],
    focus: "Senior learners",
  },
];

export const TEACHERS: Teacher[] = [...UNIVERSAL_TEACHERS, ...SPECIALIST_TEACHERS];

export function teachersForStage(stage: LearnerStage): Teacher[] {
  return TEACHERS.filter((t) => t.stages.includes(stage));
}

export function defaultTeacherForStage(stage: LearnerStage): Teacher {
  return teachersForStage(stage)[0] ?? UNIVERSAL_TEACHERS[0];
}
