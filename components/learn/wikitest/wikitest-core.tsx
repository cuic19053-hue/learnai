/**
 * WikiTest core gallery screens (Batch 2, 8 screens).
 *
 * Faithful TSX ports of the design handoff prototypes:
 *   ScholarHome   — Scholar World home, with WikiTest entry card
 *   WikiHub       — "Understand any Wikipedia article" landing
 *   WikiDetail    — Test-ready (Differential equation)
 *   WikiTrain     — Loop · tutor chat training surface
 *   WikiExam      — Exam in progress (locked header, timer, MCQ + free-response)
 *   ExamFocusMode — Distraction-free dark exam canvas
 *   WikiResults   — Readiness report with "next best step" hero
 *   WikiLibrary   — Saved tests grid
 *
 * Sources: /tmp/design/extracted/learnai/project/wikitest-screen-*.jsx.
 * Uses the shared chrome from Batch 1 (`SidebarShell`, `Icon`, etc.).
 */

"use client";

import { useState } from "react";
import {
  LATopBar,
  LASidebar,
  WTBreadcrumb,
  WTFootAttribution,
  LearnAIMark,
} from "@/components/learn/shared/SidebarShell";
import { Icon } from "@/components/learn/shared/wikitest-icons";

// ─── 0 · Scholar Home ─────────────────────────────────────────────

const LOOP_STEPS = [
  { label: "Hook", state: "done", emoji: "❓" },
  { label: "Explain", state: "done", emoji: "💡" },
  { label: "Practice", state: "current", emoji: "✏️" },
  { label: "Feedback", state: "locked", emoji: "💬" },
  { label: "Reflect", state: "locked", emoji: "🪞" },
  { label: "Evolve", state: "locked", emoji: "🌱" },
] as const;

export function ScholarHome() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={0} initials="J" avatarBg="#7c3aed" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", minHeight: 836 }}>
        <LASidebar active="Home" teacherName="Mentor Max" teacherIcon="🎓" />

        <main style={{ padding: "28px 36px", overflow: "hidden" }}>
          <div style={{ color: "var(--ink-mute)", fontSize: 13, marginBottom: 4 }}>
            Thursday, May 21
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
            Welcome back, Jess{" "}
            <span style={{ display: "inline-block", transform: "rotate(-12deg)" }}>👋</span>
          </h1>
          <p
            style={{ color: "var(--ink-soft)", fontSize: 15, margin: "6px 0 22px", maxWidth: 720 }}
          >
            Trigonometry is your weakest area. 25-minute focused session today moves you up a band.
          </p>

          {/* Today's session — Scholar warm gradient */}
          <div
            style={{
              borderRadius: 22,
              padding: "28px 32px",
              position: "relative",
              overflow: "hidden",
              background: "linear-gradient(135deg, #c2410c 0%, #9a3412 60%, #7c2d12 100%)",
              color: "#fff",
              boxShadow: "var(--shadow-2)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 130px",
                gap: 32,
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  className="la-mono"
                  style={{
                    fontSize: 11,
                    opacity: 0.85,
                    letterSpacing: ".08em",
                    marginBottom: 10,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  TODAY'S SESSION
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 99,
                      background: "rgba(255,255,255,.5)",
                    }}
                  />
                  <span>2 OF 6 COMPLETED · NEXT: PRACTICE</span>
                </div>
                <h2
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: "-0.015em",
                    margin: "4px 0 10px",
                    lineHeight: 1.1,
                  }}
                >
                  Trigonometry: sine and cosine basics
                </h2>
                <p style={{ opacity: 0.88, fontSize: 14, lineHeight: 1.55, margin: "0 0 22px" }}>
                  Concept refresher, two worked examples, then 5 exam-style questions with feedback.
                  Teach-until-learned loop on misses.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <button
                    className="la-btn"
                    style={{
                      background: "#fff",
                      color: "var(--ink)",
                      boxShadow: "none",
                      padding: "12px 22px",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    ▶ Continue session
                  </button>
                  <span style={{ opacity: 0.85, fontSize: 13 }}>
                    ~15 min left · +60 XP remaining
                  </span>
                </div>
              </div>

              {/* Progress ring */}
              <div style={{ textAlign: "center", padding: 6 }}>
                <div
                  className="la-mono"
                  style={{ fontSize: 10, opacity: 0.7, letterSpacing: ".08em", marginBottom: 6 }}
                >
                  PROGRESS
                </div>
                <div style={{ position: "relative", width: 100, height: 100, margin: "0 auto" }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,.15)"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#fff"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${(2 / 6) * 2 * Math.PI * 40} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        className="la-serif"
                        style={{ fontSize: 26, fontWeight: 800, lineHeight: 1 }}
                      >
                        2<span style={{ fontSize: 14, opacity: 0.7 }}>/6</span>
                      </div>
                      <div className="la-mono" style={{ fontSize: 9, opacity: 0.85, marginTop: 2 }}>
                        steps done
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loop steps row */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 10,
                marginTop: 28,
              }}
            >
              {LOOP_STEPS.map((s) => (
                <LoopStepCard key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* Continue + WikiTest callout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 22 }}>
            <div className="la-card" style={{ padding: 18 }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: ".08em",
                  marginBottom: 12,
                }}
              >
                CONTINUE PRACTICING
              </div>
              {[
                { t: "Algebra: quadratic equations", s: "Math · 68% mastery", w: 68 },
                { t: "Probability fundamentals", s: "Math · 75% mastery", w: 75 },
              ].map((c, i) => (
                <div
                  key={c.t}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "54px 1fr 18px",
                    gap: 14,
                    padding: "10px 0",
                    borderTop: i ? "1px solid var(--line-soft)" : "none",
                    alignItems: "center",
                  }}
                >
                  <div className="la-imgslot" style={{ width: 54, height: 38, fontSize: 9 }}>
                    <span>Cover</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{c.t}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)", marginBottom: 5 }}>
                      {c.s}
                    </div>
                    <div className="wt-meter" style={{ height: 6 }}>
                      <div className="fill" style={{ width: `${c.w}%`, background: "#c2410c" }} />
                    </div>
                  </div>
                  <Icon.arrow color="var(--ink-mute)" />
                </div>
              ))}
            </div>

            <div
              className="la-card"
              style={{
                padding: 18,
                position: "relative",
                overflow: "hidden",
                border: "1.5px solid var(--brand-1)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: 0.06,
                  background: "var(--brand-grad)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span
                    className="la-mono"
                    style={{ fontSize: 10, color: "var(--brand-1)", letterSpacing: ".08em" }}
                  >
                    NEW IN SCHOLAR · WIKITEST
                  </span>
                  <span
                    className="la-pill"
                    style={{
                      background: "var(--brand-grad)",
                      color: "#fff",
                      fontSize: 10,
                      padding: "2px 8px",
                    }}
                  >
                    BETA
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    margin: "4px 0 6px",
                  }}
                >
                  Build a test from any Wikipedia article
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--ink-soft)",
                    lineHeight: 1.55,
                    margin: "0 0 14px",
                  }}
                >
                  Paste a link. Mentor Max walks you through the article, then grades you on it.
                  Same Loop — taught from a source you choose.
                </p>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="la-btn" style={{ padding: "10px 16px", fontSize: 13 }}>
                    <Icon.spark /> Try WikiTest
                  </button>
                  <button className="la-btn ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                    How it works
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right — Mentor chat */}
        <aside
          style={{
            padding: "24px 18px",
            borderLeft: "1px solid var(--line-soft)",
            background: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 99,
                  background: "#fff1d6",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 18,
                }}
              >
                🎓
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800 }}>Mentor Max</div>
                <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>Your AI teacher</div>
              </div>
            </div>
            <button className="la-iconbtn">⋯</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ChatMsg from="ai">
              Welcome back! Want to keep going where you left off, or do a 5-min warm-up first?
            </ChatMsg>
            <ChatMsg from="me">Let's do the warm-up first 🎯</ChatMsg>
            <ChatMsg from="ai">
              Smart move 🧠 Loading 5 pattern puzzles, getting easier as you warm up…
            </ChatMsg>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {["Explain like I'm 10", "Show me an example", "Make it harder"].map((q) => (
              <button
                key={q}
                style={{
                  border: "1px solid var(--line)",
                  background: "#fff",
                  cursor: "pointer",
                  padding: "7px 11px",
                  borderRadius: 99,
                  fontFamily: "inherit",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--ink-soft)",
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function LoopStepCard({ label, state, emoji }: { label: string; state: string; emoji: string }) {
  const isDone = state === "done";
  const isCurrent = state === "current";
  const isLocked = state === "locked";
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        position: "relative",
        background: isCurrent ? "#fff" : isDone ? "rgba(255,255,255,.12)" : "transparent",
        color: isCurrent ? "var(--ink)" : "#fff",
        border: isCurrent ? "none" : "1px solid rgba(255,255,255,.18)",
        boxShadow: isCurrent
          ? "0 8px 22px rgba(0,0,0,.18), 0 0 0 3px rgba(255,255,255,.22)"
          : "none",
        opacity: isLocked ? 0.45 : 1,
        transform: isCurrent ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 18 }} aria-hidden>
          {emoji}
        </span>
        {isDone ? (
          <span style={{ fontSize: 12 }}>✓</span>
        ) : isLocked ? (
          <span style={{ fontSize: 11 }}>🔒</span>
        ) : null}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800 }}>{label}</div>
      <div
        className="la-mono"
        style={{
          fontSize: 10,
          marginTop: 3,
          color: isCurrent ? "#c2410c" : "#fff",
          opacity: isCurrent ? 1 : 0.7,
          fontWeight: isCurrent ? 800 : 600,
        }}
      >
        {isDone ? "COMPLETED" : isCurrent ? "CURRENT STEP" : "LOCKED"}
      </div>
    </div>
  );
}

function ChatMsg({ from, children }: { from: "ai" | "me"; children: React.ReactNode }) {
  if (from === "me") {
    return (
      <div
        style={{
          alignSelf: "flex-end",
          background: "var(--brand-grad)",
          color: "#fff",
          borderRadius: 14,
          padding: "10px 13px",
          fontSize: 13,
          lineHeight: 1.5,
          maxWidth: "85%",
        }}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      style={{
        background: "var(--surface-soft)",
        border: "1px solid var(--line-soft)",
        borderRadius: 14,
        padding: "10px 13px",
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

// ─── 1 · WikiTest hub (landing) ──────────────────────────────────

export function WikiHub() {
  const [url, setUrl] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={45} initials="J" avatarBg="#7c3aed" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Mentor Max" teacherIcon="🎓" />
        <main style={{ position: "relative" }}>
          <WTBreadcrumb trail={["Scholar", "WikiTest"]} />

          <section
            style={{
              padding: "60px 28px 40px",
              textAlign: "center",
              maxWidth: 760,
              margin: "0 auto",
            }}
          >
            <span
              className="la-pill"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              <Icon.book color="var(--brand-1)" /> WikiTest · a guided reading tutor for Wikipedia
            </span>
            <h1
              style={{
                fontSize: 44,
                lineHeight: 1.08,
                letterSpacing: "-0.025em",
                fontWeight: 800,
                margin: "14px 0 8px",
              }}
            >
              Understand any Wikipedia article.
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 16,
                margin: "8px auto 26px",
                maxWidth: 580,
                lineHeight: 1.55,
              }}
            >
              WikiTest reads the article with you, runs small check-ins, then gives a cited test
              back to the source.
            </p>

            <div className="wt-urlbar" style={{ textAlign: "left" }}>
              <Icon.link color="var(--brand-1)" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a Wikipedia URL · or pick a sample below"
              />
              <button className="la-btn" style={{ padding: "12px 24px", fontSize: 14 }}>
                Start learning <Icon.arrow color="#fff" />
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                marginTop: 12,
                fontSize: 11.5,
                color: "var(--ink-mute)",
                flexWrap: "wrap",
              }}
            >
              <span>
                <b style={{ color: "var(--ink-soft)" }}>Auto-tuned</b> · 8 short questions · learn
                first, then test
              </span>
              <span style={{ color: "var(--ink-faint)" }}>·</span>
              <button
                type="button"
                onClick={() => setShowCustom((s) => !s)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  color: "var(--brand-1)",
                  fontFamily: "inherit",
                  fontWeight: 700,
                  fontSize: 11.5,
                }}
              >
                Customize {showCustom ? "▴" : "▾"}
              </button>
            </div>

            {showCustom ? (
              <div
                style={{
                  marginTop: 12,
                  padding: "14px 16px",
                  borderRadius: 12,
                  background: "var(--surface-soft)",
                  border: "1px solid var(--line-soft)",
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                }}
              >
                <CustomField label="Level">
                  <SegRow opts={["Auto", "Beginner", "Intermediate", "Advanced"]} activeIdx={0} />
                </CustomField>
                <CustomField label="Mode">
                  <SegRow opts={["Learn first", "Quick test", "Review weak parts"]} activeIdx={0} />
                </CustomField>
                <CustomField label="Questions">
                  <SegRow opts={["5", "8", "12", "20"]} activeIdx={1} />
                </CustomField>
              </div>
            ) : null}

            <div
              style={{
                marginTop: 18,
                display: "flex",
                alignItems: "center",
                gap: 8,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                or try one:
              </span>
              {["Calculus", "Photosynthesis", "World War II", "Volcanoes"].map((s) => (
                <button
                  key={s}
                  type="button"
                  style={{
                    border: "1px solid var(--line)",
                    background: "#fff",
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: 99,
                    fontFamily: "inherit",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--ink-soft)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>

          <section style={{ padding: "16px 36px 12px", maxWidth: 980, margin: "0 auto" }}>
            <h3
              style={{
                fontSize: 16,
                fontWeight: 800,
                letterSpacing: "-0.01em",
                textAlign: "center",
                margin: "0 0 18px",
              }}
            >
              How it works
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
              <HowStep
                n="1"
                t="Learn the article"
                body="Mentor Max walks you through the article one section at a time."
              />
              <HowStep
                n="2"
                t="Practice key ideas"
                body="Short check-in questions after each section."
              />
              <HowStep
                n="3"
                t="Test yourself"
                body="A short cited test at the end. Open-book is fine."
              />
              <HowStep
                n="4"
                t="Review weak sections"
                body="Misses become your personal review plan."
              />
            </div>
          </section>

          <section style={{ padding: "28px 36px 12px", maxWidth: 980, margin: "0 auto" }}>
            <div className="la-card" style={{ padding: 22, background: "var(--surface-soft)" }}>
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  margin: "0 0 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🛡 Why this is safe to learn from
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                <TrustRow
                  t="Every question links to the article section"
                  body="Tap a question to jump to the paragraph it came from."
                />
                <TrustRow
                  t="Wrong answers show the source paragraph"
                  body="See the exact sentence that explains the right answer."
                />
                <TrustRow
                  t="Your weak sections become your review plan"
                  body="No re-reading from scratch — only what you missed."
                />
              </div>
            </div>
          </section>

          <section style={{ padding: "20px 36px 36px", maxWidth: 980, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <h3 style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>Your last 3 WikiTests</h3>
              <button className="wt-tab" style={{ fontSize: 12, padding: 0 }}>
                See all →
              </button>
            </div>
            <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
              {[
                {
                  t: "Differential equation",
                  sub: "en.wikipedia.org · 10 q · cited · 2 days ago",
                  score: 70,
                  ic: "∫",
                },
                {
                  t: "Photosynthesis",
                  sub: "en.wikipedia.org · 8 q · cited · 5 days ago",
                  score: 95,
                  ic: "✺",
                },
                {
                  t: "French Revolution",
                  sub: "en.wikipedia.org · 10 q · cited · 1 wk ago",
                  score: 75,
                  ic: "❡",
                },
              ].map((r, i) => (
                <div
                  key={r.t}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 80px 110px",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderTop: i ? "1px solid var(--line-soft)" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: "var(--bg-2)",
                      display: "grid",
                      placeItems: "center",
                      fontFamily: "var(--font-serif)",
                      fontWeight: 800,
                      fontSize: 16,
                      color: "var(--brand-1)",
                    }}
                  >
                    {r.ic}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{r.t}</div>
                    <div
                      className="la-mono"
                      style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 1 }}
                    >
                      {r.sub}
                    </div>
                  </div>
                  <span
                    className="la-mono"
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: r.score >= 80 ? "var(--ok)" : "var(--warn)",
                    }}
                  >
                    {r.score}%
                  </span>
                  <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 11.5 }}>
                    Review weak parts →
                  </button>
                </div>
              ))}
            </div>
          </section>

          <WTFootAttribution />
        </main>
      </div>
    </div>
  );
}

function HowStep({ n, t, body }: { n: string; t: string; body: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        background: "#fff",
        border: "1px solid var(--line-soft)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 99,
            background: "var(--brand-grad)",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {n}
        </span>
        <span style={{ fontSize: 14, fontWeight: 800 }}>{t}</span>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}

function TrustRow({ t, body }: { t: string; body: string }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <span style={{ color: "var(--ok)", fontSize: 16, fontWeight: 800, lineHeight: 1.2 }}>✓</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.45 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

function CustomField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div
        className="la-mono"
        style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em", marginBottom: 6 }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function SegRow({ opts, activeIdx }: { opts: string[]; activeIdx: number }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {opts.map((o, i) => (
        <button
          key={o}
          type="button"
          style={{
            padding: "6px 11px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            background: i === activeIdx ? "var(--brand-grad)" : "#fff",
            color: i === activeIdx ? "#fff" : "var(--ink-soft)",
            border: i === activeIdx ? "none" : "1px solid var(--line)",
            fontSize: 11.5,
            fontWeight: 700,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── 2 · WikiDetail (Test ready) ─────────────────────────────────

export function WikiDetail() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={45} initials="J" avatarBg="#7c3aed" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Mentor Max" teacherIcon="🎓" />
        <main>
          <WTBreadcrumb trail={["Scholar", "WikiTest", "Differential equation"]} />

          <section style={{ padding: "36px 32px", maxWidth: 920, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <span
                className="la-pill"
                style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: 99, background: "var(--s-math)" }}
                />{" "}
                Mathematics
              </span>
              <span className="la-pill">Intermediate</span>
              <span
                className="la-mono"
                style={{ fontSize: 11, color: "var(--ink-mute)", marginLeft: "auto" }}
              >
                from en.wikipedia.org/wiki/Differential_equation
              </span>
            </div>

            <h1
              className="la-serif"
              style={{
                fontSize: 46,
                fontWeight: 800,
                letterSpacing: "-0.025em",
                margin: "4px 0 14px",
                lineHeight: 1.05,
              }}
            >
              Differential equation
            </h1>

            <div className="la-card" style={{ padding: 24, marginBottom: 16 }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 11,
                  color: "var(--brand-1)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                YOU WILL LEARN
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <LearnPoint
                  t="Ordinary differential equations"
                  body="Single-variable equations and their general solutions."
                />
                <LearnPoint
                  t="Partial differential equations"
                  body="Equations with multiple variables — wave, heat, Laplace."
                />
                <LearnPoint
                  t="Linear vs nonlinear equations"
                  body="What makes an equation linear, and why it matters."
                />
                <LearnPoint
                  t="Methods for solving"
                  body="Separation, integrating factor, classification."
                />
              </div>
              <div
                style={{
                  marginTop: 16,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--surface-soft)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  color: "var(--ink-soft)",
                  fontSize: 13,
                }}
              >
                <span>
                  📖 <b style={{ color: "var(--ink)" }}>10 questions</b>
                </span>
                <span>·</span>
                <span>
                  ⏱ <b style={{ color: "var(--ink)" }}>about 12 minutes</b>
                </span>
                <span>·</span>
                <span>🔗 every answer cites the article</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
              <button className="la-btn" style={{ padding: "14px 26px", fontSize: 15 }}>
                <Icon.brain /> Learn first
              </button>
              <button className="la-btn ghost" style={{ padding: "14px 22px", fontSize: 14 }}>
                <Icon.bolt /> Take test now
              </button>
              <span style={{ fontSize: 12.5, color: "var(--ink-mute)", alignSelf: "center" }}>
                <b>Learn first</b> is recommended — Mentor Max walks you through, then you test.
              </span>
            </div>

            <div style={{ marginBottom: 18 }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: ".06em",
                  marginBottom: 8,
                }}
              >
                WHAT'S INSIDE
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {[
                  { h: "History", q: 1 },
                  { h: "Types", q: 2 },
                  { h: "Ordinary DE", q: 3 },
                  { h: "Partial DE", q: 2 },
                  { h: "Linear / nonlin", q: 1 },
                  { h: "Examples", q: 1 },
                ].map((s) => (
                  <div
                    key={s.h}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "var(--surface-soft)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.h}</span>
                    <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                      {s.q} q
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <WTFootAttribution />
        </main>
      </div>
    </div>
  );
}

function LearnPoint({ t, body }: { t: string; body: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "22px 1fr",
        gap: 12,
        padding: "8px 0",
        borderTop: "1px solid var(--line-soft)",
      }}
    >
      <span style={{ color: "var(--brand-1)", fontSize: 18, fontWeight: 800, lineHeight: 1 }}>
        ›
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{t}</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2, lineHeight: 1.5 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

// ─── 3 · WikiTrain ───────────────────────────────────────────────

const TRAIN_LOOP = [
  { n: 1, label: "Hook", color: "#ef4444", emoji: "❓" },
  { n: 2, label: "Explain", color: "#f59e0b", emoji: "💡" },
  { n: 3, label: "Practice", color: "#fb923c", emoji: "✦" },
  { n: 4, label: "Feedback", color: "#8b5cf6", emoji: "♥" },
  { n: 5, label: "Reflect", color: "#ec4899", emoji: "☼" },
  { n: 6, label: "Evolve", color: "#22c55e", emoji: "↗" },
];

export function WikiTrain() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={45} initials="J" avatarBg="#7c3aed" />
      <WTBreadcrumb trail={["Scholar", "WikiTest", "Differential equation", "Train"]} />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 320px", minHeight: 836 }}>
        <aside
          style={{
            padding: "24px 18px",
            borderRight: "1px solid var(--line-soft)",
            background: "var(--surface-soft)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <button className="la-iconbtn">
              <Icon.back />
            </button>
            <span
              className="la-mono"
              style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em" }}
            >
              TEST · 7f3a…d219
            </span>
          </div>
          <h3
            className="la-serif"
            style={{ fontSize: 22, margin: "6px 0 18px", letterSpacing: "-0.01em" }}
          >
            Differential equation
          </h3>

          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              marginBottom: 8,
            }}
          >
            SECTIONS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { h: "History", prog: 100 },
              { h: "Types", prog: 100 },
              { h: "Ordinary differential equations", prog: 60, current: true },
              { h: "Partial differential equations", prog: 0 },
              { h: "Linear vs nonlinear", prog: 0 },
              { h: "Examples", prog: 0 },
            ].map((s, i) => (
              <div
                key={s.h}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: s.current ? "#fff" : "transparent",
                  boxShadow: s.current ? "var(--shadow-1)" : "none",
                  border: s.current ? "1.5px solid var(--brand-1)" : "1px solid transparent",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="la-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: s.current ? 700 : 600,
                      color: s.current ? "var(--ink)" : "var(--ink-soft)",
                      flex: 1,
                    }}
                  >
                    {s.h}
                  </span>
                  {s.prog === 100 ? <Icon.check color="var(--ok)" /> : null}
                </div>
                {s.prog > 0 && s.prog < 100 ? (
                  <div className="wt-meter" style={{ marginTop: 6 }}>
                    <div className="fill" style={{ width: `${s.prog}%` }} />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </aside>

        <main style={{ padding: "28px 36px" }}>
          {/* Loop ribbon */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 22 }}>
            {TRAIN_LOOP.map((l, i) => (
              <div
                key={l.n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < TRAIN_LOOP.length - 1 ? 1 : 0,
                }}
              >
                <div
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
                >
                  <div
                    className="la-loop-ring"
                    style={{
                      color: l.color,
                      background: l.label === "Practice" ? l.color : "#fff",
                      borderColor: l.color,
                    }}
                  >
                    <span style={{ color: l.label === "Practice" ? "#fff" : l.color }} aria-hidden>
                      {l.emoji}
                    </span>
                  </div>
                  <span
                    className="la-mono"
                    style={{ fontSize: 9, fontWeight: 700, color: "var(--ink-mute)" }}
                  >
                    {l.label.toUpperCase()}
                  </span>
                </div>
                {i < TRAIN_LOOP.length - 1 ? (
                  <div style={{ flex: 1, height: 2, background: "var(--line)", margin: "0 6px" }} />
                ) : null}
              </div>
            ))}
          </div>

          {/* Section header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              borderRadius: 10,
              background: "var(--bg-2)",
              marginBottom: 18,
            }}
          >
            <span
              className="la-mono"
              style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".08em" }}
            >
              SECTION 03 / 06 · ORDINARY DIFFERENTIAL EQUATIONS
            </span>
          </div>

          <h2
            className="la-serif"
            style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.015em", margin: "0 0 14px" }}
          >
            What is an ODE?
          </h2>
          <p
            style={{ fontSize: 15, lineHeight: 1.65, color: "var(--ink-soft)", margin: "0 0 18px" }}
          >
            An <b style={{ color: "var(--ink)" }}>ordinary differential equation</b> contains an
            unknown function of a single independent variable and its derivatives. Solving an ODE
            means finding the function(s) that satisfy it.
          </p>

          <div className="wt-math" style={{ display: "block", marginBottom: 18, fontSize: 20 }}>
            dy/dx + 2y = e^(-x)
          </div>

          <div
            className="la-card"
            style={{ padding: 18, background: "var(--surface-soft)", marginBottom: 18 }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--brand-1)",
                letterSpacing: ".08em",
                fontWeight: 800,
                marginBottom: 8,
              }}
            >
              CHECK-IN · 1 / 2
            </div>
            <p style={{ fontSize: 14.5, fontWeight: 700, margin: "0 0 12px" }}>
              Which keyword tells you this is an <i>ordinary</i> DE rather than a partial one?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <McqOption k="A" label="It uses 'd/dx', not '∂/∂x'." />
              <McqOption k="B" label="It contains an exponential function." selected />
              <McqOption k="C" label="It has an initial condition." />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="la-btn ghost" style={{ padding: "10px 16px" }}>
              <Icon.back /> Previous section
            </button>
            <button className="la-btn" style={{ padding: "10px 16px" }}>
              Continue <Icon.arrow color="#fff" />
            </button>
          </div>
        </main>

        {/* Right — Mentor chat */}
        <aside
          style={{
            padding: "24px 18px",
            borderLeft: "1px solid var(--line-soft)",
            background: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 99,
                background: "#fff1d6",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>Mentor Max</div>
              <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>Watching with you</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ChatMsg from="ai">
              Ordinary DEs use <b>d/dx</b> — one independent variable. Partial DEs use <b>∂/∂x</b>.
            </ChatMsg>
            <ChatMsg from="me">Got it. Why does that matter for solving?</ChatMsg>
            <ChatMsg from="ai">
              Because ODE methods like the integrating factor only work when there's one independent
              variable. PDEs need different tools.
            </ChatMsg>
          </div>
          <div style={{ marginTop: 12 }}>
            <input
              placeholder="Ask anything about this section…"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid var(--line)",
                fontFamily: "inherit",
                fontSize: 13,
              }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function McqOption({
  k,
  label,
  selected = false,
}: {
  k: string;
  label: string;
  selected?: boolean;
}) {
  return (
    <div className={"wt-mcq" + (selected ? " selected" : "")}>
      <span className="key">{k}</span>
      <span>{label}</span>
    </div>
  );
}

// ─── 4 · WikiExam ────────────────────────────────────────────────

export function WikiExam() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900, background: "#fff" }}>
      <div
        style={{
          height: 64,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LearnAIMark size={28} />
          <span style={{ width: 1, height: 22, background: "rgba(255,255,255,.18)" }} />
          <span style={{ fontSize: 13, opacity: 0.7 }}>Exam in progress</span>
          <span className="la-pill" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: "#ef4444",
              }}
            />{" "}
            LIVE
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Differential equation · intermediate</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              background: "rgba(255,255,255,.1)",
            }}
          >
            <Icon.clock color="#fff" />
            <span
              className="la-mono"
              style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
            >
              07:42 / 12:00
            </span>
          </div>
          <button
            className="la-btn ghost"
            style={{
              background: "transparent",
              color: "#fff",
              boxShadow: "0 0 0 1px rgba(255,255,255,.25) inset",
              padding: "7px 12px",
              fontSize: 12,
            }}
          >
            ⛶ Focus mode
          </button>
          <button
            className="la-btn ghost"
            style={{
              background: "transparent",
              color: "#fff",
              boxShadow: "0 0 0 1px rgba(255,255,255,.25) inset",
            }}
          >
            Submit early
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: 836 }}>
        <main style={{ padding: "32px 56px", maxWidth: 860, margin: "0 auto", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span
              className="la-mono"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--ink-mute)",
                letterSpacing: ".08em",
              }}
            >
              QUESTION 05 / 10
            </span>
            <span className="la-pill">Short answer · 2 pts</span>
            <span
              className="la-pill"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              § Ordinary DE
            </span>
            <button className="la-iconbtn" style={{ marginLeft: "auto", color: "var(--warn)" }}>
              <Icon.flag color="var(--warn)" />
            </button>
            <button className="la-iconbtn">
              <Icon.bookmark />
            </button>
          </div>

          <h2
            className="la-serif"
            style={{
              fontSize: 30,
              lineHeight: 1.25,
              margin: "8px 0 18px",
              letterSpacing: "-0.01em",
            }}
          >
            Solve the first-order linear ODE below using an integrating factor, and state the
            general solution for <span style={{ fontStyle: "italic" }}>y(x)</span>.
          </h2>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 22 }}>
            <div className="wt-math" style={{ fontSize: 26 }}>
              dy/dx + 2y = e^(-x)
            </div>
            <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
              Initial condition: y(0) = 1
            </span>
          </div>

          <div
            style={{
              border: "1.5px solid var(--brand-1)",
              borderRadius: 16,
              background: "var(--surface-soft)",
              padding: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
                borderBottom: "1px solid var(--line-soft)",
              }}
            >
              {["∫", "∂", "Σ", "√", "x²", "π", "α", "μ", "∞"].map((k) => (
                <button key={k} className="wt-kbd">
                  {k}
                </button>
              ))}
              <span
                style={{ marginLeft: "auto", fontSize: 11, color: "var(--ink-mute)" }}
                className="la-mono"
              >
                LaTeX accepted · auto-rendered
              </span>
            </div>
            <div
              style={{
                padding: 18,
                minHeight: 140,
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                fontStyle: "italic",
                color: "var(--ink)",
              }}
            >
              μ(x) = e^(∫2 dx) = e^(2x)
              <br />
              y(x) = e^(-2x) · (∫ e^(-x) · e^(2x) dx + C)
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
            <button className="la-btn ghost" style={{ padding: "10px 16px" }}>
              <Icon.back /> Previous
            </button>
            <button className="la-btn" style={{ padding: "10px 20px" }}>
              Next question <Icon.arrow color="#fff" />
            </button>
          </div>
        </main>

        <aside
          style={{
            padding: "24px 18px",
            borderLeft: "1px solid var(--line-soft)",
            background: "var(--surface-soft)",
          }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              marginBottom: 12,
            }}
          >
            QUESTION PALETTE
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
            {Array.from({ length: 10 }, (_, i) => {
              const status = i < 4 ? "done" : i === 4 ? "current" : i === 6 ? "flagged" : "pending";
              const cls =
                "wt-qnav" +
                (status === "done"
                  ? " done"
                  : status === "current"
                    ? " current"
                    : status === "flagged"
                      ? " flagged"
                      : "");
              return (
                <button key={i} className={cls}>
                  {String(i + 1).padStart(2, "0")}
                </button>
              );
            })}
          </div>
          <div
            style={{
              marginTop: 18,
              padding: 12,
              borderRadius: 10,
              background: "#fff",
              border: "1px solid var(--line-soft)",
            }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-mute)",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              LEGEND
            </div>
            {[
              { c: "var(--brand-1)", t: "Done" },
              { c: "var(--warn)", t: "Flagged" },
              { c: "var(--ink-mute)", t: "Not visited" },
            ].map((l) => (
              <div
                key={l.t}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 12,
                  color: "var(--ink-soft)",
                  padding: "3px 0",
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: 3, background: l.c }} /> {l.t}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── 5 · ExamFocusMode ───────────────────────────────────────────

export function ExamFocusMode() {
  return (
    <div style={{ width: 1280, minHeight: 900, background: "var(--ink)", position: "relative" }}>
      <div
        style={{
          height: 56,
          padding: "0 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#0b1020",
          color: "#fff",
          borderBottom: "1px solid rgba(255,255,255,.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LearnAIMark size={24} />
          <span style={{ width: 1, height: 20, background: "rgba(255,255,255,.15)" }} />
          <span
            className="la-mono"
            style={{ fontSize: 11, color: "rgba(255,255,255,.55)", letterSpacing: ".08em" }}
          >
            FOCUS MODE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span
            className="la-mono"
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,.7)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            QUESTION 14 / 25
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              background: "rgba(255,255,255,.08)",
            }}
          >
            <Icon.clock color="#fff" />
            <span
              className="la-mono"
              style={{
                fontSize: 14,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                letterSpacing: ".04em",
              }}
            >
              32:18 / 60:00
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="la-iconbtn" style={{ color: "rgba(255,255,255,.7)" }}>
            <Icon.flag color="rgba(255,255,255,.7)" />
          </button>
          <button
            type="button"
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "transparent",
              color: "rgba(255,255,255,.85)",
              border: "1px solid rgba(255,255,255,.2)",
              fontSize: 11.5,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13 }}>⛶</span> Exit focus
          </button>
        </div>
      </div>

      <div style={{ height: 3, background: "rgba(255,255,255,.06)" }}>
        <div
          style={{
            width: "56%",
            height: "100%",
            background: "linear-gradient(90deg, #2e5bff, #7c3aed)",
          }}
        />
      </div>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "72px 28px 32px", color: "#fff" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 10,
            color: "rgba(255,255,255,.45)",
            letterSpacing: ".1em",
            marginBottom: 14,
          }}
        >
          SAA-C03 · DOMAIN 2 · RESILIENT ARCHITECTURES
        </div>

        <h2
          className="la-serif"
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
            margin: "0 0 32px",
            color: "#f3f4ff",
          }}
        >
          A company runs a critical web application on Amazon EC2 in a single Availability Zone.
          Traffic has grown 4× in 6 months and a recent AZ outage caused a 45-minute outage. The
          team must improve availability <i>without re-architecting the app</i>. Which approach BEST
          meets the requirement?
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FocusOpt
            k="A"
            t="Add an Application Load Balancer in front of the EC2 instance and enable cross-zone load balancing."
          />
          <FocusOpt
            k="B"
            t="Place the EC2 instance in an Auto Scaling group spanning multiple AZs, fronted by an Application Load Balancer."
            selected
          />
          <FocusOpt
            k="C"
            t="Migrate the application to AWS Lambda for automatic multi-AZ resilience."
          />
          <FocusOpt
            k="D"
            t="Take an AMI of the instance and store it in S3 for fast restore after an AZ outage."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 36 }}>
          <button
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              background: "transparent",
              color: "rgba(255,255,255,.7)",
              border: "1px solid rgba(255,255,255,.18)",
              fontSize: 13,
              fontFamily: "inherit",
            }}
          >
            ← Previous
          </button>
          <button
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "var(--brand-grad)",
              color: "#fff",
              border: "none",
              fontSize: 13,
              fontFamily: "inherit",
              fontWeight: 700,
            }}
          >
            Next →
          </button>
        </div>
      </main>
    </div>
  );
}

function FocusOpt({ k, t, selected = false }: { k: string; t: string; selected?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "16px 18px",
        borderRadius: 14,
        border: `1.5px solid ${selected ? "var(--brand-1)" : "rgba(255,255,255,.12)"}`,
        background: selected ? "rgba(46,91,255,.18)" : "rgba(255,255,255,.03)",
        color: "rgba(255,255,255,.92)",
        fontSize: 15,
        lineHeight: 1.55,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: selected ? "var(--brand-1)" : "rgba(255,255,255,.08)",
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 800,
          flex: "0 0 auto",
          color: "#fff",
        }}
      >
        {k}
      </span>
      <span>{t}</span>
    </div>
  );
}

// ─── 6 · WikiResults ─────────────────────────────────────────────

export function WikiResults() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={45} initials="J" avatarBg="#7c3aed" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Mentor Max" teacherIcon="🎓" />
        <main>
          <WTBreadcrumb trail={["Scholar", "WikiTest", "Differential equation", "Results"]} />

          <section style={{ padding: "28px 32px", maxWidth: 980, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span
                className="la-pill"
                style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
              >
                <span
                  style={{ width: 6, height: 6, borderRadius: 99, background: "var(--s-math)" }}
                />{" "}
                Mathematics
              </span>
              <span className="la-pill">Intermediate · 10 questions</span>
              <span
                className="la-mono"
                style={{ fontSize: 11, color: "var(--ink-mute)", marginLeft: "auto" }}
              >
                attempt #02 · 8 min 14 s
              </span>
            </div>

            {/* Next best step hero */}
            <div
              style={{
                borderRadius: 22,
                padding: "26px 28px",
                marginBottom: 22,
                overflow: "hidden",
                position: "relative",
                background: "linear-gradient(135deg, #2e5bff 0%, #7c3aed 100%)",
                color: "#fff",
                boxShadow: "var(--shadow-2)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: 22,
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    className="la-mono"
                    style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em", fontWeight: 800 }}
                  >
                    NEXT BEST STEP
                  </div>
                  <h1
                    className="la-serif"
                    style={{
                      fontSize: 30,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      margin: "8px 0 6px",
                      lineHeight: 1.15,
                    }}
                  >
                    Re-train Ordinary differential equations for 5 minutes.
                  </h1>
                  <p
                    style={{
                      opacity: 0.9,
                      fontSize: 14,
                      margin: 0,
                      lineHeight: 1.55,
                      maxWidth: 520,
                    }}
                  >
                    You got 1 of 3 right in this section. Mentor Max will walk the section, then
                    re-ask the questions you missed.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
                  <button
                    className="la-btn"
                    style={{
                      background: "#fff",
                      color: "var(--ink)",
                      boxShadow: "none",
                      padding: "13px 18px",
                      fontSize: 14,
                      fontWeight: 800,
                    }}
                  >
                    ▶ Re-train this section
                  </button>
                  <button
                    className="la-btn"
                    style={{
                      background: "rgba(255,255,255,.16)",
                      color: "#fff",
                      boxShadow: "none",
                      padding: "10px 14px",
                      fontSize: 12.5,
                    }}
                  >
                    Re-take only missed questions
                  </button>
                  <button
                    className="la-btn"
                    style={{
                      background: "transparent",
                      color: "#fff",
                      opacity: 0.85,
                      padding: "8px 14px",
                      fontSize: 12,
                    }}
                  >
                    Skip — start a new test
                  </button>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: 18,
                marginBottom: 22,
              }}
            >
              <div
                className="la-card"
                style={{ padding: 22, display: "flex", alignItems: "center", gap: 18 }}
              >
                <ScoreRing pct={70} />
                <div>
                  <div
                    className="la-mono"
                    style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em" }}
                  >
                    YOUR SCORE
                  </div>
                  <div
                    className="la-serif"
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                      marginTop: 2,
                    }}
                  >
                    7 of 10 right
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--ink-soft)",
                      marginTop: 4,
                      lineHeight: 1.5,
                    }}
                  >
                    Above the <b>intermediate</b> readiness threshold (60%). +5 from last attempt.
                  </div>
                </div>
              </div>

              <div
                className="la-card"
                style={{
                  padding: 22,
                  background: "var(--bad-bg)",
                  borderLeft: "4px solid var(--bad)",
                }}
              >
                <div
                  className="la-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--bad)",
                    letterSpacing: ".06em",
                    fontWeight: 800,
                  }}
                >
                  MAIN WEAK AREA
                </div>
                <div style={{ marginTop: 4, fontSize: 17, fontWeight: 800, color: "var(--ink)" }}>
                  Ordinary differential equations
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-soft)",
                    marginTop: 6,
                    lineHeight: 1.55,
                  }}
                >
                  Missed integrating-factor questions. Re-train walks you through with a worked
                  example, then re-asks the ones you got wrong.
                </div>
              </div>
            </div>

            <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  className="la-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-mute)",
                    letterSpacing: ".08em",
                    fontWeight: 800,
                  }}
                >
                  PER-QUESTION REVIEW · 10 ITEMS
                </div>
                <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
                  Expand all ▾
                </button>
              </div>
              {[
                { q: "Define an ODE", res: "✓", sec: "Types" },
                { q: "Linear vs nonlinear", res: "✓", sec: "Linear / nonlin" },
                { q: "Integrating factor solve (∂)", res: "✗", sec: "Ordinary DE" },
                { q: "Initial-value problem", res: "✓", sec: "Ordinary DE" },
                { q: "Wave equation classification", res: "✓", sec: "Partial DE" },
              ].map((r, i) => (
                <div
                  key={r.q}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "24px 1fr 120px",
                    gap: 12,
                    padding: "10px 18px",
                    borderTop: "1px solid var(--line-soft)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ color: r.res === "✓" ? "var(--ok)" : "var(--bad)", fontWeight: 800 }}
                  >
                    {r.res}
                  </span>
                  <span style={{ fontSize: 13.5 }}>
                    {String(i + 1).padStart(2, "0")} · {r.q}
                  </span>
                  <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                    § {r.sec}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <WTFootAttribution />
        </main>
      </div>
    </div>
  );
}

function ScoreRing({ pct }: { pct: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 84, height: 84 }}>
      <svg width="84" height="84" viewBox="0 0 84 84">
        <circle cx="42" cy="42" r={r} stroke="var(--bg-2)" strokeWidth="8" fill="none" />
        <circle
          cx="42"
          cy="42"
          r={r}
          stroke="url(#sg)"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
          strokeLinecap="round"
          transform="rotate(-90 42 42)"
        />
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e5bff" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div className="la-serif" style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)" }}>
            {pct}
          </div>
          <div className="la-mono" style={{ fontSize: 9, color: "var(--ink-mute)" }}>
            %
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 7 · WikiLibrary ─────────────────────────────────────────────

const LIB = [
  {
    title: "Integral",
    subj: "Mathematics",
    color: "var(--s-math)",
    diff: "advanced",
    count: 40,
    attempts: 3,
    best: 68,
    when: "2 d ago",
  },
  {
    title: "Differential equation",
    subj: "Mathematics",
    color: "var(--s-math)",
    diff: "intermediate",
    count: 10,
    attempts: 2,
    best: 70,
    when: "3 d ago",
    inProgress: true,
  },
  {
    title: "Quantum mechanics",
    subj: "Physics",
    color: "var(--s-physics)",
    diff: "advanced",
    count: 40,
    attempts: 1,
    best: 45,
    when: "1 wk ago",
  },
  {
    title: "Calculus",
    subj: "Mathematics",
    color: "var(--s-math)",
    diff: "undergrad",
    count: 20,
    attempts: 4,
    best: 92,
    when: "yesterday",
  },
  {
    title: "Photosynthesis",
    subj: "Biology",
    color: "var(--s-bio)",
    diff: "undergrad",
    count: 10,
    attempts: 5,
    best: 95,
    when: "2 wk ago",
  },
  {
    title: "Cell membrane",
    subj: "Biology",
    color: "var(--s-bio)",
    diff: "advanced",
    count: 40,
    attempts: 0,
    best: null,
    when: "saved",
  },
  {
    title: "French Revolution",
    subj: "History",
    color: "var(--s-history)",
    diff: "intermediate",
    count: 10,
    attempts: 2,
    best: 75,
    when: "1 wk ago",
  },
  {
    title: "Algoritmo de Dijkstra",
    subj: "Computer Sc.",
    color: "var(--s-cs)",
    diff: "intermediate",
    count: 20,
    attempts: 2,
    best: 80,
    when: "1 wk ago",
  },
  {
    title: "Newton's laws of motion",
    subj: "Physics",
    color: "var(--s-physics)",
    diff: "undergrad",
    count: 10,
    attempts: 3,
    best: 88,
    when: "2 wk ago",
  },
];

function libState(t: (typeof LIB)[number]): { label: string; tone: string; action: string } {
  if (t.best == null) return { label: "Not started", tone: "mute", action: "Start" };
  if (t.inProgress) return { label: "In progress", tone: "brand", action: "Continue" };
  if (t.best < 70) return { label: "Needs review", tone: "bad", action: "Re-train" };
  if (t.best < 90) return { label: "Practice", tone: "warn", action: "Practice again" };
  return { label: "Strong", tone: "ok", action: "Review" };
}

const TONE_BG: Record<string, string> = {
  ok: "var(--ok-bg)",
  warn: "var(--warn-bg)",
  bad: "var(--bad-bg)",
  brand: "var(--bg-2)",
  mute: "var(--bg-2)",
};
const TONE_FG: Record<string, string> = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  bad: "var(--bad)",
  brand: "var(--brand-1)",
  mute: "var(--ink-mute)",
};

export function WikiLibrary() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Scholar" streak={1} xp={45} initials="J" avatarBg="#7c3aed" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Mentor Max" teacherIcon="🎓" />
        <main>
          <WTBreadcrumb trail={["Scholar", "WikiTest", "Library"]} />

          <section style={{ padding: "28px 32px 0", maxWidth: 1140, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 14,
              }}
            >
              <div>
                <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                  WikiTest Library
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "4px 0 0" }}>
                  Your saved article tests. Review weak topics or start a new WikiTest.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  placeholder="🔍 search tests…"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid var(--line)",
                    fontFamily: "inherit",
                    fontSize: 13,
                    width: 220,
                    background: "#fff",
                  }}
                />
                <button className="la-btn">
                  <Icon.spark /> New WikiTest
                </button>
              </div>
            </div>

            {/* Recommended next */}
            <div
              className="la-card"
              style={{
                padding: 20,
                marginTop: 20,
                position: "relative",
                overflow: "hidden",
                background: "linear-gradient(135deg, var(--bg-2), #f7f4ff)",
                border: "1.5px solid var(--brand-1)",
                boxShadow: "0 0 0 4px rgba(46,91,255,.06)",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "44px 1fr auto",
                  gap: 16,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--brand-grad)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Icon.target color="#fff" />
                </div>
                <div>
                  <div
                    className="la-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--brand-1)",
                      letterSpacing: ".08em",
                      fontWeight: 800,
                    }}
                  >
                    RECOMMENDED NEXT
                  </div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 800,
                      letterSpacing: "-0.01em",
                      marginTop: 2,
                    }}
                  >
                    Integral · 68% · Advanced Mathematics
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>
                    You're close. Review the 3 weak sections before retaking — should bump you over
                    80%.
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="la-btn ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                    Snooze
                  </button>
                  <button className="la-btn" style={{ padding: "10px 16px", fontSize: 13 }}>
                    Re-train weak sections →
                  </button>
                </div>
              </div>
            </div>

            {/* Status tabs */}
            <div style={{ display: "flex", gap: 6, marginTop: 22 }}>
              {[
                "All (12)",
                "Needs review (2)",
                "In progress (1)",
                "Completed (6)",
                "Not started (1)",
              ].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={"wt-tab" + (i === 0 ? " active" : "")}
                  style={{ fontSize: 13, padding: "8px 12px" }}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginTop: 16,
                paddingBottom: 36,
              }}
            >
              {LIB.map((t) => {
                const s = libState(t);
                return (
                  <div
                    key={t.title}
                    className="la-card"
                    style={{ padding: 16, display: "grid", gap: 10 }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        justifyContent: "space-between",
                      }}
                    >
                      <span className="wt-subj">
                        <span className="dot" style={{ background: t.color }} /> {t.subj}
                      </span>
                      <span
                        className="la-pill"
                        style={{
                          background: TONE_BG[s.tone],
                          color: TONE_FG[s.tone],
                          fontSize: 10.5,
                          padding: "3px 9px",
                        }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <div
                      className="la-serif"
                      style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em" }}
                    >
                      {t.title}
                    </div>
                    <div className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                      {t.diff} · {t.count} questions · {t.when}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                      }}
                    >
                      <div className="la-mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                        {t.best != null ? `Best ${t.best}%` : "No attempts"}
                        {t.attempts > 0 ? ` · ${t.attempts} attempts` : ""}
                      </div>
                      <button
                        className="la-btn ghost"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        {s.action} →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <WTFootAttribution />
        </main>
      </div>
    </div>
  );
}
