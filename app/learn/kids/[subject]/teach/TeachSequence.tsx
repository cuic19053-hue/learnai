"use client";

/**
 * Milo's 30-second teaching warm-up.
 *
 * Three steps, very gentle:
 *   1. "This is {item}." — big visual + TTS auto-play
 *   2. "{item} is for {word}." — example emoji + TTS
 *   3. "Tap {item}." — 2 choices (correct + 1 distractor)
 *
 * After step 3 the screen flips to a "Great job! Let's play." card
 * with the Start Practice CTA. Stories skip step 3 (they're not a
 * quiz) and route to Start Story Time instead.
 *
 * Why this exists (pedagogy):
 *   - 3-year-olds need to be introduced to a concept before being
 *     tested. The "I do · we do · you do" gradient is the standard
 *     early-childhood scaffold.
 *   - Auto-play TTS is the primary teaching channel — they can't
 *     read yet. A "Hear again" button lets them replay at will.
 *   - One simple correct tap at the end builds confidence without
 *     judgement.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import KidsHeader from "@/components/learn/kids/KidsHeader";
import { useKidsAudio, speak, shutUp } from "@/components/learn/kids/audio";
import { findLanguage } from "@/lib/letterforge/languages";
import type { Subject } from "@/lib/letterforge/subjects";
import { getPack, subjectLabels } from "@/lib/letterforge/i18n";

type Phase = "step1" | "step2" | "step3" | "wrap";

/** Distractor item used in step 3 ("tap X, not Y"). One per subject;
 *  picked to be visually unambiguous against the day's item. */
const DISTRACTOR: Record<string, { item: string; emoji: string }> = {
  letters: { item: "B", emoji: "🅱️" },
  numbers: { item: "3", emoji: "3️⃣" },
  colors: { item: "Blue", emoji: "🟦" },
  shapes: { item: "Square", emoji: "⬛" },
  animals: { item: "Dog", emoji: "🐶" },
  feelings: { item: "Sad", emoji: "😢" },
  stories: { item: "", emoji: "" },
};

export default function TeachSequence({
  subject,
  langCode,
}: {
  subject: Subject;
  langCode: string;
}) {
  const lang = findLanguage(langCode);
  const t = getPack(langCode).ui;
  const labels = subjectLabels(langCode, subject.slug);
  const todayItem =
    subject.slug === "letters" ? lang.todayLetter : (labels.today?.item ?? subject.today.item);
  const todayWord =
    subject.slug === "letters" ? lang.todayWord : (labels.today?.word ?? subject.today.word);
  const todayEmoji =
    subject.slug === "letters"
      ? lang.todayEmoji
      : (labels.today?.wordEmoji ?? subject.today.wordEmoji);
  const description = (labels.today?.description ?? subject.today.description).replace(
    subject.today.item,
    todayItem
  );

  // Stories don't do a tap-test — go from step 2 straight to wrap.
  const isStory = subject.slug === "stories";
  const totalSteps = isStory ? 2 : 3;

  const [phase, setPhase] = useState<Phase>("step1");
  const stepIndex =
    phase === "step1" ? 1 : phase === "step2" ? 2 : phase === "step3" ? 3 : totalSteps;
  const playChime = useKidsAudio();

  // Auto-play TTS once per step. We rebuild the line per phase so it
  // localizes to the picked language.
  useEffect(() => {
    let line = "";
    if (phase === "step1") line = t.thisIs(todayItem);
    else if (phase === "step2") line = description;
    else if (phase === "step3") line = t.tapTheItem(todayItem);
    else if (phase === "wrap") line = t.greatLetsPlay;
    if (line) {
      const id = setTimeout(() => void speak(line, lang.code), 220);
      return () => {
        clearTimeout(id);
        shutUp();
      };
    }
  }, [phase, t, todayItem, description, lang.code]);

  function next() {
    if (phase === "step1") setPhase("step2");
    else if (phase === "step2") setPhase(isStory ? "wrap" : "step3");
    else if (phase === "step3") setPhase("wrap");
  }

  function hearAgain() {
    const line =
      phase === "step1"
        ? t.thisIs(todayItem)
        : phase === "step2"
          ? description
          : phase === "step3"
            ? t.tapTheItem(todayItem)
            : t.greatLetsPlay;
    void speak(line, lang.code);
  }

  function tapItem(correct: boolean) {
    if (!correct) {
      // Gentle nudge — speak the prompt again.
      hearAgain();
      return;
    }
    playChime("correct");
    void speak(t.greatLetsPlay, lang.code);
    setPhase("wrap");
  }

  const distractor = DISTRACTOR[subject.slug] ?? { item: "?", emoji: "❓" };
  const startHref = `/learn/kids/${subject.slug}/play?lang=${langCode}`;

  return (
    <main
      id="main"
      dir={lang.direction}
      style={{
        minHeight: "100vh",
        background: subject.gradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <KidsHeader
        langCode={langCode}
        title={labels.name}
        backHref={`/learn/kids/${subject.slug}?lang=${langCode}`}
        progressLabel={`${t.miloTeaches} · ${t.stepNofM(stepIndex, totalSteps)}`}
      />

      {/* Progress dots */}
      <div
        aria-hidden
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          padding: "8px 0",
        }}
      >
        {Array.from({ length: totalSteps }).map((_, i) => {
          const isFilled = i + 1 <= stepIndex;
          return (
            <span
              key={i}
              style={{
                width: isFilled ? 22 : 10,
                height: 10,
                borderRadius: 99,
                background: isFilled ? subject.accent : "rgba(154,52,18,.2)",
                transition: "width .25s",
              }}
            />
          );
        })}
      </div>

      {phase !== "wrap" ? (
        <TeachStep
          subject={subject}
          phase={phase}
          todayItem={todayItem}
          todayWord={todayWord}
          todayEmoji={todayEmoji}
          description={description}
          hearAgainLabel={t.hearAgain}
          nextLabel={t.imReady}
          tapPromptLabel={t.tapTheItem(todayItem)}
          distractor={distractor}
          onHear={hearAgain}
          onNext={next}
          onTap={tapItem}
        />
      ) : (
        <WrapScreen
          subject={subject}
          startHref={startHref}
          startLabel={isStory ? "▶ Start Story Time" : t.startPractice}
          greatLine={t.greatLetsPlay}
        />
      )}
    </main>
  );
}

function TeachStep({
  subject,
  phase,
  todayItem,
  todayWord,
  todayEmoji,
  description,
  hearAgainLabel,
  nextLabel,
  tapPromptLabel,
  distractor,
  onHear,
  onNext,
  onTap,
}: {
  subject: Subject;
  phase: Phase;
  todayItem: string;
  todayWord: string;
  todayEmoji: string;
  description: string;
  hearAgainLabel: string;
  nextLabel: string;
  tapPromptLabel: string;
  distractor: { item: string; emoji: string };
  onHear: () => void;
  onNext: () => void;
  onTap: (correct: boolean) => void;
}) {
  // What's visible at each step:
  //   step1 = big item (the letter / number / shape glyph / emoji)
  //   step2 = the example word's emoji big
  //   step3 = 2 tappable tiles
  const isShortItem = todayItem.length <= 2;
  const heroGlyph = phase === "step2" ? todayEmoji : isShortItem ? todayItem : subject.emoji;
  const heroFont = phase === "step2" ? 110 : isShortItem ? 130 : 88;

  return (
    <section
      style={{
        maxWidth: 540,
        margin: "0 auto",
        padding: "16px 18px 40px",
        display: "grid",
        justifyItems: "center",
        gap: 18,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Hero card */}
      <div
        style={{
          width: "min(260px, 70vw)",
          aspectRatio: "1 / 1",
          borderRadius: 36,
          background: "#fff",
          boxShadow: `0 18px 40px ${subject.accent}33`,
          display: "grid",
          placeItems: "center",
          animation: "kPopBig .5s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <span
          aria-hidden
          style={{
            fontSize: heroFont,
            fontWeight: 800,
            color: subject.accent,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {heroGlyph}
        </span>
      </div>

      {/* Spoken line */}
      <p
        aria-live="polite"
        style={{
          margin: 0,
          fontSize: "clamp(20px, 4.5vw, 26px)",
          fontWeight: 800,
          color: "#9a3412",
          lineHeight: 1.2,
        }}
      >
        {phase === "step1"
          ? `${todayItem} · ${todayWord}`
          : phase === "step2"
            ? description
            : tapPromptLabel}
      </p>

      {/* Hear again + Next (or 2 tap tiles for step3) */}
      {phase !== "step3" ? (
        <>
          <button type="button" onClick={onHear} style={pillBtnStyle(subject.accent)}>
            {hearAgainLabel}
          </button>
          <button
            type="button"
            onClick={onNext}
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
            }}
          >
            {nextLabel}
          </button>
        </>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 18,
              width: "100%",
            }}
          >
            <TapTile
              accent={subject.accent}
              label={todayItem}
              isShortItem={isShortItem}
              emoji={isShortItem ? null : subject.emoji}
              onTap={() => onTap(true)}
              correct
            />
            <TapTile
              accent="#9a3412"
              label={distractor.item}
              isShortItem={distractor.item.length <= 2}
              emoji={distractor.item.length <= 2 ? null : distractor.emoji}
              onTap={() => onTap(false)}
            />
          </div>
          <button type="button" onClick={onHear} style={pillBtnStyle(subject.accent)}>
            {hearAgainLabel}
          </button>
        </>
      )}
    </section>
  );
}

function TapTile({
  accent,
  label,
  emoji,
  isShortItem,
  onTap,
  correct,
}: {
  accent: string;
  label: string;
  emoji: string | null;
  isShortItem: boolean;
  onTap: () => void;
  correct?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={correct ? `Correct: ${label}` : label}
      style={{
        aspectRatio: "1 / 1",
        borderRadius: 28,
        background: "#fff",
        border: `4px ${correct ? "dashed" : "solid"} ${accent}40`,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 10px 24px rgba(0,0,0,.08)",
      }}
    >
      <span
        aria-hidden
        style={{
          fontSize: isShortItem ? 80 : 60,
          fontWeight: 800,
          color: accent,
          lineHeight: 1,
        }}
      >
        {emoji ?? label}
      </span>
    </button>
  );
}

function WrapScreen({
  subject,
  startHref,
  startLabel,
  greatLine,
}: {
  subject: Subject;
  startHref: string;
  startLabel: string;
  greatLine: string;
}) {
  return (
    <section
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "30px 18px 40px",
        display: "grid",
        justifyItems: "center",
        gap: 18,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ fontSize: 88 }} aria-hidden>
        🐯
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#9a3412", lineHeight: 1.2 }}>
        {greatLine}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            style={{
              fontSize: 36,
              animation: `kStarPop .5s ease-out`,
              animationDelay: `${s * 0.15}s`,
              animationFillMode: "backwards",
              color: "#f59e0b",
            }}
          >
            ⭐
          </span>
        ))}
      </div>
      <Link
        href={startHref}
        style={{
          padding: "18px 44px",
          borderRadius: 99,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff",
          fontSize: 20,
          fontWeight: 800,
          textDecoration: "none",
          boxShadow: "0 14px 30px rgba(34,197,94,.45)",
        }}
      >
        {startLabel}
      </Link>
      <style>{`
        @keyframes kPopBig {
          0%   { transform: scale(0.5); opacity: 0; }
          60%  { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes kStarPop {
          0%   { transform: scale(0.3) rotate(-30deg); opacity: 0; }
          60%  { transform: scale(1.2)  rotate(10deg); opacity: 1; }
          100% { transform: scale(1)    rotate(0); opacity: 1; }
        }
      `}</style>
      <p style={{ fontSize: 12, color: "#9a3412", opacity: 0.7 }}>
        {subject.slug === "stories" ? "" : "You'll see 6 short games. Have fun!"}
      </p>
    </section>
  );
}

function pillBtnStyle(accent: string): React.CSSProperties {
  return {
    padding: "12px 22px",
    borderRadius: 99,
    background: "#fff",
    border: `2px solid ${accent}`,
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: 15,
    fontWeight: 800,
    color: accent,
    boxShadow: `0 6px 16px ${accent}25`,
  };
}
