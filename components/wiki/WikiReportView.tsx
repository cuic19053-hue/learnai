"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import { clearAttempt, loadAttempt } from "@/lib/wiki/attempt";
import type { WikiAttempt, WikiQuestion, WikiTest } from "@/lib/wiki/types";

type Props = { test: WikiTest; worldSlug: string };

const XP_PER_CORRECT = 10;
const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Readiness scorecard — renders after the user submits the timed test.
 * Reads the attempt from sessionStorage (client-only), awards XP once,
 * and surfaces per-section breakdown + every cited paragraph so the
 * learner can see exactly why each question scored the way it did.
 */
export default function WikiReportView({ test, worldSlug }: Props) {
  const { addXp } = useProgress();
  const [attempt, setAttempt] = useState<WikiAttempt | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const a = loadAttempt(test.id);
    setAttempt(a);
    setHydrated(true);
  }, [test.id]);

  // Award XP exactly once per finished attempt — guarded by a marker
  // appended to the stored attempt so a hard refresh doesn't double-pay.
  useEffect(() => {
    if (!attempt) return;
    const marker = `__awarded_${test.id}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(marker)) return;
    const correctCount = attempt.answers.filter((a) => a.correct === true).length;
    if (correctCount > 0) {
      addXp(correctCount * XP_PER_CORRECT, worldSlug);
    }
    window.sessionStorage.setItem(marker, "1");
  }, [attempt, addXp, test.id, worldSlug]);

  const stats = useMemo(() => {
    if (!attempt) return null;
    const total = test.questions.length;
    const correct = attempt.answers.filter((a) => a.correct === true).length;
    const wrong = attempt.answers.filter((a) => a.correct === false).length;
    const ungraded = attempt.answers.filter((a) => a.correct === null).length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const elapsedSec = attempt.finishedAt
      ? Math.max(
          0,
          Math.round(
            (new Date(attempt.finishedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000
          )
        )
      : 0;

    // Per-section accuracy.
    const bySection = new Map<string, { correct: number; total: number }>();
    for (const q of test.questions) {
      const a = attempt.answers.find((x) => x.questionId === q.id);
      const bucket = bySection.get(q.sourceSection) ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (a?.correct === true) bucket.correct += 1;
      bySection.set(q.sourceSection, bucket);
    }
    const sectionRows = Array.from(bySection.entries())
      .map(([section, b]) => ({
        section,
        correct: b.correct,
        total: b.total,
        pct: b.total ? Math.round((b.correct / b.total) * 100) : 0,
      }))
      .sort((a, b) => a.pct - b.pct);

    return { total, correct, wrong, ungraded, pct, elapsedSec, sectionRows };
  }, [attempt, test.questions]);

  if (!hydrated) {
    return (
      <div className="la-card p-6 text-center" style={{ borderRadius: 18 }}>
        <p className="text-[13px] text-ink-soft">Loading your results…</p>
      </div>
    );
  }

  if (!attempt || !stats) {
    return (
      <div className="la-card p-6 text-center" style={{ borderRadius: 18 }}>
        <h2 className="text-[18px] font-extrabold text-ink">No attempt found</h2>
        <p className="mt-2 text-[13px] text-ink-soft">
          We couldn&apos;t find a finished test on this device. Take the test first — your results
          stay local until you finish.
        </p>
        <Link href={`/learn/wiki/${test.id}/quiz`} className="la-btn mt-4">
          Take the test →
        </Link>
      </div>
    );
  }

  const verdict = readinessVerdict(stats.pct);
  const weakest = stats.sectionRows.find((r) => r.pct < 80);

  return (
    <div className="space-y-6">
      {/* Headline scorecard */}
      <section className="la-card relative overflow-hidden p-7" style={{ borderRadius: 24 }}>
        <div className="wt-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="relative grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
          <ScoreRing pct={stats.pct} />
          <div>
            <span
              className="la-pill text-[11px] font-extrabold"
              style={{ background: verdict.bg, color: verdict.fg }}
            >
              {verdict.label}
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.01em] text-ink">
              {stats.correct} of {stats.total} correct
            </h2>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{verdict.body}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Correct" value={stats.correct} />
              <Stat label="Wrong" value={stats.wrong} />
              <Stat
                label="Ungraded"
                value={stats.ungraded}
                hint="Short answers we couldn't auto-grade"
              />
              <Stat label="Time" value={`${Math.round(stats.elapsedSec / 60)}m`} />
            </dl>
          </div>
        </div>

        {weakest ? (
          <div
            className="relative mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line-soft p-4"
            style={{ background: "var(--surface-soft)" }}
          >
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
                Weakest section
              </div>
              <div className="text-[15px] font-bold text-ink">
                {weakest.section}{" "}
                <span className="font-mono text-[12px] text-ink-mute">· {weakest.pct}%</span>
              </div>
            </div>
            <Link href={`/learn/wiki/${test.id}/train`} className="la-btn">
              Re-train this section →
            </Link>
          </div>
        ) : null}
      </section>

      {/* Per-section accuracy */}
      <section className="la-card p-5" style={{ borderRadius: 20 }}>
        <h3 className="text-[14px] font-extrabold tracking-tight text-ink">Per-section accuracy</h3>
        <p className="mt-1 text-[12px] text-ink-mute">
          Lowest-scoring sections first — those are where re-training pays off.
        </p>
        <ul className="mt-4 space-y-3">
          {stats.sectionRows.map((row) => (
            <li key={row.section}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="truncate font-bold text-ink">{row.section}</span>
                <span className="font-mono text-[11px] text-ink-mute">
                  {row.correct} / {row.total} · {row.pct}%
                </span>
              </div>
              <div className="wt-meter mt-1">
                <div
                  className="fill"
                  style={{
                    width: `${row.pct}%`,
                    background:
                      row.pct >= 80 ? "#16a34a" : row.pct >= 50 ? "var(--brand-grad)" : "#dc2626",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Question-by-question review */}
      <section>
        <h3 className="text-[14px] font-extrabold tracking-tight text-ink">
          Review every question
        </h3>
        <p className="mt-1 text-[12px] text-ink-mute">
          Each card shows your answer, the cited heading, and the explanation.
        </p>
        <ol className="mt-4 space-y-3">
          {test.questions.map((q, i) => {
            const a = attempt.answers.find((x) => x.questionId === q.id);
            return (
              <li key={q.id}>
                <ReviewCard
                  q={q}
                  response={a?.response ?? ""}
                  correct={a?.correct ?? null}
                  index={i + 1}
                />
              </li>
            );
          })}
        </ol>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/learn/wiki/${test.id}/train`} className="la-btn ghost">
          ← Train again
        </Link>
        <button
          type="button"
          className="la-btn ghost"
          onClick={() => {
            clearAttempt(test.id);
            if (typeof window !== "undefined") {
              window.sessionStorage.removeItem(`__awarded_${test.id}`);
              window.location.href = `/learn/wiki/${test.id}/quiz`;
            }
          }}
        >
          Retake the test
        </button>
        <Link href="/learn/wiki" className="la-btn">
          New WikiTest →
        </Link>
      </div>
    </div>
  );
}

/* ── Score ring (SVG) ───────────────────────────────────────────────── */
function ScoreRing({ pct }: { pct: number }) {
  const R = 56;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;
  return (
    <div className="relative grid place-items-center">
      <svg width="148" height="148" viewBox="0 0 148 148" aria-hidden>
        <defs>
          <linearGradient id="wt-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e5bff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <circle cx="74" cy="74" r={R} stroke="var(--bg-2)" strokeWidth="14" fill="none" />
        <circle
          cx="74"
          cy="74"
          r={R}
          stroke="url(#wt-ring)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          transform="rotate(-90 74 74)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-[28px] font-extrabold text-ink">{pct}%</div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-ink-mute">
            Score
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div>
      <dt className="text-[10px] font-extrabold uppercase tracking-wider text-ink-mute">{label}</dt>
      <dd className="font-mono text-[18px] font-extrabold text-ink" title={hint}>
        {value}
      </dd>
    </div>
  );
}

function readinessVerdict(pct: number): {
  label: string;
  body: string;
  bg: string;
  fg: string;
} {
  if (pct >= 85) {
    return {
      label: "Ready",
      body: "You've got this. Most concepts are solid — review the few misses below and call it done.",
      bg: "#dcfce7",
      fg: "#166534",
    };
  }
  if (pct >= 60) {
    return {
      label: "Almost there",
      body: "Good footing — re-train the weakest section and you'll clear it next round.",
      bg: "#fef3c7",
      fg: "#92400e",
    };
  }
  return {
    label: "Keep training",
    body: "Plenty to chew on. Walk the article in Train mode once more — the section meters below show where to focus.",
    bg: "#fee2e2",
    fg: "#991b1b",
  };
}

/* ── One review card ────────────────────────────────────────────────── */
function ReviewCard({
  q,
  response,
  correct,
  index,
}: {
  q: WikiQuestion;
  response: string;
  correct: boolean | null;
  index: number;
}) {
  const tone =
    correct === true
      ? { bg: "#dcfce7", fg: "#166534", label: "Correct" }
      : correct === false
        ? { bg: "#fee2e2", fg: "#991b1b", label: response ? "Wrong" : "Skipped" }
        : { bg: "var(--bg-2)", fg: "var(--ink-soft)", label: "Not graded" };

  const yourAnswer = q.kind === "short_answer" ? response || "—" : describeChoice(q, response);
  const correctAnswer =
    q.kind === "short_answer"
      ? (q.expectedAnswer ?? "—")
      : describeChoice(q, LETTERS[q.correctIndex ?? -1] ?? "");

  return (
    <div className="la-card p-5" style={{ borderRadius: 16 }}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-mono text-[11px] font-bold text-ink-mute">Q{index}</span>
        <span
          className="la-pill text-[11px] font-extrabold"
          style={{ background: tone.bg, color: tone.fg }}
        >
          {tone.label}
        </span>
      </div>
      <p className="mt-2 text-[15px] font-bold leading-relaxed text-ink">{q.prompt}</p>

      <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
          <dt className="text-[10px] font-extrabold uppercase tracking-wider text-ink-mute">
            Your answer
          </dt>
          <dd className="mt-1 text-[13px] font-bold text-ink">{yourAnswer}</dd>
        </div>
        <div className="rounded-xl border border-line-soft bg-surface-soft p-3">
          <dt className="text-[10px] font-extrabold uppercase tracking-wider text-ink-mute">
            Correct answer
          </dt>
          <dd className="mt-1 text-[13px] font-bold text-ink">{correctAnswer}</dd>
        </div>
      </dl>

      <div
        className="mt-3 rounded-xl border border-line-soft px-4 py-3 text-[13px] leading-relaxed text-ink-soft"
        style={{ background: "var(--bg-2)" }}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-mute">
          Cited from · {q.sourceSection}
        </span>
        <p className="mt-1 text-ink-soft">{q.explanation}</p>
      </div>
    </div>
  );
}

function describeChoice(q: WikiQuestion, letter: string): string {
  if (!letter) return "—";
  const idx = LETTERS.indexOf(letter);
  if (idx < 0 || !q.choices || idx >= q.choices.length) return letter;
  return `${letter}. ${q.choices[idx]}`;
}
