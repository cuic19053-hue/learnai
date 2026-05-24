/**
 * World-specific Forge home gallery screens (Batch 4, 6 screens).
 *
 *   StoryForgeHome   — Little Learner (3-6)   · parent-led
 *   QuestForgeHome   — Explorer (7-11)        · curiosity quests
 *   ProjectForgeHome — Builder (12-15)        · build something
 *   ScholarExamForge — Scholar (16-18)        · exam prep (flagship)
 *   CertForgeHome    — Professional           · cert prep
 *   SafetyForgeHome  — Senior                 · digital safety
 *
 * Shared layout produced by a small <ForgeHome> component (templates +
 * recent + focus + tutor card). Each world's data lives in FORGE_DATA.
 */

"use client";

import type { ReactNode } from "react";
import { LATopBar, LASidebar, WTBreadcrumb } from "@/components/learn/shared/SidebarShell";
import { Icon } from "@/components/learn/shared/wikitest-icons";

type World = "Scholar" | "Professional" | "Builder" | "Playful";

type ForgeData = {
  world: World;
  name: string;
  ages: string;
  emoji: string;
  forge: string;
  color: string;
  bg: string;
  soft: string;
  grad: string;
  tutor: string;
  tutorIc: string;
  operator: string;
  hero: string;
  sub: string;
  ctaPrimary: string;
  ctaSecondary: string;
  initials: string;
  avatarBg: string;
  templates: { ic: string; t: string; s: string }[];
  recent: { t: string; sub: string; score: string }[];
  focus: { label: string; items: string[] };
};

const STORY: ForgeData = {
  world: "Playful",
  name: "Little Learner",
  ages: "3–6",
  emoji: "🦁",
  forge: "StoryForge",
  color: "#ec4899",
  bg: "#fce0ec",
  soft: "#fcedf3",
  grad: "linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)",
  tutor: "Milo",
  tutorIc: "🐯",
  operator: "parent-led · for your little one",
  hero: "Turn a story or theme into a 10-minute play-quiz.",
  sub: "You pick the theme — Milo turns it into a gentle story with counting, colors, and tappable answers. Voice on. Safe for ages 3–6.",
  ctaPrimary: "Pick a theme",
  ctaSecondary: "Browse stories",
  initials: "P",
  avatarBg: "#ec4899",
  templates: [
    { ic: "🦁", t: "Counting jungle animals", s: "numbers 1–7 · animals" },
    { ic: "🌈", t: "Colors of the rainbow", s: "colors · matching" },
    { ic: "🔤", t: "First letters A–E", s: "phonics · simple words" },
    { ic: "🐻", t: "Bedtime story quiz", s: "feelings · calm pace" },
  ],
  recent: [
    { t: "Count the apples with Milo", sub: "parent · for Lily (4) · 5 q · 6 min", score: "5/5 ★" },
    { t: "Animal sounds adventure", sub: "parent · for Lily (4) · 6 q · 8 min", score: "4/6" },
    { t: "Colors of the sea", sub: "parent · for Lily (4) · 5 q · 7 min", score: "5/5 ★" },
  ],
  focus: {
    label: "Mastery this week",
    items: ["Counting 1–5 ✓", "Counting 6–7", "Colors red/blue/green ✓", "Letters A,B,C"],
  },
};

const QUEST: ForgeData = {
  world: "Builder",
  name: "Explorer",
  ages: "7–11",
  emoji: "🚀",
  forge: "QuestForge",
  color: "#4338ca",
  bg: "#e0e7ff",
  soft: "#eef2ff",
  grad: "linear-gradient(135deg, #4338ca 0%, #2e5bff 100%)",
  tutor: "Luna",
  tutorIc: "🌙",
  operator: "curiosity quests for ages 7–11",
  hero: 'Turn a "why?" into a 3-day quest with badges.',
  sub: "Ask a question you're curious about. Luna builds a quest with experiments, fun facts, and a badge at the end.",
  ctaPrimary: "Start a quest",
  ctaSecondary: "Quest library",
  initials: "A",
  avatarBg: "#4338ca",
  templates: [
    { ic: "🌋", t: "Why do volcanoes erupt?", s: "earth science · 3-day quest" },
    { ic: "🦖", t: "Could a T-Rex outrun a car?", s: "dinosaurs · physics · fun facts" },
    { ic: "🪐", t: "How big is the solar system?", s: "space · scale · numbers" },
    { ic: "🌊", t: "Why is the ocean salty?", s: "science · ecosystems" },
  ],
  recent: [
    {
      t: "Why is the sky blue? 🌌 quest",
      sub: "Captain Aiden · 8 q · ★ Sky Detective badge",
      score: "8/8",
    },
    { t: "Sharks that glow in the dark", sub: "Captain Aiden · 6 q · ★", score: "6/6" },
    { t: "How a volcano blows its top", sub: "Captain Aiden · 10 q · in progress", score: "4/10" },
  ],
  focus: {
    label: "Badges to earn",
    items: ["🌌 Sky Detective", "🦈 Ocean Diver", "🌋 Earth Explorer", "🪐 Space Voyager"],
  },
};

const PROJECT: ForgeData = {
  world: "Builder",
  name: "Builder",
  ages: "12–15",
  emoji: "🛠️",
  forge: "ProjectForge",
  color: "#7c3aed",
  bg: "#efe7ff",
  soft: "#f7f3ff",
  grad: "linear-gradient(135deg, #7c3aed 0%, #2e5bff 100%)",
  tutor: "Nova",
  tutorIc: "⚡",
  operator: "build & ship for ages 12–15",
  hero: "Turn an idea into a project you can ship.",
  sub: "Pick a project. Nova breaks it into 5–10 build steps with code reviews and a final demo question.",
  ctaPrimary: "Start a project",
  ctaSecondary: "Project gallery",
  initials: "S",
  avatarBg: "#7c3aed",
  templates: [
    { ic: "🐍", t: "Build a Python calculator", s: "Python · 6 build steps · 90 min" },
    { ic: "🌐", t: "Make a personal homepage", s: "HTML/CSS · 5 steps · 60 min" },
    { ic: "🤖", t: "Train a tiny image classifier", s: "ML · 8 steps · 2 hrs" },
    { ic: "🎮", t: "Code a Pong clone", s: "JS canvas · 7 steps · 90 min" },
  ],
  recent: [
    { t: "Pong v2 (smarter AI)", sub: "Sam · 7 steps · 4/7 done", score: "in progress" },
    { t: "To-do app with localStorage", sub: "Sam · 5 steps · ✓ shipped", score: "★" },
    { t: "Simple calculator", sub: "Sam · 6 steps · ✓ shipped", score: "★" },
  ],
  focus: {
    label: "Build streaks",
    items: [
      "✓ Day 4 of code streak",
      "Next milestone: 7 days",
      "Skill: JS canvas → intermediate",
      "Skill: Python → beginner",
    ],
  },
};

const EXAM: ForgeData = {
  world: "Scholar",
  name: "Scholar",
  ages: "16–18",
  emoji: "🎓",
  forge: "ExamForge",
  color: "#c2410c",
  bg: "#fff1d6",
  soft: "#fff8e9",
  grad: "linear-gradient(135deg, #c2410c 0%, #9a3412 100%)",
  tutor: "Mentor Max",
  tutorIc: "🎓",
  operator: "exam prep · the WikiTest flagship",
  hero: "Build a real exam from anything.",
  sub: "Wikipedia article, syllabus PDF, study notes — Max turns it into a cited, exam-style test you can drill. Misses become your review plan.",
  ctaPrimary: "Forge a new exam",
  ctaSecondary: "My exams",
  initials: "J",
  avatarBg: "#c2410c",
  templates: [
    { ic: "📐", t: "Trigonometry sprint (SAT)", s: "10 q · 12 min · cited" },
    { ic: "🧪", t: "AP Chemistry · acids & bases", s: "12 q · 18 min · cited" },
    { ic: "📖", t: "AP Lit · Romeo & Juliet", s: "8 q · 10 min · cited" },
    { ic: "🧠", t: "AP Psych · operant conditioning", s: "10 q · 14 min · cited" },
  ],
  recent: [
    { t: "Differential equation", sub: "from Wikipedia · 10 q · 70%", score: "70%" },
    { t: "World War II — causes", sub: "from notes (PDF) · 8 q · 88%", score: "88%" },
    {
      t: "Trigonometry — sin/cos basics",
      sub: "syllabus · 12 q · 55% · re-train suggested",
      score: "55%",
    },
  ],
  focus: {
    label: "Weak areas this week",
    items: [
      "Trigonometry · 55% (re-train)",
      "Differential equations · 70%",
      "Algebra (quadratic) · 78%",
      "Probability · 75%",
    ],
  },
};

const CERT: ForgeData = {
  world: "Professional",
  name: "Professional",
  ages: "18+",
  emoji: "💼",
  forge: "CertForge",
  color: "#0f766e",
  bg: "#d6f1f0",
  soft: "#e9f8f7",
  grad: "linear-gradient(135deg, #0f766e 0%, #2e5bff 100%)",
  tutor: "Prof. Turing",
  tutorIc: "💼",
  operator: "career certifications for AWS, Azure, GCP, IBM",
  hero: "Pass a cloud certification with cited drills.",
  sub: "Pick a cert. Prof. Turing generates exam-style questions from the official vendor docs, with citations back to the source.",
  ctaPrimary: "Pick a certification",
  ctaSecondary: "All certs",
  initials: "R",
  avatarBg: "#0f766e",
  templates: [
    { ic: "🟧", t: "AWS Solutions Architect (SAA-C03)", s: "Associate · 720 q · drill ready" },
    { ic: "🟦", t: "Azure Administrator (AZ-104)", s: "Associate · 640 q · drill ready" },
    { ic: "🟥", t: "GCP Pro Cloud Architect", s: "Professional · 360 q" },
    { ic: "🟪", t: "IBM watsonx Gen-AI Engineer", s: "Associate · 240 q · NEW" },
  ],
  recent: [
    { t: "SAA-C03 · Resilient Architectures drill", sub: "25 q · 19/25 · domain 2", score: "76%" },
    { t: "AZ-104 · Identity drill", sub: "20 q · 18/20", score: "90%" },
    { t: "DOP-C02 · CI/CD review", sub: "12 q · in progress", score: "—" },
  ],
  focus: {
    label: "Cert plan · this month",
    items: [
      "SAA-C03 · ETA 2 wks",
      "AZ-104 · keep warm (90%)",
      "DOP-C02 · onboarding",
      "Sources: 42 cited URLs",
    ],
  },
};

const SAFETY: ForgeData = {
  world: "Scholar",
  name: "Senior Learner",
  ages: "65+",
  emoji: "🌿",
  forge: "SafetyForge",
  color: "#0ea5a4",
  bg: "#d6f1f0",
  soft: "#e9f8f7",
  grad: "linear-gradient(135deg, #0ea5a4 0%, #16a34a 100%)",
  tutor: "Aiya",
  tutorIc: "🌿",
  operator: "calm, large text · safety on the modern internet",
  hero: "Stay safe online with kind, slow lessons.",
  sub: "Aiya teaches you how to spot scams, use video calls, and keep your account safe. Big text. Voice on. No tests, just check-ins.",
  ctaPrimary: "Start today's lesson",
  ctaSecondary: "My past lessons",
  initials: "M",
  avatarBg: "#0ea5a4",
  templates: [
    { ic: "📱", t: "Spot a scam text message", s: "10 min · calm pace" },
    { ic: "💳", t: "Pay safely online", s: "12 min · calm pace" },
    { ic: "📞", t: "Video call your family", s: "8 min · calm pace" },
    { ic: "🔒", t: "Make a strong password", s: "8 min · calm pace" },
  ],
  recent: [
    { t: "Scam text — pretend bank", sub: "yesterday · 5 min · ✓", score: "✓" },
    { t: "Video call my daughter", sub: "3 days ago · 6 min · ✓", score: "✓" },
    { t: "Change my email password", sub: "1 wk ago · 8 min · ✓", score: "✓" },
  ],
  focus: {
    label: "This week's goals",
    items: [
      "Recognize phishing emails",
      "Set up 2-step verification",
      "Save bookmarks",
      "Block unknown callers",
    ],
  },
};

// ─── Shared layout ────────────────────────────────────────────────

function ForgeHome({ d }: { d: ForgeData }) {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world={d.world} streak={1} xp={45} initials={d.initials} avatarBg={d.avatarBg} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName={d.tutor} teacherIcon={d.tutorIc} />
        <main>
          <WTBreadcrumb trail={[d.name, d.forge]} />

          {/* Hero */}
          <section
            style={{
              margin: "24px 32px 22px",
              padding: "32px 36px",
              borderRadius: 22,
              color: "#fff",
              background: d.grad,
              boxShadow: "var(--shadow-2)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <span style={{ fontSize: 30 }}>{d.emoji}</span>
              <div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em", fontWeight: 700 }}
                >
                  {d.forge.toUpperCase()} · {d.operator.toUpperCase()}
                </div>
                <h1
                  className="la-serif"
                  style={{
                    fontSize: 30,
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    margin: "4px 0 0",
                  }}
                >
                  {d.hero}
                </h1>
              </div>
            </div>
            <p
              style={{
                opacity: 0.9,
                fontSize: 14.5,
                lineHeight: 1.6,
                margin: "0 0 18px",
                maxWidth: 680,
              }}
            >
              {d.sub}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
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
                <Icon.spark color={d.color} /> {d.ctaPrimary}
              </button>
              <button
                className="la-btn"
                style={{
                  background: "rgba(255,255,255,.16)",
                  color: "#fff",
                  boxShadow: "none",
                  padding: "12px 18px",
                }}
              >
                {d.ctaSecondary}
              </button>
            </div>
          </section>

          {/* Templates + sidebar */}
          <section
            style={{
              padding: "0 32px 22px",
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: 22,
            }}
          >
            <div>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                  marginBottom: 10,
                }}
              >
                START FROM A TEMPLATE
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {d.templates.map((t) => (
                  <div key={t.t} className="la-card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 22 }}>{t.ic}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{t.t}</div>
                        <div
                          className="la-mono"
                          style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 2 }}
                        >
                          {t.s}
                        </div>
                      </div>
                      <button
                        className="la-btn ghost"
                        style={{ padding: "6px 10px", fontSize: 11 }}
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                  marginTop: 22,
                  marginBottom: 10,
                }}
              >
                RECENT IN {d.forge.toUpperCase()}
              </div>
              <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
                {d.recent.map((r, i) => (
                  <div
                    key={r.t}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 90px 80px",
                      gap: 12,
                      padding: "12px 14px",
                      borderTop: i ? "1px solid var(--line-soft)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{r.t}</div>
                      <div
                        className="la-mono"
                        style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}
                      >
                        {r.sub}
                      </div>
                    </div>
                    <span
                      className="la-mono"
                      style={{ fontSize: 12, fontWeight: 800, color: d.color }}
                    >
                      {r.score}
                    </span>
                    <button className="la-btn ghost" style={{ padding: "5px 10px", fontSize: 11 }}>
                      Open →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right rail */}
            <div>
              <div
                className="la-card"
                style={{ padding: 18, marginBottom: 14, background: d.soft, borderColor: d.color }}
              >
                <div
                  className="la-mono"
                  style={{ fontSize: 10, color: d.color, letterSpacing: ".08em", fontWeight: 800 }}
                >
                  {d.focus.label.toUpperCase()}
                </div>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                  {d.focus.items.map((i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px 10px",
                        borderRadius: 8,
                        background: "#fff",
                        fontSize: 12.5,
                        fontWeight: 600,
                      }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>

              <div className="la-card" style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 99,
                      background: d.bg,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 18,
                    }}
                  >
                    {d.tutorIc}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 800 }}>{d.tutor}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-mute)" }}>
                      Your {d.forge} guide
                    </div>
                  </div>
                </div>
                <p
                  style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: 0, lineHeight: 1.55 }}
                >
                  Tap a template above, or paste your own source on the right. I'll walk you through
                  and keep it cited.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── 6 world exports ──────────────────────────────────────────────

export function StoryForgeHome() {
  return <ForgeHome d={STORY} />;
}
export function QuestForgeHome() {
  return <ForgeHome d={QUEST} />;
}
export function ProjectForgeHome() {
  return <ForgeHome d={PROJECT} />;
}
export function ScholarExamForge() {
  return <ForgeHome d={EXAM} />;
}
export function CertForgeHome() {
  return <ForgeHome d={CERT} />;
}
export function SafetyForgeHome() {
  return <ForgeHome d={SAFETY} />;
}

// Silence unused-helper warning
void ([] as ReactNode[]);
