/**
 * WikiTest shared chrome — port of `wikitest-shared.jsx` to typed
 * React. Five public exports:
 *
 *   <LearnAIMark />     The "L" badge + wordmark.
 *   <LATopBar />        Top bar: logo · world pill · streak · XP · avatar.
 *   <LASidebar />       Left rail: Home/Missions/Projects/Library/
 *                       Achievements/Switch world + WikiTest highlight
 *                       + teacher card.
 *   <WTBreadcrumb />    Inline breadcrumb shown on every WikiTest page.
 *   <SidebarShell />    Convenience composition: TopBar + Sidebar +
 *                       Breadcrumb + slot for the page body.
 *
 * The chrome is intentionally width-fixed at the design's 1280 px so
 * a screen captured for the Gallery shell matches the production
 * render pixel-for-pixel.
 */

import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "./wikitest-icons";

// ─── World colors ──────────────────────────────────────────────────

type WorldKey = "GRADE_9" | "Professional" | "GRADE_8" | "Playful";

export const WORLD_COLORS: Record<WorldKey, { bg: string; fg: string; ico: string }> = {
  GRADE_9: { bg: "#fff1d6", fg: "#b45309", ico: "🎓" },
  Professional: { bg: "#d6f1f0", fg: "#0f766e", ico: "💼" },
  GRADE_8: { bg: "#efe7ff", fg: "#6d28d9", ico: "🛠️" },
  Playful: { bg: "#fce0ec", fg: "#be185d", ico: "🎈" },
};

// ─── Mark ──────────────────────────────────────────────────────────

export function LearnAIMark({ size = 36 }: { size?: number }) {
  return (
    <div
      className="la-mark"
      style={{
        fontSize: 20,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontWeight: 800,
        letterSpacing: "-0.02em",
      }}
    >
      <span
        style={{
          width: size,
          height: size,
          borderRadius: 10,
          background: "var(--brand-grad)",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          boxShadow: "0 6px 16px rgba(46,91,255,.25)",
        }}
      >
        智
      </span>
      <span style={{ letterSpacing: "-0.02em" }}>
        AI
        <span
          style={{
            background: "var(--brand-grad)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          智能学习助手
        </span>
      </span>
    </div>
  );
}

// ─── Subject chip + difficulty meter ───────────────────────────────

export function WTSubjectChip({
  name,
  color = "var(--ink-mute)",
}: {
  name: string;
  color?: string;
}) {
  return (
    <span className="wt-subj">
      <span className="dot" style={{ background: color }} /> {name}
    </span>
  );
}

export function Difficulty({ level = 3 }: { level?: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <span className="wt-diff" title={`Difficulty ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={"b" + (i <= level ? " on" : "")} />
      ))}
    </span>
  );
}

// ─── Top bar ───────────────────────────────────────────────────────

export type LATopBarProps = {
  world?: WorldKey;
  streak?: number;
  xp?: number;
  initials?: string;
  avatarBg?: string;
};

export function LATopBar({
  world = "GRADE_9",
  streak = 1,
  xp = 0,
  initials = "J",
  avatarBg = "var(--brand-grad)",
}: LATopBarProps) {
  const w = WORLD_COLORS[world] ?? WORLD_COLORS.GRADE_9;
  return (
    <div className="wt-topbar">
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <LearnAIMark />
        <span
          className="la-pill"
          style={{
            background: w.bg,
            color: w.fg,
            fontSize: 13,
            padding: "6px 14px",
            fontWeight: 700,
          }}
        >
          <span>{w.ico}</span> {world} World
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          className="la-pill"
          style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)", padding: "6px 12px" }}
        >
          <Icon.flame color="#f59e0b" /> <b style={{ color: "var(--ink)" }}>{streak}-day streak</b>
        </span>
        <span
          className="la-pill"
          style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)", padding: "6px 12px" }}
        >
          <Icon.zap color="#7c3aed" /> <b style={{ color: "var(--ink)" }}>{xp} XP</b>
        </span>
        <div
          style={{
            width: 38,
            height: 38,
            background: avatarBg,
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            borderRadius: 99,
            display: "grid",
            placeItems: "center",
          }}
        >
          {initials}
        </div>
      </div>
    </div>
  );
}

// ─── Left sidebar ──────────────────────────────────────────────────

const SIDEBAR_ITEMS = [
  { key: "Home", icon: "🏠", href: "/learn" },
  { key: "My missions", icon: "🎯", href: "/learn/missions" },
  { key: "Projects", icon: "🔨", href: "/learn/projects" },
  { key: "Library", icon: "📚", href: "/learn/library" },
  { key: "Achievements", icon: "🏅", href: "/learn/achievements" },
] as const;

export type LASidebarProps = {
  active?: string;
  teacherName?: string;
  teacherRole?: string;
  teacherIcon?: string;
  showWikiTest?: boolean;
};

export function LASidebar({
  active = "Home",
  teacherName = "Mentor Max",
  teacherIcon = "🎓",
  showWikiTest = true,
}: LASidebarProps) {
  const itemStyle = (isActive: boolean): React.CSSProperties => ({
    textAlign: "left",
    padding: "12px 14px",
    borderRadius: 12,
    background: isActive ? "#fff" : "transparent",
    boxShadow: isActive ? "var(--shadow-1)" : "none",
    color: isActive ? "var(--ink)" : "var(--ink-soft)",
    fontSize: 14,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 12,
    textDecoration: "none",
  });

  return (
    <aside
      style={{
        width: 240,
        padding: "24px 16px",
        borderRight: "1px solid var(--line-soft)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        minHeight: "calc(100vh - 64px)",
      }}
    >
      {SIDEBAR_ITEMS.map((it) => (
        <Link key={it.key} href={it.href} className="wt-tab" style={itemStyle(it.key === active)}>
          <span style={{ fontSize: 18 }}>{it.icon}</span> {it.key}
        </Link>
      ))}

      {showWikiTest ? (
        <Link
          href="/learn/wiki"
          className="wt-tab"
          style={{
            textAlign: "left",
            padding: "12px 14px",
            borderRadius: 12,
            background:
              active === "WikiTest" ? "#fff" : "linear-gradient(135deg,#e8eeff 0%,#f0e9ff 100%)",
            boxShadow: active === "WikiTest" ? "var(--shadow-1)" : "0 0 0 1px #d6dfff",
            color: "var(--ink)",
            fontSize: 14,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 12,
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: 18 }}>🧪</span>
          <span style={{ flex: 1 }}>WikiTest</span>
          <span
            className="la-mono"
            style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--brand-grad)",
              color: "#fff",
              letterSpacing: ".04em",
            }}
          >
            NEW
          </span>
        </Link>
      ) : null}

      <div style={{ borderTop: "1px solid var(--line-soft)", margin: "12px 0" }} />

      <Link href="/learn/switch" className="wt-tab" style={itemStyle(false)}>
        <span style={{ fontSize: 18 }}>🌐</span> Switch world
      </Link>

      <div style={{ marginTop: "auto" }}>
        <div className="la-card" style={{ padding: 14, marginTop: 16 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              marginBottom: 8,
            }}
          >
            YOUR TEACHER
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "var(--bg-2)",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
              }}
            >
              {teacherIcon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800 }}>{teacherName}</div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ok)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 99,
                    background: "var(--ok)",
                  }}
                />{" "}
                Online
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ─── Breadcrumb ────────────────────────────────────────────────────

export function WTBreadcrumb({ trail }: { trail: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "14px 28px",
        borderBottom: "1px solid var(--line-soft)",
        background: "rgba(255,255,255,.6)",
        fontSize: 13,
      }}
    >
      {trail.map((t, i) => {
        const last = i === trail.length - 1;
        return (
          <span
            key={`${i}-${t}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: last ? "var(--ink)" : "var(--ink-mute)",
              fontWeight: last ? 700 : 600,
            }}
          >
            {i > 0 ? <span style={{ color: "var(--ink-faint)" }}>/</span> : null}
            <span>{t}</span>
          </span>
        );
      })}
    </div>
  );
}

// ─── Footer attribution (CC BY-SA) ─────────────────────────────────

export function WTFootAttribution() {
  return (
    <div
      style={{
        borderTop: "1px solid var(--line-soft)",
        background: "var(--surface-soft)",
        padding: "14px 28px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          color: "var(--ink-mute)",
          fontSize: 12,
        }}
      >
        <div className="la-mono">
          Source content: Wikipedia · CC BY-SA 4.0 — attribution preserved on every generated test
        </div>
        <div className="la-mono">LearnAI/1.0 · polite client</div>
      </div>
    </div>
  );
}

// ─── Full-page shell ───────────────────────────────────────────────

export type SidebarShellProps = {
  trail?: string[];
  children?: ReactNode;
  world?: WorldKey;
  initials?: string;
  avatarBg?: string;
  streak?: number;
  xp?: number;
  teacher?: string;
  teacherIcon?: string;
  /** Bypass the fixed 1280-px design canvas (used by the Gallery preview iframe). */
  fluid?: boolean;
};

export function SidebarShell({
  trail = ["GRADE_9", "WikiTest"],
  children,
  world = "GRADE_9",
  initials = "J",
  avatarBg = "#7c3aed",
  streak = 1,
  xp = 0,
  teacher = "Mentor Max",
  teacherIcon = "🎓",
  fluid = false,
}: SidebarShellProps) {
  return (
    <div className="wt-shell" style={fluid ? undefined : { width: 1280, minHeight: 900 }}>
      <LATopBar world={world} streak={streak} xp={xp} initials={initials} avatarBg={avatarBg} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr" }}>
        <LASidebar active="WikiTest" teacherName={teacher} teacherIcon={teacherIcon} />
        <main>
          <WTBreadcrumb trail={trail} />
          {children}
        </main>
      </div>
    </div>
  );
}
