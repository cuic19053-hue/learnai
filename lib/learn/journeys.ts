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
    name: "幼龄启蒙",
    age: "3–6 岁",
    desc: "故事、数字、字母、色彩与情商认知。",
    example: "和 Milo 一起数丛林动物",
    color: "var(--j-little)",
    bg: "var(--j-little-bg)",
    soft: "var(--j-little-soft)",
    href: "/learn/kids",
  },
  {
    id: "explorer",
    stage: "EXPLORER",
    emoji: "🚀",
    name: "少儿探索",
    age: "7–11 岁",
    desc: "自然科学、阅读、数学游戏与好奇心探索。",
    example: "探索火山喷发的原理",
    color: "var(--j-explorer)",
    bg: "var(--j-explorer-bg)",
    soft: "var(--j-explorer-soft)",
    href: "/learn/explorer",
  },
  {
    id: "builder",
    stage: "BUILDER",
    emoji: "🛠️",
    name: "少年创客",
    age: "12–15 岁",
    desc: "项目实践、编程入门、逻辑思维与问题解决。",
    example: "用 Python 构建简易计算器",
    color: "var(--j-builder)",
    bg: "var(--j-builder-bg)",
    soft: "var(--j-builder-soft)",
    href: "/learn/builder",
  },
  {
    id: "scholar",
    stage: "SCHOLAR",
    emoji: "🎓",
    name: "高中学者",
    age: "16–18 岁",
    desc: "备考冲刺、学习规划与未来职业探索。",
    example: "三角函数核心突破特训",
    color: "var(--j-scholar)",
    bg: "var(--j-scholar-bg)",
    soft: "var(--j-scholar-soft)",
    href: "/learn/scholar",
  },
  {
    id: "pro",
    stage: "PROFESSIONAL",
    emoji: "💼",
    name: "职场进阶",
    age: "18 岁以上",
    desc: "专业认证、AI应用、编程、云计算与职业技能。",
    example: "AWS 网络架构复习：VPC 核心要素",
    color: "var(--j-pro)",
    bg: "var(--j-pro-bg)",
    soft: "var(--j-pro-soft)",
    href: "/learn/adult",
  },
  {
    id: "senior",
    stage: "SENIOR",
    emoji: "🌿",
    name: "长者关怀",
    age: "长者人群",
    desc: "数字素养、记忆锻炼与耐心陪伴引导。",
    example: "如何识别网络与短信诈骗",
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
