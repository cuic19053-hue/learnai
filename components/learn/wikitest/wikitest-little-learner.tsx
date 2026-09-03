/**
 * Design Gallery · Little-Learner screens (batch 11).
 *
 * Ports the five JSX prototypes from the design handoff:
 *   - MiloLetters         (wikitest-screen-milo-letters.jsx)
 *   - LetterForgeAdmin    (wikitest-screen-letterforge.jsx)
 *   - OnboardingNew       (wikitest-screen-onboarding.jsx)
 *   - MiloGamesHub        (wikitest-screen-milo-games.jsx)
 *   - MiloNumbers         (wikitest-screen-milo-games.jsx · 2nd export)
 *
 * The prototypes use global helpers (`<I.arrow>`, `<AdminShell>`,
 * `<Kpi3>`, `<SectionH>`, `dangerouslySetInnerHTML`). Those helpers
 * are inlined / replaced with local equivalents below so each component
 * is self-contained and previewable inside the gallery.
 */

import type { CSSProperties, ReactNode } from "react";
import { Arrow } from "@/components/design/icons";
import { AdminShell as RealAdminShell } from "@/components/learn/wikitest/wikitest-rest";

// ── Languages used by the Milo Letters tablet preview ────────────────
const MILO_LANGS: Array<{
  code: string;
  flag: string;
  name: string;
  letter: string;
  word: string;
  emoji: string;
  say: string;
}> = [
  { code: "en", flag: "🇬🇧", name: "English", letter: "A", word: "Apple", emoji: "🍎", say: "Ay" },
  { code: "es", flag: "🇪🇸", name: "Español", letter: "A", word: "Árbol", emoji: "🌳", say: "Ah" },
  { code: "fr", flag: "🇫🇷", name: "Français", letter: "A", word: "Avion", emoji: "✈️", say: "Ah" },
  { code: "it", flag: "🇮🇹", name: "Italiano", letter: "A", word: "Albero", emoji: "🌳", say: "Ah" },
  { code: "de", flag: "🇩🇪", name: "Deutsch", letter: "A", word: "Apfel", emoji: "🍎", say: "Ah" },
  { code: "pt", flag: "🇵🇹", name: "Português", letter: "A", word: "Avião", emoji: "✈️", say: "Ah" },
  { code: "ja", flag: "🇯🇵", name: "日本語", letter: "あ", word: "あめ", emoji: "🍬", say: "Ah" },
  { code: "ar", flag: "🇸🇦", name: "العربية", letter: "أ", word: "أسد", emoji: "🦁", say: "Ah" },
];

const KIDS_GRADIENT = "linear-gradient(180deg, #fce0ec 0%, #fff1d6 100%)";

// ════════════════════════════════════════════════════════════════════
// 17 · MiloLetters — tablet (1024×768)
// ════════════════════════════════════════════════════════════════════
export function MiloLetters() {
  const decor: Array<{ e: string; top: number; left: number; rot: number }> = [
    { e: "⭐", top: 40, left: 60, rot: -12 },
    { e: "🌟", top: 90, left: 920, rot: 18 },
    { e: "✨", top: 60, left: 480, rot: 8 },
    { e: "🌸", top: 700, left: 90, rot: -6 },
    { e: "🌈", top: 680, left: 870, rot: 22 },
    { e: "☁️", top: 130, left: 800, rot: -10 },
  ];
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: KIDS_GRADIENT,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {decor.map((d, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            fontSize: 38,
            opacity: 0.35,
            top: d.top,
            left: d.left,
            transform: `rotate(${d.rot}deg)`,
          }}
          aria-hidden
        >
          {d.e}
        </span>
      ))}

      {/* TOP parent strip */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ec4899,#f59e0b)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 14,
              fontWeight: 800,
              boxShadow: "0 4px 10px rgba(236,72,153,.3)",
            }}
          >
            L
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>Milo Letters</span>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 14px 7px 8px",
              borderRadius: 99,
              background: "#fff",
              border: "2px solid #ec4899",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 800,
              boxShadow: "0 4px 12px rgba(236,72,153,.15)",
            }}
          >
            <span style={{ fontSize: 22 }}>🇬🇧</span>
            <span style={{ color: "#9a3412" }}>English</span>
            <span style={{ fontSize: 10, color: "#9a3412", opacity: 0.6 }}>▾</span>
          </button>
          <button
            type="button"
            title="hold for parent menu"
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            🔒
          </button>
        </div>
      </div>

      {/* MAIN tracing area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 540px 1fr",
          gap: 0,
          padding: "70px 30px 30px",
          height: 768,
        }}
      >
        {/* LEFT — Milo + audio */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: 80,
              background: "radial-gradient(circle at 40% 35%, #fde68a, #f59e0b)",
              display: "grid",
              placeItems: "center",
              fontSize: 88,
              boxShadow: "0 12px 30px rgba(245,158,11,.35), inset 0 -8px 16px rgba(0,0,0,.06)",
              position: "relative",
            }}
          >
            🐯
            <div
              style={{
                position: "absolute",
                bottom: -10,
                right: -10,
                width: 44,
                height: 44,
                borderRadius: 99,
                background: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                boxShadow: "0 4px 10px rgba(0,0,0,.1)",
              }}
            >
              💬
            </div>
          </div>
          <div
            style={{
              padding: "14px 22px",
              borderRadius: 24,
              background: "#fff",
              maxWidth: 240,
              boxShadow: "0 8px 24px rgba(0,0,0,.08)",
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                textAlign: "center",
                color: "#9a3412",
                lineHeight: 1.2,
              }}
            >
              Trace the <span style={{ color: "#ec4899" }}>A</span>!
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#9a3412",
                opacity: 0.7,
                textAlign: "center",
                marginTop: 4,
              }}
            >
              It says <b>&ldquo;Ay&rdquo;</b>
            </div>
          </div>
          <button
            type="button"
            style={{
              width: 96,
              height: 96,
              borderRadius: 99,
              background: "linear-gradient(135deg, #ec4899, #f59e0b)",
              border: "none",
              cursor: "pointer",
              color: "#fff",
              fontSize: 38,
              boxShadow: "0 10px 24px rgba(236,72,153,.4), inset 0 -4px 10px rgba(0,0,0,.1)",
            }}
          >
            🔊
          </button>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#9a3412" }}>Tap to hear</div>
        </div>

        {/* CENTER tracing canvas */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 540,
              height: 540,
              borderRadius: 32,
              background: "#fff",
              boxShadow: "0 20px 50px rgba(0,0,0,.08), inset 0 0 0 6px rgba(236,72,153,.08)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: 90,
                borderTop: "2px dashed #fde68a",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: 270,
                borderTop: "2px dashed #fde68a",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 30,
                right: 30,
                top: 450,
                borderTop: "2px dashed #fde68a",
              }}
            />
            <svg viewBox="0 0 540 540" style={{ position: "absolute", inset: 0 }}>
              <path
                d="M 130 470 L 270 80 L 410 470"
                fill="none"
                stroke="#fce0ec"
                strokeWidth={46}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M 180 320 L 360 320"
                fill="none"
                stroke="#fce0ec"
                strokeWidth={46}
                strokeLinecap="round"
              />
              <path
                d="M 130 470 L 218 230"
                fill="none"
                stroke="#ec4899"
                strokeWidth={20}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <g opacity={0.7}>
                <path
                  d="M 270 80 L 410 470"
                  fill="none"
                  stroke="#9a3412"
                  strokeWidth={3}
                  strokeDasharray="8 10"
                  strokeLinecap="round"
                />
                <path
                  d="M 180 320 L 360 320"
                  fill="none"
                  stroke="#9a3412"
                  strokeWidth={3}
                  strokeDasharray="8 10"
                  strokeLinecap="round"
                />
              </g>
              <circle cx={130} cy={470} r={22} fill="#22c55e" />
              <text x={130} y={479} fontSize={26} textAnchor="middle" fill="#fff">
                ★
              </text>
            </svg>
            <div
              style={{
                position: "absolute",
                left: 196,
                top: 208,
                width: 44,
                height: 44,
                borderRadius: 99,
                background: "rgba(236,72,153,.3)",
                border: "3px solid #ec4899",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 18,
                right: 18,
                display: "flex",
                gap: 4,
              }}
            >
              {[1, 2, 3].map((s) => (
                <span
                  key={s}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    background: s <= 1 ? "#f59e0b" : "rgba(0,0,0,.08)",
                    color: "#fff",
                    fontSize: 18,
                    display: "grid",
                    placeItems: "center",
                    boxShadow: s <= 1 ? "0 4px 8px rgba(245,158,11,.4)" : "none",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 18,
                padding: "6px 12px",
                borderRadius: 99,
                background: "#fef3c7",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                fontWeight: 800,
                color: "#9a3412",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "#22c55e" }} />
              Stroke 1 of 3
            </div>
          </div>

          <div style={{ display: "flex", gap: 14, marginTop: 18, justifyContent: "center" }}>
            <button
              type="button"
              style={{
                padding: "14px 22px",
                borderRadius: 99,
                background: "#fff",
                border: "2px solid #fde68a",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 16,
                fontWeight: 800,
                color: "#9a3412",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 16px rgba(0,0,0,.06)",
              }}
            >
              ↺ Try again
            </button>
            <button
              type="button"
              style={{
                padding: "14px 28px",
                borderRadius: 99,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 17,
                fontWeight: 800,
                color: "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 8px 20px rgba(34,197,94,.4)",
              }}
            >
              I did it! ✓
            </button>
          </div>
        </div>

        {/* RIGHT — reward word */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 200,
              height: 200,
              borderRadius: 32,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 110,
              boxShadow: "0 10px 30px rgba(0,0,0,.08)",
            }}
          >
            🍎
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#9a3412",
                letterSpacing: "-0.02em",
              }}
            >
              <span style={{ color: "#ec4899" }}>A</span>pple
            </div>
            <div
              style={{
                fontSize: 14,
                color: "#9a3412",
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              A is for apple
            </div>
          </div>
          <div
            style={{
              padding: "14px 18px",
              borderRadius: 20,
              background: "#fff",
              boxShadow: "0 6px 16px rgba(0,0,0,.06)",
              marginTop: 8,
            }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 11,
                fontWeight: 800,
                color: "#9a3412",
                opacity: 0.6,
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              STICKERS TODAY
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              {["🍎", "🐝", "—", "—", "—"].map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: s === "—" ? "#fdf2f8" : "#fff1d6",
                    border: s === "—" ? "2px dashed #fce0ec" : "none",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                  }}
                >
                  {s === "—" ? "" : s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language picker — open state */}
      <div
        style={{
          position: "absolute",
          top: 64,
          right: 64,
          width: 280,
          padding: 14,
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,.15)",
          border: "2px solid #ec4899",
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.6,
            letterSpacing: ".08em",
            marginBottom: 8,
            padding: "0 6px",
          }}
        >
          WHAT LANGUAGE DOES SOFIA SPEAK?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {MILO_LANGS.map((l, i) => (
            <button
              type="button"
              key={l.code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 10px",
                borderRadius: 12,
                background: i === 0 ? "#fce0ec" : "transparent",
                border: i === 0 ? "2px solid #ec4899" : "2px solid transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 700,
                color: "#9a3412",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 20 }}>{l.flag}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {l.name}
                </div>
                <div className="la-mono" style={{ fontSize: 9, opacity: 0.6 }}>
                  {l.letter} · &ldquo;{l.say}&rdquo;
                </div>
              </div>
              {i === 0 ? <span style={{ color: "#ec4899", fontSize: 14 }}>✓</span> : null}
            </button>
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#fef3c7",
            fontSize: 11,
            color: "#9a3412",
            lineHeight: 1.4,
          }}
        >
          🌍 Milo says letters in your language. Sofia will hear <b>&ldquo;Apple&rdquo;</b> in
          English, <b>&ldquo;Árbol&rdquo;</b> in Spanish, <b>&ldquo;あめ&rdquo;</b> in Japanese.
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 18 · LetterForgeAdmin — admin console
// ════════════════════════════════════════════════════════════════════
const LF_LANGS: Array<{
  code: string;
  flag: string;
  name: string;
  chars: string;
  glyphs: number;
  sample: string;
  voice: string;
  status: "live" | "beta" | "draft";
}> = [
  {
    code: "en",
    flag: "🇬🇧",
    name: "English",
    chars: "A–Z · a–z · 0–9",
    glyphs: 62,
    sample: "Apple",
    voice: "Milo · alloy",
    status: "live",
  },
  {
    code: "es",
    flag: "🇪🇸",
    name: "Español",
    chars: "A–Z · a–z · ñ",
    glyphs: 56,
    sample: "Árbol",
    voice: "Milo · nova",
    status: "live",
  },
  {
    code: "fr",
    flag: "🇫🇷",
    name: "Français",
    chars: "A–Z · a–z · accents",
    glyphs: 64,
    sample: "Avion",
    voice: "Milo · echo",
    status: "live",
  },
  {
    code: "it",
    flag: "🇮🇹",
    name: "Italiano",
    chars: "A–Z · a–z",
    glyphs: 52,
    sample: "Albero",
    voice: "Milo · shimmer",
    status: "live",
  },
  {
    code: "de",
    flag: "🇩🇪",
    name: "Deutsch",
    chars: "A–Z · a–z · ä·ö·ü·ß",
    glyphs: 58,
    sample: "Apfel",
    voice: "Milo · alloy",
    status: "live",
  },
  {
    code: "pt",
    flag: "🇵🇹",
    name: "Português",
    chars: "A–Z · a–z · ã·ç",
    glyphs: 54,
    sample: "Avião",
    voice: "Milo · nova",
    status: "live",
  },
  {
    code: "ja",
    flag: "🇯🇵",
    name: "日本語",
    chars: "ひらがな 46",
    glyphs: 46,
    sample: "あめ",
    voice: "Milo · shimmer",
    status: "beta",
  },
  {
    code: "ar",
    flag: "🇸🇦",
    name: "العربية",
    chars: "28 أحرف",
    glyphs: 28,
    sample: "أسد",
    voice: "Milo · echo",
    status: "draft",
  },
];

export function LetterForgeAdmin() {
  return (
    <RealAdminShell trail={["Admin", "Little Learner", "LetterForge"]}>
      <div style={{ padding: "24px 32px", maxWidth: 1180, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 18,
            flexWrap: "wrap",
            gap: 14,
          }}
        >
          <div>
            <span
              className="la-pill"
              style={{ background: "#fff1d6", color: "#9a3412", fontWeight: 800 }}
            >
              🦁 Little Learner · ages 3–6 · LetterForge backend
            </span>
            <h1
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: "12px 0 4px",
              }}
            >
              LetterForge
            </h1>
            <p
              style={{
                color: "var(--ink-soft)",
                fontSize: 14,
                margin: 0,
                maxWidth: 700,
                lineHeight: 1.55,
              }}
            >
              Stores every letter as a <b>guide path</b> with a generous tolerance zone. The child
              never sees a &ldquo;wrong&rdquo; — the engine only scores effort.{" "}
              <code
                className="la-mono"
                style={{
                  padding: "1px 5px",
                  borderRadius: 4,
                  background: "var(--surface-soft)",
                  margin: "0 4px",
                }}
              >
                POST /api/v1/session/trace
              </code>{" "}
              never returns below <b>great_try</b>.
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="la-btn ghost">
              📥 Import glyph pack
            </button>
            <button type="button" className="la-btn">
              + New glyph
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 12,
            marginBottom: 22,
          }}
        >
          <Kpi label="Languages" value="8" />
          <Kpi label="Glyphs · total" value="312" />
          <Kpi label="Traces today" value="14,820" good />
          <Kpi label="P50 eval latency" value="118 ms" good />
          <Kpi label="Stars given" value="100%" good />
        </div>

        <SectionH
          n="1"
          title="Language coverage"
          sub="Same engine, every language. Each row is a glyph pack."
        />
        <div className="la-card" style={{ padding: 0, overflow: "hidden", marginBottom: 22 }}>
          {LF_LANGS.map((l, i) => (
            <LangRow key={l.code} l={l} idx={i} />
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
          <div className="la-card" style={{ padding: 22 }}>
            <SectionH
              n="2"
              title="Glyph editor · 'A' (English)"
              sub="The guide path the child traces. Tolerance zone is 40 px from each segment."
            />
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              <div
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 16,
                  background: "var(--surface-soft)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <svg
                  viewBox="0 0 540 540"
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                >
                  <path
                    d="M 130 470 L 270 80 L 410 470"
                    fill="none"
                    stroke="#fce0ec"
                    strokeWidth={70}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 180 320 L 360 320"
                    fill="none"
                    stroke="#fce0ec"
                    strokeWidth={70}
                    strokeLinecap="round"
                  />
                  <path
                    d="M 130 470 L 270 80 L 410 470"
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth={4}
                    strokeDasharray="10 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M 180 320 L 360 320"
                    fill="none"
                    stroke="#9a3412"
                    strokeWidth={4}
                    strokeDasharray="10 12"
                    strokeLinecap="round"
                  />
                  <circle cx={130} cy={470} r={22} fill="#22c55e" />
                  <text
                    x={130}
                    y={479}
                    fontSize={20}
                    textAnchor="middle"
                    fill="#fff"
                    fontWeight={800}
                  >
                    1
                  </text>
                  <circle cx={410} cy={470} r={22} fill="#f59e0b" />
                  <text
                    x={410}
                    y={479}
                    fontSize={20}
                    textAnchor="middle"
                    fill="#fff"
                    fontWeight={800}
                  >
                    2
                  </text>
                  <circle cx={180} cy={320} r={22} fill="#ec4899" />
                  <text
                    x={180}
                    y={329}
                    fontSize={20}
                    textAnchor="middle"
                    fill="#fff"
                    fontWeight={800}
                  >
                    3
                  </text>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="la-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-mute)",
                    letterSpacing: ".06em",
                    marginBottom: 6,
                  }}
                >
                  GLYPH JSON · normalized 0–540 grid
                </div>
                <pre
                  style={{
                    margin: 0,
                    padding: 12,
                    borderRadius: 8,
                    background: "var(--ink)",
                    color: "#e4e7f5",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    lineHeight: 1.55,
                    overflow: "hidden",
                  }}
                >{`{
  "glyph_id": "glyph_A_en_little",
  "character": "A",
  "language": "en",
  "strokes": [
    { "order": 1, "guide_path": [[130,470],[270,80]] },
    { "order": 2, "guide_path": [[270,80],[410,470]] },
    { "order": 3, "guide_path": [[180,320],[360,320]] }
  ],
  "reward_image_url": "/img/rewards/apple.png",
  "audio_url": "/audio/letters/A_en.mp3"
}`}</pre>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "7px 12px", fontSize: 12 }}
              >
                ↺ Reset path
              </button>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "7px 12px", fontSize: 12 }}
              >
                👀 Preview as kid
              </button>
              <button
                type="button"
                className="la-btn"
                style={{ padding: "7px 14px", fontSize: 12, marginLeft: "auto" }}
              >
                Save glyph
              </button>
            </div>
          </div>

          <div>
            <div className="la-card" style={{ padding: 22, marginBottom: 22 }}>
              <SectionH
                n="3"
                title="Soft scoring rules"
                sub="The Gentle Judge · never returns below great_try"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <Rule
                  ic="⭐"
                  t="Did they start near the star?"
                  body="≤ 40 px from start_marker → ★"
                />
                <Rule ic="✋" t="Did they move at all?" body="total distance > 30 px → ★" />
                <Rule ic="➡" t="Did they go the right way?" body="dot product > 0 → ★" />
                <Rule
                  ic="⏱"
                  t={<>Did they try for &gt; 1 second?</>}
                  body="always counts → safety-net star"
                />
              </div>
              <div
                style={{
                  marginTop: 14,
                  padding: 10,
                  borderRadius: 8,
                  background: "var(--ok-bg)",
                  fontSize: 12,
                  color: "var(--ink)",
                  borderLeft: "3px solid var(--ok)",
                  lineHeight: 1.55,
                }}
              >
                <b>Floor:</b> every attempt earns at least <b>1 star</b> +{" "}
                <i>&ldquo;Nice start! Try starting on the star.&rdquo;</i> No &ldquo;wrong&rdquo;,
                no &ldquo;failed&rdquo;, ever.
              </div>
            </div>

            <div className="la-card" style={{ padding: 22 }}>
              <SectionH
                n="4"
                title="Recent attempts"
                sub="Anonymized · for curriculum review only"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <Attempt
                  letter="A"
                  lang="en"
                  stars={3}
                  ms={142}
                  when="just now"
                  verdict="great_tracing"
                />
                <Attempt
                  letter="あ"
                  lang="ja"
                  stars={3}
                  ms={168}
                  when="2 m"
                  verdict="great_tracing"
                />
                <Attempt
                  letter="B"
                  lang="es"
                  stars={2}
                  ms={208}
                  when="6 m"
                  verdict="nice_start"
                  hint="Started below the star"
                />
                <Attempt
                  letter="C"
                  lang="en"
                  stars={3}
                  ms={110}
                  when="9 m"
                  verdict="great_tracing"
                />
                <Attempt
                  letter="A"
                  lang="fr"
                  stars={1}
                  ms={86}
                  when="14 m"
                  verdict="incomplete_tap"
                  hint="Held finger but no trace"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          className="la-card"
          style={{ padding: 18, marginTop: 22, background: "var(--surface-soft)" }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            LETTERFORGE API · OPENAPI
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {[
              "GET /api/v1/glyphs/{char}?lang=&world=",
              "POST /api/v1/session/trace",
              "GET /api/v1/lesson/next",
              "POST /api/v1/session/hear",
              "POST /api/v1/session/find",
              "GET /api/v1/learner/{id}/progress",
            ].map((s) => (
              <code
                key={s}
                className="la-mono"
                style={{
                  fontSize: 11,
                  padding: "5px 8px",
                  borderRadius: 4,
                  background: "#fff",
                  border: "1px solid var(--line)",
                  color: "var(--ink-soft)",
                }}
              >
                {s}
              </code>
            ))}
          </div>
          <div
            className="la-mono"
            style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 8 }}
          >
            target latency <b style={{ color: "var(--ok)" }}>&lt; 200 ms</b> · stateless · scalable
            to edge functions
          </div>
        </div>
      </div>
    </RealAdminShell>
  );
}

function Kpi({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div
      className="la-card"
      style={{
        padding: 14,
        borderLeft: good ? "3px solid var(--ok)" : "3px solid var(--line)",
      }}
    >
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
      <div
        style={{
          fontSize: 22,
          fontWeight: 800,
          marginTop: 4,
          color: good ? "var(--ok)" : "var(--ink)",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SectionH({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        className="la-mono"
        style={{
          fontSize: 10,
          color: "var(--brand-1)",
          letterSpacing: ".08em",
          fontWeight: 800,
        }}
      >
        {n} · {title.toUpperCase()}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--ink-soft)",
          marginTop: 2,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function LangRow({ l, idx }: { l: (typeof LF_LANGS)[number]; idx: number }) {
  const stateMap: Record<typeof l.status, { c: string; bg: string; label: string }> = {
    live: { c: "var(--ok)", bg: "var(--ok-bg)", label: "LIVE" },
    beta: { c: "var(--warn)", bg: "var(--warn-bg)", label: "BETA" },
    draft: { c: "var(--ink-mute)", bg: "var(--bg-2)", label: "DRAFT" },
  };
  const s = stateMap[l.status];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "40px 1.2fr 1.4fr 60px 1.4fr 1fr 80px",
        padding: "12px 18px",
        alignItems: "center",
        gap: 12,
        borderTop: idx ? "1px solid var(--line-soft)" : "none",
      }}
    >
      <span style={{ fontSize: 22 }}>{l.flag}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800 }}>{l.name}</div>
        <div className="la-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
          {l.code}.hpersona
        </div>
      </div>
      <span className="la-mono" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
        {l.chars}
      </span>
      <span
        className="la-mono"
        style={{
          fontSize: 12.5,
          fontWeight: 800,
          color: "var(--ink)",
          textAlign: "right",
        }}
      >
        {l.glyphs}
      </span>
      <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>
        e.g. <b style={{ color: "var(--ink)" }}>{l.sample}</b>
      </span>
      <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
        🔊 {l.voice}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".04em",
          padding: "3px 8px",
          borderRadius: 6,
          background: s.bg,
          color: s.c,
          textAlign: "center",
        }}
      >
        {s.label}
      </span>
    </div>
  );
}

function Rule({ ic, t, body }: { ic: string; t: ReactNode; body: string }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        gap: 10,
        alignItems: "center",
      }}
    >
      <span style={{ fontSize: 18 }}>{ic}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{t}</div>
        <div className="la-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}>
          {body}
        </div>
      </div>
    </div>
  );
}

function Attempt({
  letter,
  lang,
  stars,
  ms,
  when,
  verdict,
  hint,
}: {
  letter: string;
  lang: string;
  stars: 1 | 2 | 3;
  ms: number;
  when: string;
  verdict: "great_tracing" | "nice_start" | "incomplete_tap";
  hint?: string;
}) {
  const vc =
    verdict === "great_tracing"
      ? "var(--ok)"
      : verdict === "nice_start"
        ? "var(--warn)"
        : "var(--ink-mute)";
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "36px 1fr auto 60px 60px",
        padding: "8px 0",
        borderBottom: "1px solid var(--line-soft)",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "#fce0ec",
          display: "grid",
          placeItems: "center",
          fontSize: 18,
          fontWeight: 800,
          color: "#9a3412",
        }}
      >
        {letter}
      </div>
      <div>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: vc,
            letterSpacing: ".04em",
          }}
        >
          {verdict.toUpperCase().replace("_", " ")}
        </div>
        {hint ? (
          <div style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 1 }}>{hint}</div>
        ) : null}
      </div>
      <span className="la-mono" style={{ fontSize: 10, color: "var(--ink-mute)" }}>
        {lang}
      </span>
      <span style={{ fontSize: 13, color: "#f59e0b", textAlign: "right" }}>
        {"★".repeat(stars)}
        <span style={{ color: "var(--ink-faint)" }}>{"★".repeat(3 - stars)}</span>
      </span>
      <span
        className="la-mono"
        style={{ fontSize: 10, color: "var(--ink-mute)", textAlign: "right" }}
      >
        {when} · {ms}ms
      </span>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 19 · OnboardingNew — 3-step redesigned wizard, Step 1 preview
// ════════════════════════════════════════════════════════════════════
export function OnboardingNew() {
  return (
    <div
      style={{
        width: 1280,
        minHeight: 900,
        background: "linear-gradient(180deg, #f3f4ff 0%, #fff 50%)",
      }}
    >
      <div
        style={{
          height: 60,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid var(--line-soft)",
        }}
      >
        <BrandMark />
        <span
          className="la-mono"
          style={{
            fontSize: 12,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
            fontWeight: 700,
          }}
        >
          STEP 1 OF 3
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-mute)" }}>
          Need help?{" "}
          <a href="#" style={{ color: "var(--brand-1)", fontWeight: 700 }}>
            Skip setup
          </a>
        </span>
      </div>

      <div style={{ height: 4, background: "var(--bg-2)", display: "flex" }}>
        <div style={{ width: "33.33%", background: "var(--brand-grad)" }} />
        <div style={{ width: "66.66%" }} />
      </div>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 28px 32px" }}>
        <h1
          style={{
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: "-0.025em",
            margin: "0 0 8px",
            lineHeight: 1.1,
            textAlign: "center",
          }}
        >
          Who are we helping today?
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 15,
            margin: "0 auto 32px",
            textAlign: "center",
            maxWidth: 540,
            lineHeight: 1.55,
          }}
        >
          We pick the pace, voice, and lessons based on this. A 3-year-old and a teen need very
          different things — and that&apos;s all we need to know to start.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <WhoCard ic="🦁" t="My child" sub="age 3–17 · we'll ask their age next" active />
          <WhoCard ic="🎓" t="Me" sub="learner · school, work, or curiosity" />
          <WhoCard
            ic="🌿"
            t="My parent or older relative"
            sub="patient, calm digital-life skills"
          />
          <WhoCard ic="🏫" t="My students" sub="classroom — invite link after setup" />
        </div>

        <div
          className="la-card"
          style={{
            padding: 22,
            marginBottom: 20,
            background: "#fce0ec",
            border: "2px solid #ec4899",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🦁</span>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#9a3412" }}>
              How old is your child?
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {[
              { age: "3–6", sub: "Little Learner", on: true },
              { age: "7–11", sub: "GRADE_7" },
              { age: "12–15", sub: "GRADE_8" },
              { age: "16–18", sub: "GRADE_9" },
            ].map((a) => (
              <button
                type="button"
                key={a.age}
                style={{
                  padding: "14px 10px",
                  borderRadius: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: a.on ? "linear-gradient(135deg, #ec4899, #f59e0b)" : "#fff",
                  color: a.on ? "#fff" : "var(--ink)",
                  border: a.on ? "none" : "1.5px solid var(--line)",
                  boxShadow: a.on ? "0 8px 22px rgba(236,72,153,.3)" : "none",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  {a.age}
                </div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
                  {a.sub}
                </div>
              </button>
            ))}
          </div>

          <div style={{ marginTop: 18 }}>
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#9a3412",
                letterSpacing: ".08em",
                marginBottom: 8,
              }}
            >
              BEST FOR AGE 3–6
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <TopicPill ic="🔤" t="Letters" on />
              <TopicPill ic="🔢" t="Numbers" />
              <TopicPill ic="📖" t="Stories" />
              <TopicPill ic="🌈" t="Colors" />
              <TopicPill ic="🐾" t="Animals" />
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span
                className="la-mono"
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: "#9a3412",
                  letterSpacing: ".08em",
                }}
              >
                CHILD&apos;S NAME
              </span>
              <span style={{ fontSize: 11, color: "#9a3412", opacity: 0.65 }}>
                optional · just for Milo to say hi
              </span>
            </div>
            <input
              defaultValue="Sofia"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1.5px solid #ec4899",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 700,
                color: "#9a3412",
                background: "#fff",
              }}
            />
          </div>
        </div>

        <div
          className="la-card"
          style={{
            padding: 16,
            marginBottom: 24,
            background: "var(--bg-2)",
            border: "1px solid #d6dfff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>✨</span>
            <div style={{ flex: 1 }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--brand-1)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                NEXT, BASED ON YOUR CHOICES
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--ink)",
                  marginTop: 2,
                  lineHeight: 1.5,
                }}
              >
                We&apos;ll open <b>Milo Letters</b> with Sofia. First letter: <b>A</b>. Milo will
                say it, you&apos;ll trace it together on your screen.
                <span
                  className="la-mono"
                  style={{ marginLeft: 4, fontSize: 11, color: "var(--ink-mute)" }}
                >
                  Little Learner · Milo · auto-picked · change anytime
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <button
            type="button"
            style={{
              padding: "12px 18px",
              borderRadius: 10,
              cursor: "pointer",
              fontFamily: "inherit",
              background: "transparent",
              color: "var(--ink-soft)",
              border: "1px solid var(--line)",
              fontSize: 13,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            ← Back to LearnAI
          </button>
          <button
            type="button"
            className="la-btn"
            style={{
              padding: "14px 28px",
              fontSize: 15,
              fontWeight: 800,
              background: "var(--brand-grad)",
            }}
          >
            Continue · choose what to learn <Arrow color="#fff" />
          </button>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 11.5,
            color: "var(--ink-mute)",
          }}
        >
          🔒 We never use Sofia&apos;s name or data to train any AI model.
        </div>
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--brand-grad)",
          color: "#fff",
          display: "grid",
          placeItems: "center",
          fontWeight: 800,
          fontSize: 13,
          boxShadow: "0 4px 12px rgba(46,91,255,.25)",
        }}
      >
        L
      </span>
      <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>
        Learn
        <span
          style={{
            background: "var(--brand-grad)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          AI
        </span>
      </span>
    </span>
  );
}

function WhoCard({ ic, t, sub, active }: { ic: string; t: string; sub: string; active?: boolean }) {
  return (
    <button
      type="button"
      style={{
        padding: "18px 18px",
        borderRadius: 14,
        cursor: "pointer",
        fontFamily: "inherit",
        background: active ? "#fff" : "var(--surface-soft)",
        border: active ? "2px solid var(--brand-1)" : "1.5px solid var(--line)",
        boxShadow: active ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 32 }}>{ic}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 16, fontWeight: 800 }}>{t}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{sub}</div>
      </div>
      {active ? (
        <span style={{ color: "var(--brand-1)", fontSize: 22, fontWeight: 800 }}>✓</span>
      ) : null}
    </button>
  );
}

function TopicPill({ ic, t, on }: { ic: string; t: string; on?: boolean }) {
  return (
    <button
      type="button"
      style={{
        padding: "10px 16px",
        borderRadius: 99,
        cursor: "pointer",
        fontFamily: "inherit",
        background: on ? "#9a3412" : "#fff",
        color: on ? "#fff" : "#9a3412",
        border: on ? "none" : "1.5px solid #fde68a",
        fontSize: 14,
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      <span style={{ fontSize: 16 }}>{ic}</span> {t}
      {on ? <span style={{ marginLeft: 4 }}>✓</span> : null}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// 20 · MiloGamesHub — child-facing 4×2 game grid
// ════════════════════════════════════════════════════════════════════
type Game = {
  id: string;
  t: string;
  sub: string;
  ic: string;
  c: string;
  bg: string;
  badge?: string;
  current?: boolean;
  soon?: boolean;
};

const MILO_GAMES: Game[] = [
  {
    id: "letters",
    t: "Milo Letters",
    sub: "Trace A · B · C with your finger",
    ic: "🔤",
    c: "#ec4899",
    bg: "#fce0ec",
    badge: "★ 8",
  },
  {
    id: "numbers",
    t: "Milo Numbers",
    sub: "Count, tap, and trace 1–10",
    ic: "🔢",
    c: "#f59e0b",
    bg: "#fef3c7",
    badge: "★ 5",
    current: true,
  },
  {
    id: "colors",
    t: "Milo Colors",
    sub: "Match the rainbow",
    ic: "🌈",
    c: "#7c3aed",
    bg: "#efe7ff",
    badge: "★ 3",
  },
  {
    id: "animals",
    t: "Milo Zoo",
    sub: "Find the animals, hear their sound",
    ic: "🐾",
    c: "#16a34a",
    bg: "#d1fae5",
    badge: "✦ new",
  },
  {
    id: "shapes",
    t: "Milo Shapes",
    sub: "Circle, square, triangle, heart",
    ic: "🔺",
    c: "#0ea5a4",
    bg: "#d6f1f0",
  },
  {
    id: "sounds",
    t: "Milo Sounds",
    sub: "Match the noise to the picture",
    ic: "🔊",
    c: "#dc2626",
    bg: "#fee2e2",
  },
  {
    id: "songs",
    t: "Milo Songs",
    sub: "Sing-along with Milo",
    ic: "🎵",
    c: "#4338ca",
    bg: "#e0e7ff",
  },
  {
    id: "feelings",
    t: "Milo Feelings",
    sub: "Name how you feel today",
    ic: "🙂",
    c: "#be185d",
    bg: "#fdf2f8",
    soon: true,
  },
];

export function MiloGamesHub() {
  const decor: Array<{ e: string; top: number; left: number; rot: number }> = [
    { e: "⭐", top: 40, left: 60, rot: -12 },
    { e: "🌟", top: 90, left: 920, rot: 18 },
    { e: "✨", top: 60, left: 480, rot: 8 },
    { e: "🌈", top: 700, left: 90, rot: -6 },
    { e: "☁️", top: 680, left: 870, rot: 22 },
    { e: "🎈", top: 380, left: 30, rot: -10 },
    { e: "🦄", top: 130, left: 800, rot: 14 },
  ];
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "linear-gradient(180deg, #fce0ec 0%, #fef3c7 50%, #d1fae5 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {decor.map((d, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            fontSize: 36,
            opacity: 0.32,
            pointerEvents: "none",
            top: d.top,
            left: d.left,
            transform: `rotate(${d.rot}deg)`,
          }}
        >
          {d.e}
        </span>
      ))}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ec4899,#f59e0b)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 14,
              fontWeight: 800,
              boxShadow: "0 4px 10px rgba(236,72,153,.3)",
            }}
          >
            L
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>
            Milo Games · Sofia
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              background: "#fff",
              fontSize: 13,
              fontWeight: 800,
              color: "#f59e0b",
              boxShadow: "0 4px 10px rgba(0,0,0,.06)",
            }}
          >
            ⭐ 16
          </span>
          <button
            type="button"
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              border: "none",
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            🔒
          </button>
        </div>
      </div>

      <div style={{ position: "absolute", top: 72, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 4 }} aria-hidden>
          🐯
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#9a3412",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Hi Sofia! What do you want to play?
        </h1>
        <button
          type="button"
          style={{
            marginTop: 10,
            padding: "8px 18px",
            borderRadius: 99,
            background: "#fff",
            border: "2px solid #ec4899",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
            color: "#9a3412",
            boxShadow: "0 4px 12px rgba(236,72,153,.15)",
          }}
        >
          🔊 Milo says it out loud
        </button>
      </div>

      <div
        style={{
          position: "absolute",
          top: 280,
          left: 40,
          right: 40,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 18,
        }}
      >
        {MILO_GAMES.map((g) => (
          <GameTile key={g.id} g={g} />
        ))}
      </div>
    </div>
  );
}

function GameTile({ g }: { g: Game }) {
  return (
    <button
      type="button"
      style={{
        padding: "20px 14px",
        borderRadius: 24,
        cursor: g.soon ? "not-allowed" : "pointer",
        fontFamily: "inherit",
        background: g.soon ? "rgba(255,255,255,.5)" : "#fff",
        border: g.current ? "3px solid #f59e0b" : "2px solid transparent",
        boxShadow: g.current ? "0 14px 30px rgba(245,158,11,.35)" : "0 8px 20px rgba(0,0,0,.08)",
        position: "relative",
        textAlign: "center",
        opacity: g.soon ? 0.55 : 1,
        transform: g.current ? "translateY(-4px)" : "none",
      }}
    >
      {g.current ? (
        <span
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            padding: "3px 10px",
            borderRadius: 99,
            background: "#f59e0b",
            color: "#fff",
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: ".06em",
          }}
        >
          PLAYING
        </span>
      ) : null}
      {g.badge && !g.current ? (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "3px 8px",
            borderRadius: 99,
            background: g.bg,
            color: g.c,
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {g.badge}
        </span>
      ) : null}
      {g.soon ? (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            padding: "3px 8px",
            borderRadius: 99,
            background: "rgba(0,0,0,.08)",
            fontSize: 10,
            fontWeight: 800,
            color: "var(--ink-mute)",
            letterSpacing: ".06em",
          }}
        >
          SOON
        </span>
      ) : null}
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: 24,
          margin: "0 auto 10px",
          background: g.bg,
          color: g.c,
          display: "grid",
          placeItems: "center",
          fontSize: 40,
          boxShadow: "inset 0 -6px 12px rgba(0,0,0,.04)",
        }}
      >
        {g.ic}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: "#9a3412",
          letterSpacing: "-0.01em",
        }}
      >
        {g.t}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "#9a3412",
          opacity: 0.7,
          marginTop: 4,
          lineHeight: 1.35,
        }}
      >
        {g.sub}
      </div>
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════
// 21 · MiloNumbers — Count the apples (4 apples · pick the number)
// ════════════════════════════════════════════════════════════════════
export function MiloNumbers() {
  const decor: Array<{ e: string; top: number; left: number; rot: number }> = [
    { e: "⭐", top: 50, left: 80, rot: -10 },
    { e: "🌟", top: 100, left: 920, rot: 20 },
    { e: "✨", top: 720, left: 100, rot: -6 },
    { e: "🍎", top: 660, left: 870, rot: 14 },
    { e: "🍌", top: 130, left: 760, rot: -8 },
  ];
  const apples = [0, 1, 2, 3];
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {decor.map((d, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            fontSize: 36,
            opacity: 0.3,
            pointerEvents: "none",
            top: d.top,
            left: d.left,
            transform: `rotate(${d.rot}deg)`,
          }}
        >
          {d.e}
        </span>
      ))}

      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          style={{
            padding: "7px 14px",
            borderRadius: 99,
            background: "#fff",
            border: "2px solid #f59e0b",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
            color: "#9a3412",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          ← Games
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>🔢 Milo Numbers</span>
          <span
            style={{
              padding: "5px 12px",
              borderRadius: 99,
              background: "#fff",
              fontSize: 13,
              fontWeight: 800,
              color: "#f59e0b",
              boxShadow: "0 4px 10px rgba(0,0,0,.06)",
            }}
          >
            ⭐ 2 / 3
          </span>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 30,
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          maxWidth: 340,
        }}
      >
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: 50,
            background: "radial-gradient(circle at 40% 35%, #fde68a, #f59e0b)",
            display: "grid",
            placeItems: "center",
            fontSize: 50,
            boxShadow: "0 8px 22px rgba(245,158,11,.3)",
            flexShrink: 0,
          }}
          aria-hidden
        >
          🐯
        </div>
        <div
          style={{
            padding: "14px 18px",
            borderRadius: 22,
            background: "#fff",
            boxShadow: "0 8px 22px rgba(0,0,0,.08)",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#9a3412",
              lineHeight: 1.25,
            }}
          >
            Count the apples 🍎
          </div>
          <div style={{ fontSize: 13, color: "#9a3412", opacity: 0.75, marginTop: 4 }}>
            Tap each one. Then pick the number!
          </div>
          <button
            type="button"
            style={{
              marginTop: 10,
              padding: "6px 14px",
              borderRadius: 99,
              background: "#fce0ec",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
              color: "#9a3412",
            }}
          >
            🔊 Hear again
          </button>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 220,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 280,
          borderRadius: 32,
          background: "#fff",
          boxShadow: "0 18px 40px rgba(0,0,0,.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
        }}
      >
        {apples.map((i) => (
          <div key={i} style={{ textAlign: "center", position: "relative" }}>
            <div style={{ fontSize: 86 }}>🍎</div>
            <div
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 28,
                height: 28,
                borderRadius: 99,
                background: "#22c55e",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 14,
                fontWeight: 800,
                boxShadow: "0 4px 8px rgba(34,197,94,.4)",
              }}
            >
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          top: 540,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 18,
          padding: "0 30px",
        }}
      >
        {[3, 4, 5].map((n) => {
          const correct = n === 4;
          return (
            <button
              type="button"
              key={n}
              style={{
                width: 130,
                height: 130,
                borderRadius: 28,
                cursor: "pointer",
                fontFamily: "inherit",
                background: correct ? "linear-gradient(135deg, #22c55e, #16a34a)" : "#fff",
                color: correct ? "#fff" : "#9a3412",
                border: correct ? "none" : "3px solid #fde68a",
                fontSize: 64,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                boxShadow: correct
                  ? "0 14px 32px rgba(34,197,94,.45)"
                  : "0 8px 22px rgba(0,0,0,.06)",
                transform: correct ? "translateY(-4px)" : "none",
                position: "relative",
              }}
            >
              {n}
              {correct ? (
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    width: 32,
                    height: 32,
                    borderRadius: 99,
                    background: "#fff",
                    color: "#22c55e",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 18,
                    boxShadow: "0 4px 10px rgba(0,0,0,.15)",
                  }}
                >
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          padding: "14px 28px",
          borderRadius: 99,
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          color: "#fff",
          fontSize: 18,
          fontWeight: 800,
          boxShadow: "0 12px 30px rgba(34,197,94,.55)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        🎉 Yes! Four apples!
        <span style={{ display: "inline-flex", gap: 4 }}>
          {[1, 2, 3].map((s) => (
            <span key={s} style={{ fontSize: 22 }}>
              ⭐
            </span>
          ))}
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
// 22-25 · Little Learner 3-layer redesign + Parent area
//   ports `wikitest-screen-little-learner-3layer.jsx`
//   Layer 1 — LittleLearnerHome   (parent + child together)
//   Layer 2 — MiloLettersHome     (subject landing · today + 3 games)
//   Layer 3 — MiloPlay            (one game · child-only chrome)
//   Bonus  — ParentAreaPreview    (locked behind 2s hold)
// ════════════════════════════════════════════════════════════════════

const LL_AREAS: Array<{
  id: string;
  ic: string;
  t: string;
  c: string;
  bg: string;
  today: string;
}> = [
  { id: "letters", ic: "🅰️", t: "Letters", c: "#ec4899", bg: "#fce0ec", today: "A is for Apple" },
  { id: "numbers", ic: "🔢", t: "Numbers", c: "#f59e0b", bg: "#fef3c7", today: "2 apples" },
  { id: "colors", ic: "🎨", t: "Colors", c: "#7c3aed", bg: "#efe7ff", today: "Red car" },
  { id: "shapes", ic: "🔷", t: "Shapes", c: "#0ea5a4", bg: "#d6f1f0", today: "Circle" },
  { id: "animals", ic: "🦁", t: "Animals", c: "#16a34a", bg: "#d1fae5", today: "Lion" },
  { id: "feelings", ic: "🐻", t: "Feelings", c: "#dc2626", bg: "#fee2e2", today: "Happy" },
  { id: "stories", ic: "📚", t: "Stories", c: "#4338ca", bg: "#e0e7ff", today: "Jungle friends" },
];

export function LittleLearnerHome() {
  const decor: Array<{ e: string; top: number; left: number; rot: number }> = [
    { e: "⭐", top: 40, left: 60, rot: -12 },
    { e: "🌟", top: 90, left: 920, rot: 18 },
    { e: "✨", top: 60, left: 480, rot: 8 },
    { e: "🌈", top: 690, left: 90, rot: -6 },
    { e: "☁️", top: 680, left: 870, rot: 22 },
    { e: "🎈", top: 130, left: 30, rot: -10 },
  ];
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "linear-gradient(180deg, #fce0ec 0%, #fef3c7 60%, #d1fae5 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {decor.map((d, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            fontSize: 32,
            opacity: 0.3,
            pointerEvents: "none",
            top: d.top,
            left: d.left,
            transform: `rotate(${d.rot}deg)`,
          }}
        >
          {d.e}
        </span>
      ))}

      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ec4899,#f59e0b)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            L
          </span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>Little Learner</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px 6px 8px",
              borderRadius: 99,
              background: "#fff",
              border: "2px solid #ec4899",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
              color: "#9a3412",
            }}
          >
            <span style={{ fontSize: 18 }}>🌍</span> English ▾
          </button>
          <button
            type="button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "6px 12px",
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: "#9a3412",
            }}
          >
            <span style={{ fontSize: 16 }}>🔒</span> Parent · hold 2s
          </button>
        </div>
      </div>

      {/* Greeting */}
      <div style={{ position: "absolute", top: 76, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 4 }} aria-hidden>
          🐯
        </div>
        <h1
          style={{
            fontSize: 30,
            fontWeight: 800,
            color: "#9a3412",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Hi Lina! 👋 Ready to play with Milo?
        </h1>
      </div>

      {/* Today's lesson card */}
      <div
        style={{
          position: "absolute",
          top: 200,
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          padding: 24,
          borderRadius: 28,
          background: "#fff",
          boxShadow: "0 20px 40px rgba(0,0,0,.1)",
          border: "3px solid #f59e0b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <span
            className="la-mono"
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: "#f59e0b",
              letterSpacing: ".08em",
            }}
          >
            TODAY&apos;S LESSON
          </span>
          <span style={{ flex: 1, height: 2, background: "#fef3c7" }} />
          <span className="la-mono" style={{ fontSize: 10, color: "#9a3412", opacity: 0.6 }}>
            ≈ 10 min · 3 mini-games
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 14 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 22,
              background: "#fce0ec",
              display: "grid",
              placeItems: "center",
              fontSize: 56,
              fontWeight: 800,
              color: "#ec4899",
              flexShrink: 0,
            }}
          >
            A
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#9a3412",
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              A is for Apple 🍎
            </div>
            <div style={{ fontSize: 14, color: "#9a3412", opacity: 0.7, marginTop: 4 }}>
              3 mini-games using cars and blocks · Lina&apos;s favorites
            </div>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <LL3LayerTodayGame ic="🚗" t="Drive on A" />
          <LL3LayerTodayGame ic="🏠" t="Park A" />
          <LL3LayerTodayGame ic="🧱" t="Build A" />
        </div>
        <button
          type="button"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 18,
            fontWeight: 800,
            boxShadow: "0 8px 22px rgba(34,197,94,.4)",
          }}
        >
          ▶ Start today&apos;s lesson
        </button>
      </div>

      {/* Learning areas */}
      <div style={{ position: "absolute", top: 524, left: 0, right: 0, padding: "0 40px" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.65,
            letterSpacing: ".08em",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          OR PICK ANOTHER AREA
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
          {LL_AREAS.map((a) => (
            <button
              type="button"
              key={a.id}
              style={{
                padding: "14px 8px",
                borderRadius: 18,
                cursor: "pointer",
                fontFamily: "inherit",
                background: "#fff",
                border: "2px solid transparent",
                boxShadow: "0 6px 16px rgba(0,0,0,.06)",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: a.bg,
                  color: a.c,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 26,
                  margin: "0 auto 8px",
                }}
              >
                {a.ic}
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>{a.t}</div>
              <div
                className="la-mono"
                style={{ fontSize: 9, color: a.c, marginTop: 2, fontWeight: 700 }}
              >
                {a.today}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LL3LayerTodayGame({ ic, t }: { ic: string; t: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        background: "#fef3c7",
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 22 }}>{ic}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>{t}</span>
    </div>
  );
}

export function MiloLettersHome() {
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "linear-gradient(180deg, #fce0ec 0%, #fff1d6 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 14px",
            borderRadius: 99,
            background: "#fff",
            border: "2px solid #ec4899",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 800,
            color: "#9a3412",
          }}
        >
          ← Home
        </button>
        <span style={{ fontSize: 14, fontWeight: 800, color: "#9a3412" }}>🅰️ Milo Letters</span>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "6px 12px",
            borderRadius: 99,
            background: "rgba(255,255,255,.7)",
            border: "none",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            color: "#9a3412",
          }}
        >
          <span style={{ fontSize: 16 }}>🔒</span> Parent
        </button>
      </div>

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.7,
            letterSpacing: ".08em",
          }}
        >
          TODAY&apos;S LETTER
        </div>
        <div
          style={{
            width: 200,
            height: 200,
            borderRadius: 32,
            background: "#fff",
            display: "grid",
            placeItems: "center",
            margin: "14px auto",
            fontSize: 130,
            fontWeight: 800,
            color: "#ec4899",
            boxShadow: "0 16px 36px rgba(0,0,0,.1)",
          }}
        >
          A
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#9a3412", letterSpacing: "-0.02em" }}>
          A is for Apple 🍎
        </div>
        <button
          type="button"
          style={{
            marginTop: 10,
            padding: "10px 22px",
            borderRadius: 99,
            background: "linear-gradient(135deg,#ec4899,#f59e0b)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 15,
            fontWeight: 800,
            boxShadow: "0 8px 20px rgba(236,72,153,.35)",
          }}
        >
          🔊 Tap to hear &ldquo;Ay&rdquo;
        </button>
      </div>

      <div style={{ position: "absolute", top: 520, left: 40, right: 40 }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.7,
            letterSpacing: ".08em",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          TODAY&apos;S MINI-GAMES
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginBottom: 14,
          }}
        >
          <LL3LayerMiniGame ic="🚗" t="Drive on the letter A" sub="trace A with your car" />
          <LL3LayerMiniGame ic="🏠" t="Park A in the garage" sub="match A to A · not B" />
          <LL3LayerMiniGame ic="🧱" t="Build A with blocks" sub="drag blocks into the shape" />
        </div>
        <button
          type="button"
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: 16,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            border: "none",
            cursor: "pointer",
            color: "#fff",
            fontSize: 17,
            fontWeight: 800,
            boxShadow: "0 8px 22px rgba(34,197,94,.4)",
          }}
        >
          ▶ Start · Game 1 of 3
        </button>
      </div>
    </div>
  );
}

function LL3LayerMiniGame({ ic, t, sub }: { ic: string; t: string; sub: string }) {
  return (
    <div
      style={{
        padding: "16px 14px",
        borderRadius: 18,
        background: "#fff",
        boxShadow: "0 6px 16px rgba(0,0,0,.08)",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 44, marginBottom: 6 }}>{ic}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color: "#9a3412" }}>{t}</div>
      <div style={{ fontSize: 11, color: "#9a3412", opacity: 0.7, marginTop: 3 }}>{sub}</div>
    </div>
  );
}

export function MiloPlay() {
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          right: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          ←
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: 99,
            background: "#fff",
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>
            🚗 Park A · Game 1 of 3
          </span>
        </div>
        <button
          type="button"
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          }}
        >
          🔊
        </button>
      </div>

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 24px",
            borderRadius: 24,
            background: "#fff",
            boxShadow: "0 8px 22px rgba(0,0,0,.08)",
          }}
        >
          <span style={{ fontSize: 36 }}>🐯</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#9a3412" }}>
            Where does <span style={{ color: "#ec4899" }}>A</span> go?
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", top: 240, left: "50%", transform: "translateX(-50%)" }}>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 90 }}>🚗</div>
          <div
            style={{
              marginTop: -10,
              padding: "4px 14px",
              borderRadius: 99,
              background: "#ec4899",
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            A
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 460,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          gap: 40,
        }}
      >
        {[
          { l: "A", ok: true },
          { l: "B", ok: false },
        ].map((g) => (
          <div key={g.l} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 24,
                background: "#fff",
                border: g.ok ? "4px dashed #22c55e" : "4px dashed #fde68a",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 10px 24px rgba(0,0,0,.08)",
              }}
            >
              <div style={{ fontSize: 50 }}>🏠</div>
              <div
                style={{
                  fontSize: 46,
                  fontWeight: 800,
                  color: g.ok ? "#22c55e" : "#9a3412",
                  marginTop: -8,
                }}
              >
                {g.l}
              </div>
            </div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: g.ok ? "#22c55e" : "#9a3412",
                marginTop: 10,
                opacity: g.ok ? 1 : 0.6,
              }}
            >
              {g.ok ? "Drop here" : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ParentAreaPreview() {
  const settings: Array<{ k: string; v: string }> = [
    { k: "Language", v: "English" },
    { k: "Age band", v: "3–6 · Little Learner" },
    { k: "Active subjects", v: "Letters · Numbers · Colors · Shapes · Animals" },
    { k: "Daily time limit", v: "20 min · auto-pause" },
    { k: "Quiet hours", v: "7 pm – 9 am" },
    { k: "Voice", v: "Milo · gentle · slow" },
  ];
  return (
    <div
      style={{
        width: 1024,
        minHeight: 768,
        background: "#f8f9ff",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          height: 60,
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          borderBottom: "1px solid var(--line-soft)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ec4899,#f59e0b)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            L
          </span>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Parent area · Lina (4)</span>
        </div>
        <button
          type="button"
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            background: "var(--brand-grad)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          ← Back to Milo
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: 708 }}>
        <aside
          style={{ padding: 16, background: "#fff", borderRight: "1px solid var(--line-soft)" }}
        >
          {["Today", "Children", "Settings", "Reports", "Safety"].map((it, i) => (
            <button
              type="button"
              key={it}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                background: i === 0 ? "var(--bg-2)" : "transparent",
                color: i === 0 ? "var(--brand-1)" : "var(--ink-soft)",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "inherit",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: 4,
              }}
            >
              {it}
            </button>
          ))}
        </aside>

        <main style={{ padding: 24 }}>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              margin: "0 0 18px",
            }}
          >
            Today, Lina learned
          </h1>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <div className="la-card" style={{ padding: 18, background: "#fff" }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ok)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                WHAT WENT WELL
              </div>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 18,
                  fontSize: 13,
                  color: "var(--ink)",
                  lineHeight: 1.7,
                }}
              >
                <li>
                  Letter <b>A</b> — Apple, Avocado · 3 ⭐
                </li>
                <li>Counted apples 1 → 5 · 3 ⭐</li>
                <li>Picked the color red · 3 ⭐</li>
              </ul>
            </div>
            <div className="la-card" style={{ padding: 18, background: "#fff" }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--warn)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                WHERE SHE PAUSED
              </div>
              <ul
                style={{
                  margin: "8px 0 0",
                  paddingLeft: 18,
                  fontSize: 13,
                  color: "var(--ink)",
                  lineHeight: 1.7,
                }}
              >
                <li>Hesitated on number 4 — try again tomorrow</li>
                <li>&ldquo;Build A with blocks&rdquo; took 2 tries</li>
              </ul>
            </div>
          </div>

          <div
            className="la-card"
            style={{
              padding: 18,
              background: "var(--bg-2)",
              border: "1.5px solid var(--brand-1)",
              marginBottom: 18,
            }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--brand-1)",
                letterSpacing: ".08em",
                fontWeight: 800,
              }}
            >
              TOMORROW · MILO SUGGESTS
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, marginTop: 4 }}>
              Count jungle animals with Milo
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
              Revisits number 4 inside an animal-counting story. ~8 min.
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px" }}>Quick settings</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
            {settings.map((s) => (
              <div
                className="la-card"
                key={s.k}
                style={{ padding: "10px 14px", background: "#fff" }}
              >
                <div
                  className="la-mono"
                  style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em" }}
                >
                  {s.k.toUpperCase()}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{s.v}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

// Keep the unused style satisfied — Prettier needs this re-export anchor.
export const __GRADE_6_STYLE: CSSProperties = { display: "none" };
