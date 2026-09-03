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
    name: "六年级 (预备班数学)",
    age: "11–12 岁",
    desc: "沪教版六年级数学：分数的意义与四则运算、长方体与正方体、有理数及其运算、一次方程与一次不等式。",
    example: "沪教版六年级数学 - 分数的化简与四则运算",
    color: "var(--j-little)",
    bg: "var(--j-little-bg)",
    soft: "var(--j-little-soft)",
    href: "/learn/grade6",
  },
  {
    id: "explorer",
    stage: "GRADE_7",
    emoji: "📐",
    name: "七年级 (初一数学)",
    age: "12–13 岁",
    desc: "沪教版七年级数学：线段与角、相交线与平行线、实数与二次根式、整式的乘除与因式分解。",
    example: "沪教版七年级数学 - 相交线与平行线性质",
    color: "var(--j-explorer)",
    bg: "var(--j-explorer-bg)",
    soft: "var(--j-explorer-soft)",
    href: "/learn/grade7",
  },
  {
    id: "builder",
    stage: "GRADE_8",
    emoji: "📊",
    name: "八年级 (初二数学)",
    age: "13–14 岁",
    desc: "沪教版八年级数学：二次根式化简、一元二次方程、正比例函数与一次函数、全等三角形证明。",
    example: "沪教版八年级数学 - 一次函数解析式与图象",
    color: "var(--j-builder)",
    bg: "var(--j-builder-bg)",
    soft: "var(--j-builder-soft)",
    href: "/learn/grade8",
  },
  {
    id: "scholar",
    stage: "GRADE_9",
    emoji: "🎯",
    name: "九年级 (初三数学)",
    age: "14–15 岁",
    desc: "沪教版九年级数学：相似三角形、锐角三角函数、二次函数与图像、圆的性质与中考压轴题复习。",
    example: "沪教版九年级数学 - 锐角三角函数与解直角三角形",
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
