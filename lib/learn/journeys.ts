import type { LearnerStage } from "./stages";

/**
 * Journey = the design-system view of a learner stage.
 * It pairs each LearnerStage with the visual identity from the design handoff:
 * emoji, color tokens, an example lesson, and short copy.
 */
export type Journey = {
  id: string;
  stage: LearnerStage;
  emoji: string;
  name: string;
  age: string;
  desc: string;
  example: string;
  /** CSS variables exposed by globals.css (--j-*). */
  color: string;
  bg: string;
  soft: string;
  href: string;
};

export const JOURNEYS: Journey[] = [
  {
    id: "little",
    stage: "LITTLE_LEARNER",
    emoji: "🦁",
    name: "Little Learner",
    age: "Ages 3–6",
    desc: "Stories, numbers, letters, colors, and emotions.",
    example: "Count jungle animals with Milo",
    color: "var(--j-little)",
    bg: "var(--j-little-bg)",
    soft: "var(--j-little-soft)",
    href: "/learn/kids",
  },
  {
    id: "explorer",
    stage: "EXPLORER",
    emoji: "🚀",
    name: "Explorer",
    age: "Ages 7–11",
    desc: "Science, reading, math games, and curiosity quests.",
    example: "Discover how volcanoes work",
    color: "var(--j-explorer)",
    bg: "var(--j-explorer-bg)",
    soft: "var(--j-explorer-soft)",
    href: "/learn/explorer",
  },
  {
    id: "builder",
    stage: "BUILDER",
    emoji: "🛠️",
    name: "Builder",
    age: "Ages 12–15",
    desc: "Projects, coding, logic, and problem solving.",
    example: "Build a simple calculator in Python",
    color: "var(--j-builder)",
    bg: "var(--j-builder-bg)",
    soft: "var(--j-builder-soft)",
    href: "/learn/builder",
  },
  {
    id: "scholar",
    stage: "SCHOLAR",
    emoji: "🎓",
    name: "Scholar",
    age: "Ages 16–18",
    desc: "Exam prep, study plans, and career discovery.",
    example: "Trigonometry mastery sprint",
    color: "var(--j-scholar)",
    bg: "var(--j-scholar-bg)",
    soft: "var(--j-scholar-soft)",
    href: "/learn/scholar",
  },
  {
    id: "pro",
    stage: "PROFESSIONAL",
    emoji: "💼",
    name: "Professional",
    age: "Ages 18+",
    desc: "Certifications, AI, coding, cloud, and career skills.",
    example: "AWS networking review: VPC essentials",
    color: "var(--j-pro)",
    bg: "var(--j-pro-bg)",
    soft: "var(--j-pro-soft)",
    href: "/learn/adult",
  },
  {
    id: "senior",
    stage: "SENIOR",
    emoji: "🌿",
    name: "Senior Learner",
    age: "Older adults",
    desc: "Digital literacy, memory practice, and patient guidance.",
    example: "How to identify scam messages",
    color: "var(--j-senior)",
    bg: "var(--j-senior-bg)",
    soft: "var(--j-senior-soft)",
    href: "/learn/senior",
  },
];

export function journeyForStage(stage: LearnerStage): Journey {
  return (
    JOURNEYS.find((j) => j.stage === stage) ??
    // UNIVERSITY shares the Pro journey palette
    JOURNEYS.find((j) => j.id === "pro") ??
    JOURNEYS[0]
  );
}
