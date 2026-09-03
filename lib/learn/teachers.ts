import type { LearnerStage } from "./stages";

const ALL_STAGES: LearnerStage[] = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
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
    name: "诺瓦导师",
    emoji: "🦉",
    tag: "耐心启发 · 激发好奇心",
    style: "喜欢引导学生思考“如果……会怎样”。非常适合项目实践。",
    tone: "温和 · 探索型",
    voice: "柔和、稳健",
    stages: ALL_STAGES,
    universal: true,
    focus: "全能型 · 耐心启发",
  },
  {
    id: "rex",
    name: "雷克斯导师",
    emoji: "🦊",
    tag: "敏捷有趣 · 互动教学",
    style: "充满活力，善于将知识点融入游戏化关卡中。",
    tone: "明快 · 鼓励型",
    voice: "轻快、有力",
    stages: ALL_STAGES,
    universal: true,
    focus: "全能型 · 敏捷互动",
  },
  {
    id: "sage",
    name: "赛吉导师",
    emoji: "🐢",
    tag: "沉稳条理 · 循序渐进",
    style: "一步步拆解核心概念，适合建立扎实的知识框架。",
    tone: "冷静 · 结构化",
    voice: "沉稳、平缓",
    stages: ALL_STAGES,
    universal: true,
    focus: "全能型 · 沉稳条理",
  },
  {
    id: "pixel",
    name: "皮克导师",
    emoji: "🤖",
    tag: "注重实践 · 动手构建",
    style: "带你做中学，将知识转化为解决实际问题的能力。",
    tone: "直接 · 务实",
    voice: "清晰、简练",
    stages: ALL_STAGES,
    universal: true,
    focus: "全能型 · 动手实践",
  },
];

/**
 * Stage-specialist teachers — kept for the catalog page so families can pick a
 * persona that's tuned to a single age range when they want one.
 */
export const SPECIALIST_TEACHERS: Teacher[] = [
  {
    id: "milo",
    name: "米洛导师",
    emoji: "🦉",
    tag: "启蒙故事家",
    style: "生动的童话故事、数数练习与亲切的音色。",
    tone: "温和 · 缓慢",
    voice: "亲切、柔柔的",
    stages: ["GRADE_6"],
    focus: "小学预备班",
  },
  {
    id: "luna",
    name: "露娜导师",
    emoji: "📚",
    tag: "阅读与科学探索",
    style: "培养观察习惯、拓展语文阅读与科学探索。",
    tone: "明亮 · 充满好奇",
    voice: "生动、有感染力",
    stages: ["GRADE_7"],
    focus: "初一 (七年级)",
  },
  {
    id: "ada-jr",
    name: "小艾达导师",
    emoji: "🛠️",
    tag: "信息技术与逻辑",
    style: "信息技术实战、逻辑分析与实验步骤点拨。",
    tone: "明确 · 重实操",
    voice: "干练",
    stages: ["GRADE_8"],
    focus: "初二 (八年级)",
  },
  {
    id: "mentor-max",
    name: "导师 Max",
    emoji: "🎓",
    tag: "中考冲刺教练",
    style: "中考考点精讲、薄弱板块针对性提升、讲练结合。",
    tone: "专注 · 耐心",
    voice: "稳定",
    stages: ["GRADE_9"],
    focus: "初三 (九年级中考)",
  },
  {
    id: "professor-turing",
    name: "图灵教授",
    emoji: "💼",
    tag: "高阶前沿学术",
    style: "计算机科学、人工智能与高阶学术拓展。",
    tone: "严谨 · 精确",
    voice: "专业",
    stages: ["UNIVERSITY", "PROFESSIONAL"],
    focus: "高中与大学阶段",
  },
  {
    id: "sofia",
    name: "索菲亚导师",
    emoji: "🌿",
    tag: "耐心素养辅导",
    style: "耐心、放慢节奏的陪伴式辅助教学。",
    tone: "宁静 · 鼓励",
    voice: "缓和、温暖",
    stages: ["SENIOR"],
    focus: "全龄素养学习",
  },
];

export const TEACHERS: Teacher[] = [...UNIVERSAL_TEACHERS, ...SPECIALIST_TEACHERS];

export function teachersForStage(stage: LearnerStage): Teacher[] {
  return TEACHERS.filter((t) => t.stages.includes(stage));
}

export function defaultTeacherForStage(stage: LearnerStage): Teacher {
  return teachersForStage(stage)[0] ?? UNIVERSAL_TEACHERS[0];
}
