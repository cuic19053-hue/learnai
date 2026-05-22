"use client";

import { useState } from "react";
import ProgressStars from "@/components/learn/ProgressStars";
import VoiceButton from "@/components/learn/VoiceButton";
import TeacherAvatar from "@/components/learn/TeacherAvatar";
import { useProgress } from "@/components/progress/ProgressProvider";

const APPLES = "🍎 🍎 🍎";
const CORRECT = 3;
const XP_REWARD = 5;

export default function CountingTask() {
  const [picked, setPicked] = useState<number | null>(null);
  const [stars, setStars] = useState(3);
  const [awarded, setAwarded] = useState(false);
  const { addXp } = useProgress();

  const correct = picked === CORRECT;

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
      <TeacherAvatar name="Milo the Owl" emoji="🦉" />
      <p className="mt-4 text-5xl" aria-label="three apples">
        {APPLES}
      </p>
      <p className="mt-3 text-xl font-semibold text-dark">How many apples?</p>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => {
              setPicked(n);
              if (n === CORRECT) {
                setStars((s) => Math.min(5, s + 1));
                if (!awarded) {
                  addXp(XP_REWARD, "kids");
                  setAwarded(true);
                }
              }
            }}
            aria-pressed={picked === n}
            aria-label={`Answer ${n}`}
            className={`rounded-2xl py-5 text-3xl font-bold text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 ${
              picked === n
                ? n === CORRECT
                  ? "bg-emerald-500"
                  : "bg-rose-400"
                : "bg-primary hover:opacity-90"
            }`}
          >
            {n}
          </button>
        ))}
      </div>

      <div aria-live="polite" role="status" className="mt-5 min-h-[2rem] text-2xl font-semibold">
        {picked === null ? "" : correct ? "Great job! ⭐" : "Try again, you can do it!"}
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <VoiceButton label="Read question" />
        <button
          onClick={() => setPicked(null)}
          className="rounded-xl bg-gray-100 px-5 py-3 text-lg font-semibold"
        >
          Try again
        </button>
        <a href="/parent" className="rounded-xl bg-gray-100 px-5 py-3 text-lg font-semibold">
          Parent Exit
        </a>
      </div>

      <div className="mt-5 flex justify-center">
        <ProgressStars earned={stars} total={5} />
      </div>
    </div>
  );
}
