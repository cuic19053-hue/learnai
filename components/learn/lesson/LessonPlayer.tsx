"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import ImgSlot from "@/components/design/ImgSlot";
import { Arrow } from "@/components/design/icons";
import { LOOP } from "@/lib/learn/loop";
import type { Journey } from "@/lib/learn/journeys";
import { stageToPath } from "@/lib/learn/stages";
import LoopProgressStrip from "./LoopProgressStrip";

/** Drop targets for the volcano cross-section practice. */
type Target = {
  id: string;
  label: string;
  /** Position on the diagram, expressed as a percentage. */
  x: string;
  y: string;
};

/** Draggable label tokens for the practice tray. */
type Token = { id: string; label: string; emoji: string };

const TARGETS: Target[] = [
  { id: "magma", label: "Magma chamber", x: "18%", y: "55%" },
  { id: "vent", label: "Vent", x: "50%", y: "40%" },
  { id: "ash", label: "Ash cloud", x: "78%", y: "15%" },
];

const TOKENS: Token[] = [
  { id: "magma", emoji: "🟠", label: "Magma chamber" },
  { id: "ash", emoji: "☁️", label: "Ash cloud" },
  { id: "crust", emoji: "🪨", label: "Crust" },
  { id: "lava", emoji: "🔥", label: "Lava flow" },
];

const HINT_LADDER = [
  { emoji: "💡", text: "It’s deep underground." },
  { emoji: "🌋", text: "It’s where the magma collects." },
  { emoji: "🔬", text: "Look at the bottom layer of the diagram." },
];

type LessonPlayerProps = {
  journey: Journey;
  teacherName?: string;
  teacherEmoji?: string;
  /** Optional override for the displayed lesson title. */
  title?: string;
  subject?: string;
};

export default function LessonPlayer({
  journey,
  teacherName = "Rex",
  teacherEmoji = "🦊",
  title = "Why does a volcano erupt? 🌋",
  subject = "Science",
}: LessonPlayerProps) {
  // Practice step (3 of 6) — initial state matches the design preview:
  // "Vent" already correctly placed.
  const PRACTICE_STEP = 2;
  const [placed, setPlaced] = useState<Record<string, string | null>>({
    magma: null,
    vent: "vent",
    ash: null,
  });
  const [picked, setPicked] = useState<Token | null>(null);
  const [feedback, setFeedback] = useState<string | null>(
    "Nice — that vent is right! Magma comes up through the vent. Now: where does the magma start?",
  );
  const [hintsRevealed, setHintsRevealed] = useState(2);

  const remainingTokens = useMemo(
    () =>
      TOKENS.filter((t) => {
        // A token disappears from the tray once it has been correctly placed.
        return !Object.entries(placed).some(([targetId, val]) => val === t.id && targetId === t.id);
      }),
    [placed],
  );

  const placedCount = Object.values(placed).filter((v) => v !== null).length;
  const allCorrect = placedCount === TARGETS.length;
  const stagePill = LOOP[PRACTICE_STEP];

  function tryPlace(targetId: string, tokenId: string) {
    if (targetId === tokenId) {
      setPlaced((p) => ({ ...p, [targetId]: tokenId }));
      setPicked(null);
      setFeedback(`Yes — ${labelFor(tokenId)} is right where it goes.`);
    } else {
      setFeedback(
        `Not quite. Try a different spot for "${labelFor(tokenId)}". You can keep going.`,
      );
    }
  }

  function unlockNextHint() {
    setHintsRevealed((n) => Math.min(HINT_LADDER.length, n + 1));
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ───── Header ───── */}
      <header
        className="flex items-center justify-between border-b border-line-soft bg-white px-4 md:px-6"
        style={{ height: 60 }}
      >
        <div className="flex items-center gap-4">
          <Link
            href={stageToPath(journey.stage)}
            aria-label="Back to home"
            className="text-lg text-ink-mute hover:text-ink"
          >
            ←
          </Link>
          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.06em]"
              style={{ color: journey.color }}
            >
              {journey.name} · {subject}
            </div>
            <div className="text-sm font-bold text-ink">{title}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-ink-soft sm:inline">⏱ 4:21 elapsed</span>
          <span className="la-pill" style={{ background: "#fff7e6", color: "#b15c00" }}>
            +30 XP
          </span>
        </div>
      </header>

      {/* ───── Loop progress strip ───── */}
      <LoopProgressStrip step={PRACTICE_STEP} />

      {/* ───── Main: practice stage + teacher panel ───── */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        <main id="main" className="overflow-auto px-5 py-7 md:px-12">
          <span
            className="la-pill"
            style={{ background: `${stagePill.color}18`, color: stagePill.color }}
          >
            {stagePill.icon} Step {PRACTICE_STEP + 1} · {stagePill.label}
          </span>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[30px]">
            Drag each label to the correct part of the volcano
          </h1>
          <p className="mb-6 mt-1.5 text-sm text-ink-soft">
            You&apos;ll get instant feedback after each drop. {TARGETS.length - placedCount} left.
          </p>

          {/* Diagram */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-line-soft"
            style={{
              height: 300,
              background: "linear-gradient(180deg, #fef9e7 0%, #fde2c8 60%, #f8b78a 100%)",
            }}
          >
            <ImgSlot
              label="🌋 Cross-section diagram (volcano)"
              height={300}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 0,
                border: "none",
                background: "transparent",
              }}
            />

            {TARGETS.map((t) => {
              const correctTokenId = placed[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (picked) tryPlace(t.id, picked.id);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const tokenId = e.dataTransfer.getData("text/plain");
                    if (tokenId) tryPlace(t.id, tokenId);
                  }}
                  aria-label={
                    correctTokenId
                      ? `Correctly placed: ${t.label}`
                      : `Drop target for ${t.label}`
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: t.x,
                    top: t.y,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: correctTokenId ? "#fff" : "rgba(255,255,255,.6)",
                    border: `2px ${correctTokenId ? `solid ${journey.color}` : "dashed rgba(15,20,48,.3)"}`,
                    color: correctTokenId ? journey.color : "var(--ink-soft)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {correctTokenId ? `✓ ${t.label}` : "? Drop here"}
                </button>
              );
            })}
          </div>

          {/* Drag tray */}
          <div className="mt-5">
            <div className="la-mono mb-2 text-[12px] font-bold tracking-[0.06em] text-ink-mute">
              DRAG OR TAP A LABEL
            </div>
            <div className="flex flex-wrap gap-2.5">
              {remainingTokens.length === 0 ? (
                <p className="text-sm text-ink-soft">All labels placed. Great work.</p>
              ) : (
                remainingTokens.map((c) => {
                  const selected = picked?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                      }}
                      onClick={() => setPicked(selected ? null : c)}
                      aria-pressed={selected}
                      className="flex cursor-grab items-center gap-2 rounded-xl border bg-white px-3.5 py-3 text-[13px] font-bold"
                      style={{
                        borderColor: selected ? journey.color : "var(--line)",
                        boxShadow: selected
                          ? `0 0 0 4px ${journey.color}1a, var(--shadow-1)`
                          : "var(--shadow-1)",
                      }}
                    >
                      <span aria-hidden>{c.emoji}</span> {c.label}
                    </button>
                  );
                })
              )}
            </div>
            {picked ? (
              <p className="mt-3 text-xs text-ink-soft">
                Now tap the spot on the diagram to drop “{picked.label}”.
              </p>
            ) : null}
          </div>
        </main>

        {/* Teacher panel */}
        <aside
          className="flex flex-col gap-3 border-t border-line-soft p-5 lg:border-l lg:border-t-0"
          style={{ background: "#fbfbff" }}
        >
          <div className="flex items-center gap-2.5">
            <PersonaAvatar
              emoji={teacherEmoji}
              color={journey.color}
              bg={journey.bg}
              size={40}
            />
            <div>
              <div className="text-sm font-bold text-ink">{teacherName}</div>
              <div className="text-[11px] text-ink-soft">Your AI teacher</div>
            </div>
            <button
              type="button"
              className="ml-auto text-base text-ink-mute hover:text-ink"
              aria-label="Read aloud"
            >
              🔊
            </button>
          </div>

          <div
            aria-live="polite"
            className="rounded-2xl p-3.5 text-[13px] leading-relaxed"
            style={{
              background: journey.soft,
              border: `1px solid ${journey.bg}`,
              color: "var(--ink)",
            }}
          >
            <strong style={{ color: journey.color }}>
              {allCorrect ? "All placed — beautiful!" : "Live feedback"}
            </strong>
            <br />
            {feedback ?? "Pick a label, then tap the diagram to drop it."}
          </div>

          <div className="la-mono text-[11px] font-bold tracking-[0.06em] text-ink-mute">
            HINTS
          </div>
          <div className="flex flex-col gap-2">
            {HINT_LADDER.map((h, i) => {
              const unlocked = i < hintsRevealed;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px]"
                  style={{
                    borderRadius: 10,
                    background: unlocked ? "#fff" : "transparent",
                    border: unlocked
                      ? "1px solid var(--line-soft)"
                      : "1px dashed var(--line)",
                    color: unlocked ? "var(--ink)" : "var(--ink-mute)",
                  }}
                >
                  <span aria-hidden>{h.emoji}</span>
                  {unlocked ? h.text : null}
                  {!unlocked && i === hintsRevealed ? (
                    <button
                      type="button"
                      onClick={unlockNextHint}
                      className="font-semibold text-ink"
                    >
                      🔓 Unlock next hint (-2 XP)
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <AdaptiveTuning />
        </aside>
      </div>

      {/* ───── Footer controls ───── */}
      <footer
        className="flex items-center justify-between border-t border-line-soft bg-white px-4 md:px-6"
        style={{ height: 64 }}
      >
        <div className="flex flex-wrap gap-2">
          <button type="button" className="la-btn ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
            Pause
          </button>
          <button
            type="button"
            className="la-btn ghost hidden sm:inline-flex"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            Skip step
          </button>
          <button
            type="button"
            className="la-btn ghost hidden md:inline-flex"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            Make it easier
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-mute sm:inline">
            {placedCount} / {TARGETS.length} labels placed
          </span>
          <button
            type="button"
            disabled={!allCorrect}
            className="la-btn"
            style={{ padding: "12px 18px", opacity: allCorrect ? 1 : 0.6 }}
          >
            Continue to feedback <Arrow />
          </button>
        </div>
      </footer>
    </div>
  );
}

function labelFor(id: string): string {
  return TOKENS.find((t) => t.id === id)?.label ?? id;
}

function AdaptiveTuning() {
  return (
    <div className="mt-auto">
      <div className="la-mono text-[10px] font-bold tracking-[0.06em] text-ink-mute">
        ADAPTIVE TUNING
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {[
          "📖 Reading: grade 4",
          "⏱ Pace: medium",
          "🎯 Goal: curiosity",
        ].map((p) => (
          <span
            key={p}
            className="la-pill text-[11px]"
            style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
