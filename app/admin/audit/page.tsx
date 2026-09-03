import type { Metadata } from "next";
import { Chip, Crumbs, PageHeader } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Audit log" };

type Severity = "info" | "med" | "high";

const AUDIT: Array<{
  t: string;
  actor: string;
  ic: string;
  action: string;
  target: string;
  ip: string;
  sev: Severity;
}> = [
  {
    t: "14:42:17",
    actor: "admin@learnai",
    ic: "🤖",
    action: "provider.add",
    target: "xAI · Grok",
    ip: "88.143.x.x",
    sev: "info",
  },
  {
    t: "14:38:02",
    actor: "admin@learnai",
    ic: "🔑",
    action: "apikey.create",
    target: "xai-prod-key-1",
    ip: "88.143.x.x",
    sev: "high",
  },
  {
    t: "14:21:55",
    actor: "system",
    ic: "🛡️",
    action: "safety.block",
    target: "GRADE_8 · profanity · Maya",
    ip: "—",
    sev: "med",
  },
  {
    t: "14:11:30",
    actor: "system",
    ic: "✨",
    action: "wikitest.generate",
    target: "Linear algebra · jess",
    ip: "—",
    sev: "info",
  },
  {
    t: "13:58:09",
    actor: "mariac@gmail",
    ic: "👪",
    action: "parent.update_settings",
    target: "Sofia · session_length=15m",
    ip: "92.30.x.x",
    sev: "info",
  },
  {
    t: "13:47:23",
    actor: "system",
    ic: "💳",
    action: "billing.alert",
    target: "OpenAI · 49% of $50 cap",
    ip: "—",
    sev: "info",
  },
  {
    t: "13:30:18",
    actor: "admin@learnai",
    ic: "🎭",
    action: "persona.edit",
    target: "mentor-max.hpersona · v4",
    ip: "88.143.x.x",
    sev: "info",
  },
  {
    t: "12:55:00",
    actor: "admin@learnai",
    ic: "🌍",
    action: "world.toggle",
    target: "Senior Learner · disabled",
    ip: "88.143.x.x",
    sev: "med",
  },
  {
    t: "12:18:44",
    actor: "system",
    ic: "🛡️",
    action: "safety.block.high",
    target: "GRADE_9 · self-harm · auto-resolved",
    ip: "—",
    sev: "high",
  },
  {
    t: "11:42:01",
    actor: "anna@learnai",
    ic: "🛡️",
    action: "incident.resolve",
    target: "inc-2087 · 4m to resolve",
    ip: "37.18.x.x",
    sev: "info",
  },
  {
    t: "11:30:55",
    actor: "jess@school",
    ic: "✨",
    action: "wikitest.create",
    target: "Trig sprint · 24-day plan",
    ip: "—",
    sev: "info",
  },
  {
    t: "10:14:22",
    actor: "admin@learnai",
    ic: "⚙",
    action: "routing.update",
    target: "GRADE_9 · grok-4-fast primary",
    ip: "88.143.x.x",
    sev: "info",
  },
  {
    t: "09:08:11",
    actor: "system",
    ic: "🔁",
    action: "failover.trigger",
    target: "OllaBridge timeout → OpenAI",
    ip: "—",
    sev: "med",
  },
  {
    t: "08:00:00",
    actor: "system",
    ic: "📜",
    action: "audit.snapshot",
    target: "daily digest · 14,230 events",
    ip: "—",
    sev: "info",
  },
];

const COLS = "90px 24px 1.2fr 1.6fr 1.4fr 110px 70px";

const SEV_TONE: Record<Severity, { c: string; bg: string }> = {
  info: { c: "var(--ink-mute)", bg: "var(--bg-2)" },
  med: { c: "#b45309", bg: "#fef3c7" },
  high: { c: "#991b1b", bg: "#fee2e2" },
};

export default function AdminAudit() {
  return (
    <>
      <Crumbs trail={["Admin", "Audit log"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          eyebrow={
            <span
              className="la-pill text-[11px]"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              📜 14,230 events · last 24 h · retained 90 days
            </span>
          }
          title="Audit log"
          subtitle="Every privileged action, safety event, and learner-impacting change. Append-only, signed hourly."
          right={
            <>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                📥 Export CSV
              </button>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                🔍 Search by actor
              </button>
            </>
          }
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Chip on>All · 14.2k</Chip>
          <Chip>🛡️ Safety · 48</Chip>
          <Chip>🔑 Auth & keys · 12</Chip>
          <Chip>⚙ Config · 32</Chip>
          <Chip>💳 Billing · 8</Chip>
          <Chip>🎭 Personas · 6</Chip>
          <Chip>👪 Parent actions · 84</Chip>
          <span
            aria-hidden
            style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }}
          />
          <Chip>HIGH only · 4</Chip>
          <div className="ml-auto flex gap-2">
            <input
              placeholder="🔍 actor, action, or target…"
              className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-1"
              style={{ width: 240 }}
            />
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "8px 12px", fontSize: 12 }}
            >
              Last 24 h ▾
            </button>
          </div>
        </div>

        <div className="la-card mt-4 overflow-hidden p-0" style={{ borderRadius: 16 }}>
          <div
            className="la-mono grid px-4 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute"
            style={{ gridTemplateColumns: COLS, background: "var(--surface-soft)" }}
          >
            <span>Time</span>
            <span />
            <span>Actor</span>
            <span>Action</span>
            <span>Target</span>
            <span>IP</span>
            <span>Sev</span>
          </div>
          {AUDIT.map((e, i) => {
            const tone = SEV_TONE[e.sev];
            return (
              <div
                key={i}
                className="grid items-center px-4 py-2"
                style={{
                  gridTemplateColumns: COLS,
                  borderTop: i ? "1px solid var(--line-soft)" : "none",
                  background: e.sev === "high" ? "#fee2e2" : "#fff",
                }}
              >
                <span className="la-mono text-[11px] text-ink-mute">{e.t}</span>
                <span aria-hidden className="text-[14px]">
                  {e.ic}
                </span>
                <span className="text-[12px] font-semibold text-ink">{e.actor}</span>
                <span
                  className="la-mono text-[12px] font-extrabold"
                  style={{ color: "var(--brand-1)" }}
                >
                  {e.action}
                </span>
                <span
                  className="la-mono truncate text-[11px] text-ink-soft"
                  style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {e.target}
                </span>
                <span className="la-mono text-[10px] text-ink-mute">{e.ip}</span>
                <span
                  className="la-mono rounded-md px-1.5 py-1 text-center text-[9px] font-extrabold uppercase tracking-[0.04em]"
                  style={{ background: tone.bg, color: tone.c }}
                >
                  {e.sev}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[12px] text-ink-mute">
          <span className="la-mono">showing 14 of 14,230 · today</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              ← Older
            </button>
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "6px 12px", fontSize: 12 }}
            >
              Newer →
            </button>
          </div>
        </div>

        <div
          className="la-mono mt-4 rounded-xl border border-dashed border-line p-3 text-[11px] text-ink-soft"
          style={{ background: "var(--surface-soft)" }}
        >
          ✔ Audit chain verified · last signature: 14:00:00 UTC · sha256 a91b…d4f3 · signed by hsm-1
        </div>
      </div>
    </>
  );
}
