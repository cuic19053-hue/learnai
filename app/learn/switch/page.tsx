import type { Metadata } from "next";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import LearningStageCard from "@/components/learn/LearningStageCard";
import { JOURNEYS } from "@/lib/learn/journeys";

export const metadata: Metadata = {
  title: "Switch world",
  description: "Pick a different learning world. No setup, no questions — just click.",
};

export default function SwitchWorldPage() {
  return (
    <main id="main" className="min-h-screen bg-white">
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <Link
            href="/"
            className="text-[13px] font-bold text-ink-soft hover:text-ink"
          >
            ← Back home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
        <p className="la-mono text-xs font-bold tracking-wider text-brand-1">
          SWITCH WORLD
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-5xl">
          Pick a different learning world.
        </h1>
        <p className="mt-3 max-w-[640px] text-base leading-relaxed text-ink-soft">
          Six worlds, one engine. Click any card to land directly in that
          world&apos;s dashboard — no setup, no questions, no sign-in.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEYS.map((j) => (
            <LearningStageCard key={j.id} {...j} />
          ))}
        </div>

        <p className="mt-10 text-[13px] text-ink-mute">
          Want a guided setup with goal, teacher persona, and a 5-min first
          lesson?{" "}
          <Link
            href="/onboarding"
            className="font-semibold text-brand-1 hover:underline"
          >
            Run the 5-step onboarding wizard →
          </Link>
        </p>
      </section>
    </main>
  );
}
