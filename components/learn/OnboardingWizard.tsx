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
type AgeBand = "3-6" | "7-11" | "12-15" | "16-18";

const STEP_LABELS = ["Who are we helping?", "What should they learn?", "Start"] as const;

const AUDIENCE_OPTIONS: { id: Audience; label: string; emoji: string; hint: string }[] = [
  { id: "child", label: "My child", emoji: "🧒", hint: "We'll pick a kid-safe world by age." },
  {
    id: "self",
    label: "Me",
    emoji: "🙋",
    hint: "Exam prep, certifications, or a topic to master.",
  },
  {
    id: "older_relative",
    label: "My parent or older relative",
    emoji: "🌿",
    hint: "Calm, large-text, scam-aware Senior world.",
  },
  {
    id: "student_group",
    label: "My students",
    emoji: "👥",
    hint: "Lesson planning + class quizzes (teacher use).",
  },
];

const AGE_BANDS: { id: AgeBand; label: string; stage: LearnerStage }[] = [
  { id: "3-6", label: "3–6", stage: "LITTLE_LEARNER" },
  { id: "7-11", label: "7–11", stage: "EXPLORER" },
  { id: "12-15", label: "12–15", stage: "BUILDER" },
  { id: "16-18", label: "16–18", stage: "SCHOLAR" },
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
  // Little Learner (child, 3-6)
  {
    id: "letters",
    label: "Letters",
    audiences: ["child"],
    ageBands: ["3-6"],
    stage: "LITTLE_LEARNER",
  },
  {
    id: "numbers",
    label: "Numbers",
    audiences: ["child"],
    ageBands: ["3-6"],
    stage: "LITTLE_LEARNER",
  },
  {
    id: "stories",
    label: "Stories",
    audiences: ["child"],
    ageBands: ["3-6"],
    stage: "LITTLE_LEARNER",
  },
  {
    id: "emotions",
    label: "Emotions",
    audiences: ["child"],
    ageBands: ["3-6"],
    stage: "LITTLE_LEARNER",
  },
  // Explorer (child, 7-11)
  { id: "reading", label: "Reading", audiences: ["child"], ageBands: ["7-11"], stage: "EXPLORER" },
  { id: "science", label: "Science", audiences: ["child"], ageBands: ["7-11"], stage: "EXPLORER" },
  {
    id: "math-games",
    label: "Math games",
    audiences: ["child"],
    ageBands: ["7-11"],
    stage: "EXPLORER",
  },
  {
    id: "curiosity",
    label: "Curiosity quests",
    audiences: ["child"],
    ageBands: ["7-11"],
    stage: "EXPLORER",
  },
  // Builder (child, 12-15)
  {
    id: "coding-kid",
    label: "Coding",
    audiences: ["child"],
    ageBands: ["12-15"],
    stage: "BUILDER",
  },
  {
    id: "projects",
    label: "Projects",
    audiences: ["child"],
    ageBands: ["12-15"],
    stage: "BUILDER",
  },
  { id: "logic", label: "Logic", audiences: ["child"], ageBands: ["12-15"], stage: "BUILDER" },
  { id: "math-12", label: "Math", audiences: ["child"], ageBands: ["12-15"], stage: "BUILDER" },
  // Scholar (child, 16-18)
  {
    id: "exam-kid",
    label: "Exam prep",
    audiences: ["child"],
    ageBands: ["16-18"],
    stage: "SCHOLAR",
  },
  {
    id: "subject",
    label: "Subject mastery",
    audiences: ["child"],
    ageBands: ["16-18"],
    stage: "SCHOLAR",
  },
  {
    id: "career-kid",
    label: "Career discovery",
    audiences: ["child"],
    ageBands: ["16-18"],
    stage: "SCHOLAR",
  },
  // Me — default Professional; Scholar offered for exam prep.
  { id: "exam-me", label: "Exam preparation", audiences: ["self"], stage: "SCHOLAR" },
  { id: "cert-me", label: "Cloud certification", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "coding-me", label: "Coding & AI", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "language", label: "Language", audiences: ["self"], stage: "PROFESSIONAL" },
  { id: "career", label: "Career change", audiences: ["self"], stage: "PROFESSIONAL" },
  // Older relative — Senior world.
  { id: "safety", label: "Online safety", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "digital", label: "Digital basics", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "memory", label: "Memory practice", audiences: ["older_relative"], stage: "SENIOR" },
  { id: "health", label: "Health & wellbeing", audiences: ["older_relative"], stage: "SENIOR" },
  // Student group — Scholar (teacher/class use).
  { id: "class-quiz", label: "Class quizzes", audiences: ["student_group"], stage: "SCHOLAR" },
  { id: "lesson-plan", label: "Lesson plans", audiences: ["student_group"], stage: "SCHOLAR" },
  { id: "grading", label: "Grading help", audiences: ["student_group"], stage: "SCHOLAR" },
];

function defaultStageFor(audience: Audience, age?: AgeBand): LearnerStage {
  if (audience === "child") {
    return AGE_BANDS.find((b) => b.id === age)?.stage ?? "EXPLORER";
  }
  if (audience === "older_relative") return "SENIOR";
  if (audience === "student_group") return "SCHOLAR";
  return "PROFESSIONAL";
}

// ─── Component ─────────────────────────────────────────────────────

export default function OnboardingWizard({ initialStage }: { initialStage?: LearnerStage }) {
  const router = useRouter();

  const seed = useMemo<{ audience: Audience | null; age: AgeBand | null }>(() => {
    if (!initialStage) return { audience: null, age: null };
    switch (initialStage) {
      case "LITTLE_LEARNER":
        return { audience: "child", age: "3-6" };
      case "EXPLORER":
        return { audience: "child", age: "7-11" };
      case "BUILDER":
        return { audience: "child", age: "12-15" };
      case "SCHOLAR":
        return { audience: "child", age: "16-18" };
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
    if (!audience) return "Pick who is learning to continue.";
    if (audience === "child" && !age) return "Pick a child age band to continue.";
    return null;
  }, [step, audience, age]);

  async function start() {
    if (!stage || !teacher) {
      setError("Pick who is learning and a goal before starting.");
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
          language: "en",
          interests: goalId ? [goalId] : [],
        }),
      });
    } catch {
      /* non-fatal — the lesson route doesn't require the profile cookie */
    }
    router.push(`/learn/lesson/${worldSlugForStage(stage)}`);
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
            STEP {String(step + 1).padStart(2, "0")} / {String(STEP_LABELS.length).padStart(2, "0")}
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[38px]">
            {STEP_LABELS[step]}
          </h1>
          <p className="mt-2 max-w-[560px] text-[15px] leading-relaxed text-ink-soft">
            {step === 0
              ? "We tune the world, voice, and pace to the learner. You can change anything later."
              : step === 1
                ? "Pick the closest match. Goals shape the first lesson; you can switch any time."
                : "We picked your world and AI teacher based on what you told us. One click to start."}
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
                ← Back to LearnAI
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 0 ? 0 : ((s - 1) as 0 | 1 | 2)))}
                className="la-btn ghost"
                style={{ padding: "12px 18px" }}
              >
                ← Back
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
                Continue <Arrow />
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={submitting || !canContinue[2]}
                className="la-btn"
                style={{ padding: "14px 22px", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Starting…" : "Start the first lesson"}
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
        <Link href="/" style={{ textDecoration: "none" }} aria-label="LearnAI home">
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
              L
            </span>
            <span style={{ fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
              Learn
              <span
                style={{
                  background: "var(--brand-grad)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                AI
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
        SETUP PROGRESS
      </div>

      <SidebarRow
        label="Learner"
        value={name.trim() || "No name yet (optional)"}
        accent={!!name.trim()}
      />
      <SidebarRow
        label="Journey"
        value={journey?.name ?? "Auto-pick from goal"}
        accent={!!journey}
      />
      <SidebarRow label="AI teacher" value={teacher?.name ?? "Auto-picked"} accent={!!teacher} />

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
        <div style={{ fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>Why ask this?</div>A
        3-year-old, a teenager, and an adult need different lessons. We use these answers to pick
        the world (Little Learner, Scholar, Senior…) and the right pace.
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

      <Field label="Learner's name" optional>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isChild ? "e.g. Sofia" : "e.g. Alex"}
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
        HOW OLD IS YOUR CHILD?
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
            Optional
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
        No goals for this audience yet — pick a different audience on Step 1.
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
            BEST WORLD FOR THIS GOAL
          </div>
          <div style={{ marginTop: 6 }}>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{journey.name}</div>
            <div style={{ fontSize: 13, color: "var(--ink-mute)", marginTop: 2 }}>
              {audience === "child"
                ? "Kid-safe pace, friendly voice."
                : "We'll tune pace, voice, and lesson style."}
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
  const displayName = name.trim() || "you";
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
          READY
        </div>
        <div style={{ marginTop: 6, fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
          Today's plan for {displayName}
        </div>
        <ul style={{ marginTop: 14, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
          <Bullet label="World" value={journey?.name ?? "—"} />
          <Bullet label="AI teacher" value={teacher?.name ?? "—"} />
          <Bullet label="What's next" value="A short, focused first lesson tuned to your goal." />
        </ul>
      </div>

      <p style={{ marginTop: 20, fontSize: 13.5, color: "var(--ink-mute)" }}>
        We picked an AI teacher we think fits best. You can change worlds, teachers, and goals any
        time from your dashboard.
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
