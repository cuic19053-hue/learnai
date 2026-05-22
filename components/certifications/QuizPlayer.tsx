"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { LoadedQuestion } from "@/lib/certifications/load";
import type { CertificationMeta } from "@/lib/certifications/types";
import { VENDOR_META } from "@/lib/certifications/catalog";
import { useProgress } from "@/components/progress/ProgressProvider";

const XP_PER_CORRECT = 10;

type Outcome = {
  picked: string;
  correct: boolean | null; // null = multi-select, no auto-grading
  selfRated?: "known" | "review";
};

export default function QuizPlayer({
  meta,
  questions,
  mode,
}: {
  meta: CertificationMeta;
  questions: LoadedQuestion[];
  mode: "sample" | "page";
}) {
  const [idx, setIdx] = useState(0);
  const [outcomes, setOutcomes] = useState<Outcome[]>(
    Array.from({ length: questions.length }, () => ({ picked: "", correct: null }))
  );
  const [revealed, setRevealed] = useState(false);
  // Per-mount memory of which question ids have already paid out, so
  // re-selecting in the same session doesn't double-credit the XP pool.
  const awardedRef = useRef<Set<string>>(new Set());
  const { addXp } = useProgress();

  const vendor = VENDOR_META[meta.vendor];
  const accent = vendor?.color ?? "var(--brand-1)";
  const total = questions.length;
  const current = questions[idx];
  const outcome = outcomes[idx];

  const completed = useMemo(() => outcomes.filter((o) => o.picked).length, [outcomes]);
  const knownCount = useMemo(
    () => outcomes.filter((o) => o.selfRated === "known").length,
    [outcomes]
  );
  const reviewCount = useMemo(
    () => outcomes.filter((o) => o.selfRated === "review").length,
    [outcomes]
  );
  const correctCount = useMemo(() => outcomes.filter((o) => o.correct === true).length, [outcomes]);

  if (!current) {
    return (
      <div className="la-card p-6 text-center" style={{ borderRadius: 18 }}>
        <p>No questions available.</p>
      </div>
    );
  }

  function pickOption(letter: string) {
    if (revealed) return;
    const isCorrect =
      current.correctLetter === ""
        ? null
        : current.correctLetter.toUpperCase() === letter.toUpperCase();
    setOutcomes((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], picked: letter, correct: isCorrect };
      return next;
    });
    setRevealed(true);
    // Award XP once per question, only for auto-graded correct answers.
    if (isCorrect === true && !awardedRef.current.has(current.id)) {
      awardedRef.current.add(current.id);
      addXp(XP_PER_CORRECT, "adult");
    }
  }

  function selfRate(rating: "known" | "review") {
    setOutcomes((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], selfRated: rating };
      return next;
    });
  }

  function go(delta: number) {
    const target = idx + delta;
    if (target < 0 || target >= total) return;
    setIdx(target);
    setRevealed(!!outcomes[target].picked);
  }

  const isLast = idx === total - 1;
  const allAnswered = completed === total;

  return (
    <div className="space-y-4">
      {/* ── Header bar ── */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/learn/certifications/${meta.slug}`}
            className="text-[13px] font-bold text-ink-soft hover:text-ink"
          >
            ← Back to {meta.code}
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.01em] text-ink md:text-3xl">
            {meta.code} · {mode === "sample" ? "Drill mode" : "Review mode"}
          </h1>
          <p className="mt-0.5 text-[13px] text-ink-mute">
            Question {idx + 1} of {total} · {correctCount} correct so far
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat label="Known" value={knownCount} color="var(--j-little)" />
          <Stat label="Review later" value={reviewCount} color="#b45309" />
          <Stat label="Completed" value={`${completed}/${total}`} color={accent} />
        </div>
      </div>

      {/* ── Progress strip ── */}
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--line-soft)" }}>
        <div
          className="h-full transition-all"
          style={{
            width: `${(completed / total) * 100}%`,
            background: accent,
          }}
        />
      </div>

      {/* ── Question card ── */}
      <div className="la-card p-5 md:p-6" style={{ borderRadius: 18 }}>
        <p className="text-[15px] leading-relaxed text-ink">{current.question}</p>

        <ul className="mt-5 space-y-2">
          {current.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isPicked = outcome.picked === letter;
            const isCorrect = revealed && letter === current.correctLetter;
            const isWrongPick = revealed && isPicked && !isCorrect && current.correctLetter !== "";
            return (
              <li key={letter}>
                <button
                  type="button"
                  onClick={() => pickOption(letter)}
                  disabled={revealed}
                  aria-pressed={isPicked}
                  className="la-card flex w-full items-start gap-3 p-3.5 text-left transition"
                  style={{
                    borderRadius: 12,
                    border: `1.5px solid ${
                      isCorrect
                        ? "var(--j-little)"
                        : isWrongPick
                          ? "#dc2626"
                          : isPicked
                            ? accent
                            : "var(--line-soft)"
                    }`,
                    background: isCorrect
                      ? "rgba(45,187,108,0.08)"
                      : isWrongPick
                        ? "rgba(220,38,38,0.06)"
                        : "#fff",
                    cursor: revealed ? "default" : "pointer",
                  }}
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-extrabold"
                    style={{
                      background: isCorrect
                        ? "var(--j-little)"
                        : isWrongPick
                          ? "#dc2626"
                          : isPicked
                            ? accent
                            : "var(--bg-2)",
                      color: isPicked || isCorrect ? "#fff" : "var(--ink)",
                    }}
                    aria-hidden
                  >
                    {letter}
                  </span>
                  <span className="text-[14px] leading-relaxed text-ink">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* ── Answer reveal ── */}
        {revealed ? (
          <div
            className="mt-5 rounded-2xl border p-4"
            style={{
              borderColor:
                outcome.correct === true
                  ? "var(--j-little)"
                  : outcome.correct === false
                    ? "#dc2626"
                    : "var(--line)",
              background: "var(--bg-2)",
            }}
          >
            <div className="flex flex-wrap items-baseline gap-2">
              <span
                className="text-[11px] font-bold uppercase tracking-wider"
                style={{
                  color:
                    outcome.correct === true
                      ? "var(--j-little)"
                      : outcome.correct === false
                        ? "#dc2626"
                        : "var(--ink-mute)",
                }}
              >
                {outcome.correct === true
                  ? "Correct"
                  : outcome.correct === false
                    ? "Not quite"
                    : "Multi-select — see explanation"}
              </span>
              {current.correctLetter ? (
                <span className="text-[12px] text-ink-soft">
                  Answer: <strong className="text-ink">{current.correctLetter}</strong>
                </span>
              ) : null}
            </div>

            {current.explanation ? (
              <details className="mt-2.5">
                <summary className="cursor-pointer text-[12px] font-bold text-brand-1">
                  Show explanation
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-soft">
                  {current.explanation}
                </p>
              </details>
            ) : null}

            {current.references ? (
              <p className="mt-2 break-words text-[11px] text-ink-mute">
                References: {current.references}
              </p>
            ) : null}

            {/* Self-rate */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-[12px] text-ink-soft">How did you do?</span>
              <button
                type="button"
                onClick={() => selfRate("known")}
                aria-pressed={outcome.selfRated === "known"}
                className="la-pill text-[11px]"
                style={{
                  background: outcome.selfRated === "known" ? "var(--j-little-bg)" : "#fff",
                  color: outcome.selfRated === "known" ? "var(--j-little)" : "var(--ink-soft)",
                  boxShadow: "0 0 0 1px var(--line)",
                  cursor: "pointer",
                }}
              >
                ✓ I know this
              </button>
              <button
                type="button"
                onClick={() => selfRate("review")}
                aria-pressed={outcome.selfRated === "review"}
                className="la-pill text-[11px]"
                style={{
                  background: outcome.selfRated === "review" ? "#fff7e6" : "#fff",
                  color: outcome.selfRated === "review" ? "#b45309" : "var(--ink-soft)",
                  boxShadow: "0 0 0 1px var(--line)",
                  cursor: "pointer",
                }}
              >
                ↻ Review later
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {/* ── Footer nav ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={idx === 0}
          className="la-btn ghost"
          style={{ padding: "10px 16px", fontSize: 13 }}
        >
          ← Previous
        </button>
        <div className="flex items-center gap-2">
          {!isLast ? (
            <button
              type="button"
              onClick={() => go(1)}
              disabled={!revealed && !outcome.picked}
              className="la-btn"
              style={{ padding: "12px 20px", fontSize: 14, background: accent, boxShadow: "none" }}
            >
              {revealed ? "Next question →" : "Pick an answer first"}
            </button>
          ) : (
            <Link
              href={`/learn/certifications/${meta.slug}`}
              className="la-btn"
              style={{ padding: "12px 20px", fontSize: 14, background: accent, boxShadow: "none" }}
            >
              {allAnswered ? "Finish · back to cert" : "Exit · back to cert"}
            </Link>
          )}
        </div>
      </div>

      {/* ── Final summary when all answered on the last screen ── */}
      {isLast && allAnswered ? (
        <div
          className="la-card p-6 text-center"
          style={{ borderRadius: 18, background: "var(--bg-2)" }}
        >
          <h2 className="text-2xl font-extrabold text-ink">Session complete</h2>
          <p className="mt-1 text-[14px] text-ink-soft">
            {correctCount} of {total} auto-graded correct · {knownCount} marked known ·{" "}
            {reviewCount} marked review
          </p>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="text-lg font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
