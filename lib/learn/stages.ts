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
    title: "预备班 (六年级)",
    age: "11–12 岁",
    icon: "🎒",
    description: "语文、数学、英语、科学、地理、信息科技等基础课程。",
    exampleLesson: "沪教版六年级数学 - 分数的运算",
    href: "/onboarding?stage=GRADE_6",
  },
  {
    stage: "GRADE_7",
    title: "初一 (七年级)",
    age: "12–13 岁",
    icon: "🔬",
    description: "语文、数学、英语、生命科学、地理、历史等学科。",
    exampleLesson: "沪教版七年级生命科学 - 显微镜的使用",
    href: "/onboarding?stage=GRADE_7",
  },
  {
    stage: "GRADE_8",
    title: "初二 (八年级)",
    age: "13–14 岁",
    icon: "🧲",
    description: "语文、数学、英语、物理、历史、生命科学等，迎接挑战。",
    exampleLesson: "沪科版八年级物理 - 光的折射与反射",
    href: "/onboarding?stage=GRADE_8",
  },
  {
    stage: "GRADE_9",
    title: "初三 (九年级)",
    age: "14–15 岁",
    icon: "🧪",
    description: "语文、数学、英语、物理、化学、跨学科等，中考冲刺。",
    exampleLesson: "沪教版九年级化学 - 溶液的酸碱性",
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
