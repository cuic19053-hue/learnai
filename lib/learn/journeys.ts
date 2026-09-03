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
    stage: "GRADE_6",
    emoji: "🎒",
    name: "六年级 (预备班)",
    age: "11–12 岁",
    desc: "语文、数学、英语、科学、地理、信息科技等基础课程。",
    example: "沪教版六年级数学 - 分数运算",
    color: "var(--j-little)",
    bg: "var(--j-little-bg)",
    soft: "var(--j-little-soft)",
    href: "/learn/grade6",
  },
  {
    id: "explorer",
    stage: "GRADE_7",
    emoji: "🔬",
    name: "七年级 (初一)",
    age: "12–13 岁",
    desc: "语文、数学、英语、生命科学、地理、历史等学科。",
    example: "沪教版七年级生命科学 - 显微镜使用",
    color: "var(--j-explorer)",
    bg: "var(--j-explorer-bg)",
    soft: "var(--j-explorer-soft)",
    href: "/learn/grade7",
  },
  {
    id: "builder",
    stage: "GRADE_8",
    emoji: "🧲",
    name: "八年级 (初二)",
    age: "13–14 岁",
    desc: "语文、数学、英语、物理、历史、生命科学等，迎接挑战。",
    example: "沪科版八年级物理 - 光的折射与反射",
    color: "var(--j-builder)",
    bg: "var(--j-builder-bg)",
    soft: "var(--j-builder-soft)",
    href: "/learn/grade8",
  },
  {
    id: "scholar",
    stage: "GRADE_9",
    emoji: "🧪",
    name: "九年级 (初三)",
    age: "14–15 岁",
    desc: "语文、数学、英语、物理、化学、跨学科等，中考冲刺。",
    example: "沪教版九年级化学 - 溶液的酸碱性",
    color: "var(--j-scholar)",
    bg: "var(--j-scholar-bg)",
    soft: "var(--j-scholar-soft)",
    href: "/learn/grade9",
  },
  {
    id: "pro",
    stage: "PROFESSIONAL",
    emoji: "🎓",
    name: "高中及以上",
    age: "15 岁以上",
    desc: "高中课程、各类考试与大学先修内容。",
    example: "高中数学 - 三角函数核心突破特训",
    color: "var(--j-pro)",
    bg: "var(--j-pro-bg)",
    soft: "var(--j-pro-soft)",
    href: "/learn/adult",
  },
  {
    id: "senior",
    stage: "SENIOR",
    emoji: "👨‍🏫",
    name: "教研与家长",
    age: "成人",
    desc: "教学研讨、考纲分析与家庭教育指导。",
    example: "如何帮助孩子做好初高中衔接",
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
