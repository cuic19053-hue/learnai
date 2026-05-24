"use client";

/**
 * 3-mini-game sequence for one subject.
 *
 * Renders one game at a time; advances on any successful interaction.
 * Game types come from the subject catalog. The player is deliberately
 * minimal — the goal is the *workflow* (one instruction → one tap →
 * one happy moment), not deep mechanics.
 *
 * Game renderers:
 *   - match    pick the right tile out of 2–3 options
 *   - count    items appear, child picks the right number
 *   - trace    a path with a finger (we accept any motion as "great")
 *   - build    tap blocks to fill a shape
 *   - listen   tap to hear Milo say it, then advance
 *
 * Every game ends on "Great job!"; the run ends on a 3-star reward.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import KidsHeader from "@/components/learn/kids/KidsHeader";
import SparkleBurst from "@/components/learn/kids/SparkleBurst";
import ExerciseStage from "@/components/learn/kids/ExerciseStage";
import { useKidsAudio, useSpeakOnce, speak } from "@/components/learn/kids/audio";
import { useXp } from "@/components/learn/kids/XpProvider";
import Milo from "@/components/learn/kids/Milo";
import { findLanguage } from "@/lib/letterforge/languages";
import {
  SUBJECT_LIST,
  nextTopicEnglish,
  type GameType,
  type Subject,
  type SubjectGame,
} from "@/lib/letterforge/subjects";
import { getPack, subjectLabels, type UiStrings } from "@/lib/letterforge/i18n";

/** Localize a single English topic key ("Blue" / "B" / "3") into the
 *  currently-picked language using the same per-language tables that
 *  drive the rest of the kids tree. Numbers and single letters pass
 *  through unchanged; word topics get a tiny lookup. */
function localizedItem(langCode: string, _slug: string, en: string): string {
  if (en.length <= 2) return en; // letter / digit / short token
  const map: Record<string, Record<string, string>> = {
    es: {
      Blue: "Azul",
      Yellow: "Amarillo",
      Green: "Verde",
      Orange: "Naranja",
      Purple: "Morado",
      Pink: "Rosa",
      Red: "Rojo",
      Square: "Cuadrado",
      Triangle: "Triángulo",
      Star: "Estrella",
      Heart: "Corazón",
      Circle: "Círculo",
      Elephant: "Elefante",
      Cat: "Gato",
      Dog: "Perro",
      Bird: "Pájaro",
      Bear: "Oso",
      Lion: "León",
      Sad: "Triste",
      Angry: "Enojado",
      Surprised: "Sorprendido",
      Calm: "Tranquilo",
      Excited: "Emocionado",
      Happy: "Feliz",
    },
    it: {
      Blue: "Blu",
      Yellow: "Giallo",
      Green: "Verde",
      Orange: "Arancione",
      Purple: "Viola",
      Pink: "Rosa",
      Red: "Rosso",
      Square: "Quadrato",
      Triangle: "Triangolo",
      Star: "Stella",
      Heart: "Cuore",
      Circle: "Cerchio",
      Elephant: "Elefante",
      Cat: "Gatto",
      Dog: "Cane",
      Bird: "Uccello",
      Bear: "Orso",
      Lion: "Leone",
      Sad: "Triste",
      Angry: "Arrabbiato",
      Surprised: "Sorpreso",
      Calm: "Calmo",
      Excited: "Eccitato",
      Happy: "Felice",
    },
    fr: {
      Blue: "Bleu",
      Yellow: "Jaune",
      Green: "Vert",
      Red: "Rouge",
      Square: "Carré",
      Triangle: "Triangle",
      Circle: "Cercle",
      Elephant: "Éléphant",
      Cat: "Chat",
      Dog: "Chien",
      Lion: "Lion",
      Sad: "Triste",
      Happy: "Content",
    },
    pt: {
      Blue: "Azul",
      Yellow: "Amarelo",
      Green: "Verde",
      Red: "Vermelho",
      Circle: "Círculo",
      Lion: "Leão",
      Happy: "Feliz",
      Sad: "Triste",
    },
    de: {
      Blue: "Blau",
      Yellow: "Gelb",
      Green: "Grün",
      Red: "Rot",
      Circle: "Kreis",
      Lion: "Löwe",
      Cat: "Katze",
      Dog: "Hund",
      Happy: "Glücklich",
      Sad: "Traurig",
    },
  };
  return map[(langCode || "en").toLowerCase()]?.[en] ?? en;
}
import { pickSessionExercises, type Exercise, type KidsTheme } from "@/lib/learn/kids/exercises";
import { localizeExercise, localizedLettersPool } from "@/lib/learn/kids/exercises-i18n";

const SESSION_LENGTH = 6;

/** Subject slug → exercise theme. Stories has no matching theme yet,
 *  so it falls back to the static game catalog. */
const SUBJECT_TO_THEME: Partial<Record<string, KidsTheme>> = {
  letters: "letters",
  numbers: "numbers",
  colors: "colors",
  shapes: "shapes",
  animals: "animals",
  feelings: "feelings",
  stories: "stories",
};

type Phase = "playing" | "between" | "reward";

export default function PlaySequence({
  subject,
  langCode,
}: {
  subject: Subject;
  langCode: string;
}) {
  const lang = findLanguage(langCode);
  const t = getPack(langCode).ui;
  const labels = subjectLabels(langCode, subject.slug);
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");

  // Resolve today's taught item up front so the exercise picker can
  // pin same-concept exercises first (teach=test coherence).
  const dayTarget =
    subject.slug === "letters" ? lang.todayLetter : (labels.today?.item ?? subject.today.item);

  // Pick today's exercise sequence from the rich catalog when this
  // subject maps to a theme. Falls back to the legacy 3-game shape
  // for Stories (and anything else without a catalog match).
  //
  // For LETTERS specifically: non-English locales use a native pool
  // (`localizedLettersPool`) because translating "Apple starts with A"
  // to "Mela starts with A" is broken (Mela starts with M). English
  // and any locale without a native pool fall back to the cross-
  // language catalog + word-by-word translation.
  const theme = SUBJECT_TO_THEME[subject.slug];
  const exercises = useMemo<Exercise[]>(() => {
    if (!theme) return [];
    if (theme === "letters") {
      const native = localizedLettersPool(langCode);
      if (native.length > 0) {
        // Day-stable shuffle of the native pool with a small bias
        // toward exercises whose letter matches today's target.
        const target = dayTarget;
        const scored = native
          .map((ex, i) => ({
            ex,
            score: ex.reference === target ? 10 : 0,
            tiebreak: i,
          }))
          .sort((a, b) => b.score - a.score || a.tiebreak - b.tiebreak);
        return scored.slice(0, SESSION_LENGTH).map((s) => s.ex);
      }
    }
    return pickSessionExercises(theme, SESSION_LENGTH, { targetItem: dayTarget });
  }, [theme, dayTarget, langCode]);
  const useExercises = exercises.length > 0;

  const total = useExercises ? exercises.length : subject.games.length;
  const current = useExercises ? null : subject.games[idx];
  // Localize prompts + choice labels into the picked language.
  // Falls back to English text for any string not yet translated, so
  // the screen is never blank — only mixed at worst, never broken.
  const rawExercise = useExercises ? exercises[idx] : null;
  const currentExercise = rawExercise ? localizeExercise(rawExercise, langCode) : null;

  // Letters: alphabet rotates with picked language. Others: i18n
  // override wins.
  const todayItem =
    subject.slug === "letters" ? lang.todayLetter : (labels.today?.item ?? subject.today.item);
  const todayWord =
    subject.slug === "letters" ? lang.todayWord : (labels.today?.word ?? subject.today.word);

  // Audio + visual feedback for every correct tap. `sparkleKey` is
  // monotonically bumped so the SparkleBurst replays each time.
  const playChime = useKidsAudio();
  const [sparkleKey, setSparkleKey] = useState(0);
  const xp = useXp();

  // Called the moment a correct tap lands. Fires the audio/visual
  // celebration but does NOT advance — the exercise stays on screen
  // with its praise line until the child taps Next →.
  function onSolved() {
    playChime("correct");
    setSparkleKey((k) => k + 1);
    // Record the correct tap: +5 XP, surprise bingo every 7th, streak
    // roll, achievement checks. RewardOverlay drains any unlock queue.
    xp.addCorrect(subject.slug);
  }
  // Used by the legacy static-game path (Stories) which still needs
  // the "Great job!" between screen.
  function finishStepLegacy() {
    onSolved();
    void speak(t.greatJob, lang.code);
    setTimeout(() => setPhase("between"), 850);
  }
  function nextStep() {
    if (idx + 1 >= total) {
      // +25 XP + sessionsCompleted++ when the whole sequence is done.
      xp.completeSession(subject.slug);
      setPhase("reward");
    } else {
      setIdx(idx + 1);
      setPhase("playing");
    }
  }
  function restart() {
    setIdx(0);
    setPhase("playing");
  }

  if (!useExercises && !current) return null;
  if (useExercises && !currentExercise) return null;

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
        onlyBrand
        backHref={`/learn/kids/${subject.slug}?lang=${langCode}`}
        progressLabel={phase === "reward" ? t.done : t.gameNofM(idx + 1, total)}
      />

      {/* Subject switcher — the child can change activity mid-session
          without going all the way home. Horizontal scroll on narrow
          screens. */}
      {phase !== "reward" ? (
        <SubjectSwitcher activeSlug={subject.slug} langCode={langCode} />
      ) : null}

      {phase === "playing" && useExercises && currentExercise ? (
        <div style={{ position: "relative" }}>
          <SparkleBurst trigger={sparkleKey} />
          <ExerciseStage
            exercise={currentExercise}
            langCode={langCode}
            onSolved={onSolved}
            onAdvance={() => {
              // Child tapped Next → after seeing the praise line.
              // Skip the "between" screen — the celebration already
              // happened inline on the exercise itself.
              if (idx + 1 >= total) {
                xp.completeSession(subject.slug);
                setPhase("reward");
              } else {
                setIdx(idx + 1);
                setPhase("playing");
              }
            }}
            nextLabel={t.nextLabel + " →"}
          />
        </div>
      ) : null}
      {phase === "playing" && !useExercises && current ? (
        <GameStage
          subject={subject}
          game={current}
          todayItem={todayItem}
          onSolved={finishStepLegacy}
          langCode={langCode}
          sparkleKey={sparkleKey}
        />
      ) : null}

      {phase === "between" ? (
        <BetweenScreen
          subject={subject}
          gameTitle={current?.title ?? currentExercise?.prompt ?? ""}
          onNext={nextStep}
          last={idx + 1 >= total}
          t={t}
        />
      ) : null}

      {phase === "reward" ? (
        <RewardScreen
          subject={subject}
          todayItem={todayItem}
          todayWord={todayWord}
          onPlayAgain={restart}
          langCode={langCode}
          t={t}
          nextTopicEn={nextTopicEnglish(subject.slug, subject.today.item)}
        />
      ) : null}
    </main>
  );
}

// ── Game stage dispatcher ─────────────────────────────────────────

function GameStage({
  subject,
  game,
  todayItem,
  onSolved,
  langCode,
  sparkleKey,
}: {
  subject: Subject;
  game: SubjectGame;
  todayItem: string;
  onSolved: () => void;
  langCode: string;
  sparkleKey: number;
}) {
  // Speak the prompt as the stage opens so the child hears what to
  // do, not just sees it. `useSpeakOnce` re-fires when the deps tuple
  // changes — i.e. on every new game in the sequence.
  useSpeakOnce(game.prompt, langCode, [game.id]);
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
      <SparkleBurst trigger={sparkleKey} />
      <MiloBubble bouncy={sparkleKey > 0}>
        <span style={{ fontSize: 17, fontWeight: 800, color: "#9a3412" }}>{game.prompt}</span>
      </MiloBubble>

      <GameRenderer
        type={game.type}
        subject={subject}
        game={game}
        todayItem={todayItem}
        onSolved={onSolved}
      />
    </section>
  );
}

function GameRenderer({
  type,
  subject,
  game,
  todayItem,
  onSolved,
}: {
  type: GameType;
  subject: Subject;
  game: SubjectGame;
  todayItem: string;
  onSolved: () => void;
}) {
  switch (type) {
    case "match":
      return <MatchStage subject={subject} game={game} todayItem={todayItem} onSolved={onSolved} />;
    case "count":
      return <CountStage subject={subject} todayItem={todayItem} onSolved={onSolved} />;
    case "trace":
      return <TraceStage subject={subject} todayItem={todayItem} onSolved={onSolved} />;
    case "build":
      return <BuildStage subject={subject} todayItem={todayItem} onSolved={onSolved} />;
    case "listen":
      return <ListenStage subject={subject} todayItem={todayItem} onSolved={onSolved} />;
  }
}

// ── Individual game renderers ─────────────────────────────────────
// All deliberately tolerant: any tap progresses. The point is the
// workflow + Milo's praise loop, not a strict win condition.

function MatchStage({
  subject,
  game,
  todayItem,
  onSolved,
}: {
  subject: Subject;
  game: SubjectGame;
  todayItem: string;
  onSolved: () => void;
}) {
  // Two garages — one correct, one distractor. Per the spec, 2 options
  // is the right call for 3-year-olds: less to scan, harder to mis-tap.
  // The correct garage has a green dashed ring so it visually invites
  // the drop; the distractor is muted but tappable (and forgiving).
  const correctIdx = 0;
  const options = [0, 1];
  const distractor =
    subject.slug === "letters" && todayItem === "A"
      ? "B"
      : subject.slug === "letters"
        ? "B"
        : subject.slug === "numbers"
          ? "?"
          : "·";
  return (
    <div style={{ display: "grid", gap: 18 }}>
      {/* Item card up top (the thing being placed). */}
      <div
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          justifySelf: "center",
        }}
      >
        <div style={{ fontSize: 72 }} aria-hidden>
          {game.emoji}
        </div>
        <div
          style={{
            marginTop: -8,
            padding: "4px 14px",
            borderRadius: 99,
            background: subject.accent,
            color: "#fff",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {todayItem}
        </div>
      </div>

      {/* Two garages. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
          justifyContent: "center",
        }}
      >
        {options.map((i) => {
          const isCorrect = i === correctIdx;
          const display = isCorrect ? todayItem : distractor;
          return (
            <button
              key={i}
              type="button"
              onClick={() => isCorrect && onSolved()}
              style={{
                aspectRatio: "1 / 1",
                maxWidth: 200,
                borderRadius: 24,
                background: "#fff",
                border: isCorrect ? "4px dashed #22c55e" : "4px dashed #fde68a",
                cursor: "pointer",
                fontFamily: "inherit",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 10px 24px rgba(0,0,0,.08)",
                margin: "0 auto",
                width: "100%",
              }}
              aria-label={isCorrect ? `Correct garage: ${todayItem}` : "Other garage"}
            >
              <div style={{ fontSize: 44 }} aria-hidden>
                🏠
              </div>
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 800,
                  color: isCorrect ? "#22c55e" : "#9a3412",
                  marginTop: -8,
                }}
              >
                {display}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CountStage({
  subject,
  todayItem,
  onSolved,
}: {
  subject: Subject;
  todayItem: string;
  onSolved: () => void;
}) {
  const n = Number.parseInt(todayItem, 10);
  const target = Number.isFinite(n) && n > 0 ? Math.min(5, n) : 2;
  const [tapped, setTapped] = useState(0);
  const choices = [target - 1, target, target + 1].filter((c) => c > 0);
  const stage = tapped < target ? "tapping" : "choosing";

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          padding: "18px 14px",
          borderRadius: 28,
          background: "#fff",
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          boxShadow: "0 8px 22px rgba(0,0,0,.06)",
        }}
      >
        {Array.from({ length: target }).map((_, i) => {
          const isTapped = i < tapped;
          return (
            <button
              type="button"
              key={i}
              onClick={() => stage === "tapping" && setTapped((t) => Math.min(target, t + 1))}
              aria-label={isTapped ? `Apple ${i + 1} counted` : "Tap to count"}
              style={{
                fontSize: 64,
                background: "transparent",
                border: "none",
                cursor: stage === "tapping" ? "pointer" : "default",
                position: "relative",
                padding: 4,
              }}
            >
              {subject.today.wordEmoji}
              {isTapped ? (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    width: 24,
                    height: 24,
                    borderRadius: 99,
                    background: "#22c55e",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 800,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  {i + 1}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {stage === "choosing" ? (
        <div
          style={{
            display: "flex",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {choices.map((c) => (
            <button
              type="button"
              key={c}
              onClick={() => c === target && onSolved()}
              style={{
                width: 100,
                height: 100,
                borderRadius: 24,
                background: c === target ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#fff",
                color: c === target ? "#fff" : "#9a3412",
                border: c === target ? "none" : "3px solid #fde68a",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 54,
                fontWeight: 800,
                boxShadow: "0 8px 22px rgba(0,0,0,.08)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 13, color: "#9a3412", opacity: 0.7, textAlign: "center" }}>
          Tap each {subject.today.wordEmoji} to count it.
        </p>
      )}
    </div>
  );
}

function TraceStage({
  subject,
  todayItem,
  onSolved,
}: {
  subject: Subject;
  todayItem: string;
  onSolved: () => void;
}) {
  const [progress, setProgress] = useState(0);
  // 6 dots to "drive over" — any pointer activity counts. We accept
  // the run once 4 dots are touched. No fail state.
  const dots = [0, 1, 2, 3, 4, 5];
  const done = progress >= 4;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        onPointerMove={() => setProgress((p) => Math.min(6, p + 1))}
        onPointerDown={() => setProgress((p) => Math.min(6, p + 1))}
        style={{
          height: 240,
          borderRadius: 28,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 18,
          padding: "0 20px",
          touchAction: "none",
          cursor: "crosshair",
          boxShadow: "0 8px 22px rgba(0,0,0,.06)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 14,
            left: 18,
            fontSize: 56,
            fontWeight: 800,
            color: subject.accent,
            opacity: 0.18,
          }}
          aria-hidden
        >
          {todayItem}
        </div>
        {dots.map((d) => (
          <span
            key={d}
            style={{
              width: 28,
              height: 28,
              borderRadius: 99,
              background: progress > d ? subject.accent : "#fde68a",
              boxShadow: progress > d ? `0 0 0 6px ${subject.accent}22` : "none",
              transition: "background .2s",
            }}
          />
        ))}
      </div>
      <button
        type="button"
        disabled={!done}
        onClick={onSolved}
        style={{
          padding: "14px 28px",
          borderRadius: 99,
          background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#fde68a",
          color: done ? "#fff" : "#9a3412",
          border: "none",
          fontFamily: "inherit",
          fontSize: 17,
          fontWeight: 800,
          cursor: done ? "pointer" : "default",
          opacity: done ? 1 : 0.7,
          justifySelf: "center",
        }}
      >
        I did it! ✓
      </button>
    </div>
  );
}

function BuildStage({
  subject,
  todayItem: _todayItem,
  onSolved,
}: {
  subject: Subject;
  todayItem: string;
  onSolved: () => void;
}) {
  const [filled, setFilled] = useState<number[]>([]);
  const cells = Array.from({ length: 9 });
  const target = 5;
  const done = filled.length >= target;
  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          padding: 18,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 8px 22px rgba(0,0,0,.06)",
          display: "grid",
          gridTemplateColumns: "repeat(3, 70px)",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {cells.map((_, i) => {
          const on = filled.includes(i);
          return (
            <button
              type="button"
              key={i}
              onClick={() => setFilled((prev) => (prev.includes(i) ? prev : [...prev, i]))}
              aria-label={on ? `Block ${i + 1} placed` : "Place block"}
              style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                background: on ? subject.accent : "#fff1d6",
                border: on ? "none" : "2px dashed #fde68a",
                cursor: "pointer",
                fontSize: 30,
                color: "#fff",
                fontWeight: 800,
                display: "grid",
                placeItems: "center",
                transition: "background .2s",
              }}
            >
              {on ? "🧱" : ""}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={!done}
        onClick={onSolved}
        style={{
          padding: "14px 28px",
          borderRadius: 99,
          background: done ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#fde68a",
          color: done ? "#fff" : "#9a3412",
          border: "none",
          fontFamily: "inherit",
          fontSize: 17,
          fontWeight: 800,
          cursor: done ? "pointer" : "default",
          opacity: done ? 1 : 0.7,
          justifySelf: "center",
        }}
      >
        Done building! ✓
      </button>
    </div>
  );
}

function ListenStage({
  subject,
  todayItem,
  onSolved,
}: {
  subject: Subject;
  todayItem: string;
  onSolved: () => void;
}) {
  const [played, setPlayed] = useState(false);
  function play() {
    setPlayed(true);
    if (typeof window === "undefined") return;
    try {
      const utter = new SpeechSynthesisUtterance(subject.today.word);
      utter.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {
      /* silent */
    }
  }
  return (
    <div style={{ display: "grid", gap: 18, justifyItems: "center" }}>
      <button
        type="button"
        onClick={play}
        aria-label={`Hear ${subject.today.word}`}
        style={{
          width: 140,
          height: 140,
          borderRadius: 99,
          background: `linear-gradient(135deg, ${subject.accent}, #f59e0b)`,
          border: "none",
          cursor: "pointer",
          color: "#fff",
          fontSize: 64,
          boxShadow: `0 14px 28px ${subject.accent}55`,
        }}
      >
        🔊
      </button>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#9a3412" }}>
        Tap to hear &ldquo;{todayItem}&rdquo;
      </div>
      <button
        type="button"
        disabled={!played}
        onClick={onSolved}
        style={{
          padding: "14px 28px",
          borderRadius: 99,
          background: played ? "linear-gradient(135deg,#22c55e,#16a34a)" : "#fde68a",
          color: played ? "#fff" : "#9a3412",
          border: "none",
          fontFamily: "inherit",
          fontSize: 17,
          fontWeight: 800,
          cursor: played ? "pointer" : "default",
          opacity: played ? 1 : 0.7,
        }}
      >
        Continue
      </button>
    </div>
  );
}

// ── Between-game + reward screens ─────────────────────────────────

function BetweenScreen({
  subject,
  gameTitle,
  onNext,
  last,
  t,
}: {
  subject: Subject;
  gameTitle: string;
  onNext: () => void;
  last: boolean;
  t: UiStrings;
}) {
  return (
    <section
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "60px 18px 40px",
        display: "grid",
        gap: 16,
        justifyItems: "center",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div style={{ fontSize: 88 }} aria-hidden>
        🎉
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#9a3412" }}>{t.greatJob}</div>
      <div style={{ fontSize: 14, color: "#9a3412", opacity: 0.75, maxWidth: 340 }}>
        {gameTitle} — done!
      </div>
      <button
        type="button"
        onClick={onNext}
        style={{
          padding: "16px 36px",
          borderRadius: 99,
          background: `linear-gradient(135deg, ${subject.accent}, #f59e0b)`,
          color: "#fff",
          border: "none",
          fontFamily: "inherit",
          fontSize: 18,
          fontWeight: 800,
          cursor: "pointer",
          boxShadow: `0 12px 26px ${subject.accent}55`,
        }}
      >
        {last ? t.seeReward : t.nextLabel}
      </button>
    </section>
  );
}

function RewardScreen({
  subject,
  todayItem,
  todayWord,
  onPlayAgain,
  langCode,
  t,
  nextTopicEn,
}: {
  subject: Subject;
  todayItem: string;
  todayWord: string;
  onPlayAgain: () => void;
  langCode: string;
  t: UiStrings;
  /** English next-topic key (e.g. "Blue", "B", "3"). Null = the world
   *  is complete; the reward screen suggests trying another world. */
  nextTopicEn: string | null;
}) {
  // Three stars pop in with ascending bell chimes; the lesson ends
  // on a tiny fanfare and Milo speaks the "you learned X" praise.
  const [showStars, setShowStars] = useState<number>(0);
  const playChime = useKidsAudio();
  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowStars(1);
      playChime("star1");
    }, 200);
    const t2 = setTimeout(() => {
      setShowStars(2);
      playChime("star2");
    }, 600);
    const t3 = setTimeout(() => {
      setShowStars(3);
      playChime("star3");
    }, 1000);
    const t4 = setTimeout(() => {
      playChime("complete");
      void speak(t.youLearned(todayItem), langCode);
    }, 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);
  return (
    <section
      style={{
        maxWidth: 480,
        margin: "0 auto",
        padding: "60px 18px 40px",
        display: "grid",
        gap: 18,
        justifyItems: "center",
        textAlign: "center",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Milo size={112} />

      <div style={{ fontSize: 26, fontWeight: 800, color: "#9a3412" }}>
        {t.youLearned(todayItem)}
      </div>
      <div style={{ fontSize: 16, color: "#9a3412", opacity: 0.75 }}>
        {todayItem} is for {todayWord} {subject.today.wordEmoji}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        {[1, 2, 3].map((s) => (
          <span
            key={s}
            style={{
              width: 56,
              height: 56,
              borderRadius: 99,
              background: showStars >= s ? "#f59e0b" : "rgba(0,0,0,.08)",
              color: "#fff",
              fontSize: 28,
              display: "grid",
              placeItems: "center",
              boxShadow: showStars >= s ? "0 6px 14px rgba(245,158,11,.45)" : "none",
              transition: "background .2s, box-shadow .2s",
            }}
          >
            ★
          </span>
        ))}
      </div>
      {/* Primary action — continue the learning journey. When there's
          a next topic in the world's sequence we suggest it explicitly
          ("Continue: Learn Blue"). When the world is complete the CTA
          rotates to "Try Numbers" / similar so the child still has a
          forward step instead of a dead-end. */}
      {nextTopicEn ? (
        <Link
          href={`/learn/kids/${subject.slug}/teach?lang=${langCode}`}
          style={{
            marginTop: 18,
            padding: "18px 36px",
            borderRadius: 99,
            background: `linear-gradient(135deg, ${subject.accent}, #f59e0b)`,
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: `0 14px 30px ${subject.accent}55`,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          ▶ {t.continueLearn(localizedItem(langCode, subject.slug, nextTopicEn))}
        </Link>
      ) : (
        <Link
          href={`/learn/kids?lang=${langCode}`}
          style={{
            marginTop: 18,
            padding: "18px 36px",
            borderRadius: 99,
            background: "linear-gradient(135deg, #f59e0b, #ec4899)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 14px 30px rgba(245,158,11,.45)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          🏆 {t.worldComplete}
        </Link>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          marginTop: 14,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          type="button"
          onClick={onPlayAgain}
          style={{
            padding: "14px 28px",
            borderRadius: 99,
            background: "#fff",
            border: "2px solid #fde68a",
            color: "#9a3412",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {t.playAgain}
        </button>
        <Link
          href={`/learn/kids?lang=${langCode}`}
          style={{
            padding: "14px 28px",
            borderRadius: 99,
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            color: "#fff",
            fontFamily: "inherit",
            fontSize: 15,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 10px 22px rgba(34,197,94,.45)",
          }}
        >
          {t.backHome}
        </Link>
      </div>
    </section>
  );
}

// ── Tiny shared bits ──────────────────────────────────────────────

function MiloBubble({ children, bouncy }: { children: React.ReactNode; bouncy?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderRadius: 24,
        background: "#fff",
        boxShadow: "0 6px 18px rgba(0,0,0,.08)",
        maxWidth: 540,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 99,
          background: "radial-gradient(circle at 40% 35%, #fde68a, #f59e0b)",
          display: "grid",
          placeItems: "center",
          fontSize: 30,
          flexShrink: 0,
          animation: bouncy ? "kBounce .6s ease-in-out 2" : undefined,
        }}
        aria-hidden
      >
        <Milo size={48} />
      </div>
      <div style={{ flex: 1, textAlign: "start" }}>{children}</div>
    </div>
  );
}

/**
 * Inline subject tabs so a 3-year-old can swap activity mid-session
 * (the behaviour the old /learn/lesson/kids surface had at the top).
 * Tapping a tab navigates straight to that subject's play, picking a
 * fresh 6-exercise sequence for the day.
 */
function SubjectSwitcher({ activeSlug, langCode }: { activeSlug: string; langCode: string }) {
  // Outer scroller spans the viewport so the row CAN scroll on narrow
  // phones; the inner flex group has `margin: 0 auto` so on desktop —
  // where all 7 pills fit — it sits centered, matching the centered
  // activity below. Same trick as a min-content container.
  return (
    <nav
      aria-label="Switch activity"
      style={{
        display: "flex",
        justifyContent: "center",
        overflowX: "auto",
        padding: "12px 16px 8px",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          margin: "0 auto",
          flexShrink: 0,
          maxWidth: 980,
        }}
      >
        {SUBJECT_LIST.map((s) => {
          const sl = subjectLabels(langCode, s.slug);
          const active = s.slug === activeSlug;
          return (
            <Link
              key={s.slug}
              href={`/learn/kids/${s.slug}/play?lang=${langCode}`}
              aria-current={active ? "page" : undefined}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                height: 44,
                padding: "0 18px",
                borderRadius: 99,
                background: active ? s.accent : "#fff",
                color: active ? "#fff" : "#9a3412",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                whiteSpace: "nowrap",
                boxShadow: active ? `0 8px 20px ${s.accent}55` : "0 6px 14px rgba(120,60,40,.08)",
                border: active ? "none" : "2px solid transparent",
                flexShrink: 0,
              }}
            >
              <span aria-hidden style={{ fontSize: 16 }}>
                {s.emoji}
              </span>
              <span>{sl.short}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
