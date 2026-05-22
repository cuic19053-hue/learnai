"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { ArticleSection, WikiQuestion, WikiTest } from "@/lib/wiki/types";

type Props = {
  test: WikiTest;
  sections: ArticleSection[];
  /** Which world's XP bucket to credit for correct check-ins. */
  worldSlug: string;
};

const XP_PER_CORRECT = 5;

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * Train mode — section-by-section walk through the source article with
 * a quick MCQ check-in after each section. Wrong answers reveal the
 * exact paragraph the answer came from (citation surfaces).
 */
export default function WikiTrainView({ test, sections, worldSlug }: Props) {
  const { addXp } = useProgress();

  // Index questions by their citation heading (case-insensitive).
  const questionsBySection = useMemo(() => {
    const map = new Map<string, WikiQuestion[]>();
    for (const q of test.questions) {
      const key = q.sourceSection.toLowerCase();
      const list = map.get(key) ?? [];
      list.push(q);
      map.set(key, list);
    }
    return map;
  }, [test.questions]);

  // Drop sections with no check-in question — keeps the loop tight.
  const ribbon = useMemo(
    () =>
      sections.filter((s) => {
        const qs = questionsBySection.get(s.heading.toLowerCase()) ?? [];
        return qs.length > 0;
      }),
    [sections, questionsBySection]
  );

  const [stepIdx, setStepIdx] = useState(0);
  const current = ribbon[stepIdx];

  if (!current) {
    return (
      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <p className="text-[14px] text-ink-soft">
          This article doesn&apos;t have enough cited sections to train on. Jump straight to the
          test.
        </p>
        <Link href={`/learn/wiki/${test.id}/quiz`} className="la-btn mt-4">
          Take the test →
        </Link>
      </div>
    );
  }

  const checkIns = questionsBySection.get(current.heading.toLowerCase()) ?? [];
  const sectionPct = Math.round(((stepIdx + 1) / ribbon.length) * 100);
  const isLast = stepIdx === ribbon.length - 1;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
      {/* Main column: section text + check-in */}
      <div className="space-y-5">
        {/* Progress + step ribbon */}
        <div className="la-card p-4" style={{ borderRadius: 18 }}>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
              Step {stepIdx + 1} of {ribbon.length}
            </span>
            <span className="font-mono text-[11px] text-ink-mute">{sectionPct}%</span>
          </div>
          <div className="wt-meter mt-2">
            <div className="fill" style={{ width: `${sectionPct}%` }} />
          </div>
        </div>

        {/* Section text */}
        <article className="la-card p-6" style={{ borderRadius: 20 }}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-ink">
              {current.heading}
            </h2>
            <span className="la-pill text-[11px]">
              {checkIns.length} check-in{checkIns.length === 1 ? "" : "s"}
            </span>
          </div>
          <SectionBody text={current.text} />
        </article>

        {/* Check-ins */}
        {checkIns.map((q, qIdx) => (
          <CheckInCard
            key={q.id}
            q={q}
            index={qIdx + 1}
            total={checkIns.length}
            onCorrect={() => addXp(XP_PER_CORRECT, worldSlug)}
          />
        ))}

        {/* Nav */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            className="la-btn ghost"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
            aria-label="Previous section"
          >
            ← Previous
          </button>
          {isLast ? (
            <Link
              href={`/learn/wiki/${test.id}/quiz`}
              className="la-btn"
              aria-label="Start the timed test"
            >
              Ready — take the test →
            </Link>
          ) : (
            <button
              type="button"
              className="la-btn"
              onClick={() => setStepIdx((i) => Math.min(ribbon.length - 1, i + 1))}
              aria-label="Next section"
            >
              Next section →
            </button>
          )}
        </div>
      </div>

      {/* Right rail: section ribbon */}
      <aside className="la-card h-fit p-4" style={{ borderRadius: 18 }}>
        <h3 className="text-[12px] font-extrabold uppercase tracking-wider text-ink-mute">
          Article ribbon
        </h3>
        <ol className="mt-3 space-y-1">
          {ribbon.map((s, i) => {
            const isCurrent = i === stepIdx;
            const isDone = i < stepIdx;
            return (
              <li key={s.heading}>
                <button
                  type="button"
                  onClick={() => setStepIdx(i)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[13px] transition ${
                    isCurrent
                      ? "bg-brand-1/10 font-bold text-ink"
                      : "hover:bg-bg-2 text-ink-soft hover:text-ink"
                  }`}
                >
                  <span
                    className="grid h-5 w-5 flex-none place-items-center rounded-full font-mono text-[10px]"
                    style={{
                      background: isDone
                        ? "var(--brand-grad)"
                        : isCurrent
                          ? "var(--brand-1)"
                          : "var(--bg-2)",
                      color: isDone || isCurrent ? "#fff" : "var(--ink-mute)",
                    }}
                  >
                    {isDone ? "✓" : i + 1}
                  </span>
                  <span className="min-w-0 truncate">{s.heading}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <Link
          href={`/learn/wiki/${test.id}/quiz`}
          className="la-btn ghost mt-4 w-full"
          style={{ display: "flex" }}
        >
          Skip to test
        </Link>
      </aside>
    </div>
  );
}

/* ── Section body — paragraph split + soft height cap ───────────────── */
function SectionBody({ text }: { text: string }) {
  const paragraphs = text
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <div className="mt-4 space-y-3 font-serif text-[16px] leading-relaxed text-ink-soft">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

/* ── One check-in question ──────────────────────────────────────────── */
function CheckInCard({
  q,
  index,
  total,
  onCorrect,
}: {
  q: WikiQuestion;
  index: number;
  total: number;
  onCorrect: () => void;
}) {
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [shortText, setShortText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [awarded, setAwarded] = useState(false);

  const choices = q.choices ?? [];
  const hasChoices = choices.length > 0 && q.correctIndex != null;

  function reveal() {
    if (revealed) return;
    setRevealed(true);
    if (hasChoices) {
      if (pickedIdx === q.correctIndex && !awarded) {
        onCorrect();
        setAwarded(true);
      }
    } else if (q.expectedAnswer && shortText.trim()) {
      // Loose match for short_answer — case-insensitive substring is good
      // enough for a check-in (the timed test does proper grading).
      if (shortText.toLowerCase().includes(q.expectedAnswer.toLowerCase()) && !awarded) {
        onCorrect();
        setAwarded(true);
      }
    }
  }

  return (
    <div className="la-card p-5" style={{ borderRadius: 18, background: "var(--surface-soft)" }}>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
          Check-in {index} / {total}
        </span>
        <span className="la-pill text-[11px]">+{XP_PER_CORRECT} XP</span>
      </div>
      <p className="mt-2 text-[15px] font-bold leading-relaxed text-ink">{q.prompt}</p>

      {hasChoices ? (
        <ul className="mt-4 space-y-2">
          {choices.map((c, i) => {
            const selected = pickedIdx === i;
            const isCorrect = revealed && i === q.correctIndex;
            const isWrong = revealed && selected && !isCorrect;
            const className = [
              "wt-mcq",
              selected && !revealed ? "selected" : "",
              isCorrect ? "correct" : "",
              isWrong ? "wrong" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <li key={i}>
                <button
                  type="button"
                  disabled={revealed}
                  onClick={() => setPickedIdx(i)}
                  className={className}
                  aria-pressed={selected}
                >
                  <span className="key">{LETTERS[i] ?? i + 1}</span>
                  <span className="text-[14px] font-semibold text-ink">{c}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <label className="mt-3 block">
          <span className="sr-only">Your answer</span>
          <input
            type="text"
            value={shortText}
            onChange={(e) => setShortText(e.target.value)}
            disabled={revealed}
            placeholder="Type your answer…"
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-[14px] font-semibold text-ink outline-none focus:border-brand-1"
          />
        </label>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!revealed ? (
          <button
            type="button"
            className="la-btn"
            onClick={reveal}
            disabled={hasChoices ? pickedIdx === null : !shortText.trim()}
          >
            Reveal answer
          </button>
        ) : (
          <span className="text-[12px] font-bold text-ink-soft">
            Cited from: <span className="text-ink">{q.sourceSection}</span>
          </span>
        )}
      </div>

      {revealed ? (
        <div
          className="mt-3 rounded-xl border border-line-soft px-4 py-3 text-[13px] leading-relaxed text-ink-soft"
          style={{ background: "var(--bg-2)" }}
        >
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
            Why
          </span>
          <p className="mt-1">{q.explanation}</p>
        </div>
      ) : null}
    </div>
  );
}
