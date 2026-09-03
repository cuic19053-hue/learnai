export type LearnerStage =
  | "GRADE_6"
  | "GRADE_7"
  | "GRADE_8"
  | "GRADE_9"
  | "UNIVERSITY"
  | "PROFESSIONAL"
  | "SENIOR";

export type LearnerProfile = {
  id: string;
  name: string;
  stage: LearnerStage;
  age?: number;
  language: string;
  attentionMinutes: number;
  interests: string[];
};

export const LEARNING_STAGES: Array<{
  stage: LearnerStage;
  title: string;
  age: string;
  icon: string;
  description: string;
  exampleLesson: string;
  href: string;
}> = [
  {
    stage: "GRADE_6",
    title: "预备班 (六年级数学)",
    age: "11–12 岁",
    icon: "🎒",
    description: "沪教版六年级数学：分数的意义与四则运算、长方体与正方体、有理数及其运算、一次方程与一次不等式。",
    exampleLesson: "沪教版六年级数学 - 分数的化简与运算",
    href: "/onboarding?stage=GRADE_6",
  },
  {
    stage: "GRADE_7",
    title: "初一 (七年级数学)",
    age: "12–13 岁",
    icon: "📐",
    description: "沪教版七年级数学：线段与角、相交线与平行线、实数与二次根式、整式的乘除与因式分解。",
    exampleLesson: "沪教版七年级数学 - 相交线与平行线性质",
    href: "/onboarding?stage=GRADE_7",
  },
  {
    stage: "GRADE_8",
    title: "初二 (八年级数学)",
    age: "13–14 岁",
    icon: "📊",
    description: "沪教版八年级数学：二次根式、一元二次方程、正比例函数与一次函数、命题与证明、全等三角形与勾股定理。",
    exampleLesson: "沪教版八年级数学 - 一次函数解析式与图象",
    href: "/onboarding?stage=GRADE_8",
  },
  {
    stage: "GRADE_9",
    title: "初三 (九年级数学)",
    age: "14–15 岁",
    icon: "🎯",
    description: "沪教版九年级数学：相似三角形、锐角三角函数、二次函数图象与性质、圆的切线与中考数学压轴题。",
    exampleLesson: "沪教版九年级数学 - 锐角三角函数与解直角三角形",
    href: "/onboarding?stage=GRADE_9",
  },
  {
    stage: "PROFESSIONAL",
    title: "高中及以上 (Professional)",
    age: "15 岁+",
    icon: "🎓",
    description: "高中课程、各类考试与大学先修内容。",
    exampleLesson: "高中数学 - 三角函数核心突破特训",
    href: "/onboarding?stage=PROFESSIONAL",
  },
  {
    stage: "SENIOR",
    title: "教研与家长 (Senior)",
    age: "成人",
    icon: "👨‍🏫",
    description: "教学研讨、考纲分析与家庭教育指导。",
    exampleLesson: "如何帮助孩子做好初高中衔接",
    href: "/onboarding?stage=SENIOR",
  },
];

export function stageToPath(stage: LearnerStage): string {
  switch (stage) {
    case "GRADE_6":
      return "/learn/grade6";
    case "GRADE_7":
      return "/learn/grade7";
    case "GRADE_8":
      return "/learn/grade8";
    case "GRADE_9":
      return "/learn/grade9";
    case "UNIVERSITY":
    case "PROFESSIONAL":
      return "/learn/adult";
    case "SENIOR":
      return "/learn/senior";
    default:
      return "/onboarding";
  }
}
