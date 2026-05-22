import type { Metadata } from "next";
import { Chip, Crumbs, PageHeader } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Learners" };

type Learner = {
  name: string;
  world: keyof typeof WORLD_C;
  age: number;
  parent: string;
  lastActive: string;
  streak: number;
  xp: number;
  status: "active" | "paused" | "at-risk" | "invited";
  email: string;
};

const WORLD_C = {
  "Little Learner": "#ec4899",
  Explorer: "#4338ca",
  Builder: "#7c3aed",
  Scholar: "#c2410c",
  Professional: "#0f766e",
  "Senior Learner": "#16a34a",
} as const;

const LEARNERS: Learner[] = [
  { name: "Jess M.", world: "Scholar", age: 16, parent: "—", lastActive: "just now", streak: 1, xp: 45, status: "active", email: "jess@school.org" },
  { name: "Sofia C.", world: "Little Learner", age: 5, parent: "Maria C. (mother)", lastActive: "2 min", streak: 4, xp: 320, status: "active", email: "via parent" },
  { name: "Maya R.", world: "Builder", age: 14, parent: "—", lastActive: "6 min", streak: 2, xp: 156, status: "active", email: "maya.r@hs.org" },
  { name: "Ruslan M.", world: "Professional", age: 32, parent: "—", lastActive: "14 min", streak: 2, xp: 210, status: "active", email: "ruslan@…" },
  { name: "Captain Aiden", world: "Explorer", age: 9, parent: "Tom W. (father)", lastActive: "1 h", streak: 7, xp: 540, status: "active", email: "via parent" },
  { name: "Elena P.", world: "Senior Learner", age: 68, parent: "—", lastActive: "yest.", streak: 0, xp: 38, status: "paused", email: "elena.p@…" },
  { name: "Diego F.", world: "Scholar", age: 17, parent: "—", lastActive: "2 days", streak: 0, xp: 12, status: "at-risk", email: "diego.f@…" },
  { name: "Hana K.", world: "Builder", age: 13, parent: "Aki K. (mother)", lastActive: "3 days", streak: 0, xp: 0, status: "invited", email: "via parent" },
];

const STATUS_TONES: Record<Learner["status"], { c: string; bg: string }> = {
  active: { c: "#16a34a", bg: "#dcfce7" },
  paused: { c: "var(--ink-mute)", bg: "var(--bg-2)" },
  "at-risk": { c: "#dc2626", bg: "#fee2e2" },
  invited: { c: "#b45309", bg: "#fef3c7" },
};

const COLS = "32px 1.4fr 1fr 50px 1.2fr 90px 80px 100px 120px";

export default function AdminLearners() {
  return (
    <>
      <Crumbs trail={["Admin", "Learners"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          title="Learners"
          subtitle="2,148 active · 312 new this week · 14 at-risk"
          right={
            <>
              <button type="button" className="la-btn ghost" style={{ padding: "9px 14px", fontSize: 13 }}>📩 Invite</button>
              <button type="button" className="la-btn ghost" style={{ padding: "9px 14px", fontSize: 13 }}>CSV export</button>
              <button type="button" className="la-btn" style={{ padding: "9px 14px", fontSize: 13 }}>+ Add learner</button>
            </>
          }
        />

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Chip on>All · 2,148</Chip>
          <Chip>🦁 Little (312)</Chip>
          <Chip>🚀 Explorer (488)</Chip>
          <Chip>🛠️ Builder (402)</Chip>
          <Chip>🎓 Scholar (580)</Chip>
          <Chip>💼 Pro (286)</Chip>
          <Chip>🌿 Senior (80)</Chip>
          <span aria-hidden style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }} />
          <Chip>⚠ At-risk · 14</Chip>
          <Chip>✨ New this wk · 312</Chip>
          <div className="ml-auto flex items-center gap-2">
            <input
              placeholder="🔍 Search by name or email…"
              className="rounded-lg border border-line bg-white px-3 py-2 text-[13px] outline-none focus:border-brand-1"
              style={{ width: 220 }}
            />
            <button type="button" className="la-btn ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
              Sort: Recent ▾
            </button>
          </div>
        </div>

        <div className="la-card mt-4 flex items-center gap-3.5 p-3.5" style={{ borderRadius: 16 }}>
          <div className="la-mono text-[11px] text-ink-mute">WORLDS · 2,148 TOTAL</div>
          <div className="flex h-[18px] flex-1 gap-0.5">
            {[
              { c: "#ec4899", w: 14 },
              { c: "#4338ca", w: 23 },
              { c: "#7c3aed", w: 19 },
              { c: "#c2410c", w: 27 },
              { c: "#0f766e", w: 13 },
              { c: "#16a34a", w: 4 },
            ].map((s, i) => (
              <div key={i} style={{ width: `${s.w * 4}%`, background: s.c }} />
            ))}
          </div>
          <div className="la-mono text-[11px] text-ink-mute">updated 2m ago</div>
        </div>

        <div className="la-card mt-4 overflow-hidden p-0" style={{ borderRadius: 16 }}>
          <div
            className="la-mono grid border-b border-line px-4 py-3 text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute"
            style={{ gridTemplateColumns: COLS, background: "var(--surface-soft)" }}
          >
            <input type="checkbox" aria-label="Select all" />
            <span>Learner</span>
            <span>World</span>
            <span>Age</span>
            <span>Parent / guardian</span>
            <span>Streak</span>
            <span>XP</span>
            <span>Last active</span>
            <span>Status</span>
          </div>
          {LEARNERS.map((l, i) => {
            const tone = STATUS_TONES[l.status];
            return (
              <div
                key={l.name}
                className="grid items-center px-4 py-3"
                style={{
                  gridTemplateColumns: COLS,
                  borderTop: i ? "1px solid var(--line-soft)" : "none",
                }}
              >
                <input type="checkbox" aria-label={`Select ${l.name}`} />
                <div>
                  <div className="text-[13px] font-extrabold text-ink">{l.name}</div>
                  <div className="la-mono text-[10px] text-ink-mute">{l.email}</div>
                </div>
                <span className="text-[12px] font-extrabold" style={{ color: WORLD_C[l.world] }}>
                  <span aria-hidden style={{ display: "inline-block", width: 6, height: 6, borderRadius: 99, background: WORLD_C[l.world], marginRight: 6 }} />
                  {l.world}
                </span>
                <span className="la-mono text-[12px]">{l.age}</span>
                <span className="text-[11.5px] text-ink-soft">{l.parent}</span>
                <span className="la-mono text-[12px]">{l.streak > 0 ? `🔥 ${l.streak}` : "—"}</span>
                <span className="la-mono text-[12px] font-extrabold">{l.xp}</span>
                <span className="la-mono text-[11px] text-ink-mute">{l.lastActive}</span>
                <span
                  className="la-pill text-[10px] font-extrabold"
                  style={{ background: tone.bg, color: tone.c }}
                >
                  {l.status}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between text-[12px] text-ink-mute">
          <span className="la-mono">showing 8 of 2,148</span>
          <div className="flex gap-2">
            <button type="button" className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>← Prev</button>
            <button type="button" className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>Next →</button>
          </div>
        </div>
      </div>
    </>
  );
}
