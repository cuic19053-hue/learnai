"use client";

import { useState } from "react";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { LOOP } from "@/lib/learn/loop";
import { stageToPath } from "@/lib/learn/stages";
import type { Journey } from "@/lib/learn/journeys";

type SeniorLessonProps = {
  journey: Journey;
};

const PRACTICE_INDEX = 2;

/**
 * Senior lesson surface — same six-step Loop, but a calm one-question
 * format with two giant choice buttons, large type, and helpers
 * (Read aloud / Bigger text). The interaction is a single-question
 * scam-detection check; the right answer is "scam".
 */
export default function SeniorLesson({ journey }: SeniorLessonProps) {
  const [picked, setPicked] = useState<"scam" | "real" | null>(null);
  const [bigText, setBigText] = useState(false);

  const correct = picked === "scam";
  const baseFont = bigText ? 19 : 17;

  return (
    <main
      id="main"
      className="mx-auto min-h-screen max-w-[560px] bg-white"
      style={{ fontSize: baseFont }}
    >
      {/* ───── Top bar ───── */}
      <div className="flex items-center justify-between border-b border-line-soft bg-white px-5 py-4">
        <Link
          href={stageToPath(journey.stage)}
          className="text-[22px] text-ink-mute hover:text-ink"
          aria-label="Back"
        >
          ←
        </Link>
        <div className="text-sm font-bold text-ink">Lesson 3 of 5</div>
        <button
          type="button"
          className="text-[22px] text-ink-mute hover:text-ink"
          aria-label="Menu"
        >
          ≡
        </button>
      </div>

      {/* ───── Loop progress (compact dots, Practice expanded) ───── */}
      <div className="flex items-center justify-center gap-1.5 px-5 py-3.5">
        {LOOP.map((l, i) => {
          const done = i <= PRACTICE_INDEX;
          const active = i === PRACTICE_INDEX;
          return (
            <div
              key={l.n}
              className="flex h-3 items-center justify-center rounded-full text-[10px] font-extrabold text-white"
              style={{
                width: active ? 64 : 12,
                background: done ? l.color : "var(--line)",
                transition: "all .2s",
              }}
              aria-label={active ? `Step ${l.n} ${l.label}, current` : `${l.label}`}
            >
              {active ? "PRACTICE" : null}
            </div>
          );
        })}
      </div>

      {/* ───── Question + email card + answer buttons ───── */}
      <div className="px-[22px] pb-12 pt-2">
        <h1
          className="leading-[1.25] tracking-[-0.01em] text-ink"
          style={{ fontSize: bigText ? 32 : 28, margin: "12px 0 8px" }}
        >
          Is this message a <span style={{ color: journey.color }}>scam</span>?
        </h1>
        <p className="mb-5 leading-[1.5] text-ink-soft" style={{ fontSize: bigText ? 19 : 17 }}>
          Take your time. Read it carefully, then tell me what you think.
        </p>

        {/* Fake email card */}
        <article
          className="mb-5 rounded-2xl border border-line bg-[#f4f5fb] p-[18px]"
          aria-label="Email message"
        >
          <header className="mb-2.5 flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-full text-base"
              style={{ background: "#dde3f0" }}
              aria-hidden
            >
              📧
            </div>
            <div>
              <div className="text-sm font-bold text-ink">Your-Bank Security</div>
              <div className="text-[12px] text-ink-mute">support@your-bank.security-help.co</div>
            </div>
          </header>
          <p className="leading-[1.55] text-ink" style={{ fontSize: bigText ? 18 : 16 }}>
            <strong>Urgent:</strong> we have detected suspicious activity on your account. Click{" "}
            <span className="text-brand-1 underline">this link</span> within 24 hours to verify your
            identity, or your account will be suspended.
          </p>
        </article>

        <div className="mb-2.5 text-center text-sm font-bold text-ink-mute">What do you think?</div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => setPicked("scam")}
            aria-pressed={picked === "scam"}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-5 text-lg font-extrabold"
            style={{
              borderRadius: 18,
              border: `2px solid ${journey.color}`,
              background: picked === "scam" ? journey.color : journey.bg,
              color: picked === "scam" ? "#fff" : journey.color,
              fontSize: bigText ? 22 : 18,
            }}
          >
            🚩 This is a scam
          </button>
          <button
            type="button"
            onClick={() => setPicked("real")}
            aria-pressed={picked === "real"}
            className="flex w-full items-center justify-center gap-2.5 px-4 py-5 font-bold text-ink-soft"
            style={{
              borderRadius: 18,
              border: `2px solid ${picked === "real" ? "#ef4444" : "var(--line)"}`,
              background: "#fff",
              fontSize: bigText ? 22 : 18,
              color: picked === "real" ? "#b91c1c" : "var(--ink-soft)",
            }}
          >
            ✅ This is real
          </button>
        </div>

        {/* Live feedback */}
        <div
          aria-live="polite"
          className="mt-5 flex gap-3 rounded-2xl p-4"
          style={{ background: journey.soft, border: `1px solid ${journey.bg}` }}
        >
          <PersonaAvatar emoji="🌿" color={journey.color} bg={journey.bg} size={40} />
          <div className="flex-1">
            <div
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: journey.color }}
            >
              Sage
            </div>
            <div className="mt-0.5 leading-[1.5] text-ink" style={{ fontSize: bigText ? 17 : 15 }}>
              {picked === null
                ? "Take all the time you need. If you'd like, I can read it aloud."
                : correct
                  ? "Yes — this is a scam. Real banks never ask you to click a link to verify in 24 hours. Well spotted."
                  : "It's tempting to think so, but look at the sender address and the rush. We'll do another one together."}
            </div>
          </div>
        </div>

        {/* Helpers row */}
        <div className="mt-3.5 flex gap-2">
          <button
            type="button"
            className="la-btn ghost flex-1"
            style={{ padding: 14, fontSize: bigText ? 16 : 14 }}
          >
            🔊 Read aloud
          </button>
          <button
            type="button"
            onClick={() => setBigText((v) => !v)}
            aria-pressed={bigText}
            className="la-btn ghost flex-1"
            style={{ padding: 14, fontSize: bigText ? 16 : 14 }}
          >
            🔍 {bigText ? "Normal text" : "Bigger text"}
          </button>
        </div>
      </div>
    </main>
  );
}
