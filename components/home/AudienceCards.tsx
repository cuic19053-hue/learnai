import Link from "next/link";

/**
 * "Who it's for" strip. Four audience cards above the journeys grid
 * so a visitor instantly recognises themselves and stops asking
 * "is this for me?".
 */
const AUDIENCES = [
  {
    emoji: "👨‍👩‍👧",
    title: "Parents",
    desc: "Safe, age-aware learning for kids 3–11.",
    href: "/learn/kids",
    accent: "#ec4899",
    bg: "#fce0ec",
  },
  {
    emoji: "🎓",
    title: "Students",
    desc: "Homework, exam prep, and confidence-building feedback.",
    href: "/learn/scholar",
    accent: "#2e5bff",
    bg: "#e6ecff",
  },
  {
    emoji: "💼",
    title: "Professionals",
    desc: "AI, cloud, coding, and career skills with cited sources.",
    href: "/learn/adult",
    accent: "#0ea5a4",
    bg: "#d6f1f0",
  },
  {
    emoji: "🏫",
    title: "Organizations",
    desc: "Dashboards, learning paths, and reports for teams.",
    href: "/organizations",
    accent: "#7c3aed",
    bg: "#efe7ff",
  },
] as const;

export default function AudienceCards() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
      <div className="mb-6 text-center">
        <span
          className="la-pill"
          style={{
            background: "#fff",
            boxShadow: "0 0 0 1px var(--line)",
            color: "var(--ink-soft)",
          }}
        >
          Who it&apos;s for
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          One platform. Every kind of learner.
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group block rounded-2xl p-5 transition-shadow"
            style={{
              background: "#fff",
              border: "1px solid var(--line-soft)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div
              className="mb-3 grid place-items-center rounded-2xl"
              style={{
                width: 56,
                height: 56,
                background: a.bg,
                color: a.accent,
                fontSize: 30,
              }}
              aria-hidden
            >
              {a.emoji}
            </div>
            <h3 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">{a.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a.desc}</p>
            <span
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-0.5"
              style={{ color: a.accent }}
            >
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
