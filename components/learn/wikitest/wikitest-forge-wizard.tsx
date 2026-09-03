/**
 * Exam Forge wizard gallery screens (Batch 5, 4 screens).
 *
 *   ForgePlan        — Step 1: Plan & sources
 *   ForgeGenerating  — Step 2: Generating LIVE (SSE stream UI)
 *   ForgeReady       — Step 3: Ready — start learning
 *   ForgeQueue       — Library of forges (saved generations)
 *
 * Wires to `/api/synthetic/*` (POST jobs / GET stream / GET quizzes).
 */

"use client";

import { LATopBar, LASidebar, WTBreadcrumb } from "@/components/learn/shared/SidebarShell";
import { Icon } from "@/components/learn/shared/wikitest-icons";

const FORGE_HEADER = "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)";

function ForgeShell({ trail, children }: { trail: string[]; children: React.ReactNode }) {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="GRADE_9" streak={1} xp={45} initials="J" avatarBg="#c2410c" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Mentor Max" teacherIcon="🎓" />
        <main>
          <WTBreadcrumb trail={trail} />
          {children}
        </main>
      </div>
    </div>
  );
}

export function ForgePlan() {
  return (
    <ForgeShell trail={["GRADE_9", "ExamForge", "New exam"]}>
      <section style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 18,
            color: "#fff",
            background: FORGE_HEADER,
            marginBottom: 22,
          }}
        >
          <div className="la-mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em" }}>
            EXAMFORGE · STEP 1 OF 3
          </div>
          <h1 className="la-serif" style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 4px" }}>
            Plan & sources
          </h1>
          <p style={{ opacity: 0.88, fontSize: 14, margin: 0 }}>
            Tell Mentor Max what to build. We auto-tune the difficulty mix from your sources.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
          <div>
            <Section label="Topic">
              <input placeholder="e.g. Differential equations · grade 12" style={inputStyle} />
            </Section>
            <Section label="Sources">
              <div
                className="la-card"
                style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}
              >
                {[
                  { kind: "Wikipedia", t: "en.wikipedia.org/wiki/Differential_equation", ic: "🔗" },
                  { kind: "Upload", t: "syllabus-math12.pdf · 12 pages", ic: "📄" },
                  { kind: "Note", t: "Cover only first-order linear ODEs", ic: "✏️" },
                ].map((s) => (
                  <div
                    key={s.t}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr 100px 24px",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{s.ic}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.kind}</div>
                      <div className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                        {s.t}
                      </div>
                    </div>
                    <span
                      className="la-pill"
                      style={{ background: "var(--ok-bg)", color: "var(--ok)", fontSize: 11 }}
                    >
                      ✓ Parsed
                    </span>
                    <button className="la-iconbtn">✕</button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  <button className="la-btn ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
                    + URL
                  </button>
                  <button className="la-btn ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
                    + Upload
                  </button>
                  <button className="la-btn ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
                    + Note
                  </button>
                </div>
              </div>
            </Section>
            <Section label="Audience & pace">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input value="GRADE_9 (16–18)" readOnly style={inputStyle} />
                <input value="~12 minutes" readOnly style={inputStyle} />
              </div>
            </Section>
          </div>

          <div>
            <Section label="What Mentor Max will produce">
              <div className="la-card" style={{ padding: 16, background: "var(--surface-soft)" }}>
                {[
                  { k: "Questions", v: "10 · cited to source" },
                  { k: "Difficulty mix", v: "30 / 50 / 20 · auto" },
                  { k: "Types", v: "MCQ 6 · short answer 3 · T/F 1" },
                  { k: "Citations", v: "Every Q links a source line" },
                  { k: "Provider", v: "OllaBridge Cloud · qwen2.5:14b" },
                ].map((r) => (
                  <div
                    key={r.k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "6px 0",
                      fontSize: 12,
                    }}
                  >
                    <span className="la-mono" style={{ color: "var(--ink-mute)" }}>
                      {r.k}
                    </span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>{r.v}</span>
                  </div>
                ))}
              </div>
              <button
                className="la-btn"
                style={{ marginTop: 12, width: "100%", padding: "12px 18px" }}
              >
                <Icon.spark /> Start forging
              </button>
            </Section>
          </div>
        </div>
      </section>
    </ForgeShell>
  );
}

export function ForgeGenerating() {
  return (
    <ForgeShell trail={["GRADE_9", "ExamForge", "New exam", "Generating"]}>
      <section style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            padding: "26px 30px",
            borderRadius: 18,
            color: "#fff",
            background: FORGE_HEADER,
            marginBottom: 22,
          }}
        >
          <div className="la-mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em" }}>
            FORGING · STEP 2 OF 3 · LIVE
          </div>
          <h1 className="la-serif" style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 6px" }}>
            Generating your exam…
          </h1>
          <p style={{ opacity: 0.88, fontSize: 14, margin: 0 }}>
            Streaming questions as Mentor Max writes them. Total typical time: 30–90 seconds.
          </p>
          <div
            className="wt-meter"
            style={{ marginTop: 14, height: 8, background: "rgba(255,255,255,.18)" }}
          >
            <div className="fill" style={{ width: "62%", background: "#fff" }} />
          </div>
          <div
            style={{
              marginTop: 6,
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11.5,
              opacity: 0.85,
            }}
          >
            <span>Chunk 7 / 12 · 6 questions produced · 4 cited & validated</span>
            <span className="la-mono">12.4 s</span>
          </div>
        </div>

        <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "10px 14px",
              display: "flex",
              gap: 8,
              alignItems: "center",
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 99, background: "#ef4444" }} />
            <span
              className="la-mono"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".08em" }}
            >
              LIVE STREAM
            </span>
            <span
              className="la-mono"
              style={{ fontSize: 11, color: "var(--ink-mute)", marginLeft: "auto" }}
            >
              SSE · /api/synthetic/jobs/abc/stream
            </span>
          </div>
          {[
            { k: "plan", t: "12 chunks · target 10 q · easy 30 / med 50 / hard 20" },
            { k: "chunk 1 done", t: "History · 1 q · cited (✓)" },
            { k: "chunk 2 done", t: "Types · 2 q · cited (✓)" },
            { k: "chunk 3 done", t: "Ordinary DE · 3 q · cited (✓ ✓ ✓)" },
            { k: "chunk 4 retry", t: "Partial DE · citation outside chunk · re-prompt …" },
            { k: "chunk 4 done", t: "Partial DE · 2 q · cited (✓ ✓)" },
            { k: "chunk 5 done", t: "Linear vs nonlinear · 1 q · cited (✓)" },
            { k: "chunk 6 done", t: "Examples · 1 q · cited (✓)" },
            { k: "chunk 7 …", t: "Reading…" },
          ].map((row, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                padding: "8px 16px",
                borderTop: i ? "1px solid var(--line-soft)" : "none",
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
              }}
            >
              <span style={{ color: "var(--ink-mute)" }}>{row.k}</span>
              <span style={{ color: "var(--ink-soft)" }}>{row.t}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button className="la-btn ghost" style={{ padding: "10px 16px" }}>
            Cancel
          </button>
        </div>
      </section>
    </ForgeShell>
  );
}

export function ForgeReady() {
  return (
    <ForgeShell trail={["GRADE_9", "ExamForge", "New exam", "Ready"]}>
      <section style={{ padding: "28px 32px", maxWidth: 1000, margin: "0 auto" }}>
        <div
          style={{
            padding: "26px 30px",
            borderRadius: 18,
            color: "#fff",
            background: "linear-gradient(135deg, #16a34a 0%, #0f766e 100%)",
            marginBottom: 22,
          }}
        >
          <div className="la-mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em" }}>
            EXAMFORGE · STEP 3 OF 3 · READY
          </div>
          <h1 className="la-serif" style={{ fontSize: 28, fontWeight: 800, margin: "4px 0 6px" }}>
            Your exam is ready 🎉
          </h1>
          <p style={{ opacity: 0.92, fontSize: 14, margin: 0 }}>
            10 questions · 12 minutes · every answer cites your sources. Start learning, or save for
            later.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button
              className="la-btn"
              style={{
                background: "#fff",
                color: "var(--ink)",
                boxShadow: "none",
                padding: "12px 22px",
                fontWeight: 800,
              }}
            >
              <Icon.brain /> Learn first
            </button>
            <button
              className="la-btn"
              style={{
                background: "rgba(255,255,255,.18)",
                color: "#fff",
                boxShadow: "none",
                padding: "12px 18px",
              }}
            >
              <Icon.bolt color="#fff" /> Take test now
            </button>
            <button
              className="la-btn"
              style={{
                background: "transparent",
                color: "#fff",
                boxShadow: "0 0 0 1px rgba(255,255,255,.4) inset",
                padding: "12px 14px",
              }}
            >
              💾 Save to library
            </button>
          </div>
        </div>

        <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <span
              className="la-mono"
              style={{
                fontSize: 10,
                letterSpacing: ".08em",
                fontWeight: 800,
                color: "var(--ink-mute)",
              }}
            >
              PREVIEW · 3 / 10
            </span>
            <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
              ↻ Regenerate
            </button>
          </div>
          {[
            {
              q: "Which keyword distinguishes ordinary from partial DEs?",
              k: "MCQ · easy",
              cite: "§ Types",
            },
            {
              q: "Solve dy/dx + 2y = 0 with y(0)=1 using the integrating factor method.",
              k: "Short answer · hard",
              cite: "§ Ordinary DE",
            },
            {
              q: "True or False: the heat equation is a parabolic PDE.",
              k: "T/F · medium",
              cite: "§ Partial DE",
            },
          ].map((q, i) => (
            <div
              key={i}
              style={{ padding: "14px 16px", borderTop: i ? "1px solid var(--line-soft)" : "none" }}
            >
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
              >
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>{q.q}</div>
                <span
                  className="la-mono"
                  style={{
                    fontSize: 11,
                    color: "var(--ink-mute)",
                    whiteSpace: "nowrap",
                    marginLeft: 12,
                  }}
                >
                  {q.k}
                </span>
              </div>
              <div
                className="la-mono"
                style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 4 }}
              >
                📎 {q.cite}
              </div>
            </div>
          ))}
        </div>
      </section>
    </ForgeShell>
  );
}

export function ForgeQueue() {
  const items = [
    { t: "Differential equation", sub: "from Wikipedia · 10 q · 70%", state: "Completed" },
    { t: "Trigonometry sprint", sub: "from notes (PDF) · 12 q · 55%", state: "Re-train" },
    {
      t: "AP Chem · acids & bases",
      sub: "from notes (PDF) · 12 q · generating…",
      state: "Generating",
    },
    { t: "AP Lit · Romeo & Juliet", sub: "draft · saved · not generated", state: "Draft" },
  ];
  return (
    <ForgeShell trail={["GRADE_9", "ExamForge", "Library"]}>
      <section style={{ padding: "28px 32px", maxWidth: 1140, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 22,
          }}
        >
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Library of forges
            </h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>
              Every exam you've forged. Resume drafts, view results, or re-train your weak areas.
            </p>
          </div>
          <button className="la-btn">
            <Icon.spark /> New forge
          </button>
        </div>

        <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
          {items.map((it, i) => (
            <div
              key={it.t}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px 130px 120px",
                gap: 14,
                padding: "14px 16px",
                borderTop: i ? "1px solid var(--line-soft)" : "none",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>{it.t}</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}
                >
                  {it.sub}
                </div>
              </div>
              <span
                className="la-pill"
                style={{
                  fontSize: 11,
                  background:
                    it.state === "Generating"
                      ? "var(--bg-2)"
                      : it.state === "Re-train"
                        ? "var(--bad-bg)"
                        : "var(--ok-bg)",
                  color:
                    it.state === "Generating"
                      ? "var(--brand-1)"
                      : it.state === "Re-train"
                        ? "var(--bad)"
                        : "var(--ok)",
                }}
              >
                {it.state}
              </span>
              <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                2 days ago
              </span>
              <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
                Open →
              </button>
            </div>
          ))}
        </div>
      </section>
    </ForgeShell>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontFamily: "inherit",
  fontSize: 13.5,
  background: "#fff",
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        className="la-mono"
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".08em",
          color: "var(--ink-mute)",
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}
