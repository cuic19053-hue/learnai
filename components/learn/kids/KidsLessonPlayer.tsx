"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProgress } from "@/components/progress/ProgressProvider";
import {
  ALL_EXERCISES,
  exercisesByTheme,
  THEMES,
  type Exercise,
  type KidsTheme,
} from "@/lib/learn/kids/exercises";
import { useTTS } from "@/lib/tts/use-tts";

const XP_PER_CORRECT = 5;

/**
 * Kids lesson player — ages 3-6, touch-first, voice-friendly.
 *
 * - Pick a theme (Numbers / Letters / Colors / Shapes / Animals / Feelings)
 * - Each theme runs through its full exercise list, one big card at a time
 * - Buttons are at least 88 px tall, target one finger
 * - No reading required — every prompt is short enough to read aloud
 * - Browser speech synthesis reads the prompt + praise when the device
 *   supports it (and the parent left "Read aloud" on)
 * - +5 XP per correct answer, awarded once per exercise per session
 * - Parent exit is a visible labelled chip, not a bare emoji icon
 */
export default function KidsLessonPlayer({ defaultTheme = "numbers" as KidsTheme }) {
  const [theme, setTheme] = useState<KidsTheme>(defaultTheme);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [awarded, setAwarded] = useState<Record<string, boolean>>({});
  const { addXp } = useProgress();
  const tts = useTTS();

  const themeMeta = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const exercises = useMemo(() => exercisesByTheme(theme), [theme]);
  const total = exercises.length;
  const current: Exercise | undefined = exercises[index];

  // Reset state when switching themes or moving to a new exercise.
  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setRevealed(false);
  }, [theme]);

  function speak(text: string) {
    // Routes through the user-configurable TTS engine (Web Speech by
    // default, Piper if the learner switched in /settings). Failures
    // are non-blocking — the visual UI still works without audio.
    void tts.speak(text, { rate: 0.9, pitch: 1.15 }).catch(() => {});
  }

  // Speak the prompt when a new exercise lands.
  useEffect(() => {
    if (current) speak(current.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  if (!current) return null;
  // Narrow once so callbacks below see a non-undefined Exercise.
  const ex = current;

  const correct = picked === ex.correctId;

  function pick(id: string) {
    if (revealed) return;
    setPicked(id);
    const isCorrect = id === ex.correctId;
    setRevealed(true);
    if (isCorrect) {
      if (!awarded[ex.id]) {
        addXp(XP_PER_CORRECT, "kids");
        setAwarded((a) => ({ ...a, [ex.id]: true }));
      }
      speak(ex.praise);
    } else if (ex.hint) {
      speak(ex.hint);
    }
  }

  function next() {
    if (index < total - 1) {
      setIndex((i) => i + 1);
      setPicked(null);
      setRevealed(false);
    } else {
      // Loop back to the start of the theme — or jump to a different theme.
      setIndex(0);
      setPicked(null);
      setRevealed(false);
    }
  }

  function retry() {
    setPicked(null);
    setRevealed(false);
  }

  const correctSoFar = Object.keys(awarded).filter((k) => exercises.some((e) => e.id === k)).length;
  const pct = Math.round(((index + (revealed && correct ? 1 : 0)) / total) * 100);

  return (
    <main
      id="main"
      className="relative mx-auto min-h-screen w-full max-w-[640px] px-4 pb-32 pt-4 sm:px-6"
      style={{ background: `linear-gradient(180deg, ${themeMeta.bg}, #fff 50%)` }}
    >
      {/* Top strip — back, theme, parent exit */}
      <div className="flex items-center justify-between">
        <Link
          href="/learn/kids"
          aria-label="Back home"
          className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[26px] text-ink-mute"
          style={{ boxShadow: "var(--shadow-1)" }}
        >
          ←
        </Link>
        <span
          className="la-pill text-[13px] font-extrabold"
          style={{ background: themeMeta.bg, color: themeMeta.color }}
        >
          {themeMeta.emoji} {themeMeta.label}
        </span>
        <Link
          href="/parent"
          className="flex items-center gap-1.5 rounded-2xl bg-white px-3 py-2 text-[12px] font-extrabold text-ink-soft"
          style={{ boxShadow: "var(--shadow-1)" }}
          aria-label="Parent area"
        >
          <span aria-hidden>👨‍👩‍👧</span>
          <span className="hidden sm:inline">Parent</span>
        </Link>
      </div>

      {/* Theme picker — horizontal scroll on mobile */}
      <div
        className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
        role="tablist"
        aria-label="Pick a learning theme"
      >
        {THEMES.map((t) => {
          const active = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTheme(t.id)}
              className="flex-none rounded-2xl px-3.5 py-2 text-[13px] font-extrabold transition"
              style={{
                background: active ? t.color : "#fff",
                color: active ? "#fff" : "var(--ink-soft)",
                boxShadow: active ? "0 6px 16px " + t.color + "44" : "var(--shadow-1)",
              }}
            >
              <span aria-hidden className="mr-1.5">
                {t.emoji}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mt-5 flex items-center gap-3">
        <div className="la-mono text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
          {index + 1} / {total}
        </div>
        <div
          className="flex-1 overflow-hidden rounded-full"
          style={{ height: 10, background: "#fff" }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${pct}%`, background: themeMeta.color }}
          />
        </div>
        <div className="la-mono text-[11px] font-extrabold" style={{ color: themeMeta.color }}>
          ⚡ {correctSoFar}
        </div>
      </div>

      {/* Task card */}
      <section
        key={ex.id}
        className="mt-5 rounded-3xl bg-white p-6 text-center"
        style={{ boxShadow: "var(--shadow-2)" }}
      >
        {/* Prompt */}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.01em] text-ink sm:text-[30px]">
          {ex.prompt}
        </h1>
        <button
          type="button"
          onClick={() => speak(ex.prompt)}
          className="la-mono mt-2 text-[12px] font-bold text-ink-mute underline-offset-2 hover:underline"
          aria-label="Read prompt aloud"
        >
          🔊 Hear it
        </button>

        {/* Visual content */}
        <div className="mt-5">
          {ex.kind === "count" && ex.showEmoji ? (
            <div
              className="flex flex-wrap items-center justify-center gap-2 text-[48px] leading-none sm:text-[64px]"
              aria-label={`${ex.showCount} ${ex.showEmoji}`}
            >
              {Array.from({ length: ex.showCount ?? 0 }).map((_, i) => (
                <span key={i}>{ex.showEmoji}</span>
              ))}
            </div>
          ) : null}

          {ex.reference ? (
            <div className="mb-2 flex justify-center">
              <div
                className="grid place-items-center rounded-3xl text-[56px]"
                style={{
                  width: 96,
                  height: 96,
                  background: themeMeta.bg,
                }}
                aria-hidden
              >
                {ex.reference}
              </div>
            </div>
          ) : null}
        </div>

        {/* Choices — grid resizes by count for finger-friendly layout */}
        <div
          className={
            "mt-6 grid gap-3 " +
            (ex.choices.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3")
          }
        >
          {ex.choices.map((c) => {
            const isPicked = picked === c.id;
            const isCorrectChoice = revealed && c.id === ex.correctId;
            const isWrongPicked = revealed && isPicked && !isCorrectChoice;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => pick(c.id)}
                disabled={revealed}
                aria-pressed={isPicked}
                className="flex flex-col items-center gap-1.5 rounded-2xl border-2 px-3 py-5 transition active:scale-95"
                style={{
                  background: isCorrectChoice
                    ? "#dcfce7"
                    : isWrongPicked
                      ? "#fee2e2"
                      : isPicked
                        ? themeMeta.bg
                        : "#fff",
                  borderColor: isCorrectChoice
                    ? "#16a34a"
                    : isWrongPicked
                      ? "#dc2626"
                      : isPicked
                        ? themeMeta.color
                        : "var(--line)",
                  minHeight: 88,
                }}
              >
                <span aria-hidden className="text-[44px] leading-none sm:text-[52px]">
                  {c.emoji}
                </span>
                {c.label ? (
                  <span className="text-[15px] font-extrabold text-ink">{c.label}</span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed ? (
          <div
            role="status"
            className="mt-5 rounded-2xl px-4 py-3 text-[18px] font-extrabold"
            style={{
              background: correct ? "#dcfce7" : "#fef3c7",
              color: correct ? "#166534" : "#92400e",
            }}
          >
            {correct ? `⭐ ${ex.praise}` : "Try again — you can do it!"}
          </div>
        ) : null}

        {/* Action row */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {revealed && !correct ? (
            <button
              type="button"
              onClick={retry}
              className="la-btn ghost"
              style={{ padding: "12px 18px", fontSize: 15 }}
            >
              Try again
            </button>
          ) : null}
          <button
            type="button"
            onClick={next}
            className="la-btn"
            style={{
              padding: "14px 22px",
              fontSize: 16,
              background: revealed && correct ? themeMeta.color : undefined,
              opacity: revealed ? 1 : 0.55,
              pointerEvents: revealed ? "auto" : "none",
            }}
          >
            {index < total - 1 ? "Next →" : "Start over"}
          </button>
        </div>
      </section>

      {/* Footer hint for parents */}
      <p className="mt-6 text-center text-[11px] text-ink-mute">
        {THEMES.length} themes · {ALL_EXERCISES.length} exercises · works on phone & tablet
      </p>

      {/* Floating mic — speaks the current prompt aloud. Big enough for an adult finger. */}
      <button
        type="button"
        onClick={() => speak(ex.prompt)}
        aria-label="Hear the question again"
        className="fixed grid h-16 w-16 place-items-center rounded-full text-[28px] text-white"
        style={{
          right: "max(16px, env(safe-area-inset-right, 0px) + 12px)",
          bottom: "max(20px, env(safe-area-inset-bottom, 0px) + 12px)",
          background: themeMeta.color,
          boxShadow: `0 12px 24px ${themeMeta.color}55`,
        }}
      >
        🔊
      </button>
    </main>
  );
}
