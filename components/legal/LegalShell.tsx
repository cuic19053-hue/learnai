import Link from "next/link";
import type { ReactNode } from "react";
import Mark from "@/components/design/Mark";

type Props = {
  /** Section eyebrow: "Privacy", "Terms", "Help". */
  eyebrow: string;
  /** Big page title. */
  title: string;
  /** Sub-line under the title — typically the effective date. */
  subtitle?: string;
  /** Active tab in the secondary nav. */
  active?: "privacy" | "terms" | "help";
  children: ReactNode;
};

const TABS: Array<{ id: "privacy" | "terms" | "help"; label: string; href: string }> = [
  { id: "privacy", label: "Privacy", href: "/legal/privacy" },
  { id: "terms", label: "Terms", href: "/legal/terms" },
  { id: "help", label: "Help", href: "/help" },
];

/**
 * Shared chrome for the three trust pages — Privacy, Terms, Help.
 * Same top bar as the main learner shell so these don't feel like a
 * different product. Tabbed sub-nav so a reader can jump across the
 * three pages without using the browser back button.
 */
export default function LegalShell({
  eyebrow,
  title,
  subtitle,
  active,
  children,
}: Props) {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Legal navigation">
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <Link
                  key={t.id}
                  href={t.href}
                  className="rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition"
                  style={{
                    background: isActive ? "var(--bg-2)" : "transparent",
                    color: isActive ? "var(--ink)" : "var(--ink-soft)",
                  }}
                  aria-current={isActive ? "page" : undefined}
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
          <Link
            href="/"
            className="text-[13px] font-bold text-ink-soft hover:text-ink"
          >
            ← Back to LearnAI
          </Link>
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-[860px] px-6 pb-6 pt-10">
        <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-1">
          {eyebrow}
        </div>
        <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.02em] text-ink md:text-[40px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-[14px] text-ink-mute">{subtitle}</p>
        ) : null}
      </div>

      {/* Body */}
      <main className="mx-auto max-w-[860px] px-6 pb-20">
        <article className="la-card p-7 md:p-10" style={{ borderRadius: 22 }}>
          <div className="prose-legal">{children}</div>
        </article>

        {/* Footer */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 text-[12px] text-ink-mute">
          <div>© 2026 LearnAI · Apache 2.0 source · CC BY-SA 4.0 content</div>
          <div className="flex gap-3">
            <Link href="/legal/privacy" className="hover:text-ink-soft">Privacy</Link>
            <span aria-hidden>·</span>
            <Link href="/legal/terms" className="hover:text-ink-soft">Terms</Link>
            <span aria-hidden>·</span>
            <Link href="/help" className="hover:text-ink-soft">Help</Link>
            <span aria-hidden>·</span>
            <a
              href="https://github.com/ruslanmv/learnai"
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-ink-soft"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </main>

      {/* Inline styles for typographic comfort on the legal pages —
          keeps things separate from app-wide prose. */}
      <style>{`
        .prose-legal h2 {
          font-size: 19px;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--ink);
          margin-top: 32px;
        }
        .prose-legal h2:first-child { margin-top: 0; }
        .prose-legal h3 {
          font-size: 15px;
          font-weight: 800;
          color: var(--ink);
          margin-top: 22px;
        }
        .prose-legal p,
        .prose-legal li {
          font-size: 15px;
          line-height: 1.7;
          color: var(--ink-soft);
        }
        .prose-legal p { margin-top: 12px; }
        .prose-legal ul {
          margin-top: 12px;
          padding-left: 22px;
          list-style: disc;
        }
        .prose-legal li { margin-top: 6px; }
        .prose-legal strong { color: var(--ink); font-weight: 700; }
        .prose-legal code {
          font-family: var(--font-mono), 'Geist Mono', ui-monospace, monospace;
          font-size: 13px;
          background: var(--bg-2);
          color: var(--ink);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .prose-legal a {
          color: var(--brand-1);
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-legal a:hover { color: var(--ink); }
      `}</style>
    </div>
  );
}
