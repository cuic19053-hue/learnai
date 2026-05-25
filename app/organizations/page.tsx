import type { Metadata } from "next";
import Link from "next/link";
import StickyHeader from "@/components/home/StickyHeader";

export const metadata: Metadata = {
  title: "LearnAI for the community",
  description:
    "LearnAI is an open-source project. Use it, fork it, sponsor it — and help build the next generation of AI tutors with us.",
};

const PILLARS = [
  {
    emoji: "🏫",
    title: "Schools & classrooms",
    desc: "Curriculum-aligned lessons, teacher dashboards, and student-by-student progress reports — all in the open repo.",
  },
  {
    emoji: "🏢",
    title: "Workforce & cert prep",
    desc: "Practice for AWS · Azure · GCP · IBM with cited explanations. Fork the question packs, share improvements back.",
  },
  {
    emoji: "👪",
    title: "Family plans",
    desc: "Multi-child profiles with one parent dashboard, daily time limits, and quiet hours. Self-host or use ours.",
  },
  {
    emoji: "🛡️",
    title: "Safety first",
    desc: "Age-aware content, no ads, parent lock, and on-device voice when available. Auditable because the code is open.",
  },
];

const SUPPORT = [
  {
    emoji: "⭐",
    title: "Star the repo",
    desc: "Bookmark the project on GitHub so new visitors can find it.",
    cta: "github.com/ruslanmv/learnai",
    href: "https://github.com/ruslanmv/learnai",
  },
  {
    emoji: "🐛",
    title: "File an issue",
    desc: "Report a bug, request a lesson, suggest a UX fix. Real feedback shapes the roadmap.",
    cta: "Open an issue",
    href: "https://github.com/ruslanmv/learnai/issues/new",
  },
  {
    emoji: "🛠️",
    title: "Send a PR",
    desc: "Translations, new exercises, accessibility fixes — all welcome. See CONTRIBUTING.md.",
    cta: "Read CONTRIBUTING",
    href: "https://github.com/ruslanmv/learnai/blob/main/CONTRIBUTING.md",
  },
  {
    emoji: "💚",
    title: "Sponsor the project",
    desc: "Keep the AI tutor free for kids, seniors, and pay-what-you-can families. Sponsorship pays for compute + dev time.",
    cta: "Become a sponsor",
    href: "https://github.com/sponsors/ruslanmv",
  },
];

export default function OrganizationsPage() {
  return (
    <main id="main" style={{ background: "var(--bg)" }}>
      <StickyHeader />

      <section className="mx-auto max-w-[1100px] px-6 py-14 md:px-12 md:py-20">
        <div className="text-center">
          <span
            className="la-pill"
            style={{
              background: "var(--bg-2)",
              color: "var(--brand-1)",
              fontWeight: 800,
            }}
          >
            Open source · MIT
          </span>
          <h1
            className="mt-4 font-extrabold tracking-[-0.025em] text-ink"
            style={{ fontSize: "clamp(36px, 6vw, 56px)", lineHeight: 1.1 }}
          >
            LearnAI is a community project.
          </h1>
          <p className="mx-auto mt-4 max-w-[640px] text-lg leading-relaxed text-ink-soft">
            One AI tutor for every stage of life — and the whole codebase is open. Fork it for your
            school, your team, or your family. No sales calls, no gated demos. If you want it to
            grow, the best thing you can do is help build it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://github.com/ruslanmv/learnai"
              className="la-btn"
              style={{ padding: "14px 26px", fontSize: 15 }}
            >
              View on GitHub →
            </Link>
            <Link href="/" className="la-btn ghost" style={{ padding: "14px 22px", fontSize: 15 }}>
              Try the live app
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-ink-mute">
            MIT-licensed · self-host anywhere · no enterprise contract required
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-16 md:px-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PILLARS.map((f) => (
            <div
              key={f.title}
              className="rounded-3xl p-7"
              style={{
                background: "#fff",
                border: "1px solid var(--line-soft)",
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div
                className="grid place-items-center rounded-2xl"
                style={{
                  width: 56,
                  height: 56,
                  background: "var(--bg-2)",
                  fontSize: 30,
                }}
                aria-hidden
              >
                {f.emoji}
              </div>
              <h3 className="mt-4 text-lg font-bold tracking-[-0.01em] text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1100px] px-6 pb-16 md:px-12">
        <div className="mb-6 text-center">
          <h2
            className="m-0 font-extrabold tracking-[-0.025em] text-ink"
            style={{ fontSize: "clamp(24px, 4vw, 32px)" }}
          >
            How you can help
          </h2>
          <p className="mx-auto mt-3 max-w-[600px] text-base text-ink-soft">
            LearnAI is volunteer-driven. We don&apos;t do enterprise pilots — we do open
            contributions. Pick a path:
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUPPORT.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              className="block rounded-3xl p-6 transition hover:-translate-y-0.5"
              style={{
                background: "#fff",
                border: "1px solid var(--line-soft)",
                boxShadow: "var(--shadow-1)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid place-items-center rounded-2xl"
                  style={{
                    width: 48,
                    height: 48,
                    background: "var(--bg-2)",
                    fontSize: 26,
                  }}
                  aria-hidden
                >
                  {s.emoji}
                </div>
                <h3 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              <span
                className="mt-3 inline-flex text-sm font-bold"
                style={{ color: "var(--brand-1)" }}
              >
                {s.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[860px] px-6 pb-20 text-center md:px-12">
        <div
          className="rounded-3xl p-10"
          style={{
            background: "linear-gradient(135deg, var(--bg-2), #f7f4ff)",
            border: "1px solid var(--line-soft)",
          }}
        >
          <h2
            className="m-0 font-extrabold tracking-[-0.025em] text-ink"
            style={{ fontSize: "clamp(24px, 4vw, 32px)" }}
          >
            Want to help it grow?
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] text-base text-ink-soft">
            The best contribution is the one that fits you: a star, a translation, a bug report, a
            sponsorship, or a thoughtful PR. Every one of them moves the project forward.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://github.com/ruslanmv/learnai/issues"
              className="la-btn"
              style={{ padding: "14px 26px", fontSize: 15 }}
            >
              Open an issue
            </Link>
            <Link
              href="https://github.com/sponsors/ruslanmv"
              className="la-btn ghost"
              style={{ padding: "14px 22px", fontSize: 15 }}
            >
              Sponsor the project
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line-soft bg-surface-soft">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft md:flex-row md:px-12">
          <span className="text-xs text-ink-mute">
            © LearnAI · Open source · Education for every stage of life
          </span>
          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
            <Link href="/onboarding" className="hover:text-ink">
              Start free
            </Link>
            <Link href="https://github.com/ruslanmv/learnai" className="hover:text-ink">
              GitHub
            </Link>
            <Link href="/legal/privacy" className="hover:text-ink">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
