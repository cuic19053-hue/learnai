"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { Exercise, ProjectLesson } from "@/lib/projects/lesson";
import type { ProjectDraft } from "@/lib/projects/wizard-config";
import type { Journey } from "@/lib/learn/journeys";

type GradeResult = {
  score: number;
  verdict: "correct" | "partial" | "wrong";
  feedback: string;
  citation?: string;
};

type AttemptState = {
  /** MCQ/TF: letter (A/B/…). short_answer/explain_back: free text. */
  response: string;
  revealed: boolean;
  /** Auto-graded result (MCQ/TF) or AI-graded (short_answer/explain_back). */
  grade?: { ok: boolean; feedback: string; verdict?: GradeResult["verdict"] };
  pending: boolean;
  awarded: boolean;
};

const LETTERS = ["A", "B", "C", "D", "E"];
const XP_PER_CORRECT = 8;

type Props = {
  project: ProjectDraft;
  journey: Journey;
};

/**
 * Client-side project workspace. Loads the AI-generated lesson, renders
 * the concept + key terms, then runs each exercise as a graded
 * interaction. MCQ/TF graded locally from `correctIndex`; short_answer
 * and explain_back POST to /api/projects/[id]/grade for AI scoring.
 */
export default function ProjectWorkspace({ project, journey }: Props) {
  const [lesson, setLesson] = useState<ProjectLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<"cache" | "ai" | "fallback" | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<Record<string, AttemptState>>({});
  const { addXp } = useProgress();

  async function loadLesson(force: boolean) {
    setError(null);
    setLoading(true);
    if (force) setAttempts({});
    try {
      const url = force
        ? `/api/projects/${project.id}/lesson?force=1`
        : `/api/projects/${project.id}/lesson`;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        const detail = data?.error ?? `HTTP ${res.status}`;
        setError(detail);
        // eslint-disable-next-line no-console
        console.error("[lesson] load failed:", detail, data);
        return;
      }
      setLesson(data.lesson as ProjectLesson);
      setSource((data.source as "cache" | "ai" | "fallback") ?? null);
      setAiError(data.aiError ?? null);
      setLatencyMs(data.latencyMs ?? null);
      // eslint-disable-next-line no-console
      console.log(
        `[lesson] loaded id=${project.id} source=${data.source} ms=${data.latencyMs ?? "-"}`
      );
    } catch (e) {
      setError((e as Error).message);
      // eslint-disable-next-line no-console
      console.error("[lesson] network error:", e);
    } finally {
      setLoading(false);
    }
  }

  // Load on mount.
  useEffect(() => {
    void loadLesson(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  async function reroll() {
    setLesson(null);
    await loadLesson(true);
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonHero />
        <SkeletonCard />
        <SkeletonCard />
        <p className="text-center text-[12px] text-ink-mute">
          {project.id.startsWith("demo-")
            ? "Generating your lesson — typically 8–20 s. Cached after the first run."
            : "Generating your lesson from your topic, outcome, and sources…"}
        </p>
      </div>
    );
  }

  if (error || !lesson) {
    const isDemo = project.id.startsWith("demo-");
    return (
      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <h2 className="text-[16px] font-extrabold text-ink">Lesson didn&apos;t load</h2>
        <p className="mt-1 text-[13px] text-ink-soft">{error ?? "Unknown error."}</p>
        {isDemo ? (
          <p className="mt-2 text-[12px] text-ink-mute">
            Heads up: each demo has a hand-written fallback lesson — clicking <b>Try again</b>
            below will serve it if the AI is still unresponsive.
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadLesson(false)}
            className="la-btn"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => void loadLesson(true)}
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            Force re-roll
          </button>
          <Link
            href={`/learn/projects?world=${project.worldSlug}`}
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            ← Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const correctCount = Object.values(attempts).filter((a) => a.grade?.ok).length;
  const progressPct = Math.round((correctCount / lesson.exercises.length) * 100);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section
        className="la-card relative overflow-hidden p-6"
        style={{
          borderRadius: 22,
          background: `linear-gradient(135deg, ${journey.soft}, #fff)`,
        }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="la-pill text-[11px] font-extrabold"
                style={{ background: journey.color, color: "#fff" }}
              >
                {journey.name.toUpperCase()} PROJECT
              </span>
              <SourceBadge source={source} latencyMs={latencyMs} aiError={aiError} />
            </div>
            <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
              {lesson.title}
            </h1>
            {project.outcome ? (
              <p className="mt-1 max-w-[720px] text-[14px] text-ink-soft">
                Goal: {project.outcome}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <RingScore pct={progressPct} color={journey.color} />
            <button
              type="button"
              onClick={reroll}
              className="la-btn ghost"
              style={{ padding: "9px 14px", fontSize: 13 }}
              title="Generate a fresh lesson with the AI"
            >
              ✨ Re-roll
            </button>
          </div>
        </div>
      </section>

      {/* Concept */}
      <section className="la-card p-6" style={{ borderRadius: 20 }}>
        <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
          Concept
        </div>
        <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-soft">
          {lesson.concept.split(/\n\s*\n+/).map((para, i) => (
            <p key={i}>{para.trim()}</p>
          ))}
        </div>

        {lesson.keyTerms && lesson.keyTerms.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {lesson.keyTerms.map((kt) => (
              <div
                key={kt.term}
                className="rounded-xl border border-line-soft px-3 py-2 text-[12.5px]"
                style={{ background: "var(--surface-soft)" }}
              >
                <span className="font-extrabold text-ink">{kt.term}</span>
                <span className="text-ink-soft"> — {kt.definition}</span>
              </div>
            ))}
          </div>
        ) : null}

        {lesson.sources.length > 0 ? (
          <div className="mt-4 border-t border-line-soft pt-3">
            <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              Sources
            </div>
            <ul className="mt-1 space-y-0.5 text-[11.5px] text-ink-mute">
              {lesson.sources.map((s) => (
                <li key={s} className="truncate">
                  {s.startsWith("http") ? (
                    <a
                      href={s}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline hover:text-ink-soft"
                    >
                      {s}
                    </a>
                  ) : (
                    s
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* Exercises */}
      <div className="space-y-4">
        {lesson.exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            index={i + 1}
            total={lesson.exercises.length}
            projectId={project.id}
            attempt={attempts[ex.id]}
            setAttempt={(next) => setAttempts((prev) => ({ ...prev, [ex.id]: next }))}
            journey={journey}
            onCorrectAward={() => addXp(XP_PER_CORRECT, project.worldSlug)}
          />
        ))}
      </div>

      {/* Footer / next steps */}
      <section className="la-card p-5" style={{ borderRadius: 18 }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[15px] font-extrabold text-ink">
              {correctCount === lesson.exercises.length
                ? "Lesson complete — solid work."
                : `Progress: ${correctCount} / ${lesson.exercises.length} correct`}
            </div>
            <div className="mt-0.5 text-[12px] text-ink-mute">
              {correctCount === lesson.exercises.length
                ? "Re-roll for a deeper drill, or return to your projects."
                : "Finish each exercise — the AI tutor grades free-text answers in seconds."}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reroll}
              className="la-btn ghost"
              style={{ padding: "9px 14px", fontSize: 13 }}
            >
              ✨ Re-roll lesson
            </button>
            <Link
              href={`/learn/projects?world=${project.worldSlug}`}
              className="la-btn"
              style={{ padding: "9px 14px", fontSize: 13 }}
            >
              Back to projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Exercise card ───────────────────────────────────────────────── */
function ExerciseCard({
  ex,
  index,
  total,
  projectId,
  attempt,
  setAttempt,
  journey,
  onCorrectAward,
}: {
  ex: Exercise;
  index: number;
  total: number;
  projectId: string;
  attempt: AttemptState | undefined;
  setAttempt: (a: AttemptState) => void;
  journey: Journey;
  onCorrectAward: () => void;
}) {
  const a = attempt ?? {
    response: "",
    revealed: false,
    pending: false,
    awarded: false,
  };
  const [showHint, setShowHint] = useState(false);
  const awardedRef = useRef(a.awarded);

  const hasChoices = ex.kind === "multiple_choice" || ex.kind === "true_false";
  const isFreeText = ex.kind === "short_answer" || ex.kind === "explain_back";

  function awardIfCorrect(ok: boolean) {
    if (!ok || awardedRef.current) return;
    awardedRef.current = true;
    onCorrectAward();
  }

  async function reveal() {
    if (a.revealed || a.pending) return;
    if (hasChoices) {
      const pickedIdx = LETTERS.indexOf(a.response);
      if (pickedIdx < 0) return;
      const ok = pickedIdx === ex.correctIndex;
      awardIfCorrect(ok);
      setAttempt({
        ...a,
        revealed: true,
        awarded: awardedRef.current,
        grade: {
          ok,
          feedback: ok
            ? "Correct — that matches the concept above."
            : "Not quite — review the concept and try again.",
        },
      });
      return;
    }
    if (isFreeText) {
      if (!a.response.trim()) return;
      setAttempt({ ...a, pending: true });
      try {
        const res = await fetch(`/api/projects/${projectId}/grade`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ exerciseId: ex.id, response: a.response }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setAttempt({
            ...a,
            pending: false,
            revealed: true,
            grade: {
              ok: false,
              feedback: data?.error ?? "Grader unavailable — your answer was recorded.",
            },
          });
          return;
        }
        const g = data.grade as GradeResult;
        const ok = g.verdict === "correct";
        awardIfCorrect(ok);
        setAttempt({
          ...a,
          pending: false,
          revealed: true,
          awarded: awardedRef.current,
          grade: { ok, feedback: g.feedback, verdict: g.verdict },
        });
      } catch (e) {
        setAttempt({
          ...a,
          pending: false,
          revealed: true,
          grade: { ok: false, feedback: (e as Error).message },
        });
      }
    }
  }

  function tryAgain() {
    awardedRef.current = a.awarded;
    setAttempt({
      ...a,
      response: hasChoices ? "" : a.response,
      revealed: false,
      grade: undefined,
    });
  }

  return (
    <section
      className="la-card p-5"
      style={{
        borderRadius: 18,
        background: a.revealed && a.grade?.ok ? "#f0fdf4" : "#fff",
        borderColor: a.revealed && a.grade?.ok ? "#86efac" : undefined,
      }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
          Exercise {index} / {total}
        </span>
        <div className="flex items-center gap-2">
          {ex.method ? (
            <span
              className="la-pill text-[10px] font-extrabold"
              style={{ background: journey.bg, color: journey.color }}
            >
              {ex.method}
            </span>
          ) : null}
          <span className="la-pill text-[10px]" style={{ background: "var(--bg-2)" }}>
            +{XP_PER_CORRECT} XP
          </span>
        </div>
      </div>

      <p className="mt-2 text-[15px] font-bold leading-relaxed text-ink">{ex.prompt}</p>

      {/* Input — MCQ/TF or free text */}
      {hasChoices ? (
        <ul className="mt-3 space-y-2">
          {(ex.choices ?? []).map((c, i) => {
            const letter = LETTERS[i] ?? String(i + 1);
            const selected = a.response === letter;
            const isCorrect = a.revealed && i === ex.correctIndex;
            const isWrong = a.revealed && selected && !isCorrect;
            const className = [
              "wt-mcq",
              selected && !a.revealed ? "selected" : "",
              isCorrect ? "correct" : "",
              isWrong ? "wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={a.revealed}
                  onClick={() => setAttempt({ ...a, response: letter })}
                  className={className}
                  aria-pressed={selected}
                >
                  <span className="key">{letter}</span>
                  <span className="text-[14px] font-semibold text-ink">{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="mt-3">
          <textarea
            value={a.response}
            onChange={(e) => setAttempt({ ...a, response: e.target.value })}
            disabled={a.revealed}
            rows={ex.kind === "explain_back" ? 4 : 2}
            placeholder={
              ex.kind === "explain_back"
                ? "Explain it back in your own words — the tutor scores clarity and completeness."
                : "Type your answer…"
            }
            className="w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none focus:border-brand-1"
          />
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!a.revealed ? (
          <>
            <button
              type="button"
              onClick={reveal}
              disabled={a.pending || (hasChoices ? !a.response : !a.response.trim())}
              className="la-btn"
              style={{
                padding: "10px 16px",
                fontSize: 13,
                background: a.pending ? "var(--ink-mute)" : "var(--brand-grad)",
              }}
            >
              {a.pending ? "Grading…" : isFreeText ? "Submit for grading" : "Reveal answer"}
            </button>
            {ex.hint ? (
              <button
                type="button"
                onClick={() => setShowHint((v) => !v)}
                className="la-btn ghost"
                style={{ padding: "10px 14px", fontSize: 12 }}
              >
                {showHint ? "Hide hint" : "Show hint"}
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            onClick={tryAgain}
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 12 }}
          >
            Try again
          </button>
        )}
      </div>

      {showHint && ex.hint && !a.revealed ? (
        <div
          className="mt-3 rounded-xl border border-line-soft px-3.5 py-2.5 text-[13px] leading-relaxed text-ink-soft"
          style={{ background: "var(--surface-soft)" }}
        >
          <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Hint
          </span>
          <p className="mt-1">{ex.hint}</p>
        </div>
      ) : null}

      {a.revealed && a.grade ? (
        <div
          role="status"
          className="mt-3 rounded-xl border px-4 py-3 text-[13px] leading-relaxed"
          style={{
            background: a.grade.ok
              ? "#dcfce7"
              : a.grade.verdict === "partial"
                ? "#fef3c7"
                : "#fee2e2",
            borderColor: a.grade.ok
              ? "#86efac"
              : a.grade.verdict === "partial"
                ? "#fcd34d"
                : "#fca5a5",
            color: a.grade.ok ? "#166534" : a.grade.verdict === "partial" ? "#92400e" : "#991b1b",
          }}
        >
          <div className="font-extrabold">
            {a.grade.ok
              ? "✓ Correct"
              : a.grade.verdict === "partial"
                ? "~ Partially correct"
                : "✕ Not quite"}
          </div>
          <p className="mt-1">{a.grade.feedback}</p>
          {ex.expectedAnswer && !a.grade.ok ? (
            <div className="mt-2 text-[12px] opacity-90">
              <b>Expected:</b> {ex.expectedAnswer}
            </div>
          ) : null}
          <div className="border-current/20 mt-2 border-t pt-2 text-[12px] opacity-90">
            <b>Why:</b> {ex.explanation}
          </div>
        </div>
      ) : null}
    </section>
  );
}

/* ── Source badge — surfaces where this lesson came from ────────── */
function SourceBadge({
  source,
  latencyMs,
  aiError,
}: {
  source: "cache" | "ai" | "fallback" | null;
  latencyMs: number | null;
  aiError: string | null;
}) {
  if (source === "ai") {
    return (
      <span
        className="la-pill text-[10px] font-extrabold"
        style={{ background: "#dcfce7", color: "#166534" }}
        title={
          latencyMs
            ? `Generated by the AI provider chain in ${latencyMs} ms`
            : "Generated by the AI provider chain"
        }
      >
        ✨ AI-generated{latencyMs ? ` · ${(latencyMs / 1000).toFixed(1)}s` : ""}
      </span>
    );
  }
  if (source === "cache") {
    return (
      <span
        className="la-pill text-[10px]"
        style={{ background: "var(--bg-2)", color: "var(--ink-mute)" }}
        title="Served from the 24h lesson cache — same content, no extra LLM spend"
      >
        cached
      </span>
    );
  }
  if (source === "fallback") {
    return (
      <span
        className="la-pill text-[10px] font-extrabold"
        style={{ background: "#fef3c7", color: "#92400e" }}
        title={
          aiError
            ? `AI generation failed (${aiError}). Showing the hand-written fallback for this demo.`
            : "Showing the hand-written fallback lesson for this demo."
        }
      >
        📘 fallback lesson
      </span>
    );
  }
  return null;
}

/* ── Decorations ─────────────────────────────────────────────────── */
function RingScore({ pct, color }: { pct: number; color: string }) {
  const R = 24;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  return (
    <div className="relative" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden>
        <circle cx="32" cy="32" r={R} stroke="var(--bg-2)" strokeWidth="6" fill="none" />
        <circle
          cx="32"
          cy="32"
          r={R}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform="rotate(-90 32 32)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-[13px] font-extrabold text-ink">{pct}%</span>
      </div>
    </div>
  );
}

function SkeletonHero() {
  return (
    <div className="la-card animate-pulse p-6" style={{ borderRadius: 22 }}>
      <div className="h-4 w-32 rounded bg-line-soft" />
      <div className="mt-3 h-8 w-2/3 rounded bg-line-soft" />
      <div className="mt-2 h-4 w-1/2 rounded bg-line-soft" />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="la-card animate-pulse p-5" style={{ borderRadius: 18 }}>
      <div className="h-3 w-20 rounded bg-line-soft" />
      <div className="mt-3 h-4 w-full rounded bg-line-soft" />
      <div className="mt-2 h-4 w-4/5 rounded bg-line-soft" />
      <div className="mt-2 h-4 w-3/5 rounded bg-line-soft" />
    </div>
  );
}
