import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LessonPlayer from "@/components/learn/lesson/LessonPlayer";
import SeniorLesson from "@/components/learn/lesson/SeniorLesson";
import { journeyForStage } from "@/lib/learn/journeys";
import type { LearnerStage } from "@/lib/learn/stages";
import { findMission } from "@/lib/learn/missions";

const VALID: LearnerStage[] = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

const SLUG_TO_STAGE: Record<string, LearnerStage> = {
  grade6: "GRADE_6",
  grade7: "GRADE_7",
  grade8: "GRADE_8",
  grade9: "GRADE_9",
  kids: "GRADE_6",
  little: "GRADE_6",
  explorer: "GRADE_7",
  builder: "GRADE_8",
  scholar: "GRADE_9",
  adult: "PROFESSIONAL",
  pro: "PROFESSIONAL",
  professional: "PROFESSIONAL",
  university: "UNIVERSITY",
  senior: "SENIOR",
};

function resolveStage(input: string | undefined): LearnerStage | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  if (lower in SLUG_TO_STAGE) return SLUG_TO_STAGE[lower];
  const upper = input.toUpperCase() as LearnerStage;
  return (VALID as string[]).includes(upper) ? upper : null;
}

const STAGE_LESSON: Record<
  LearnerStage,
  { title: string; subject: string; teacherName: string; teacherEmoji: string }
> = {
  GRADE_6: {
    title: "沪教版六年级数学 - 分数的运算 🎒",
    subject: "数学",
    teacherName: "Milo",
    teacherEmoji: "🦉",
  },
  GRADE_7: {
    title: "沪教版七年级生命科学 - 显微镜的使用 🔬",
    subject: "生命科学",
    teacherName: "Rex",
    teacherEmoji: "🦊",
  },
  GRADE_8: {
    title: "沪科版八年级物理 - 光的折射与反射 🧲",
    subject: "物理",
    teacherName: "Nova",
    teacherEmoji: "🦉",
  },
  GRADE_9: {
    title: "沪教版九年级化学 - 溶液的酸碱性 🧪",
    subject: "化学",
    teacherName: "Mentor Max",
    teacherEmoji: "🎓",
  },
  UNIVERSITY: {
    title: "VPC networking: subnets and route tables ☁️",
    subject: "Cloud",
    teacherName: "Professor Turing",
    teacherEmoji: "💼",
  },
  PROFESSIONAL: {
    title: "高中数学 - 三角函数核心突破特训 🎓",
    subject: "数学",
    teacherName: "Professor Turing",
    teacherEmoji: "💼",
  },
  SENIOR: {
    title: "如何帮助孩子做好初高中衔接 👨‍🏫",
    subject: "家庭教育",
    teacherName: "Sofia",
    teacherEmoji: "🌿",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stage: string }>;
}): Promise<Metadata> {
  const { stage: raw } = await params;
  const stage = resolveStage(raw);
  if (!stage) return { title: "Lesson" };
  return {
    title: `${STAGE_LESSON[stage].title} · Lesson`,
    description: "Practice step of the LearnAI six-step Loop.",
  };
}

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ stage: string }>;
  searchParams?: Promise<{ mission?: string }>;
}) {
  const { stage: raw } = await params;
  const stage = resolveStage(raw);
  if (!stage) notFound();

  const journey = journeyForStage(stage);
  const lesson = STAGE_LESSON[stage];

  // Per-stage dispatch — Little Learner has a dedicated three-layer IA
  // at /learn/kids and we redirect any old /learn/lesson/kids link to
  // it so the same audience never sees two competing UIs. Senior keeps
  // its own calmer surface.
  if (stage === "LITTLE_LEARNER") redirect("/learn/kids");
  if (stage === "SENIOR") return <SeniorLesson journey={journey} />;

  // Resolve the mission (if any) so Resume from a specific mission
  // opens that mission's practice — not the shared volcano default.
  const sp = (await searchParams) ?? {};
  const mission = findMission(raw.toLowerCase(), sp.mission);

  return (
    <LessonPlayer
      journey={journey}
      title={mission?.title ?? lesson.title}
      subject={mission?.practice?.subject ?? lesson.subject}
      teacherName={mission?.practice?.teacherName ?? lesson.teacherName}
      teacherEmoji={mission?.practice?.teacherEmoji ?? lesson.teacherEmoji}
      practice={mission?.practice}
    />
  );
}
