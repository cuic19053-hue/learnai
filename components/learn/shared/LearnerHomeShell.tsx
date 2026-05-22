"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import UserMenu from "@/components/account/UserMenu";
import Mark from "@/components/design/Mark";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import TeacherChatPanel from "@/components/learn/shared/TeacherChatPanel";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { Journey } from "@/lib/learn/journeys";
import type { PageContext } from "@/lib/learn/tutor";

export { TeacherChatPanel };

type NavItem = {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  /** Optional small label to the right of the item — e.g. "NEW". */
  badge?: string;
  /** Distinct visual treatment for callout entries (used by WikiTest). */
  highlight?: boolean;
  /** Draw a hairline divider above this item. */
  divider?: boolean;
};

type LearnerHomeShellProps = {
  journey: Journey;
  learnerInitial?: string;
  /** World slug — scopes the XP pill to the current world's progress. */
  worldSlug?: string;
  teacherName?: string;
  teacherEmoji?: string;
  /** Override the default left-rail nav items. */
  navItems?: NavItem[];
  /** Right sidebar — pass a TeacherChatPanel or any custom node. */
  rightAside?: ReactNode;
  /**
   * Page context for the persistent tutor rail. Drives the greeting
   * and the pedagogically-labelled suggested prompts. Defaults to
   * world-home if not supplied.
   */
  pageContext?: PageContext;
  children: ReactNode;
};

const DEFAULT_NAV: NavItem[] = [
  // Sensible inert default — every page that uses the shell should pass
  // navItems via buildLearnerNav() from lib/learn/worlds.ts so the active
  // tab is highlighted and each item points at a real route.
  { icon: "🏠", label: "Home", active: true },
  { icon: "🎯", label: "My missions", href: "/learn/missions" },
  { icon: "🛠️", label: "Projects", href: "/learn/projects" },
  { icon: "📚", label: "Library", href: "/learn/library" },
  { icon: "🏅", label: "Achievements", href: "/learn/achievements" },
  { icon: "🌍", label: "Switch world", href: "/learn/switch" },
];

export default function LearnerHomeShell({
  journey,
  learnerInitial = "S",
  worldSlug,
  teacherName = "Nova",
  teacherEmoji = "🦉",
  navItems = DEFAULT_NAV,
  rightAside,
  pageContext,
  children,
}: LearnerHomeShellProps) {
  // Read live progress from the global Provider. The values pop in once
  // the cookie hydrates — before that we render zeros (SSR-safe).
  const { state, worldOf, ping, hydrated } = useProgress();
  const streakDays = state.streak.current;
  const xp = worldSlug ? worldOf(worldSlug).xp : state.xp;

  // Visiting a stage home counts as engaging with that world — pings the
  // streak engine + stamps lastSeen for the world.
  useEffect(() => {
    if (!hydrated) return;
    ping(worldSlug);
  }, [hydrated, worldSlug, ping]);

  return (
    <div className="min-h-screen bg-white">
      {/* ───── Top bar ───── */}
      <div
        className="flex items-center justify-between border-b border-line-soft bg-white px-4 md:px-8"
        style={{ height: 64 }}
      >
        <div className="flex items-center gap-4">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <span className="la-pill" style={{ background: journey.bg, color: journey.color }}>
            {journey.emoji} {journey.name} World
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="la-pill"
            style={{ background: "#fff7e6", color: "#b15c00" }}
            title={`${streakDays} day streak`}
          >
            🔥 {streakDays}-day streak
          </span>
          <span
            className="la-pill hidden sm:inline-flex"
            style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
          >
            ⚡ {xp.toLocaleString()} XP
          </span>
          <Link
            href="/settings"
            className="hidden h-9 items-center gap-1.5 rounded-full bg-white px-3 text-[12px] font-bold text-ink-soft hover:text-ink sm:inline-flex"
            style={{ boxShadow: "0 0 0 1px var(--line)" }}
            aria-label="Your settings — tutor, voice, accessibility"
          >
            ⚙ Settings
          </Link>
          {/* Real account dropdown — Profile / Settings / Sign out for
              authenticated users, Sign in / Settings for guests. */}
          <UserMenu fallbackInitial={learnerInitial} />
        </div>
      </div>

      {/* ───── Responsive layout ─────
            mobile:  single column (main only — rails hidden)
            md:      left rail + main (right rail hidden)
            lg+:     left rail + main + teacher chat */}
      <div
        className="grid grid-cols-1 md:grid-cols-[232px_minmax(0,1fr)] lg:grid-cols-[232px_minmax(0,1fr)_320px]"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {/* Left rail */}
        <aside
          className="hidden border-r border-line-soft p-4 md:block"
          style={{ background: "#fbfbff" }}
        >
          {navItems.map((it) => {
            const Tag: any = it.href ? Link : "div";
            // WikiTest-style highlight: soft brand gradient + thin border. When
            // active, render as a normal white-elevated tab so the active
            // state stays consistent across all sidebar items.
            const isHighlight = it.highlight && !it.active;
            return (
              <div key={it.label}>
                {it.divider ? <div className="my-3 border-t border-line-soft" /> : null}
                <Tag
                  href={it.href}
                  className="mb-1 flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2.5 text-sm"
                  style={{
                    background: it.active
                      ? "#fff"
                      : isHighlight
                        ? "var(--brand-grad-soft)"
                        : "transparent",
                    boxShadow: it.active
                      ? "var(--shadow-1)"
                      : isHighlight
                        ? "0 0 0 1px #d6dfff inset"
                        : "none",
                    fontWeight: it.active || isHighlight ? 700 : 600,
                    color: it.active || isHighlight ? "var(--ink)" : "var(--ink-soft)",
                  }}
                >
                  <span aria-hidden style={{ fontSize: 16 }}>
                    {it.icon}
                  </span>
                  <span className="flex-1">{it.label}</span>
                  {it.badge ? (
                    <span
                      className="la-mono rounded-[4px] px-1.5 py-[1px] text-[9px] tracking-wider text-white"
                      style={{ background: "var(--brand-grad)", letterSpacing: "0.04em" }}
                    >
                      {it.badge}
                    </span>
                  ) : null}
                </Tag>
              </div>
            );
          })}

          <div
            className="mt-5 rounded-2xl p-3.5"
            style={{
              background: `linear-gradient(135deg, ${journey.soft}, #fff)`,
              border: `1px solid ${journey.bg}`,
            }}
          >
            <div className="text-[11px] font-bold" style={{ color: journey.color }}>
              YOUR TEACHER
            </div>
            <div className="mt-2 flex items-center gap-2.5">
              <PersonaAvatar emoji={teacherEmoji} color={journey.color} bg={journey.bg} size={36} />
              <div>
                <div className="text-sm font-bold text-ink">{teacherName}</div>
                <div className="text-[11px] text-ink-soft">● Online</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main id="main" className="px-5 py-7 md:px-8">
          {children}
        </main>

        {/* Right — teacher chat (or override) */}
        <aside
          className="hidden flex-col gap-3 border-l border-line-soft p-5 lg:flex"
          style={{ background: "#fbfbff" }}
        >
          {rightAside ?? (
            <TeacherChatPanel
              journey={journey}
              teacherName={teacherName}
              teacherEmoji={teacherEmoji}
              pageContext={pageContext ?? { kind: "world-home", worldLabel: journey.name }}
              worldSlug={worldSlug}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
