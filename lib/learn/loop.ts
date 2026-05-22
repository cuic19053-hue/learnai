/**
 * The "Loop" — six-step pedagogical mechanism that every lesson runs,
 * regardless of learner age. The surface differs (playful, mission, exam,
 * professional, calm) but the steps are constant.
 */
export type LoopStep = {
  n: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  icon: string;
  /** CSS variable from globals.css (--l-*). */
  color: string;
  blurb: string;
};

export const LOOP: LoopStep[] = [
  {
    n: 1,
    label: "Hook",
    icon: "🧲",
    color: "var(--l-hook)",
    blurb: "Spark curiosity with a real question.",
  },
  {
    n: 2,
    label: "Explain",
    icon: "💡",
    color: "var(--l-explain)",
    blurb: "Clear, simple ideas — made for you.",
  },
  {
    n: 3,
    label: "Practice",
    icon: "✏️",
    color: "var(--l-practice)",
    blurb: "Active practice that builds skill.",
  },
  {
    n: 4,
    label: "Feedback",
    icon: "💬",
    color: "var(--l-feedback)",
    blurb: "Instant feedback that helps you grow.",
  },
  {
    n: 5,
    label: "Reflect",
    icon: "🪞",
    color: "var(--l-reflect)",
    blurb: "Reflect and connect the dots.",
  },
  {
    n: 6,
    label: "Evolve",
    icon: "🌱",
    color: "var(--l-evolve)",
    blurb: "Adapt and level up — together.",
  },
];
