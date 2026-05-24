import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import LessonPlayer from "@/components/learn/lesson/LessonPlayer";
import SeniorLesson from "@/components/learn/lesson/SeniorLesson";
import { journeyForStage } from "@/lib/learn/journeys";
import type { LearnerStage } from "@/lib/learn/stages";
import { findMission } from "@/lib/learn/missions";

const VALID: LearnerStage[] = [
  "LITTLE_LEARNER",
  "EXPLORER",
  "BUILDER",
  "SCHOLAR",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

const SLUG_TO_STAGE: Record<string, LearnerStage> = {
  kids: "LITTLE_LEARNER",
  little: "LITTLE_LEARNER",
  explorer: "EXPLORER",
  builder: "BUILDER",
  scholar: "SCHOLAR",
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
  LITTLE_LEARNER: {
    title: "Count the apples 🍎",
    subject: "Numbers",
    teacherName: "Milo",
    teacherEmoji: "🦉",
  },
  EXPLORER: {
    title: "Why does a volcano erupt? 🌋",
    subject: "Science",
    teacherName: "Rex",
    teacherEmoji: "🦊",
  },
  BUILDER: {
    title: "Build a calculator in Python 🐍",
    subject: "Coding",
    teacherName: "Nova",
    teacherEmoji: "🦉",
  },
  SCHOLAR: {
    title: "Trigonometry: sine and cosine basics 📐",
    subject: "Math",
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
    title: "VPC networking: subnets and route tables ☁️",
    subject: "Cloud",
    teacherName: "Professor Turing",
    teacherEmoji: "💼",
  },
  SENIOR: {
    title: "Spotting scam messages 🛡️",
    subject: "Digital safety",
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
