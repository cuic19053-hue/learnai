import type { Metadata } from "next";
import { Crumbs, PageHeader } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Loops" };

const FUNNEL = [
  { l: "Hook", n: 6402, pct: 100, drop: 0, color: "#ef4444", ic: "🧲" },
  { l: "Explain", n: 5826, pct: 91, drop: 9, color: "#f59e0b", ic: "💡" },
  { l: "Practice", n: 5288, pct: 83, drop: 8, color: "#fb923c", ic: "✏️" },
  { l: "Feedback", n: 4626, pct: 72, drop: 11, color: "#8b5cf6", ic: "💬" },
  { l: "Reflect", n: 3608, pct: 56, drop: 16, color: "#ec4899", ic: "🪞", worst: true },
  { l: "Evolve", n: 3268, pct: 51, drop: 5, color: "#22c55e", ic: "🌱" },
];

const BY_WORLD = [
  { w: "Little Learner", c: "#ec4899", v: 74 },
  { w: "Explorer", c: "#4338ca", v: 49 },
  { w: "Builder", c: "#7c3aed", v: 42 },
  { w: "Scholar", c: "#c2410c", v: 64 },
  { w: "Professional", c: "#0f766e", v: 58 },
  { w: "Senior Learner", c: "#16a34a", v: 81 },
];

const METHODS = [
  { m: "Active recall", tradition: "2006", sessions: 92, score: 8.4 },
  { m: "Worked example → twin", tradition: "Sweller 1985", sessions: 76, score: 8.2 },
  { m: "Spaced repetition", tradition: "Ebbinghaus 1885", sessions: 68, score: 8.0 },
  { m: "Kumon mastery ladder", tradition: "Kumon 1958", sessions: 64, score: 7.7 },
  { m: "Socratic dialogue", tradition: "5th c. BCE", sessions: 41, score: 8.6 },
  { m: "Feynman technique", tradition: "1960s", sessions: 28, score: 9.0 },
  { m: "Interleaving", tradition: "Bjork 1990s", sessions: 22, score: 7.5 },
  { m: "ZPD adaptive", tradition: "Vygotsky 1934", sessions: 18, score: 8.1 },
  { m: "Loci · memory palace", tradition: "~500 BCE", sessions: 8, score: 6.9 },
  { m: "Shatalov ref signal", tradition: "1970s", sessions: 14, score: 7.2 },
];

export default function AdminLoops() {
  return (
    <>
      <Crumbs trail={["Admin", "Loops"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          title="Loop performance"
          subtitle="Every session runs the same 6 steps. This page shows where learners drop off and which step needs the most teaching-design attention."
          right={
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "9px 14px", fontSize: 13 }}
            >
              Last 7 days ▾
            </button>
          }
        />

        <section className="la-card mt-5 p-6" style={{ borderRadius: 18 }}>
          <h3 className="text-[16px] font-extrabold text-ink">
            Loop funnel · 6,402 sessions · last 24 h
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-6">
            {FUNNEL.map((s, i) => (
              <div
                key={s.l}
                className="relative rounded-2xl p-3.5"
                style={{
                  background: s.worst ? "#fee2e2" : "var(--surface-soft)",
                  border: s.worst ? "1.5px solid #dc2626" : "1px solid var(--line-soft)",
                }}
              >
                <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                  STEP 0{i + 1}
                </div>
                <div className="mt-1 flex items-center gap-1.5">
                  <span aria-hidden className="text-[16px]">
                    {s.ic}
                  </span>
                  <span className="text-[14px] font-extrabold" style={{ color: s.color }}>
                    {s.l}
                  </span>
                </div>
                <div
                  className="mt-1.5 text-[22px] font-extrabold"
                  style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
                >
                  {s.pct}%
                </div>
                <div className="la-mono text-[10px] text-ink-mute">
                  {s.n.toLocaleString()} sessions
                </div>
                {s.drop > 0 ? (
                  <div
                    className="la-mono mt-1 text-[10px]"
                    style={{ color: s.worst ? "#dc2626" : "var(--ink-mute)" }}
                  >
                    −{s.drop}% dropped here
                  </div>
                ) : null}
                {s.worst ? (
                  <span
                    className="la-pill absolute right-2 top-2 text-[9px] font-extrabold"
                    style={{ background: "#dc2626", color: "#fff", padding: "2px 6px" }}
                  >
                    WEAK SPOT
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl p-3.5" style={{ background: "var(--bg-2)" }}>
            <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-brand-1">
              Suggested action
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-ink">
              <b>Reflect</b> is your biggest drop (−16%). Move the Shatalov reference signal earlier
              and reduce the reflection prompt to one sentence. Builder + Explorer worlds account
              for 70% of the drop.
            </p>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[16px] font-extrabold text-ink">Completion · by world</h3>
            <div className="mt-3 divide-y divide-line-soft">
              {BY_WORLD.map((r) => (
                <div key={r.w} className="py-2.5">
                  <div className="flex justify-between text-[12.5px]">
                    <span className="font-extrabold text-ink">
                      <span
                        aria-hidden
                        style={{
                          display: "inline-block",
                          width: 6,
                          height: 6,
                          borderRadius: 99,
                          background: r.c,
                          marginRight: 6,
                        }}
                      />
                      {r.w}
                    </span>
                    <span className="la-mono font-extrabold">{r.v}%</span>
                  </div>
                  <div className="wt-meter mt-1">
                    <div className="fill" style={{ width: `${r.v}%`, background: r.c }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[16px] font-extrabold text-ink">Method effectiveness</h3>
            <p className="mt-1 text-[12px] text-ink-soft">
              10 catalogued methods · % of sessions where they appear · learner-rated helpfulness.
            </p>
            <div className="mt-3 divide-y divide-line-soft">
              {METHODS.map((m) => (
                <div
                  key={m.m}
                  className="grid items-center gap-3 py-2 text-[12px]"
                  style={{ gridTemplateColumns: "1.6fr 110px 60px 70px" }}
                >
                  <span className="font-extrabold text-ink">{m.m}</span>
                  <span className="la-mono text-[10px] text-ink-mute">{m.tradition}</span>
                  <span className="la-mono text-[11px] text-ink-soft">{m.sessions}%</span>
                  <span
                    className="la-mono text-[11px] font-extrabold"
                    style={{
                      color:
                        m.score >= 8 ? "#16a34a" : m.score >= 7 ? "#f59e0b" : "var(--ink-mute)",
                    }}
                  >
                    ★ {m.score}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
