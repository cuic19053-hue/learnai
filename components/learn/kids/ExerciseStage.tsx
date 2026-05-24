"use client";

/**
 * Render one Exercise from the kids catalog (`lib/learn/kids/exercises`).
 *
 * Supports the five exercise kinds:
 *   - count       N emojis, pick the digit
 *   - pick-named  3 choices, pick the named one
 *   - match-pair  reference emoji + choices, pick the match
 *   - bigger      2 choices, pick the bigger/smaller
 *   - what-says   3 animals, pick the one making the sound
 *
 * Calls `onCorrect(praise)` exactly once when the child taps the
 * right answer; the prompt is spoken aloud and the praise plays a
 * chime + sparkles up in the parent (PlaySequence).
 *
 * Wrong taps are forgiving: we show the hint, never block the next
 * try, and never say "wrong" or "failed".
 */

import { useCallback, useEffect, useState } from "react";
import { speak, useSpeakOnce } from "@/components/learn/kids/audio";
import type { Exercise } from "@/lib/learn/kids/exercises";

export default function ExerciseStage({
  exercise,
  langCode,
  onAdvance,
  onSolved,
  nextLabel,
}: {
  exercise: Exercise;
  langCode: string;
  /** Called when the child taps "Next →" after seeing the praise. */
  onAdvance: () => void;
  /** Fired the moment the correct tile is tapped (for chime + XP +
   *  sparkles in the parent). The praise text is passed so the parent
   *  can speak it. */
  onSolved: (praise: string) => void;
  /** Localized label for the advance button. */
  nextLabel: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const [retry, setRetry] = useState(false);
  // Wrong-tap counter. After 1 wrong tap we GLOW the correct tile to
  // help the child find it. After 2 wrong taps we accept and reveal
  // — soft-scoring philosophy: nobody gets stuck, nothing is ever a
  // failure. The "Next" button stays manual so the praise is read.
  const [wrongCount, setWrongCount] = useState(0);
  const showHintGlow = wrongCount >= 1;
  const isSolved = picked === exercise.correctId;

  // Reset state when we move to a new exercise.
  useEffect(() => {
    setPicked(null);
    setRetry(false);
    setWrongCount(0);
  }, [exercise.id]);

  // Speak the prompt as the stage opens. Items spoken are slow + kind.
  useSpeakOnce(exercise.prompt, langCode, [exercise.id]);

  const tap = useCallback(
    (id: string) => {
      if (picked === exercise.correctId) return; // already solved
      if (id === exercise.correctId) {
        setPicked(id);
        onSolved(exercise.praise);
        // Speak the SPECIFIC praise line ("Two cats! Meow meow.") so
        // the child hears the reaction tied to the exercise — not just
        // a generic "Great job!".
        void speak(exercise.praise, langCode);
        return;
      }
      // Wrong tap.
      setRetry(true);
      const nextWrong = wrongCount + 1;
      setWrongCount(nextWrong);
      if (nextWrong >= 2) {
        // Second strike — accept it. Reveal the correct tile but DON'T
        // auto-advance: the child still taps Next so the reaction is
        // never skipped. Soft-scoring: this counts as solved.
        setPicked(exercise.correctId);
        onSolved(exercise.praise);
        void speak(exercise.praise, langCode);
        return;
      }
      // First strike — speak the hint and let the glow guide them.
      if (exercise.hint) void speak(exercise.hint, langCode);
    },
    [exercise, langCode, onSolved, picked, wrongCount]
  );

  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "20px 18px 40px",
        display: "grid",
        gap: 18,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Prompt headline */}
      <h2
        style={{
          margin: 0,
          fontSize: "clamp(22px, 5vw, 28px)",
          fontWeight: 800,
          color: "#0f1430",
          letterSpacing: "-0.02em",
          lineHeight: 1.2,
        }}
      >
        {exercise.prompt}
        <button
          type="button"
          onClick={() => void speak(exercise.prompt, langCode)}
          aria-label="Hear the question again"
          style={{
            marginInlineStart: 10,
            padding: "6px 12px",
            borderRadius: 99,
            background: "#fff",
            border: "2px solid #fde68a",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 800,
            color: "#9a3412",
            verticalAlign: "middle",
          }}
        >
          🔊
        </button>
      </h2>

      {/* Reference emoji (count + reference rendering for match-pair). */}
      {exercise.kind === "count" && exercise.showEmoji && exercise.showCount ? (
        <CountingTray emoji={exercise.showEmoji} count={exercise.showCount} />
      ) : null}
      {exercise.kind === "match-pair" && exercise.reference ? (
        <div style={{ fontSize: 80 }} aria-hidden>
          {exercise.reference}
        </div>
      ) : null}

      {/* Choice grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${exercise.choices.length}, minmax(0, 1fr))`,
          gap: 12,
          maxWidth: 560,
          margin: "0 auto",
          width: "100%",
        }}
      >
        {exercise.choices.map((c) => {
          const isCorrect = c.id === exercise.correctId;
          const isPicked = picked === c.id;
          // After one wrong tap, gently glow the correct tile so the
          // child can find it. Picked-green state takes priority once
          // they tap it (or after the 2nd-strike auto-reveal).
          const glow = showHintGlow && isCorrect && !isPicked;
          return (
            <button
              type="button"
              key={c.id}
              onClick={() => tap(c.id)}
              disabled={picked === exercise.correctId}
              aria-label={c.label || c.emoji}
              style={{
                padding: "18px 10px",
                borderRadius: 20,
                background: isPicked && isCorrect ? "#dcfce7" : "#fff",
                border: `3px solid ${
                  isPicked && isCorrect ? "#22c55e" : glow ? "#22c55e" : "#fde68a"
                }`,
                cursor: picked === exercise.correctId ? "default" : "pointer",
                fontFamily: "inherit",
                boxShadow:
                  isPicked && isCorrect
                    ? "0 8px 22px rgba(0,0,0,.08)"
                    : glow
                      ? "0 0 0 6px rgba(34,197,94,.18), 0 8px 22px rgba(34,197,94,.25)"
                      : "0 8px 22px rgba(0,0,0,.08)",
                animation:
                  isPicked && isCorrect
                    ? "kPop .45s cubic-bezier(.34,1.56,.64,1)"
                    : glow
                      ? "kGlow 1.4s ease-in-out infinite"
                      : undefined,
              }}
            >
              <div style={{ fontSize: 56, lineHeight: 1 }} aria-hidden>
                {c.emoji}
              </div>
              {c.label ? (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f1430",
                  }}
                >
                  {c.label}
                </div>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Retry helper line — kind, never punishing. Only shows while
          the child is still trying; disappears when solved. */}
      {retry && !isSolved ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            margin: "0 auto",
            padding: "10px 18px",
            borderRadius: 14,
            background: "#fef3c7",
            color: "#9a3412",
            fontSize: 14,
            fontWeight: 700,
            maxWidth: 420,
            animation: "kWiggle 1.2s ease-in-out",
          }}
        >
          {showHintGlow
            ? (exercise.hint ?? "Almost! Tap the one that's glowing.")
            : (exercise.hint ?? "Try one of the others — you can do it!")}
        </div>
      ) : null}

      {/* Solved card — the exercise's own praise line stays on screen
          until the child taps Next. Mirrors the old kids surface:
          "⭐ Two cats! Meow meow." with a Next → button. */}
      {isSolved ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            margin: "0 auto",
            padding: "14px 22px",
            borderRadius: 20,
            background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
            border: "2px solid #22c55e",
            color: "#14532d",
            fontSize: "clamp(16px, 4vw, 19px)",
            fontWeight: 800,
            maxWidth: 480,
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "center",
            animation: "kPop .45s cubic-bezier(.34,1.56,.64,1)",
          }}
        >
          <span aria-hidden style={{ fontSize: 24 }}>
            ⭐
          </span>
          {exercise.praise}
        </div>
      ) : null}

      {isSolved ? (
        <button
          type="button"
          onClick={onAdvance}
          autoFocus
          style={{
            padding: "16px 36px",
            borderRadius: 99,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 12px 24px rgba(34,197,94,.45)",
            margin: "0 auto",
            animation: "kFloatIn .35s ease-out .1s both",
          }}
        >
          {nextLabel}
        </button>
      ) : null}

      <style>{kStyles}</style>
    </section>
  );
}

function CountingTray({ emoji, count }: { emoji: string; count: number }) {
  // 1-2 rows of items, big enough to tap and count. Each emoji wiggles
  // on a tiny staggered delay so the tray feels alive (the design
  // bundle's mlWiggle keyframe).
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "center",
        padding: "18px 14px",
        borderRadius: 24,
        background: "#fff",
        boxShadow: "0 8px 22px rgba(0,0,0,.06)",
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            fontSize: 56,
            animation: "kWiggle 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.12}s`,
          }}
        >
          {emoji}
        </span>
      ))}
    </div>
  );
}

// Shared CSS keyframes — mirror the design bundle's "mlPop", "mlWiggle"
// to keep visual consistency with the gallery prototypes.
const kStyles = `
@keyframes kPop {
  0%   { transform: scale(0.85); }
  60%  { transform: scale(1.08); }
  100% { transform: scale(1); }
}
@keyframes kWiggle {
  0%, 100% { transform: rotate(-3deg) scale(1); }
  50%      { transform: rotate(3deg)  scale(1.04); }
}
@keyframes kBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-8px); }
}
@keyframes kFloatIn {
  0%   { transform: translateY(8px); opacity: 0; }
  100% { transform: translateY(0);   opacity: 1; }
}
@keyframes kStarPop {
  0%   { transform: scale(0.3) rotate(-30deg); opacity: 0; }
  60%  { transform: scale(1.2)  rotate(10deg); opacity: 1; }
  100% { transform: scale(1)    rotate(0);     opacity: 1; }
}
@keyframes kGlow {
  0%, 100% { box-shadow: 0 0 0 6px rgba(34,197,94,.18), 0 8px 22px rgba(34,197,94,.25); transform: scale(1); }
  50%      { box-shadow: 0 0 0 12px rgba(34,197,94,.10), 0 14px 28px rgba(34,197,94,.35); transform: scale(1.04); }
}
`;
