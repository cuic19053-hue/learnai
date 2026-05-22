import Link from "next/link";
import LearningStageCard from "@/components/learn/LearningStageCard";
import Mark from "@/components/design/Mark";
import Illustration from "@/components/design/Illustration";
import { Arrow } from "@/components/design/icons";
import StickyHeader from "@/components/home/StickyHeader";
import AnimatedHero from "@/components/home/AnimatedHero";
import { JOURNEYS } from "@/lib/learn/journeys";
import { LOOP } from "@/lib/learn/loop";

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "Tell us who is learning",
    desc: "A 5-step setup picks the right age, goal, and AI teacher.",
  },
  {
    n: 2,
    title: "Land in your learning world",
    desc: "Each stage has its own interface — playful, mission, exam, professional, or calm.",
  },
  {
    n: 3,
    title: "Practice with feedback",
    desc: "Every session uses the same loop: hook, explain, practice, feedback, reflect, evolve.",
  },
];

const WORLDS: Array<{
  id: string;
  title: string;
  desc: string;
  best: string;
  /** Stage home this World card lands the learner in. */
  href: string;
  tint: string;
  recommended?: boolean;
}> = [
  {
    id: "playful",
    title: "Playful World",
    desc: "Fun stories, games, and colorful lessons.",
    best: "Little Learner",
    href: "/learn/kids",
    tint: "linear-gradient(135deg,#fce0ec,#fff1d6)",
  },
  {
    id: "mission",
    title: "Mission World",
    desc: "Quests, challenges, and problem-solving.",
    best: "Builder",
    href: "/learn/builder",
    tint: "linear-gradient(135deg,#efe7ff,#e6ecff)",
    recommended: true,
  },
  {
    id: "career",
    title: "Career World",
    desc: "Real-world examples and practical skills.",
    best: "Professional",
    href: "/learn/adult",
    tint: "linear-gradient(135deg,#d6f1f0,#e6ecff)",
  },
  {
    id: "calm",
    title: "Calm World",
    desc: "Clear steps, gentle pace, and larger text.",
    best: "Senior Learner",
    href: "/learn/senior",
    tint: "linear-gradient(135deg,#e7f8ee,#f3fbf5)",
  },
];

export default function HomePage() {
  return (
    <main id="main">
      {/* ────────── Top nav ────────── */}
      <StickyHeader />

      {/* ────────── Hero (animated) ────────── */}
      <AnimatedHero />

      {/* ────────── Journey grid ────────── */}
      <section id="journeys" className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="mb-8 max-w-[720px]">
          <span
            className="la-pill"
            style={{
              background: "#fff",
              boxShadow: "0 0 0 1px var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            Choose your learning journey
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
            Pick the stage that fits the learner
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            We tune the language, length, and tone of every lesson to match.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEYS.map((j) => (
            <LearningStageCard key={j.id} {...j} />
          ))}
        </div>
      </section>

      {/* ────────── Learning Worlds ────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16 md:px-12">
        <div className="mb-7 max-w-[720px]">
          <span
            className="la-pill"
            style={{
              background: "#fff",
              boxShadow: "0 0 0 1px var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            Learning Worlds
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-4xl">
            Four worlds. One that fits you.
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORLDS.map((w) => (
            <Link
              key={w.id}
              href={w.href}
              className="la-jcard group block"
              style={{
                padding: 0,
                gap: 0,
                overflow: "hidden",
                border: w.recommended ? "1.5px solid var(--brand-1)" : "1px solid var(--line-soft)",
                boxShadow: w.recommended ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
              }}
              aria-label={`${w.title}: ${w.desc}. Best for ${w.best}.`}
            >
              <div className="relative overflow-hidden" style={{ height: 140 }}>
                <Illustration
                  id={`worlds/${w.id}`}
                  label={`${w.title} — ${w.desc}`}
                  fallbackHeight={140}
                />
                {w.recommended ? (
                  <span
                    className="la-pill absolute left-3 top-3"
                    style={{
                      background: "var(--brand-grad)",
                      color: "#fff",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    ★ Recommended
                  </span>
                ) : null}
              </div>
              <div style={{ padding: 18 }}>
                <h3 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">{w.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{w.desc}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-mute">
                  <span>
                    Best for: <strong className="text-ink-soft">{w.best}</strong>
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-bold transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--brand-1)" }}
                  >
                    Open <Arrow color="var(--brand-1)" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────── How it works (Loop) ────────── */}
      <section
        id="how"
        className="border-y border-line-soft bg-white"
        style={{ padding: "64px 0" }}
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="mb-10 text-center">
            <span
              className="la-pill"
              style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
            >
              How it works
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
              One loop. Endless lessons.
            </h2>
            <p className="mt-2 text-base text-ink-soft">
              Every session — for every age — runs the same six steps.
            </p>
          </div>

          <div className="mx-auto mb-12 grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ padding: 22 }}>
                <div className="la-mono text-[13px] font-bold text-brand-1">
                  STEP {String(s.n).padStart(2, "0")}
                </div>
                <h3 className="mt-2 text-[22px] font-bold tracking-[-0.01em] text-ink">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* The Loop */}
          <div
            className="mx-auto max-w-[1100px] rounded-[28px] p-9"
            style={{
              background: "linear-gradient(135deg, var(--bg-2), #f7f4ff)",
              border: "1px solid var(--line-soft)",
            }}
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {LOOP.map((l, i) => (
                <div key={l.n} className="relative text-center">
                  <div className="la-mono mb-2 text-[11px] font-bold text-ink-mute">0{l.n}</div>
                  <div className="la-loop-ring mx-auto" style={{ color: l.color }}>
                    <span aria-hidden>{l.icon}</span>
                  </div>
                  <div className="mt-3 text-base font-bold text-ink">{l.label}</div>
                  <div className="mt-1 px-1.5 text-xs leading-snug text-ink-soft">{l.blurb}</div>
                  {i < LOOP.length - 1 ? (
                    <div
                      className="absolute hidden text-ink-faint md:block"
                      style={{ top: 36, right: -18 }}
                      aria-hidden
                    >
                      →
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────── CTA ────────── */}
      <section className="px-6 py-16 text-center md:px-12 md:py-20">
        <h2 className="m-0 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
          Start the right journey today.
        </h2>
        <p className="mt-3 text-base text-ink-soft">
          Free to try. No card. No ads. Made for every age.
        </p>
        <Link
          href="/onboarding"
          className="la-btn mt-6 inline-flex"
          style={{ padding: "16px 28px", fontSize: 16 }}
        >
          Choose your journey <Arrow />
        </Link>
      </section>

      {/* ────────── Footer ────────── */}
      <footer className="border-t border-line-soft bg-surface-soft">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft md:flex-row md:px-12">
          <div className="flex items-center gap-3">
            <Mark size={28} fontSize={16} />
            <span className="text-xs text-ink-mute">
              © LearnAI · Education for every stage of life
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/onboarding" className="hover:text-ink">
              Get started
            </Link>
            <Link href="/teachers" className="hover:text-ink">
              Teachers
            </Link>
            <Link href="/parent" className="hover:text-ink">
              Parents
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
