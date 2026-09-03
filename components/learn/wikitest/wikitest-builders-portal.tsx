/**
 * GRADE_8s Portal · enterprise-grade GRADE_8 home (DataCamp-lite).
 *
 * Gallery-only static preview. The live route at /learn/GRADE_8
 * renders the same layout but driven by the Prisma-backed
 * GRADE_8Mission / GRADE_8Step models.
 *
 * Visual spec (calm enterprise polish):
 *   - 280 px left sidebar with GRADE_8 Academy mark + 6 nav items
 *   - Top header card · date · welcome line · Level/XP chip
 *   - Today's mission card with Loop progress (6 steps · 3-col tiles)
 *   - Continue practicing row · 2 soft-gradient placeholder cards
 *   - Right rail · Nova recommends + Enterprise essentials
 *   - Deep slate primary (#020617) · indigo accent (#4f46e5 / #4338ca)
 *   - Soft 0 1px 2px shadows · 22-32 px radii
 */

"use client";

import type { ReactNode } from "react";

type NavItem = { ic: string; l: string; active?: boolean };

const BUILD_NAV: ReadonlyArray<NavItem> = [
  { ic: "🏠", l: "Home", active: true },
  { ic: "🎯", l: "My missions" },
  { ic: "🛠️", l: "Projects" },
  { ic: "📚", l: "Library" },
  { ic: "🏅", l: "Achievements" },
  { ic: "🌍", l: "Switch world" },
];

const BUILD_LOOP = [
  { ic: "🧲", l: "Hook", state: "Done" },
  { ic: "💡", l: "Explain", state: "Done" },
  { ic: "✏️", l: "Practice", state: "Done" },
  { ic: "💬", l: "Feedback", state: "Done" },
  { ic: "🪞", l: "Reflect", state: "Current step" },
  { ic: "🌱", l: "Evolve", state: "Locked" },
] as const;

export function GRADE_8sPortal() {
  return (
    <div
      style={{
        width: 1280,
        minHeight: 900,
        background: "#f5f7fb",
        color: "#020617",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        display: "grid",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      {/* ── Left sidebar ── */}
      <aside style={{ borderRight: "1px solid #e2e8f0", background: "#fff", padding: "24px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 14,
              background: "#020617",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            B
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>
              GRADE_8 Academy
            </div>
            <div style={{ fontSize: 12, color: "#64748b" }}>Learning portal</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {BUILD_NAV.map((it) => (
            <button
              key={it.l}
              type="button"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "inherit",
                fontSize: 14,
                fontWeight: 700,
                background: it.active ? "#020617" : "transparent",
                color: it.active ? "#fff" : "#475569",
                boxShadow: it.active ? "0 4px 12px rgba(2,6,23,.15)" : "none",
              }}
            >
              <span style={{ fontSize: 18 }}>{it.ic}</span> {it.l}
            </button>
          ))}
        </nav>

        <div
          style={{
            marginTop: 32,
            padding: 16,
            borderRadius: 22,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".18em",
              color: "#94a3b8",
              marginBottom: 12,
            }}
          >
            YOUR TEACHER
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                boxShadow: "0 2px 6px rgba(0,0,0,.06)",
              }}
            >
              🦉
            </div>
            <div>
              <div style={{ fontWeight: 800 }}>Nova</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 11.5,
                  color: "#059669",
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "#10b981" }} />{" "}
                Online
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <section style={{ padding: "32px 40px" }}>
        {/* Top header card */}
        <header
          style={{
            marginBottom: 24,
            padding: 20,
            borderRadius: 22,
            border: "1px solid #e2e8f0",
            background: "#fff",
            boxShadow: "0 1px 2px rgba(0,0,0,.04)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "#64748b" }}>Monday, May 25</div>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "4px 0 6px",
              }}
            >
              Welcome back, Guest 👋
            </h1>
            <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 540 }}>
              You&apos;re 30 minutes from finishing your Python calculator project.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderRadius: 16,
              background: "#f8fafc",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  color: "#94a3b8",
                }}
              >
                Level
              </div>
              <div style={{ fontSize: 14, fontWeight: 800 }}>GRADE_8 · 1,240 XP</div>
            </div>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "#e0e7ff",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
              }}
            >
              🏅
            </div>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Today's mission */}
            <section
              style={{
                borderRadius: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: 26, borderBottom: "1px solid #f1f5f9" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 14,
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      padding: "5px 14px",
                      borderRadius: 99,
                      background: "#eef2ff",
                      color: "#4338ca",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: ".04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Today&apos;s mission · 4 of 6 completed
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
                    ~12 min · +60 XP
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 20,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ maxWidth: 580 }}>
                    <h2
                      style={{
                        fontSize: 30,
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        margin: 0,
                        lineHeight: 1.1,
                      }}
                    >
                      Build a calculator in Python
                    </h2>
                    <p style={{ marginTop: 10, color: "#475569", fontSize: 14, lineHeight: 1.55 }}>
                      Last time you wrote the{" "}
                      <code
                        style={{
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "#f1f5f9",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        add()
                      </code>{" "}
                      function. Today: handle division by zero — and make Nova proud.
                    </p>
                  </div>
                  <button
                    type="button"
                    style={{
                      padding: "12px 22px",
                      borderRadius: 14,
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontSize: 13.5,
                      fontWeight: 800,
                      background: "#020617",
                      color: "#fff",
                      boxShadow: "0 4px 14px rgba(2,6,23,.25)",
                    }}
                  >
                    ▶ Continue with Reflect
                  </button>
                </div>
              </div>

              <div
                style={{
                  padding: 26,
                  display: "grid",
                  gridTemplateColumns: "220px 1fr",
                  gap: 20,
                }}
              >
                <div style={{ padding: 20, borderRadius: 24, background: "#f8fafc" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 800 }}>Loop progress</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#4338ca" }}>67%</span>
                  </div>
                  <div
                    style={{
                      height: 10,
                      borderRadius: 99,
                      background: "#e2e8f0",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: "67%",
                        height: "100%",
                        background: "#4f46e5",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginTop: 12 }}>
                    4/6 steps complete
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {BUILD_LOOP.map((s) => {
                    const done = s.state === "Done";
                    const cur = s.state === "Current step";
                    return (
                      <div
                        key={s.l}
                        style={{
                          padding: 14,
                          borderRadius: 20,
                          border: "1px solid " + (cur ? "#c7d2fe" : done ? "#bbf7d0" : "#e2e8f0"),
                          background: cur ? "#eef2ff" : done ? "#ecfdf5" : "#f8fafc",
                          opacity: s.state === "Locked" ? 0.65 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: 10,
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{s.ic}</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                            {done ? "✓" : cur ? "Now" : "🔒"}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 14 }}>{s.l}</div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: "#64748b",
                            marginTop: 2,
                          }}
                        >
                          {s.state}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Continue practicing */}
            <section>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Continue practicing</h2>
                <button
                  type="button"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#4338ca",
                    fontFamily: "inherit",
                  }}
                >
                  View all
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  {
                    t: "Logic gates: AND, OR, NOT",
                    sub: "Coding · 6 mins left",
                    g: "linear-gradient(135deg,#f1f5f9,#e0e7ff)",
                  },
                  {
                    t: "Algebra: solving for x",
                    sub: "Math · 12 mins left",
                    g: "linear-gradient(135deg,#fef3c7,#fce7f3)",
                  },
                ].map((c) => (
                  <article
                    key={c.t}
                    style={{
                      padding: 20,
                      borderRadius: 24,
                      border: "1px solid #e2e8f0",
                      background: "#fff",
                      boxShadow: "0 1px 2px rgba(0,0,0,.04)",
                    }}
                  >
                    <div
                      style={{ height: 100, borderRadius: 16, background: c.g, marginBottom: 18 }}
                    />
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 14,
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{c.t}</h3>
                        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{c.sub}</p>
                      </div>
                      <span
                        style={{
                          padding: "4px 12px",
                          borderRadius: 99,
                          background: "#f1f5f9",
                          fontWeight: 800,
                        }}
                      >
                        →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Right rail */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section
              style={{
                padding: 24,
                borderRadius: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    background: "#fef3c7",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 22,
                  }}
                >
                  🦉
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: ".18em",
                      color: "#94a3b8",
                    }}
                  >
                    NOVA RECOMMENDS
                  </div>
                  <h2 style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 900, lineHeight: 1.3 }}>
                    Try a logic puzzle before today&apos;s mission
                  </h2>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                Yesterday&apos;s session showed you flew through patterns but slowed on edge cases.
                A 10-minute warm-up sharpens both.
              </p>
              <button
                type="button"
                style={{
                  width: "100%",
                  marginTop: 18,
                  padding: "12px",
                  borderRadius: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13.5,
                  fontWeight: 800,
                  background: "#4f46e5",
                  color: "#fff",
                  boxShadow: "0 4px 14px rgba(79,70,229,.3)",
                }}
              >
                Start warm-up
              </button>
            </section>

            <section
              style={{
                padding: 24,
                borderRadius: 32,
                border: "1px solid #e2e8f0",
                background: "#fff",
                boxShadow: "0 1px 2px rgba(0,0,0,.04)",
              }}
            >
              <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 900 }}>
                Enterprise essentials
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <EntRow l="Current mission" v="On track" tone="ok" />
                <EntRow l="Skill evidence" v="3 artifacts" />
                <EntRow l="Next review" v="Friday" />
              </div>
            </section>
          </aside>
        </div>
      </section>
    </div>
  );
}

function EntRow({ l, v, tone }: { l: string; v: string; tone?: "ok" }): ReactNode {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 14,
        background: "#f8fafc",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600 }}>{l}</span>
      <span style={{ fontWeight: 800, color: tone === "ok" ? "#059669" : "#020617" }}>{v}</span>
    </div>
  );
}
