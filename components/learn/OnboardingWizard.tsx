"use client";

/**
 * Onboarding wizard — redesigned to 3 steps.
 *
 * The old 5-step flow (Who → Journey → Teacher → Goal → Ready) made
 * the learner pick an AI teacher before they had any context, blocked
 * Continue on a required name, and treated the Step 1 Back button as
 * a no-op. The redesign collapses it to:
 *
 *   1. Who are we helping?      (audience + age band when child + optional name)
 *   2. What should they learn?  (audience-aware goal chips)
 *   3. Start                    (auto-picks the journey + teacher; one click)
 *
 * The teacher is chosen automatically from the picked stage; the
 * learner can change it on their world's settings page after the
 * first lesson. That removes the heaviest step in the old flow
 * without losing the option.
 *
 * Other corrections from the design review:
 *
 *   - Back button on Step 1 returns to "/" (LearnAI home) instead of
 *     being inert; the label is "← Back to LearnAI".
 *   - Sidebar is hidden on Step 1 so the screen feels like a clean
 *     decision, not a half-filled form.
 *   - The contextual helper card ("Why ask this?") explains the
 *     current decision, not a downstream one.
 *   - Name is explicitly optional; Continue activates the moment a
 *     valid audience (+ age, if child) is selected.
 *   - On Continue, the wizard tells the learner exactly what they
 *     still need (audience? age?) instead of staying greyed out.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Arrow } from "@/components/design/icons";
import type { LearnerStage } from "@/lib/learn/stages";
import { journeyForStage, type Journey } from "@/lib/learn/journeys";
import { UNIVERSAL_TEACHERS, SPECIALIST_TEACHERS, type Teacher } from "@/lib/learn/teachers";
import { worldSlugForStage } from "@/lib/learn/worlds";

// ─── Step model ────────────────────────────────────────────────────

type Audience = "child" | "self" | "older_relative" | "student_group";
type AgeBand =
  | "11-12"
  | "12-13"
  | "13-14"
  | "14-15"
  | "15+"
  | "adult"
  | "3-6"
  | "7-11"
  | "12-15"
  | "16-18"
  | "18+"
  | "65+";

const STEP_LABELS = ["学习对象是谁？", "要学习什么目标？", "开启学习"] as const;

// First mission slug each world should open into from onboarding. Kept
// in sync with the practice payloads in lib/learn/missions.ts — without
// these slugs the lesson route falls back to the GRADE_7-volcano demo
// for every world.
const DEFAULT_MISSION_BY_STAGE: Partial<Record<LearnerStage, string>> = {
  GRADE_7: "GRADE_7-volcano",
  GRADE_8: "python-calculator",
  GRADE_9: "GRADE_9-trig",
  UNIVERSITY: "vpc-networking-subnets-routes",
  PROFESSIONAL: "vpc-networking-subnets-routes",
};

function defaultMissionQuery(stage: LearnerStage): string {
  const slug = DEFAULT_MISSION_BY_STAGE[stage];
  return slug ? `?mission=${slug}` : "";
}

const AUDIENCE_OPTIONS: { id: Audience; label: string; emoji: string; hint: string }[] = [
  {
    id: "child",
    label: "我的孩子",
    emoji: "🧒",
    hint: "我们将根据年级选定匹配的初中/小学学习世界。",
  },
  {
    id: "self",
    label: "我自己",
    emoji: "🙋",
    hint: "备考冲刺、学科突破或掌握特定技能。",
  },
  {
    id: "older_relative",
    label: "我的长辈或家人",
    emoji: "🌿",
    hint: "护眼大字版、防诈骗与温和陪伴引导。",
  },
  {
    id: "student_group",
    label: "我的学生/班级",
    emoji: "👥",
    hint: "备课大纲、班级测验与教学助手。",
  },
];

const AGE_BANDS: { id: AgeBand; label: string; stage: LearnerStage }[] = [
  { id: "11-12", label: "11–12岁 (预备班)", stage: "GRADE_6" },
  { id: "12-13", label: "12–13岁 (初一)", stage: "GRADE_7" },
  { id: "13-14", label: "13–14岁 (初二)", stage: "GRADE_8" },
  { id: "14-15", label: "14–15岁 (初三)", stage: "GRADE_9" },
];

/**
 * Audience-aware goal catalogue. Each entry encodes the stage it
 * routes to so the wizard can auto-resolve the journey + teacher on
 * Step 3 without the learner picking a "world" manually.
 */
type Goal = {
  id: string;
  label: string;
  audiences: Audience[];
  /** When audience === "child", the age bands this goal applies to. */
  ageBands?: AgeBand[];
  stage: LearnerStage;
};

const GOALS: Goal[] = [
  // 六年级 (预备班)
  {
    id: "letters",
    label: "基础认知与表达",
    audiences: ["child"],
    ageBands: ["11-12"],
    stage: "GRADE_6",
  },
  {
    id: "numbers",
    label: "沪教数学分数的运算",
    audiences: ["child"],
    ageBands: ["11-12"],
    stage: "GRADE_6",
  },
  {
    id: "stories",
    label: "课外阅读与古诗词",
    audiences: ["child"],
    ageBands: ["11-12"],
    stage: "GRADE_6",
  },
  {
    id: "emotions",
    label: "心理健康与学习习惯",
    audiences: ["child"],
    ageBands: ["11-12"],
    stage: "GRADE_6",
  },
  // 七年级 (初一)
  {
    id: "reading",
    label: "现代文阅读理解",
    audiences: ["child"],
    ageBands: ["12-13"],
    stage: "GRADE_7",
  },
  {
    id: "science",
    label: "沪教版生命科学",
    audiences: ["child"],
    ageBands: ["12-13"],
    stage: "GRADE_7",
  },
  {
    id: "math-games",
    label: "代数式与有理数特训",
    audiences: ["child"],
    ageBands: ["12-13"],
    stage: "GRADE_7",
  },
  {
    id: "curiosity",
    label: "地理与自然常识",
    audiences: ["child"],
    ageBands: ["12-13"],
    stage: "GRADE_7",
  },
  // 八年级 (初二)
  {
    id: "coding-kid",
    label: "沪科版八年级物理",
    audiences: ["child"],
    ageBands: ["13-14"],
    stage: "GRADE_8",
  },
  {
    id: "projects",
    label: "一次函数与几何证明",
    audiences: ["child"],
    ageBands: ["13-14"],
    stage: "GRADE_8",
  },
  {
    id: "logic",
    label: "逻辑思维与压轴题",
    audiences: ["child"],
    ageBands: ["13-14"],
    stage: "GRADE_8",
  },
  {
    id: "math-12",
    label: "英语语法与完形填空",
    audiences: ["child"],
    ageBands: ["13-14"],
    stage: "GRADE_8",
  },
  // 九年级 (初三)
  {
    id: "exam-kid",
    label: "上海中考全科冲刺",
    audiences: ["child"],
    ageBands: ["14-15"],
    stage: "GRADE_9",
  },
  {
    id: "subject",
    label: "沪教版九年级化学",
    audiences: ["child"],
    ageBands: ["14-15"],
    stage: "GRADE_9",
  },
  {
    id: "career-kid",
    label: "物理电学与压轴大题",
    audiences: ["child"],
    ageBands: ["14-15"],
    stage: "GRADE_9",
  },
  // 自己学习
  { id: "exam-me", label: "中考/高考备考特训", audiences: ["self"], stage: "GRADE_9" },
  { id: "cert-me", label: "AI 与云计算认证", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "coding-me", label: "编程与前沿技术", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "language", label: "外语能力提升", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "career", label: "职业进阶与转行", audiences: ["self"], stage: "PROFESSIONAL" },
  // 长辈家人
  { id: "safety", label: "网络安全与防诈骗", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "digital", label: "智能手机与数字素养", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "memory", label: "防衰老记忆训练", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "health", label: "健康养生与生活常识", audiences: ["older_relative"], stage: "SENIOR" },
  // 教师/学生群体
  { id: "class-quiz", label: "随堂测验与自动出题", audiences: ["student_group"], stage: "GRADE_9" },
  { id: "lesson-plan", label: "上海教材教案设计", audiences: ["student_group"], stage: "GRADE_9" },
  { id: "grading", label: "作业批改与学情分析", audiences: ["student_group"], stage: "GRADE_9" },
];

function defaultStageFor(audience: Audience, age?: AgeBand): LearnerStage {
  if (audience === "child") {
    return AGE_BANDS.find((b) => b.id === age)?.stage ?? "GRADE_7";
  }
  if (audience === "older_relative") return "SENIOR";
  if (audience === "student_group") return "GRADE_9";
  return "PROFESSIONAL";
}

// ─── Component ─────────────────────────────────────────────────────

export default function OnboardingWizard({ initialStage }: { initialStage?: LearnerStage }) {
  const router = useRouter();

  const seed = useMemo<{ audience: Audience | null; age: AgeBand | null }>(() => {
    if (!initialStage) return { audience: null, age: null };
    switch (initialStage) {
      case "GRADE_6":
        return { audience: "child", age: "11-12" };
      case "GRADE_7":
        return { audience: "child", age: "12-13" };
      case "GRADE_8":
        return { audience: "child", age: "13-14" };
      case "GRADE_9":
        return { audience: "child", age: "14-15" };
      case "SENIOR":
        return { audience: "older_relative", age: null };
      case "PROFESSIONAL":
      case "UNIVERSITY":
      default:
        return { audience: "self", age: null };
    }
  }, [initialStage]);

  const [step, setStep] = useState<0 | 1 | 2>(initialStage ? 1 : 0);
  const [audience, setAudience] = useState<Audience | null>(seed.audience);
  const [age, setAge] = useState<AgeBand | null>(seed.age);
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stage: LearnerStage | null = useMemo(() => {
    if (!audience) return null;
    if (audience === "child" && !age) return null;
    const goal = GOALS.find((g) => g.id === goalId);
    return goal?.stage ?? defaultStageFor(audience, age ?? undefined);
  }, [audience, age, goalId]);

  const journey: Journey | null = useMemo(() => (stage ? journeyForStage(stage) : null), [stage]);

  const teacher: Teacher | null = useMemo(() => {
    if (!stage) return null;
    const specialist = SPECIALIST_TEACHERS.find((t) => t.stages.includes(stage));
    return specialist ?? UNIVERSAL_TEACHERS[0] ?? null;
  }, [stage]);

  const availableGoals = useMemo(() => {
    if (!audience) return [];
    return GOALS.filter((g) => {
      if (!g.audiences.includes(audience)) return false;
      if (audience === "child" && g.ageBands && g.ageBands.length > 0) {
        if (!age || !g.ageBands.includes(age)) return false;
      }
      return true;
    });
  }, [audience, age]);

  // Default-select the first goal as soon as Step 2 has options.
  useEffect(() => {
    if (step === 1 && !goalId && availableGoals.length > 0) {
      setGoalId(availableGoals[0]!.id);
    }
  }, [step, goalId, availableGoals]);

  // If the audience or age band changes such that the current goal is
  // no longer valid, clear it so Step 2 re-defaults on entry.
  useEffect(() => {
    if (!goalId) return;
    if (!availableGoals.some((g) => g.id === goalId)) setGoalId(null);
  }, [availableGoals, goalId]);

  const canContinue: Record<number, boolean> = {
    0: !!audience && (audience !== "child" || !!age),
    1: !!goalId,
    2: !!stage && !!teacher,
  };

  const missingHint = useMemo(() => {
    if (step !== 0) return null;
    if (!audience) return "请选择学习对象以继续。";
    if (audience === "child" && !age) return "请选择孩子的年级以继续。";
    return null;
  }, [step, audience, age]);

  async function start() {
    if (!stage || !teacher) {
      setError("请在开始前选择学习对象与目标。");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await fetch("/api/learn/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          stage,
          language: "zh",
          interests: goalId ? [goalId] : [],
        }),
      });
    } catch {
      /* non-fatal — the lesson route doesn't require the profile cookie */
    }
    // Land each stage on its first real mission so the practice surface
    // shows real content (and not the GRADE_7-volcano fallback that the
    // lesson route uses when ?mission= is missing).
    router.push(`/learn/lesson/${worldSlugForStage(stage)}${defaultMissionQuery(stage)}`);
  }

  const showSidebar = step > 0;

  return (
    <div className="min-h-screen bg-white">
      <TopBar step={step} />

      <div
        className={
          showSidebar
            ? "mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[320px_1fr]"
            : "mx-auto max-w-[880px]"
        }
      >
        {showSidebar ? <Sidebar name={name} journey={journey} teacher={teacher} /> : null}

        <main className="px-6 py-9 md:px-12">
          <div className="la-mono text-xs font-bold tracking-[0.06em] text-brand-1">
            步骤 {String(step + 1).padStart(2, "0")} / {String(STEP_LABELS.length).padStart(2, "0")}
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[38px]">
            {STEP_LABELS[step]}
          </h1>
          <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
            {step === 0
              ? "我们会根据学习者的年龄与学情精准适配教学界面、音色与节奏。稍后可随时调整。"
              : step === 1
                ? "选择最接近的目标。目标将决定第一堂课的教学设计，您随时可以切换。"
                : "我们已根据您的选择配置好最合适的 AI 导师与学习世界，点击即可开始。"}
          </p>

          {step === 0 ? (
            <StepWho
              audience={audience}
              setAudience={setAudience}
              age={age}
              setAge={setAge}
              name={name}
              setName={setName}
              missingHint={missingHint}
            />
          ) : null}

          {step === 1 ? (
            <StepGoal
              audience={audience}
              goals={availableGoals}
              selectedId={goalId}
              setSelectedId={setGoalId}
              journey={journey}
            />
          ) : null}

          {step === 2 ? <StepReady name={name} journey={journey} teacher={teacher} /> : null}

          {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

          <div className="mt-9 flex max-w-[880px] items-center justify-between gap-3">
            {step === 0 ? (
              <Link href="/" className="la-btn ghost" style={{ padding: "12px 18px" }}>
                ← 返回首页
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2)))}
                className="la-btn ghost"
                style={{ padding: "12px 18px" }}
              >
                ← 上一步
              </button>
            )}

            {step < 2 ? (
              <button
                type="button"
                disabled={!canContinue[step]}
                onClick={() => setStep((s) => (s === 2 ? 2 : ((s + 1) as 0 | 1 | 2)))}
                className="la-btn"
                style={{ padding: "14px 22px", opacity: canContinue[step] ? 1 : 0.5 }}
                title={missingHint ?? undefined}
              >
                继续 <Arrow />
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={submitting || !canContinue[2]}
                className="la-btn"
                style={{ padding: "14px 22px", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "正在启动…" : "开启第一堂课"}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Top bar (3-step stepper) ──────────────────────────────────────

function TopBar({ step }: { step: number }) {
  return (
    <header
      style={{
        borderBottom: "1px solid var(--line)",
        background: "rgba(255,255,255,.95)",
        position: "sticky",
        top: 0,
        zIndex: 5,
      }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-6 py-3 md:px-12">
        <Link href="/" style={{ textDecoration: "none" }} aria-label="返回首页">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: "var(--brand-grad)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: "0 4px 12px rgba(46,91,255,.25)",
              }}
            >
              智
            </span>
            <span style={{ fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              AI
              <span
                style={{
                  background: "var(--brand-grad)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                智能学习助手
              </span>
            </span>
          </span>
        </Link>

        <nav
          aria-label="Onboarding progress"
          className="hidden items-center md:flex"
          style={{ display: "none", gap: 12 }}
        >
          {STEP_LABELS.map((label, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <div
                key={label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: isActive
                    ? "var(--brand-grad)"
                    : isDone
                      ? "var(--bg-2)"
                      : "transparent",
                  color: isActive ? "#fff" : "var(--ink-soft)",
                  fontWeight: isActive ? 800 : 600,
                  fontSize: 13,
                }}
                aria-current={isActive ? "step" : undefined}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 99,
                    display: "grid",
                    placeItems: "center",
                    background: isActive ? "rgba(255,255,255,.25)" : "var(--bg-2)",
                    color: isActive ? "#fff" : "var(--ink-mute)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                  aria-hidden
                >
                  {isDone ? "✓" : i + 1}
                </span>
                <span>{label}</span>
              </div>
            );
          })}
        </nav>

        <span
          className="la-mono"
          style={{ fontSize: 12, color: "var(--ink-mute)" }}
          aria-live="polite"
        >
          Step {step + 1}/{STEP_LABELS.length}
        </span>
      </div>
    </header>
  );
}

// ─── Sidebar summary (Steps 2+ only) ───────────────────────────────

function Sidebar({
  name,
  journey,
  teacher,
}: {
  name: string;
  journey: Journey | null;
  teacher: Teacher | null;
}) {
  return (
    <aside
      style={{
        background: "var(--surface-soft)",
        borderRight: "1px solid var(--line-soft)",
        padding: "32px 24px",
        minHeight: "calc(100vh - 80px)",
      }}
    >
      <div
        className="la-mono"
        style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-mute)", letterSpacing: ".08em" }}
      >
        配置进度
      </div>

      <SidebarRow label="学员" value={name.trim() || "未填写 (可选)"} accent={!!name.trim()} />
      <SidebarRow label="学习世界" value={journey?.name ?? "根据目标自动匹配"} accent={!!journey} />
      <SidebarRow label="AI 导师" value={teacher?.name ?? "自动匹配"} accent={!!teacher} />

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 12,
          background: "var(--bg-2)",
          fontSize: 12.5,
          color: "var(--ink-soft)",
          lineHeight: 1.55,
        }}
      >
        <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
          为什么要问这个？
        </div>
        不同年级和年龄段的学习者需要不同的教学方式。我们通过这些选项配置最适合的学习世界与引导风格。
      </div>
    </aside>
  );
}

function SidebarRow({ label, value, accent }: { label: string; value: string; accent: boolean }) {
  return (
    <div style={{ marginTop: 18 }}>
      <div
        className="la-mono"
        style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-mute)", letterSpacing: ".08em" }}
      >
        {label.toUpperCase()}
      </div>
      <div
        style={{
          marginTop: 4,
          padding: "10px 12px",
          borderRadius: 10,
          background: "#fff",
          border: `1px solid ${accent ? "var(--brand-1)" : "var(--line)"}`,
          color: accent ? "var(--ink)" : "var(--ink-mute)",
          fontWeight: 600,
          fontSize: 13.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Step 1 — Who ──────────────────────────────────────────────────

function StepWho({
  audience,
  setAudience,
  age,
  setAge,
  name,
  setName,
  missingHint,
}: {
  audience: Audience | null;
  setAudience: (a: Audience) => void;
  age: AgeBand | null;
  setAge: (a: AgeBand) => void;
  name: string;
  setName: (s: string) => void;
  missingHint: string | null;
}) {
  const isChild = audience === "child";
  return (
    <div className="mt-8 max-w-[880px]">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {AUDIENCE_OPTIONS.map((opt) => {
          const selected = audience === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setAudience(opt.id)}
              aria-pressed={selected}
              style={{
                textAlign: "left",
                padding: "16px 18px",
                borderRadius: 16,
                border: `1.5px solid ${selected ? "var(--brand-1)" : "var(--line)"}`,
                background: selected ? "var(--bg-2)" : "#fff",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 14,
                transition: "border-color .12s ease, background .12s ease",
              }}
            >
              <span style={{ fontSize: 26 }} aria-hidden>
                {opt.emoji}
              </span>
              <span style={{ flex: 1 }}>
                <span
                  style={{ display: "block", fontWeight: 800, fontSize: 15, color: "var(--ink)" }}
                >
                  {opt.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: 12.5,
                    color: "var(--ink-mute)",
                    marginTop: 2,
                  }}
                >
                  {opt.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {isChild ? <ChildAgePicker selected={age} onPick={setAge} /> : null}

      <Field label="学员姓名" optional>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isChild ? "例如：小明" : "例如：李华"}
          maxLength={60}
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: 14,
            border: "1.5px solid var(--line)",
            background: "#fff",
            fontFamily: "inherit",
            fontSize: 15,
            outline: "none",
          }}
        />
      </Field>

      {missingHint ? (
        <p style={{ marginTop: 18, fontSize: 13.5, color: "var(--ink-mute)" }} role="status">
          {missingHint}
        </p>
      ) : null}
    </div>
  );
}

function ChildAgePicker({
  selected,
  onPick,
}: {
  selected: AgeBand | null;
  onPick: (a: AgeBand) => void;
}) {
  return (
    <div className="mt-6">
      <div
        className="la-mono"
        style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-mute)", letterSpacing: ".08em" }}
      >
        请选择孩子的年级 / 学龄：
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
        {AGE_BANDS.map((b) => {
          const isOn = selected === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => onPick(b.id)}
              aria-pressed={isOn}
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: `1.5px solid ${isOn ? "var(--brand-1)" : "var(--line)"}`,
                background: isOn ? "var(--brand-1)" : "#fff",
                color: isOn ? "#fff" : "var(--ink)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
              }}
            >
              {b.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "block", marginTop: 24 }}>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: 13,
          color: "var(--ink)",
        }}
      >
        {label}
        {optional ? (
          <span
            className="la-mono"
            style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 999,
              background: "var(--bg-2)",
              color: "var(--ink-mute)",
              letterSpacing: ".06em",
              textTransform: "uppercase",
            }}
          >
            可选
          </span>
        ) : null}
      </span>
      <div style={{ marginTop: 8 }}>{children}</div>
    </label>
  );
}

// ─── Step 2 — Goal ─────────────────────────────────────────────────

function StepGoal({
  audience,
  goals,
  selectedId,
  setSelectedId,
  journey,
}: {
  audience: Audience | null;
  goals: Goal[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  journey: Journey | null;
}) {
  if (goals.length === 0) {
    return (
      <p style={{ marginTop: 24, fontSize: 14, color: "var(--ink-mute)" }}>
        暂无该类型对象的独立目标，请返回第一步选择其他学习对象。
      </p>
    );
  }
  return (
    <div className="mt-8 max-w-[880px]">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {goals.map((g) => {
          const selected = selectedId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setSelectedId(g.id)}
              aria-pressed={selected}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                border: `1.5px solid ${selected ? "var(--brand-1)" : "var(--line)"}`,
                background: selected ? "var(--bg-2)" : "#fff",
                color: "var(--ink)",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {journey ? (
        <div
          style={{
            marginTop: 28,
            padding: 18,
            borderRadius: 16,
            background: "var(--surface-soft)",
            border: "1px solid var(--line-soft)",
          }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
            }}
          >
            最契合的学习世界
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{journey.name}</div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 2 }}>
              {audience === "child"
                ? "适合学龄节奏，亲和耐心的语调。"
                : "我们将动态匹配节奏、音色与授课风格。"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ─── Step 3 — Ready ────────────────────────────────────────────────

function StepReady({
  name,
  journey,
  teacher,
}: {
  name: string;
  journey: Journey | null;
  teacher: Teacher | null;
}) {
  const displayName = name.trim() || "您";
  return (
    <div className="mt-8 max-w-[640px]">
      <div
        className="la-card"
        style={{
          padding: 24,
          background: "linear-gradient(135deg, #fdf4ff 0%, #fef3c7 100%)",
          borderColor: "rgba(124,58,237,.18)",
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
          }}
        >
          已准备就绪
        </div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
          {displayName} 的专属学习计划
        </div>
        <ul style={{ marginTop: 14, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          <Bullet label="学习世界" value={journey?.name ?? "—"} />
          <Bullet label="AI 导师" value={teacher?.name ?? "—"} />
          <Bullet label="后续步骤" value="开启为您专属定制的高效第一堂课。" />
        </ul>
      </div>

      <p style={{ marginTop: 20, fontSize: 13.5, color: "var(--ink-mute)" }}>
        我们已为您匹配了最适合的 AI 导师。您可以随时在控制面板中切换学习世界、导师与学习目标。
      </p>
    </div>
  );
}

function Bullet({ label, value }: { label: string; value: string }) {
  return (
    <li style={{ display: "flex", gap: 10, fontSize: 14 }}>
      <span
        className="la-mono"
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".08em",
          color: "var(--ink-mute)",
          minWidth: 90,
          paddingTop: 2,
        }}
      >
        {label.toUpperCase()}
      </span>
      <span style={{ fontWeight: 700, color: "var(--ink)" }}>{value}</span>
    </li>
  );
}
