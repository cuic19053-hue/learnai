"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveAttempt } from "@/lib/wiki/attempt";
import type { WikiAttempt, WikiQuestion, WikiTest } from "@/lib/wiki/types";

type Props = { test: WikiTest };

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type AnswerState = {
  response: string;
  flagged: boolean;
};

/**
 * Timed test runner. No reveals during the test — grading happens on
 * submit. Auto-saves to sessionStorage so the Report page can render
 * results client-side without a database.
 */
export default function WikiQuizView({ test }: Props) {
  const router = useRouter();
  const questions = test.questions;
  const total = questions.length;

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>(() =>
    Array.from({ length: total }, () => ({ response: "", flagged: false }))
  );
  const [remainingSec, setRemainingSec] = useState(test.estDurationMin * 60);
  const [submitting, setSubmitting] = useState(false);
  const startedAtRef = useRef<string>(new Date().toISOString());

  // Tick the timer.
  useEffect(() => {
    if (submitting) return;
    const id = window.setInterval(() => {
      setRemainingSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [submitting]);

  // Auto-submit when time runs out.
  useEffect(() => {
    if (remainingSec === 0 && !submitting) {
      void submit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSec]);

  const answered = useMemo(
    () => answers.filter((a) => a.response.trim().length > 0).length,
    [answers]
  );
  const flagged = useMemo(() => answers.filter((a) => a.flagged).length, [answers]);

  const current = questions[idx];
  if (!current) return null;
  const answer = answers[idx]!;

  function setResponse(value: string) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx]!, response: value };
      return next;
    });
  }

  function toggleFlag() {
    setAnswers((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx]!, flagged: !next[idx]!.flagged };
      return next;
    });
  }

  function go(delta: number) {
    setIdx((i) => Math.min(total - 1, Math.max(0, i + delta)));
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    const graded: WikiAttempt["answers"] = questions.map((q, i) => {
      const resp = answers[i]?.response ?? "";
      const correct = grade(q, resp);
      return {
        questionId: q.id,
        response: resp,
        correct,
        flaggedForReview: answers[i]?.flagged,
      };
    });
    const attempt: WikiAttempt = {
      testId: test.id,
      startedAt: startedAtRef.current,
      finishedAt: new Date().toISOString(),
      answers: graded,
    };
    saveAttempt(test.id, attempt);
    router.push(`/learn/wiki/${test.id}/report`);
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_280px]">
      {/* Main column */}
      <div className="space-y-4">
        {/* Timer + counts */}
        <div
          className="la-card flex flex-wrap items-center justify-between gap-3 p-4"
          style={{ borderRadius: 16 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden>
              ⏱️
            </span>
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
                Time left
              </div>
              <div
                className={`font-mono text-[20px] font-extrabold ${
                  remainingSec <= 60 ? "text-rose-600" : "text-ink"
                }`}
              >
                {formatTime(remainingSec)}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[12px] font-bold text-ink-soft">
            <span>
              Answered <span className="text-ink">{answered}</span> / {total}
            </span>
            <span>·</span>
            <span>
              Flagged <span className="text-ink">{flagged}</span>
            </span>
          </div>
          <button
            type="button"
            className="la-btn dark"
            onClick={() => void submit()}
            style={{ background: "var(--ink)" }}
          >
            Submit test
          </button>
        </div>

        {/* Question */}
        <article className="la-card p-6" style={{ borderRadius: 20 }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
              Question {idx + 1} of {total}
            </span>
            <span className="la-pill text-[11px]">{labelKind(current.kind)}</span>
          </div>
          <h2 className="mt-3 text-[18px] font-bold leading-relaxed text-ink">{current.prompt}</h2>

          {current.kind === "short_answer" ? (
            <label className="mt-4 block">
              <span className="sr-only">Your answer</span>
              <input
                type="text"
                value={answer.response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your answer…"
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[15px] font-semibold text-ink outline-none focus:border-brand-1"
              />
            </label>
          ) : (
            <ul className="mt-4 space-y-2">
              {(current.choices ?? []).map((c, i) => {
                const letter = LETTERS[i] ?? String(i + 1);
                const selected = answer.response === letter;
                return (
                  <li key={i}>
                    <button
                      type="button"
                      className={`wt-mcq ${selected ? "selected" : ""}`}
                      aria-pressed={selected}
                      onClick={() => setResponse(letter)}
                    >
                      <span className="key">{letter}</span>
                      <span className="text-[14px] font-semibold text-ink">{c}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="la-btn ghost"
                onClick={() => go(-1)}
                disabled={idx === 0}
              >
                ← Previous
              </button>
              <button
                type="button"
                className="la-btn ghost"
                onClick={() => go(1)}
                disabled={idx === total - 1}
              >
                Next →
              </button>
            </div>
            <button
              type="button"
              className="la-btn ghost"
              onClick={toggleFlag}
              aria-pressed={answer.flagged}
              style={
                answer.flagged
                  ? { boxShadow: "0 0 0 1px var(--warn,#f59e0b) inset", color: "#b45309" }
                  : undefined
              }
            >
              {answer.flagged ? "🚩 Flagged for review" : "🚩 Flag for review"}
            </button>
          </div>
        </article>
      </div>

      {/* Right rail: question grid */}
      <aside className="la-card h-fit p-4" style={{ borderRadius: 18 }}>
        <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-ink-mute">
          Questions
        </h3>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {questions.map((_, i) => {
            const a = answers[i]!;
            const isCurrent = i === idx;
            const isDone = a.response.trim().length > 0;
            const className = [
              "wt-qnav",
              isCurrent ? "current" : "",
              !isCurrent && isDone ? "done" : "",
              a.flagged ? "flagged" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <button
                key={i}
                type="button"
                className={className}
                onClick={() => setIdx(i)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${i + 1}${isDone ? " (answered)" : ""}${
                  a.flagged ? " (flagged)" : ""
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <Link
          href={`/learn/wiki/${test.id}`}
          className="la-btn ghost mt-4 w-full"
          style={{ display: "flex" }}
        >
          Exit test
        </Link>
        <p className="mt-3 text-[11px] leading-relaxed text-ink-mute">
          Your answers stay on this device — nothing is sent until you submit.
        </p>
      </aside>
    </div>
  );
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

function labelKind(kind: WikiQuestion["kind"]): string {
  return kind === "multiple_choice"
    ? "Multiple choice"
    : kind === "true_false"
      ? "True / false"
      : "Short answer";
}

function grade(q: WikiQuestion, response: string): boolean | null {
  if (!response.trim()) return false;
  if (q.kind === "short_answer") {
    if (!q.expectedAnswer) return null;
    return response.trim().toLowerCase().includes(q.expectedAnswer.trim().toLowerCase());
  }
  // MCQ / true_false — letter compare.
  if (q.correctIndex == null) return null;
  const correctLetter = LETTERS[q.correctIndex] ?? "";
  return response.toUpperCase() === correctLetter.toUpperCase();
}
