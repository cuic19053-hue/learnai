"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Language, VocabCard } from "@/lib/languages/types";

type Outcome = "unseen" | "known" | "review";

export default function VocabDrill({
  language,
  level,
  cards,
}: {
  language: Language;
  level: string;
  cards: VocabCard[];
}) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [outcomes, setOutcomes] = useState<Outcome[]>(() => cards.map(() => "unseen"));

  const total = cards.length;
  const known = useMemo(() => outcomes.filter((o) => o === "known").length, [outcomes]);
  const review = useMemo(() => outcomes.filter((o) => o === "review").length, [outcomes]);
  const seen = total - outcomes.filter((o) => o === "unseen").length;
  const card = cards[idx];

  if (!card) {
    return (
      <div className="la-card p-6 text-center" style={{ borderRadius: 18 }}>
        <h2 className="text-xl font-bold text-ink">Nothing to drill yet</h2>
        <p className="mt-2 text-[14px] text-ink-soft">
          This level doesn&apos;t have seed modules yet. Add a module under{" "}
          <code className="rounded bg-line-soft px-1.5 py-0.5 text-[12px]">
            lib/languages/seed.ts
          </code>
          .
        </p>
      </div>
    );
  }

  function record(o: Outcome) {
    setOutcomes((prev) => {
      const next = prev.slice();
      next[idx] = o;
      return next;
    });
    advance();
  }

  function advance() {
    if (idx + 1 < total) {
      setIdx(idx + 1);
      setFlipped(false);
    } else {
      // Loop unknown / review cards once more if any remain.
      const firstUnknown = outcomes.findIndex((o) => o !== "known");
      if (firstUnknown >= 0) {
        setIdx(firstUnknown);
        setFlipped(false);
      }
    }
  }

  function jump(delta: number) {
    const next = Math.max(0, Math.min(total - 1, idx + delta));
    setIdx(next);
    setFlipped(false);
  }

  const accent = language.accent;
  const completed = known + review;
  const allKnown = known === total && total > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-[13px] text-ink-mute">
            {language.flag} {language.name} · {level} · Vocab drill
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.01em] text-ink md:text-3xl">
            Flashcards
          </h1>
          <p className="mt-1 text-[13px] text-ink-mute">
            Card {idx + 1} of {total} · {known} known · {review} to review
          </p>
        </div>
      </div>

      {/* Progress strip */}
      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--line-soft)" }}>
        <div
          className="h-full transition-all"
          style={{ width: `${(completed / total) * 100}%`, background: accent }}
        />
      </div>

      {/* Flashcard */}
      <button
        type="button"
        onClick={() => setFlipped((v) => !v)}
        aria-pressed={flipped}
        className="la-card relative w-full p-8 text-center transition"
        style={{
          minHeight: 240,
          borderRadius: 24,
          background: flipped ? `${accent}0a` : "#fff",
          border: `1.5px solid ${flipped ? accent : "var(--line-soft)"}`,
        }}
      >
        <span
          className="la-pill absolute left-4 top-4 text-[10px]"
          style={{
            background: flipped ? "#fff" : `${accent}1f`,
            color: accent,
            boxShadow: "0 0 0 1px var(--line)",
          }}
        >
          {flipped ? "Meaning" : "Tap to reveal"}
        </span>

        {flipped ? (
          <div>
            <p className="text-2xl font-bold leading-snug text-ink md:text-3xl">{card.meaning}</p>
            {card.example ? (
              <p className="mt-3 text-[14px] italic text-ink-soft">{card.example}</p>
            ) : null}
          </div>
        ) : (
          <div dir={language.dir}>
            <p
              className="text-3xl font-extrabold leading-tight tracking-[-0.01em] text-ink md:text-5xl"
              style={{ direction: language.dir }}
            >
              {card.term}
            </p>
            {card.hint ? <p className="mt-3 text-[14px] text-ink-soft">{card.hint}</p> : null}
          </div>
        )}
      </button>

      {/* Self-rate row — visible only after reveal */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => record("known")}
            disabled={!flipped}
            className="la-btn"
            style={{
              padding: "10px 16px",
              fontSize: 13,
              background: "var(--j-little)",
              boxShadow: "none",
              opacity: flipped ? 1 : 0.45,
            }}
          >
            ✓ I knew it
          </button>
          <button
            type="button"
            onClick={() => record("review")}
            disabled={!flipped}
            className="la-btn ghost"
            style={{ padding: "10px 16px", fontSize: 13, opacity: flipped ? 1 : 0.45 }}
          >
            ↻ Review later
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => jump(-1)}
            disabled={idx === 0}
            className="la-btn ghost"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            ← Previous
          </button>
          <button
            type="button"
            onClick={() => jump(1)}
            disabled={idx === total - 1}
            className="la-btn ghost"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            Next →
          </button>
        </div>
      </div>

      {allKnown ? (
        <div
          className="la-card p-5 text-center"
          style={{
            borderRadius: 18,
            background: "rgba(45,187,108,0.06)",
            borderColor: "var(--j-little)",
          }}
        >
          <h2 className="text-lg font-bold text-ink">All cards known 🎉</h2>
          <p className="mt-1 text-[13px] text-ink-soft">
            Add more modules under{" "}
            <code className="rounded bg-line-soft px-1.5 py-0.5 text-[11px]">
              lib/languages/seed.ts
            </code>{" "}
            to grow the deck.
          </p>
          <Link
            href={`/learn/languages/${language.code}/${level}`}
            className="la-btn mt-3 inline-flex"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            Back to level home
          </Link>
        </div>
      ) : null}
    </div>
  );
}
