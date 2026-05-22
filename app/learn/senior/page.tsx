import type { Metadata } from "next";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { Arrow } from "@/components/design/icons";
import { journeyForStage } from "@/lib/learn/journeys";
import { getLearnerFirstName } from "@/lib/learn/learner-name";

export const metadata: Metadata = {
  title: "Senior Learner",
  description: "Large text, slow pace, and practical lessons for older adults.",
};

const PRACTICAL_LESSONS = [
  {
    title: "Spotting scam messages",
    emoji: "🛡️",
    body: "Learn the signs and try one example.",
    href: "/learn/lesson/senior",
  },
  {
    title: "Use WhatsApp safely",
    emoji: "💬",
    body: "Send messages, share photos, block strangers.",
    href: "/learn/lesson/senior",
  },
  {
    title: "Online banking basics",
    emoji: "🏦",
    body: "Sign in, check your balance, pay a bill.",
    href: "/learn/lesson/senior",
  },
  {
    title: "Memory practice",
    emoji: "🧠",
    body: "Five minutes a day to keep your memory sharp.",
    href: "/learn/lesson/senior",
  },
];

export default async function SeniorPage() {
  const learnerName = await getLearnerFirstName();
  const j = journeyForStage("SENIOR");

  return (
    <main
      id="main"
      className="mx-auto min-h-screen max-w-[820px] px-5 pb-24 pt-7 md:px-8"
      style={{ background: `linear-gradient(180deg, ${j.soft} 0%, #fff 40%)` }}
    >
      {/* Top strip */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PersonaAvatar emoji="🌿" color={j.color} bg={j.bg} size={48} />
          <div>
            <div className="text-base text-ink-mute">Hello</div>
            <div className="text-2xl font-extrabold tracking-[-0.01em] text-ink">
              {learnerName ? `Welcome back, ${learnerName}` : "Welcome, Guest"}
            </div>
          </div>
        </div>
        <Link
          href="/login"
          className="la-pill"
          style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
        >
          Sign in
        </Link>
      </div>

      {/* Hero card */}
      <section className="mt-6">
        <div
          className="rounded-3xl p-6 md:p-7"
          style={{
            background: `linear-gradient(135deg, ${j.color}, #b1377c)`,
            color: "#fff",
            boxShadow: "var(--shadow-3)",
          }}
        >
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] opacity-85">
            Today’s practical lesson
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold leading-tight tracking-[-0.01em] md:text-4xl">
            Spot a scam in 5 minutes
          </h1>
          <p className="mt-2.5 max-w-[520px] leading-relaxed opacity-90" style={{ fontSize: 18 }}>
            We&apos;ll read a fake message together and you&apos;ll tell me what you think. We go
            slowly, and you can hear it read aloud.
          </p>
          <Link
            href="/learn/lesson/senior"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-extrabold"
            style={{ color: j.color, fontSize: 18 }}
          >
            ▶ Start the lesson <Arrow color={j.color} />
          </Link>
        </div>
      </section>

      {/* Practical lessons grid */}
      <section className="mt-8">
        <div className="mb-3 text-base font-bold text-ink-mute">More practical lessons</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRACTICAL_LESSONS.map((l) => (
            <Link
              key={l.title}
              href={l.href}
              className="la-card flex items-start gap-4 p-5 hover:border-line"
              style={{ borderRadius: 18, fontSize: 18 }}
            >
              <span className="text-4xl" aria-hidden>
                {l.emoji}
              </span>
              <div>
                <div className="font-extrabold text-ink">{l.title}</div>
                <div className="mt-1 text-base text-ink-soft">{l.body}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Helpers row */}
      <section className="mt-7 flex flex-wrap gap-3">
        <button
          type="button"
          className="la-btn ghost"
          style={{ padding: "14px 18px", fontSize: 16 }}
        >
          🔊 Read aloud
        </button>
        <button
          type="button"
          className="la-btn ghost"
          style={{ padding: "14px 18px", fontSize: 16 }}
        >
          🔍 Bigger text
        </button>
        <Link
          href="/onboarding"
          className="la-btn ghost"
          style={{ padding: "14px 18px", fontSize: 16 }}
        >
          🌍 Switch world
        </Link>
      </section>
    </main>
  );
}
