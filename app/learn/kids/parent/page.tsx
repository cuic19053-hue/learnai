import type { Metadata } from "next";
import Link from "next/link";
import { SUBJECT_LIST } from "@/lib/letterforge/subjects";
import { LANGUAGES } from "@/lib/letterforge/languages";

export const metadata: Metadata = {
  title: "Parent area · Little Learner",
  description: "Today's summary, subjects, language, and quiet hours for Little Learner.",
};

/**
 * /learn/kids/parent — locked parent area.
 *
 * Reached by holding the 🔒 on any kids screen. Designed for the
 * grown-up, not the child: progress summary, settings, reports.
 * No big colourful play buttons here.
 *
 * Sections are anchor-linked from the parent menu (#settings, #reports)
 * so the menu can deep-link to a specific block.
 */
export default function KidsParentPage() {
  return (
    <main
      id="main"
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        fontFamily: "inherit",
        color: "var(--ink)",
      }}
    >
      <header
        style={{
          padding: "18px 24px",
          borderBottom: "1px solid var(--line-soft)",
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            href="/learn/kids"
            aria-label="Back to Milo"
            style={{
              padding: "6px 12px",
              borderRadius: 99,
              background: "var(--surface-soft)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            ← Back to Milo
          </Link>
          <span style={{ fontSize: 16, fontWeight: 800 }}>Parent area</span>
        </div>
        <span
          className="la-mono"
          style={{
            padding: "4px 10px",
            borderRadius: 99,
            background: "#fef3c7",
            color: "#9a3412",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".08em",
          }}
        >
          LITTLE LEARNER
        </span>
      </header>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px 60px" }}>
        {/* Today */}
        <Section title="Today" subtitle="What Lina played today.">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 14,
            }}
          >
            <StatCard label="Lessons started" value="2" detail="Letters · Numbers" />
            <StatCard label="Stars earned" value="6" detail="3 × Letters · 3 × Numbers" tone="ok" />
            <StatCard
              label="Where she paused"
              value="Counting to 4"
              detail="Re-introduce tomorrow"
              tone="warn"
            />
          </div>
          <p
            style={{
              fontSize: 13,
              color: "var(--ink-soft)",
              marginTop: 14,
              lineHeight: 1.55,
            }}
          >
            Tomorrow: <b>Count jungle animals with Milo</b> · gentle re-entry to numbers around 4.
          </p>
        </Section>

        {/* Children */}
        <Section
          title="Children"
          subtitle="One profile per child. Each child has its own progress."
        >
          <div
            className="la-card"
            style={{ padding: 14, display: "flex", gap: 14, alignItems: "center" }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 99,
                background: "#fce0ec",
                color: "#9a3412",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              🦁
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Lina · age 3–6</div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                English · All subjects active · Daily limit 20 min
              </div>
            </div>
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              Edit
            </button>
          </div>
          <button
            type="button"
            className="la-btn ghost"
            style={{ marginTop: 10, padding: "8px 14px", fontSize: 13 }}
          >
            + Add another child
          </button>
        </Section>

        {/* Settings */}
        <Section id="settings" title="Settings" subtitle="Language, subjects, time limits, voice.">
          <SettingRow
            label="Language"
            value="English"
            help="Drives alphabet, voice, example words, and writing direction."
            choices={LANGUAGES.slice(0, 6).map((l) => `${l.flag} ${l.name}`)}
          />
          <SettingRow
            label="Active subjects"
            value="All 7"
            help="Hide subjects to keep the home page short. Parent only."
            choices={SUBJECT_LIST.map((s) => `${s.emoji} ${s.shortName}`)}
          />
          <SettingRow
            label="Daily time limit"
            value="20 minutes"
            help="Milo will end the session calmly when the limit is reached."
            choices={["10 min", "20 min", "30 min", "Unlimited"]}
          />
          <SettingRow
            label="Quiet hours"
            value="7:00 PM – 7:00 AM"
            help="Milo won't play sounds during quiet hours."
            choices={["6 PM – 7 AM", "7 PM – 7 AM", "8 PM – 7 AM", "Off"]}
          />
          <SettingRow
            label="Voice"
            value="On · soft"
            help="Voice prompts can be muted or set to whisper-soft."
            choices={["On · soft", "On · normal", "Mute"]}
          />
        </Section>

        {/* Reports */}
        <Section
          id="reports"
          title="This week"
          subtitle="A gentle weekly summary — no rankings, no scores."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <StatCard label="Days played" value="4 / 7" detail="Tuesday off, Sunday rest" />
            <StatCard
              label="Comfortable with"
              value="Letters A–C · Numbers 1–3"
              tone="ok"
              detail="Try one new each week"
            />
            <StatCard
              label="Needs more play"
              value="Counting around 4"
              detail="Re-introduce gently"
              tone="warn"
            />
          </div>
        </Section>

        {/* Safety */}
        <Section title="Safety" subtitle="Privacy and approved content.">
          <ul style={{ paddingLeft: 18, color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.7 }}>
            <li>
              No third-party ads. No data sold. Lina&apos;s name is stored locally on this device.
            </li>
            <li>
              Voice runs on-device whenever available, otherwise via the platform speech engine.
            </li>
            <li>
              Approved-content-only: only Milo&apos;s curated lessons and stories. No open web.
            </li>
          </ul>
        </Section>
      </div>
    </main>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 30 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: "0 0 4px" }}>{title}</h2>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0 0 12px" }}>{subtitle}</p>
      {children}
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "ok" | "warn";
}) {
  const c = tone === "ok" ? "var(--ok)" : tone === "warn" ? "var(--warn)" : "var(--ink)";
  const bg = tone === "ok" ? "var(--ok-bg)" : tone === "warn" ? "var(--warn-bg)" : "var(--bg-2)";
  return (
    <div className="la-card" style={{ padding: 14, borderLeft: `3px solid ${c}` }}>
      <div
        className="la-mono"
        style={{
          fontSize: 10,
          color: "var(--ink-mute)",
          letterSpacing: ".06em",
          fontWeight: 800,
        }}
      >
        {label.toUpperCase()}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: c }}>{value}</div>
      {detail ? (
        <div
          style={{
            fontSize: 12,
            color: "var(--ink-soft)",
            marginTop: 4,
            padding: "4px 8px",
            background: bg,
            borderRadius: 6,
            display: "inline-block",
          }}
        >
          {detail}
        </div>
      ) : null}
    </div>
  );
}

function SettingRow({
  label,
  value,
  help,
  choices,
}: {
  label: string;
  value: string;
  help: string;
  choices: string[];
}) {
  return (
    <div
      className="la-card"
      style={{
        padding: 14,
        marginBottom: 10,
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{label}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{help}</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          {choices.slice(0, 4).map((c) => (
            <span
              key={c}
              className="la-pill"
              style={{
                fontSize: 11,
                background: c === value ? "var(--brand-1)" : "var(--bg-2)",
                color: c === value ? "#fff" : "var(--ink-soft)",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}
