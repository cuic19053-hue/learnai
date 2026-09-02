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
    label: "兴趣引入",
    icon: "🧲",
    color: "var(--l-hook)",
    blurb: "用贴近生活的问题激发好奇心。",
  },
  {
    n: 2,
    label: "概念讲解",
    icon: "💡",
    color: "var(--l-explain)",
    blurb: "清晰简明、因材施教的知识点点拨。",
  },
  {
    n: 3,
    label: "互动练习",
    icon: "✏️",
    color: "var(--l-practice)",
    blurb: "在做中学，巩固掌握核心技能。",
  },
  {
    n: 4,
    label: "即时反馈",
    icon: "💬",
    color: "var(--l-feedback)",
    blurb: "AI 导师实时指导与针对性纠错。",
  },
  {
    n: 5,
    label: "反思总结",
    icon: "🪞",
    color: "var(--l-reflect)",
    blurb: "梳理知识脉络，融会贯通。",
  },
  {
    n: 6,
    label: "能力进阶",
    icon: "🌱",
    color: "var(--l-evolve)",
    blurb: "根据掌握情况自动调整难度并升级。",
  },
];
