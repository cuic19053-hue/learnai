"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Mark from "@/components/design/Mark";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { Arrow, Check } from "@/components/design/icons";
import { stageToPath, type LearnerStage } from "@/lib/learn/stages";
import { JOURNEYS, journeyForStage, type Journey } from "@/lib/learn/journeys";
import {
  UNIVERSAL_TEACHERS,
  SPECIALIST_TEACHERS,
  type Teacher,
} from "@/lib/learn/teachers";
import { worldSlugForStage } from "@/lib/learn/worlds";

const STEP_LABELS = [
  "Who is learning",
  "Pick a journey",
  "Choose your AI teacher",
  "Set a goal",
  "Ready to start",
] as const;

type Audience = "child" | "self" | "older_relative" | "student_group";

const AUDIENCE_OPTIONS: { id: Audience; label: string; emoji: string }[] = [
  { id: "child", label: "My child", emoji: "🧒" },
  { id: "self", label: "Me", emoji: "🙋" },
  { id: "older_relative", label: "My parent or older relative", emoji: "🌿" },
  { id: "student_group", label: "My student group", emoji: "👥" },
];

const GOAL_OPTIONS: { id: string; label: string; stages: LearnerStage[] }[] = [
  { id: "learn-numbers", label: "Learn numbers and letters", stages: ["LITTLE_LEARNER"] },
  { id: "improve-reading", label: "Improve reading", stages: ["LITTLE_LEARNER", "EXPLORER"] },
  { id: "curiosity", label: "Explore science and curiosity", stages: ["EXPLORER"] },
  { id: "learn-coding", label: "Learn coding", stages: ["BUILDER", "UNIVERSITY", "PROFESSIONAL"] },
  { id: "prepare-exam", label: "Prepare for an exam", stages: ["SCHOLAR"] },
  { id: "change-career", label: "Change career", stages: ["UNIVERSITY", "PROFESSIONAL"] },
  { id: "use-tech-safely", label: "Use technology safely", stages: ["SENIOR"] },
];

export default function OnboardingWizard({
  initialStage,
}: {
  initialStage?: LearnerStage;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStage ? 2 : 0);

  // Step state
  const [audience, setAudience] = useState<Audience | null>(null);
  const [name, setName] = useState("");
  const [stage, setStage] = useState<LearnerStage | null>(initialStage ?? null);
  const [teacherId, setTeacherId] = useState<string | null>("nova");
  const [goalId, setGoalId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const journey: Journey | null = useMemo(
    () => (stage ? journeyForStage(stage) : null),
    [stage],
  );

  const availableTeachers: Teacher[] = useMemo(() => {
    if (!stage) return UNIVERSAL_TEACHERS;
    const specialists = SPECIALIST_TEACHERS.filter((t) => t.stages.includes(stage));
    return [...UNIVERSAL_TEACHERS, ...specialists];
  }, [stage]);

  const teacher: Teacher | null = useMemo(
    () => availableTeachers.find((t) => t.id === teacherId) ?? null,
    [availableTeachers, teacherId],
  );

  const availableGoals = useMemo(
    () => (stage ? GOAL_OPTIONS.filter((g) => g.stages.includes(stage)) : []),
    [stage],
  );

  // Default the goal if none chosen yet for the picked stage.
  useEffect(() => {
    if (stage && !goalId && availableGoals.length > 0) {
      setGoalId(availableGoals[0].id);
    }
  }, [stage, goalId, availableGoals]);

  async function start() {
    if (!stage || !name.trim() || !teacher) {
      setError("Please complete all steps before starting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    // Save the profile first — this is what makes the rest of the app
    // know which world to render. Failure here is a hard error.
    try {
      const profileRes = await fetch("/api/learn/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          stage,
          language: "en",
          interests: goalId ? [goalId] : [],
        }),
      });
      if (!profileRes.ok) throw new Error("Could not save your profile.");
    } catch (e: any) {
      setError(e?.message ?? "Couldn't save your profile.");
      setSubmitting(false);
      return;
    }

    // Now create a first-lesson project from the stage's example topic +
    // the selected goal as the outcome. This lands the learner in the
    // working AI workspace at /learn/projects/[id] — the same surface
    // we use for the 5 demo projects, so the "first 5-minute lesson"
    // promise actually delivers a real lesson.
    const j = journey ?? journeyForStage(stage);
    const goalLabel = GOAL_OPTIONS.find((g) => g.id === goalId)?.label ?? "";
    try {
      const projRes = await fetch("/api/projects", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          worldSlug: worldSlugForStage(stage),
          topic: j.example,
          outcome: goalLabel ? `${goalLabel} — first 5-minute lesson.` : "",
          sources: [],
          daysPerWeek: 5,
          minutesPerDay: 5,
          prefs: ["practice", "worked"],
        }),
      });
      const payload = (await projRes.json().catch(() => null)) as
        | { ok: true; project: { id: string } }
        | { ok: false; error: string }
        | null;
      if (projRes.ok && payload && payload.ok && payload.project?.id) {
        router.push(`/learn/projects/${payload.project.id}`);
        return;
      }
      // Soft fallback if project creation fails (rate limit, parse error,
      // etc.) — at least take the learner to their world home so they're
      // not stuck on the onboarding screen.
      router.push(stageToPath(stage));
    } catch {
      router.push(stageToPath(stage));
    }
  }

  const canContinueFrom: Record<number, boolean> = {
    0: !!audience && name.trim().length > 0,
    1: !!stage,
    2: !!teacher,
    3: !!goalId,
    4: true,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ───── Top bar with stepper ───── */}
      <TopBar step={step} />

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* ───── Sidebar summary ───── */}
        <Sidebar name={name} journey={journey} teacher={teacher} />

        {/* ───── Main step body ───── */}
        <main className="px-6 py-9 md:px-12">
          <div className="la-mono text-xs font-bold tracking-[0.06em] text-brand-1">
            STEP {String(step + 1).padStart(2, "0")} / {String(STEP_LABELS.length).padStart(2, "0")}
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[38px]">
            {STEP_LABELS[step]}
          </h1>

          {step === 0 ? (
            <StepWho
              audience={audience}
              setAudience={setAudience}
              name={name}
              setName={setName}
            />
          ) : null}

          {step === 1 ? <StepJourney stage={stage} setStage={setStage} /> : null}

          {step === 2 ? (
            <StepTeacher
              journey={journey}
              teachers={availableTeachers}
              selectedId={teacherId}
              setSelectedId={setTeacherId}
            />
          ) : null}

          {step === 3 ? (
            <StepGoal
              journey={journey}
              goals={availableGoals}
              selectedId={goalId}
              setSelectedId={setGoalId}
            />
          ) : null}

          {step === 4 ? (
            <StepReady name={name} journey={journey} teacher={teacher} goalId={goalId} />
          ) : null}

          {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

          {/* ───── Footer nav ───── */}
          <div className="mt-9 flex max-w-[880px] items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="la-btn ghost"
              style={{ padding: "12px 18px" }}
            >
              ← Back
            </button>

            {step < STEP_LABELS.length - 1 ? (
              <button
                type="button"
                disabled={!canContinueFrom[step]}
                onClick={() => setStep((s) => s + 1)}
                className="la-btn"
                style={{ padding: "14px 22px", opacity: canContinueFrom[step] ? 1 : 0.5 }}
              >
                Continue <Arrow />
              </button>
            ) : (
              <button
                type="button"
                onClick={start}
                disabled={submitting}
                className="la-btn"
                style={{ padding: "14px 22px", opacity: submitting ? 0.6 : 1 }}
              >
                {submitting ? "Starting…" : "Start my first 5-minute lesson"}
                {!submitting ? <Arrow /> : null}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                            */
/* ────────────────────────────────────────────────────────────────────────── */

function TopBar({ step }: { step: number }) {
  return (
    <div
      className="flex items-center justify-between border-b border-line-soft bg-white px-6 md:px-8"
      style={{ height: 64 }}
    >
      <Mark size={28} fontSize={18} />
      <div className="hidden items-center gap-2 lg:flex">
        {STEP_LABELS.map((s, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-extrabold"
                style={{
                  background: done
                    ? "var(--brand-1)"
                    : active
                      ? "var(--brand-grad)"
                      : "#fff",
                  color: done || active ? "#fff" : "var(--ink-mute)",
                  border: `1.5px solid ${done || active ? "transparent" : "var(--line)"}`,
                }}
              >
                {done ? <Check size={12} color="#fff" /> : i + 1}
              </div>
              <div
                className="text-xs font-semibold"
                style={{ color: active ? "var(--ink)" : "var(--ink-mute)" }}
              >
                {s}
              </div>
              {i < STEP_LABELS.length - 1 ? (
                <div
                  className="ml-1 h-0.5 w-7"
                  style={{ background: done ? "var(--brand-1)" : "var(--line)" }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <span className="text-[13px] text-ink-mute">
        Step {step + 1}/{STEP_LABELS.length}
      </span>
    </div>
  );
}

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
      className="border-b border-line-soft p-7 lg:border-b-0 lg:border-r"
      style={{ background: "linear-gradient(180deg, var(--bg-2), #fff 60%)" }}
    >
      <div className="la-mono text-[11px] font-bold tracking-[0.08em] text-ink-mute">
        YOUR SETUP SO FAR
      </div>

      {/* Learner card */}
      <div className="la-card mt-3" style={{ padding: 16, borderRadius: 16 }}>
        <div className="text-[11px] font-bold text-ink-mute">LEARNER</div>
        <div className="mt-1 font-bold text-ink">{name.trim() || "Not set yet"}</div>
        <div className="text-xs text-ink-soft">English (US) · Voice on</div>
      </div>

      {/* Journey card */}
      {journey ? (
        <div
          className="la-card mt-2.5"
          style={{
            padding: 16,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${journey.soft}, #fff)`,
            border: `1px solid ${journey.bg}`,
          }}
        >
          <div className="text-[11px] font-bold" style={{ color: journey.color }}>
            JOURNEY
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <PersonaAvatar emoji={journey.emoji} color={journey.color} bg={journey.bg} size={36} />
            <div>
              <div className="font-bold text-ink">{journey.name}</div>
              <div className="text-xs text-ink-soft">{journey.age}</div>
            </div>
          </div>
        </div>
      ) : (
        <DashedCard label="JOURNEY" hint="Pick one in step 2…" />
      )}

      {/* Teacher card */}
      {teacher && journey ? (
        <div
          className="la-card mt-2.5"
          style={{
            padding: 16,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${journey.soft}, #fff)`,
            border: `1px solid ${journey.bg}`,
          }}
        >
          <div className="text-[11px] font-bold" style={{ color: journey.color }}>
            AI TEACHER
          </div>
          <div className="mt-1.5 flex items-center gap-2.5">
            <PersonaAvatar emoji={teacher.emoji} color={journey.color} bg={journey.bg} size={36} />
            <div>
              <div className="font-bold text-ink">{teacher.name}</div>
              <div className="text-xs text-ink-soft">{teacher.tag}</div>
            </div>
          </div>
        </div>
      ) : (
        <DashedCard label="AI TEACHER" hint="Choosing now…" />
      )}

      <div
        className="mt-6 rounded-xl p-4 text-xs leading-relaxed text-ink-soft"
        style={{ background: "var(--bg-2)" }}
      >
        <strong className="text-ink">Why a teacher?</strong>
        <br />
        Your AI teacher sets the tone, pace, and voice for every lesson — and
        remembers what helps you learn.
      </div>
    </aside>
  );
}

function DashedCard({ label, hint }: { label: string; hint: string }) {
  return (
    <div
      className="la-card mt-2.5"
      style={{
        padding: 16,
        borderRadius: 16,
        border: "1px dashed var(--line)",
        background: "transparent",
        boxShadow: "none",
      }}
    >
      <div className="text-[11px] font-bold text-ink-mute">{label}</div>
      <div className="mt-1 text-[13px] text-ink-mute">{hint}</div>
    </div>
  );
}

/* ─── Step bodies ─────────────────────────────────────────────────────────── */

function StepWho({
  audience,
  setAudience,
  name,
  setName,
}: {
  audience: Audience | null;
  setAudience: (v: Audience) => void;
  name: string;
  setName: (v: string) => void;
}) {
  return (
    <div>
      <p className="mt-2 max-w-[600px] text-[15px] text-ink-soft">
        We tune the experience to that person. You can change anything later.
      </p>

      <div className="mt-7 grid max-w-[880px] grid-cols-1 gap-3 sm:grid-cols-2">
        {AUDIENCE_OPTIONS.map((a) => {
          const active = audience === a.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAudience(a.id)}
              className="la-card flex items-center gap-3 p-4 text-left"
              style={{
                border: `1.5px solid ${active ? "var(--brand-1)" : "var(--line-soft)"}`,
                boxShadow: active ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
              }}
            >
              <span className="text-2xl" aria-hidden>
                {a.emoji}
              </span>
              <span className="font-semibold text-ink">{a.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 max-w-[480px]">
        <label htmlFor="learner-name" className="text-sm font-semibold text-ink">
          Learner&apos;s name
        </label>
        <input
          id="learner-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sam"
          maxLength={80}
          className="mt-2 w-full rounded-xl border border-line bg-white p-3.5 text-base text-ink focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
        />
      </div>
    </div>
  );
}

function StepJourney({
  stage,
  setStage,
}: {
  stage: LearnerStage | null;
  setStage: (s: LearnerStage) => void;
}) {
  return (
    <div>
      <p className="mt-2 max-w-[640px] text-[15px] text-ink-soft">
        Pick the stage that fits the learner. Each one has its own world — playful,
        mission, exam, professional, or calm.
      </p>

      <div className="mt-7 grid max-w-[1100px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {JOURNEYS.map((j) => {
          const active = stage === j.stage;
          return (
            <button
              key={j.id}
              type="button"
              onClick={() => setStage(j.stage)}
              className="la-jcard"
              style={{
                border: `2px solid ${active ? j.color : "transparent"}`,
                boxShadow: active
                  ? `0 0 0 4px ${j.color}1f, var(--shadow-2)`
                  : "var(--shadow-1)",
              }}
              aria-pressed={active}
            >
              <div className="flex items-start justify-between">
                <PersonaAvatar emoji={j.emoji} color={j.color} bg={j.bg} size={48} />
                <span className="la-pill" style={{ background: j.bg, color: j.color }}>
                  {j.age}
                </span>
              </div>
              <div>
                <h3>{j.name}</h3>
                <p style={{ marginTop: 6 }}>{j.desc}</p>
              </div>
              <div className="ex">
                <b>Example lesson</b>
                {j.example}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepTeacher({
  journey,
  teachers,
  selectedId,
  setSelectedId,
}: {
  journey: Journey | null;
  teachers: Teacher[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
}) {
  // Fall back to brand color when no journey is picked yet.
  const accent = journey?.color ?? "var(--brand-1)";
  const accentBg = journey?.bg ?? "var(--bg-2)";
  const accentSoft = journey?.soft ?? "var(--surface-soft)";
  const selected = teachers.find((t) => t.id === selectedId) ?? teachers[0];

  return (
    <div>
      <p className="mt-2 max-w-[640px] text-[15px] text-ink-soft">
        Each teacher covers the same curriculum — but with a different style. You can switch any time.
      </p>

      <div className="mt-7 grid max-w-[880px] grid-cols-1 gap-3.5 sm:grid-cols-2">
        {teachers.map((t) => {
          const active = selectedId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedId(t.id)}
              className="la-card flex gap-3.5 p-4 text-left"
              style={{
                borderRadius: 18,
                border: `2px solid ${active ? accent : "transparent"}`,
                boxShadow: active
                  ? `0 0 0 4px ${accent}1a, var(--shadow-2)`
                  : "var(--shadow-1)",
              }}
              aria-pressed={active}
            >
              <PersonaAvatar emoji={t.emoji} color={accent} bg={accentBg} size={56} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-extrabold text-ink">{t.name}</div>
                  {active ? (
                    <span
                      className="la-pill"
                      style={{ background: accentBg, color: accent }}
                    >
                      <Check size={10} color={accent} /> Selected
                    </span>
                  ) : t.universal ? (
                    <span className="la-pill text-[10px]">Universal</span>
                  ) : null}
                </div>
                <div className="mt-0.5 text-xs font-bold" style={{ color: accent }}>
                  {t.tag}
                </div>
                <div className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">
                  {t.style}
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="la-pill text-[11px]">{t.tone}</span>
                  <span className="la-pill text-[11px]">🔊 {t.voice}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live preview of the selected teacher */}
      {selected ? (
        <div
          className="mt-7 flex max-w-[880px] items-start gap-3.5 rounded-2xl p-4"
          style={{ background: accentSoft, border: `1px solid ${accentBg}` }}
        >
          <PersonaAvatar emoji={selected.emoji} color={accent} bg={accentBg} size={44} />
          <div className="flex-1">
            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: accent }}>
              {selected.name} · Preview
            </div>
            <div className="mt-1 text-sm leading-relaxed text-ink">
              {samplePreview(selected, journey)}
            </div>
          </div>
          <button
            type="button"
            className="la-btn ghost"
            style={{ padding: "8px 12px", fontSize: 12 }}
          >
            ▶ Hear voice
          </button>
        </div>
      ) : null}
    </div>
  );
}

function samplePreview(teacher: Teacher, journey: Journey | null): string {
  const learner = "Hey there";
  const subject = journey?.example?.toLowerCase() ?? "today's topic";
  switch (teacher.id) {
    case "nova":
      return `${learner} — want to explore "${subject}" together? Let's start with what you already know.`;
    case "rex":
      return `${learner}! Quick warm-up before we dive into "${subject}" — ready in 30 seconds?`;
    case "sage":
      return `Welcome. We'll take "${subject}" step by step, no rushing. Pause whenever you need.`;
    case "pixel":
      return `Plan: build something around "${subject}" today. We code, break it, fix it, ship it.`;
    default:
      return `Let's begin with "${subject}".`;
  }
}

function StepGoal({
  journey,
  goals,
  selectedId,
  setSelectedId,
}: {
  journey: Journey | null;
  goals: { id: string; label: string }[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
}) {
  const accent = journey?.color ?? "var(--brand-1)";
  const accentBg = journey?.bg ?? "var(--bg-2)";
  return (
    <div>
      <p className="mt-2 max-w-[640px] text-[15px] text-ink-soft">
        What should we focus on first? You can add more goals any time.
      </p>

      <div className="mt-7 grid max-w-[880px] grid-cols-1 gap-3 sm:grid-cols-2">
        {goals.length === 0 ? (
          <p className="text-sm text-ink-soft">Pick a journey first.</p>
        ) : (
          goals.map((g) => {
            const active = selectedId === g.id;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setSelectedId(g.id)}
                className="la-card p-4 text-left"
                style={{
                  borderRadius: 16,
                  border: `1.5px solid ${active ? accent : "var(--line-soft)"}`,
                  boxShadow: active ? `0 0 0 4px ${accent}1a` : "var(--shadow-1)",
                }}
                aria-pressed={active}
              >
                <div className="font-semibold text-ink">{g.label}</div>
                {active ? (
                  <span
                    className="la-pill mt-2"
                    style={{ background: accentBg, color: accent }}
                  >
                    <Check size={10} color={accent} /> Selected
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function StepReady({
  name,
  journey,
  teacher,
  goalId,
}: {
  name: string;
  journey: Journey | null;
  teacher: Teacher | null;
  goalId: string | null;
}) {
  const goalLabel = GOAL_OPTIONS.find((g) => g.id === goalId)?.label ?? "—";
  const accent = journey?.color ?? "var(--brand-1)";
  const accentBg = journey?.bg ?? "var(--bg-2)";
  const accentSoft = journey?.soft ?? "var(--surface-soft)";
  return (
    <div>
      <p className="mt-2 max-w-[640px] text-[15px] text-ink-soft">
        Quick check before we begin. Your first lesson takes about 5 minutes.
      </p>

      <div
        className="mt-7 max-w-[640px] rounded-2xl p-6"
        style={{ background: accentSoft, border: `1px solid ${accentBg}` }}
      >
        <Row label="Learner" value={name.trim() || "Not set"} />
        <Row
          label="Journey"
          value={journey ? `${journey.emoji} ${journey.name} · ${journey.age}` : "—"}
        />
        <Row
          label="Teacher"
          value={teacher ? `${teacher.emoji} ${teacher.name} (${teacher.tag})` : "—"}
        />
        <Row label="First goal" value={goalLabel} />

        {teacher && journey ? (
          <div
            className="mt-5 flex items-start gap-3 rounded-xl bg-white p-3"
            style={{ border: `1px solid ${accentBg}` }}
          >
            <PersonaAvatar emoji={teacher.emoji} color={accent} bg={accentBg} size={36} />
            <div className="text-[13px] leading-relaxed text-ink">
              <strong style={{ color: accent }}>{teacher.name}:</strong>{" "}
              {samplePreview(teacher, journey)}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-white/40 py-2 last:border-0">
      <div className="text-xs font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="font-semibold text-ink">{value}</div>
    </div>
  );
}
