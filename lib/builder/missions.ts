/**
 * GRADE_8 Academy mission resolver.
 *
 * DB-first (Prisma `GRADE_8Mission` / `GRADE_8Step` rows when the
 * mission catalog has been seeded), static fallback otherwise.
 *
 * The static catalog below is the canonical seed: it ships with the
 * portal so /learn/GRADE_8 renders cleanly out of the box, before any
 * admin has populated the database. Once a mission with the same slug
 * exists in the DB, the resolver prefers the DB row (so admins can
 * tweak copy without a code release).
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { BuilderProgressStatus, BuilderStepType } from "@prisma/client";

export type LoopState = "已完成" | "当前步骤" | "已锁定" | "后续步骤";

export type StepView = {
  id: string;
  order: number;
  type: BuilderStepType;
  title: string;
  xp: number;
  status: BuilderProgressStatus;
  /** Computed lock — true when a strictly-earlier step is not COMPLETED. */
  locked: boolean;
  /** UI label aligned with the design (Done / Current step / Locked / Upcoming). */
  loopState: LoopState;
  icon: string;
};

export type MissionView = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  xpReward: number;
  estimatedMinutes: number;
  steps: StepView[];
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  /** The first non-completed step — the one the dashboard CTA points at. */
  currentStep: StepView | null;
};

/** Visual mapping for the 6-step loop (matches the design tiles). */
export const STEP_ICONS: Record<BuilderStepType, string> = {
  HOOK: "🧲",
  EXPLAIN: "💡",
  PRACTICE: "✏️",
  FEEDBACK: "💬",
  REFLECT: "🪞",
  EVOLVE: "🌱",
};

export const STEP_LABELS: Record<BuilderStepType, string> = {
  HOOK: "兴趣引入",
  EXPLAIN: "概念讲解",
  PRACTICE: "互动练习",
  FEEDBACK: "即时反馈",
  REFLECT: "反思总结",
  EVOLVE: "能力进阶",
};

/**
 * Static seed catalog. Used when the DB is empty or unreachable —
 * mirrors the design spec exactly so the portal shows the same data
 * a freshly seeded DB would. To customize, run a migration that
 * imports these into GRADE_8Mission/GRADE_8Step rows.
 */
const SEED_MISSIONS: Array<{
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  xpReward: number;
  estimatedMinutes: number;
  steps: Array<{ order: number; type: BuilderStepType; title: string; xp: number }>;
}> = [
  {
    slug: "python-calculator",
    title: "沪科版八年级物理/信息：Python 计算器与逻辑判断",
    description:
      "上次你编写了基础运算函数。今天：处理除数为零的异常处理 — 让诺瓦导师为你感到骄傲。",
    category: "信息技术",
    order: 1,
    xpReward: 60,
    estimatedMinutes: 12,
    steps: [
      { order: 1, type: "HOOK", title: "为什么计算器会报错崩溃", xp: 10 },
      { order: 2, type: "EXPLAIN", title: "Python 中的除零异常原理", xp: 10 },
      { order: 3, type: "PRACTICE", title: "为 divide() 添加条件判断与防错", xp: 10 },
      { order: 4, type: "FEEDBACK", title: "诺瓦导师点评你的代码实现", xp: 10 },
      { order: 5, type: "REFLECT", title: "本次练习的反思与总结", xp: 10 },
      { order: 6, type: "EVOLVE", title: "拓展训练：处理取余运算中的零异常", xp: 10 },
    ],
  },
];

/** Side-cards on the dashboard — kept static for v1. */
export const PRACTICE_TRACKS = [
  {
    slug: "logic-gates",
    title: "逻辑电路：与门、或门与非门原理",
    subtitle: "信息技术 · 剩余 6 分钟",
    gradient: "linear-gradient(135deg,#f1f5f9,#e0e7ff)",
  },
  {
    slug: "algebra-x",
    title: "沪教版八年级数学：一元一次方程求解",
    subtitle: "数学 · 剩余 12 分钟",
    gradient: "linear-gradient(135deg,#fef3c7,#fce7f3)",
  },
];

function deriveLoopState(
  step: { status: BuilderProgressStatus; locked: boolean },
  isCurrent: boolean
): LoopState {
  if (step.status === "COMPLETED") return "已完成";
  if (isCurrent) return "当前步骤";
  if (step.locked) return "已锁定";
  return "后续步骤";
}

/**
 * Resolve the active mission for the given user. Falls back to the
 * static seed (with no per-user progress) when the DB is empty or
 * unreachable — so the portal stays renderable in any environment.
 */
export async function resolveActiveMission(userId: string | null): Promise<MissionView> {
  // 1) DB path — preferred when a published mission exists.
  try {
    const dbMission = await prisma.builderMission.findFirst({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: userId
            ? { progress: { where: { userId }, select: { status: true } } }
            : undefined,
        },
      },
    });

    if (dbMission) {
      return shapeMissionView(dbMission, userId);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[builder.resolveActiveMission] db read failed, using seed", err);
  }

  // 2) Static seed fallback.
  return seedMissionView(SEED_MISSIONS[0]!, userId);
}

type DbMission = Awaited<ReturnType<typeof prisma.builderMission.findFirst>> & {
  steps: Array<{
    id: string;
    order: number;
    type: BuilderStepType;
    title: string;
    xp: number;
    progress?: Array<{ status: BuilderProgressStatus }>;
  }>;
};

function shapeMissionView(mission: DbMission, _userId: string | null): MissionView {
  const steps: StepView[] = mission.steps.map((s, idx) => {
    const status: BuilderProgressStatus = s.progress?.[0]?.status ?? "NOT_STARTED";
    const prev = idx > 0 ? mission.steps[idx - 1] : null;
    const prevStatus: BuilderProgressStatus = prev?.progress?.[0]?.status ?? "NOT_STARTED";
    const locked = prev !== null && prevStatus !== "COMPLETED";
    return {
      id: s.id,
      order: s.order,
      type: s.type,
      title: s.title,
      xp: s.xp,
      status,
      locked,
      icon: STEP_ICONS[s.type],
      loopState: "Upcoming", // placeholder, set below
    };
  });

  const currentStep = steps.find((s) => s.status !== "COMPLETED" && !s.locked) ?? null;
  for (const step of steps) {
    step.loopState = deriveLoopState(step, currentStep?.id === step.id);
  }

  const completedSteps = steps.filter((s) => s.status === "COMPLETED").length;
  const totalSteps = steps.length;

  return {
    id: mission.id,
    slug: mission.slug,
    title: mission.title,
    description: mission.description,
    category: mission.category,
    xpReward: mission.xpReward,
    estimatedMinutes: mission.estimatedMinutes,
    steps,
    completedSteps,
    totalSteps,
    progressPercent: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0,
    currentStep,
  };
}

function seedMissionView(
  seed: (typeof SEED_MISSIONS)[number],
  _userId: string | null
): MissionView {
  // For the static seed we mark first 4 as Done, 5th as current, 6th as locked
  // — matches the design's "4 of 6 completed" state. Replace with real progress
  // lookup once the DB is seeded.
  const completedThrough = 4;
  const steps: StepView[] = seed.steps.map((s, idx) => {
    const completed = idx < completedThrough;
    const status: BuilderProgressStatus = completed ? "COMPLETED" : "NOT_STARTED";
    const locked = !completed && idx > completedThrough;
    return {
      id: `seed-${seed.slug}-${s.order}`,
      order: s.order,
      type: s.type,
      title: s.title,
      xp: s.xp,
      status,
      locked,
      icon: STEP_ICONS[s.type],
      loopState: "Upcoming",
    };
  });

  const currentStep = steps.find((s) => s.status !== "COMPLETED" && !s.locked) ?? null;
  for (const step of steps) {
    step.loopState = deriveLoopState(step, currentStep?.id === step.id);
  }

  return {
    id: `seed-${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    category: seed.category,
    xpReward: seed.xpReward,
    estimatedMinutes: seed.estimatedMinutes,
    steps,
    completedSteps: steps.filter((s) => s.status === "COMPLETED").length,
    totalSteps: steps.length,
    progressPercent: Math.round((completedThrough / steps.length) * 100),
    currentStep,
  };
}

/**
 * List all published missions for the dashboard / mission selector.
 * Each mission carries a `completedSteps` count for the user; for
 * anonymous viewers this falls back to 0. Returns the seed list if
 * the DB is empty.
 */
export async function listMissions(userId: string | null): Promise<MissionView[]> {
  try {
    const rows = await prisma.builderMission.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      include: {
        steps: {
          orderBy: { order: "asc" },
          include: userId
            ? { progress: { where: { userId }, select: { status: true } } }
            : undefined,
        },
      },
    });
    if (rows.length > 0) {
      return rows.map((m) => shapeMissionView(m as DbMission, userId));
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[builder.listMissions] db read failed, using seed", err);
  }
  return SEED_MISSIONS.map((m) => seedMissionView(m, userId));
}

/** Awarded XP delta from completing a step + (optionally) the whole mission. */
export type CompleteStepResult = {
  ok: true;
  xp: number;
  missionCompleted: boolean;
  bonusXp: number;
};

/**
 * Mark a step COMPLETED for the user. Enforces sequential unlocking
 * (the prior step must be COMPLETED). Awards step XP, and if the
 * mission's final step is now done, awards the mission's bonus XP.
 *
 * Throws when the step is locked, doesn't exist, or the user is
 * anonymous (no userId).
 */
export async function completeStep(params: {
  userId: string;
  stepId: string;
}): Promise<CompleteStepResult> {
  const { userId, stepId } = params;

  const step = await prisma.builderStep.findUnique({
    where: { id: stepId },
    include: { mission: true },
  });
  if (!step) throw new Error("Step not found");

  // Sequential gate.
  if (step.order > 1) {
    const prev = await prisma.builderStep.findFirst({
      where: { missionId: step.missionId, order: step.order - 1 },
      include: { progress: { where: { userId } } },
    });
    if (!prev?.progress[0] || prev.progress[0].status !== "COMPLETED") {
      throw new Error("Previous step is not complete");
    }
  }

  await prisma.builderStepProgress.upsert({
    where: { userId_stepId: { userId, stepId } },
    create: { userId, stepId, status: "COMPLETED", completedAt: new Date() },
    update: { status: "COMPLETED", completedAt: new Date() },
  });

  // Award per-step XP into the global UserProgress counter.
  await prisma.userProgress.upsert({
    where: { userId },
    create: { userId, xp: step.xp, updatedAt: new Date() },
    update: { xp: { increment: step.xp } },
  });

  // Mission-complete bonus.
  const totalSteps = await prisma.builderStep.count({ where: { missionId: step.missionId } });
  const doneSteps = await prisma.builderStepProgress.count({
    where: { userId, status: "COMPLETED", step: { missionId: step.missionId } },
  });
  let missionCompleted = false;
  let bonusXp = 0;
  if (doneSteps === totalSteps) {
    missionCompleted = true;
    bonusXp = step.mission.xpReward;
    await prisma.userProgress.update({
      where: { userId },
      data: { xp: { increment: bonusXp } },
    });
  }

  return { ok: true, xp: step.xp, missionCompleted, bonusXp };
}
