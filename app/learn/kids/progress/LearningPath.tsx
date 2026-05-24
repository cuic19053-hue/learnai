"use client";

/**
 * My Learning Path — the kids progression dashboard.
 *
 * Sections (top to bottom):
 *   1. Back arrow + "My Learning Path" title + subtitle
 *   2. Big player card (Milo + level + 4 stat tiles)
 *   3. "Continue Learning" — next topic in the current world + a
 *      secondary "Or continue: Colors" suggestion
 *   4. Legend chips ✓ Completed · ○ Next · 🔒 Locked
 *   5. 7 world progression cards (3-step previews per world)
 *   6. Skills Unlocked badge strip
 *
 * Data sources:
 *   - XpProvider state for stars, streak, sessions, per-subject taps
 *   - PROGRESSION catalog in lib/letterforge/subjects.ts
 *   - getLocalizedItem (small map below) for translating sequence
 *     entries into the picked language
 *
 * Back button: uses the router so it always returns to the previous
 * screen — lesson, practice, or home.
 */

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useXp } from "@/components/learn/kids/XpProvider";
import Milo from "@/components/learn/kids/Milo";
import {
  SUBJECT_LIST,
  SUBJECTS,
  progressionFor,
  type Subject,
  type SubjectSlug,
} from "@/lib/letterforge/subjects";
import { getPack, subjectLabels } from "@/lib/letterforge/i18n";
import { ACHIEVEMENTS } from "@/lib/letterforge/xp";

export default function LearningPath({ langCode }: { langCode: string }) {
  const router = useRouter();
  const { state, level } = useXp();
  const t = getPack(langCode).ui;

  // Cross-cut stats for the player card.
  const stars = state.xp;
  const lessons = state.sessionsCompleted;
  const topicsUnlocked = SUBJECT_LIST.reduce((sum, s) => {
    const taps = state.bySubject[s.slug] ?? 0;
    return sum + Math.min(Math.floor(taps / 3), SUBJECTS[s.slug].today.item.length + 8);
  }, 0);
  const streak = state.streak;

  // Pick "next continue" — the world the child has the most invested
  // in, with its next unfinished topic.
  const nextSubject =
    [...SUBJECT_LIST].sort(
      (a, b) => (state.bySubject[b.slug] ?? 0) - (state.bySubject[a.slug] ?? 0)
    )[0] ?? SUBJECT_LIST[0]!;
  const nextProg = progressionFor(nextSubject.slug, state.bySubject[nextSubject.slug] ?? 0);
  const nextEn = nextProg.next ?? nextProg.completed[nextProg.completed.length - 1] ?? "A";
  const nextLocalized = localizeTopic(langCode, nextEn);
  // Secondary suggestion = a different world the child has touched.
  const otherSubject =
    SUBJECT_LIST.find((s) => s.slug !== nextSubject.slug && (state.bySubject[s.slug] ?? 0) > 0) ??
    SUBJECT_LIST.find((s) => s.slug !== nextSubject.slug) ??
    SUBJECT_LIST[2]!;
  const otherProg = progressionFor(otherSubject.slug, state.bySubject[otherSubject.slug] ?? 0);
  const otherEn = otherProg.next ?? otherProg.completed[otherProg.completed.length - 1] ?? null;

  // Newest 5 unlocked achievements for the Skills row.
  const unlockedBadges = state.unlocked
    .slice(-5)
    .map((id) => ACHIEVEMENTS.find((a) => a.id === id))
    .filter((a): a is (typeof ACHIEVEMENTS)[number] => !!a);

  return (
    <main
      id="main"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #fce0ec 0%, #fff1d6 100%)",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      {/* ───── HEADER ───── */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 18,
          padding: "20px 24px 4px",
          maxWidth: 1240,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          style={{
            width: 44,
            height: 44,
            borderRadius: 99,
            background: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: 22,
            color: "#ec4899",
            boxShadow: "0 6px 16px rgba(120,60,40,.1)",
            flexShrink: 0,
          }}
        >
          ←
        </button>
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(28px, 5vw, 38px)",
              fontWeight: 800,
              color: "#9a3412",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            My Learning Path
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: "#9a3412", opacity: 0.7 }}>
            See what you learned and what&apos;s next.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "16px 24px 60px" }}>
        {/* ───── Player summary card ───── */}
        <section
          style={{
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 14px 36px rgba(120,60,40,.1)",
            padding: 22,
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 22,
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 70,
                background: "radial-gradient(circle at 40% 35%, #fde68a, #f59e0b)",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 12px 30px rgba(245,158,11,.35)",
              }}
              aria-hidden
            >
              <Milo size={110} />
            </div>
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: -10,
                right: -10,
                fontSize: 30,
                animation: "kFloat 2.5s ease-in-out infinite",
              }}
            >
              ✨
            </span>
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "clamp(24px, 4vw, 32px)",
                fontWeight: 800,
                color: "#9a3412",
                letterSpacing: "-0.02em",
              }}
            >
              Level {level.index + 1} · {level.level.name}
            </div>
            <div style={{ fontSize: 14, color: "#9a3412", opacity: 0.75, marginTop: 4 }}>
              {level.level.tagline}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
                marginTop: 16,
              }}
            >
              <StatTile
                emoji="⭐"
                value={String(stars)}
                label="Stars"
                tone="#f59e0b"
                bg="#fef3c7"
              />
              <StatTile
                emoji="📘"
                value={String(lessons)}
                label="Lessons"
                tone="#16a34a"
                bg="#d1fae5"
              />
              <StatTile
                emoji="🔓"
                value={String(topicsUnlocked)}
                label="Topics"
                tone="#7c3aed"
                bg="#efe7ff"
              />
              <StatTile
                emoji="🔥"
                value={String(streak)}
                label="Day Streak"
                tone="#ec4899"
                bg="#fce0ec"
              />
            </div>
          </div>
        </section>

        {/* ───── Continue Learning ───── */}
        <section
          style={{
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 14px 36px rgba(120,60,40,.08)",
            padding: 22,
            marginBottom: 22,
            border: `2px solid ${nextSubject.accent}33`,
          }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: nextSubject.accent,
              letterSpacing: ".08em",
              marginBottom: 12,
            }}
          >
            CONTINUE LEARNING
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 18px",
                borderRadius: 22,
                background: nextSubject.accentBg,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: nextSubject.accent,
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontSize: nextEn.length <= 2 ? 32 : 24,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
                aria-hidden
              >
                {nextEn.length <= 2 ? nextEn : nextSubject.emoji}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, color: "#9a3412", opacity: 0.7, fontWeight: 700 }}>
                  Next up:
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: "#9a3412",
                    lineHeight: 1.2,
                  }}
                >
                  {t.continueLearn(nextLocalized)}
                </div>
              </div>
            </div>
            <Link
              href={`/learn/kids/${nextSubject.slug}/teach?lang=${langCode}`}
              style={{
                padding: "16px 26px",
                borderRadius: 99,
                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "#fff",
                fontSize: 17,
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 12px 24px rgba(34,197,94,.45)",
              }}
            >
              ▶ Continue
            </Link>
            <div
              style={{
                textAlign: "end",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: nextSubject.accent,
                  fontWeight: 800,
                  letterSpacing: ".08em",
                }}
              >
                OR CONTINUE
              </span>
              <span style={{ fontSize: 13, color: "#9a3412", fontWeight: 700 }}>
                {subjectLabels(langCode, otherSubject.slug).short}
                {otherEn ? `: ${localizeTopic(langCode, otherEn)}` : ""}
              </span>
              <Link
                href={`/learn/kids/${otherSubject.slug}?lang=${langCode}`}
                style={{
                  padding: "8px 16px",
                  borderRadius: 99,
                  background: "#fff",
                  border: `2px solid ${otherSubject.accent}`,
                  color: otherSubject.accent,
                  fontSize: 12,
                  fontWeight: 800,
                  textDecoration: "none",
                }}
              >
                Go to {subjectLabels(langCode, otherSubject.slug).short}
              </Link>
            </div>
          </div>
        </section>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 18,
            justifyContent: "center",
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <LegendChip color="#22c55e" emoji="✓" label="Completed" />
          <LegendChip color="#2e5bff" emoji="○" label="Next" />
          <LegendChip color="#94a3b8" emoji="🔒" label="Locked" />
        </div>

        {/* ───── World progression tracks ───── */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 14,
            marginBottom: 22,
          }}
        >
          {SUBJECT_LIST.map((s) => (
            <WorldTrack key={s.slug} subject={s} langCode={langCode} state={state} />
          ))}
        </section>

        {/* ───── Skills Unlocked ───── */}
        <section
          style={{
            background: "#fff",
            borderRadius: 28,
            boxShadow: "0 14px 36px rgba(120,60,40,.08)",
            padding: 22,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: 18,
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#ec4899",
                  letterSpacing: "-0.01em",
                }}
              >
                Skills Unlocked
              </div>
              <div style={{ fontSize: 12, color: "#9a3412", opacity: 0.7, marginTop: 4 }}>
                Keep it up! You&apos;re unlocking amazing skills.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                gap: 10,
                overflowX: "auto",
                paddingBottom: 4,
                scrollbarWidth: "none",
              }}
            >
              {unlockedBadges.length === 0 ? (
                <div style={{ fontSize: 13, color: "#9a3412", opacity: 0.6 }}>
                  Your first skill is just a few taps away!
                </div>
              ) : (
                unlockedBadges.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      borderRadius: 14,
                      background: "#fef3c7",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: 22 }} aria-hidden>
                      {a.emoji}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "#9a3412" }}>
                        {a.name}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link
              href="#"
              style={{
                padding: "10px 18px",
                borderRadius: 99,
                background: "#fff",
                border: "2px solid #ec4899",
                color: "#ec4899",
                fontSize: 13,
                fontWeight: 800,
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              See all →
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes kFloat {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-6px) rotate(8deg); }
        }
      `}</style>
    </main>
  );
}

// ── World track card ─────────────────────────────────────────────

function WorldTrack({
  subject,
  langCode,
  state,
}: {
  subject: Subject;
  langCode: string;
  state: ReturnType<typeof useXp>["state"];
}) {
  const labels = subjectLabels(langCode, subject.slug);
  const taps = state.bySubject[subject.slug] ?? 0;
  const prog = progressionFor(subject.slug as SubjectSlug, taps);
  // Show the 3 items closest to the child's frontier: last completed,
  // next, then locked.
  const window: Array<{ item: string; state: "done" | "next" | "locked" }> = [];
  const completed = prog.completed;
  const next = prog.next;
  const locked = prog.locked;
  // Most recent completed (or first item if none completed yet).
  if (completed.length > 0) window.push({ item: completed[completed.length - 1]!, state: "done" });
  else if (next) window.push({ item: next, state: "next" });
  // Next item (if not already pushed).
  if (next && window.every((w) => w.item !== next)) window.push({ item: next, state: "next" });
  // First locked.
  if (locked[0] && window.length < 3) window.push({ item: locked[0], state: "locked" });
  // Pad to 3 with locked.
  let lockedIdx = 1;
  while (window.length < 3 && locked[lockedIdx]) {
    window.push({ item: locked[lockedIdx]!, state: "locked" });
    lockedIdx++;
  }

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 24,
        boxShadow: "0 10px 24px rgba(120,60,40,.08)",
        padding: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: subject.accentBg,
            color: subject.accent,
            display: "grid",
            placeItems: "center",
            fontSize: 24,
          }}
          aria-hidden
        >
          {subject.emoji}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{ fontSize: 16, fontWeight: 800, color: "#9a3412", letterSpacing: "-0.01em" }}
          >
            {labels.short}
          </div>
          <div style={{ fontSize: 11, color: "#9a3412", opacity: 0.65, marginTop: 2 }}>
            {prog.doneCount} / {prog.sequence.length} completed
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {window.map((w, i) => (
          <ProgressNode
            key={`${subject.slug}-${i}`}
            item={w.item}
            state={w.state}
            accent={subject.accent}
            accentBg={subject.accentBg}
            isLastFilled={
              i + 1 < window.length && (window[i + 1]!.state === "next" || w.state === "done")
            }
          />
        ))}
      </div>
    </article>
  );
}

function ProgressNode({
  item,
  state,
  accent,
  accentBg,
  isLastFilled,
}: {
  item: string;
  state: "done" | "next" | "locked";
  accent: string;
  accentBg: string;
  isLastFilled: boolean;
}) {
  const bg = state === "done" ? "#22c55e" : state === "next" ? accentBg : "#f1f5f9";
  const fg = state === "done" ? "#fff" : state === "next" ? accent : "#94a3b8";
  const border =
    state === "next" ? `3px solid ${accent}` : state === "locked" ? "2px solid #e2e8f0" : "none";
  const isShort = item.length <= 2;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: 1,
        position: "relative",
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 99,
          background: bg,
          color: fg,
          border,
          display: "grid",
          placeItems: "center",
          fontSize: isShort ? 22 : 11,
          fontWeight: 800,
          boxShadow: state === "next" ? `0 0 0 6px ${accent}22` : "0 4px 10px rgba(0,0,0,.05)",
          animation: state === "next" ? "kPulse 2s ease-in-out infinite" : undefined,
          padding: isShort ? 0 : "0 6px",
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {state === "done" ? "✓" : state === "locked" ? "🔒" : isShort ? item : item.slice(0, 5)}
      </div>
      {state === "next" ? (
        <span
          style={{
            marginTop: 6,
            fontSize: 10,
            fontWeight: 800,
            color: "#fff",
            background: "#2e5bff",
            padding: "2px 8px",
            borderRadius: 99,
            letterSpacing: ".04em",
          }}
        >
          NEXT
        </span>
      ) : null}
      {!isShort && state !== "done" ? (
        <span
          style={{
            marginTop: state === "next" ? 4 : 6,
            fontSize: 10,
            color: "#9a3412",
            opacity: 0.7,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 70,
            lineHeight: 1.1,
          }}
        >
          {item}
        </span>
      ) : null}
      {isLastFilled ? null : null}
      <style>{`
        @keyframes kPulse {
          0%, 100% { box-shadow: 0 0 0 6px ${accent}22; }
          50%      { box-shadow: 0 0 0 10px ${accent}11; }
        }
      `}</style>
    </div>
  );
}

// ── Tiny shared bits ─────────────────────────────────────────────

function StatTile({
  emoji,
  value,
  label,
  tone,
  bg,
}: {
  emoji: string;
  value: string;
  label: string;
  tone: string;
  bg: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderRadius: 16,
        background: bg,
      }}
    >
      <span style={{ fontSize: 24 }} aria-hidden>
        {emoji}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: tone, lineHeight: 1 }}>{value}</div>
        <div
          style={{
            fontSize: 11,
            color: "#9a3412",
            opacity: 0.7,
            fontWeight: 700,
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

function LegendChip({ color, emoji, label }: { color: string; emoji: string; label: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 14px",
        borderRadius: 99,
        background: "#fff",
        boxShadow: "0 4px 10px rgba(120,60,40,.08)",
        fontSize: 12,
        fontWeight: 800,
        color,
      }}
    >
      <span aria-hidden>{emoji}</span>
      <span style={{ color: "#9a3412" }}>{label}</span>
    </span>
  );
}

// Small translation table for topic names shown on the progress page.
// We keep this here (and not in i18n.ts) because the catalog is tiny
// and progress-specific; the bigger i18n shop covers UI strings.
function localizeTopic(langCode: string, en: string): string {
  if (en.length <= 2) return en;
  const map: Record<string, Record<string, string>> = {
    es: {
      Blue: "Azul",
      Yellow: "Amarillo",
      Green: "Verde",
      Red: "Rojo",
      Square: "Cuadrado",
      Triangle: "Triángulo",
      Circle: "Círculo",
      Star: "Estrella",
      Heart: "Corazón",
      Lion: "León",
      Elephant: "Elefante",
      Cat: "Gato",
      Dog: "Perro",
      Bird: "Pájaro",
      Bear: "Oso",
      Happy: "Feliz",
      Sad: "Triste",
      Angry: "Enojado",
      Surprised: "Sorprendido",
      Calm: "Tranquilo",
      Excited: "Emocionado",
      "Brave Bunny": "Conejo valiente",
      "Curious Fox": "Zorro curioso",
      "Sleepy Bear": "Oso dormilón",
    },
    it: {
      Blue: "Blu",
      Yellow: "Giallo",
      Green: "Verde",
      Red: "Rosso",
      Square: "Quadrato",
      Triangle: "Triangolo",
      Circle: "Cerchio",
      Lion: "Leone",
      Elephant: "Elefante",
      Cat: "Gatto",
      Dog: "Cane",
      Happy: "Felice",
      Sad: "Triste",
      "Brave Bunny": "Coniglio coraggioso",
    },
    fr: {
      Blue: "Bleu",
      Yellow: "Jaune",
      Green: "Vert",
      Red: "Rouge",
      Circle: "Cercle",
      Lion: "Lion",
      Happy: "Content",
      Sad: "Triste",
      "Brave Bunny": "Lapin courageux",
    },
    pt: {
      Blue: "Azul",
      Yellow: "Amarelo",
      Green: "Verde",
      Red: "Vermelho",
      Circle: "Círculo",
      Lion: "Leão",
      Happy: "Feliz",
      Sad: "Triste",
      "Brave Bunny": "Coelho corajoso",
    },
    de: {
      Blue: "Blau",
      Yellow: "Gelb",
      Green: "Grün",
      Red: "Rot",
      Circle: "Kreis",
      Lion: "Löwe",
      Cat: "Katze",
      Dog: "Hund",
      Happy: "Glücklich",
      Sad: "Traurig",
    },
  };
  return map[(langCode || "en").toLowerCase()]?.[en] ?? en;
}
