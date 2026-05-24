"use client";

/**
 * Little Learner home — dynamic activity launcher.
 *
 * Layout follows the "choose below → preview above → start" rule:
 *   1. Bottom: 7 area tiles act as a SELECTOR (no navigation).
 *   2. Top: a single big "today's lesson" card live-updates with the
 *      selected world's letter / number / colour / shape / animal /
 *      feeling / story plus the 3 mini-games.
 *   3. One main CTA whose label changes with the selection
 *      ("▶ Start Letters Lesson" / "▶ Start Numbers Lesson" / …).
 *
 * No scores, no settings, no second Start hidden somewhere. The child
 * picks an area, sees what they'll play, taps Start.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import KidsHeader from "@/components/learn/kids/KidsHeader";
import Milo from "@/components/learn/kids/Milo";
import { speak } from "@/components/learn/kids/audio";
import {
  SUBJECT_LIST,
  SUBJECTS,
  TODAYS_PATH,
  type Subject,
  type SubjectSlug,
} from "@/lib/letterforge/subjects";
import { getPack, startLabelFor, subjectLabels } from "@/lib/letterforge/i18n";
import { findLanguage } from "@/lib/letterforge/languages";

export default function KidsHome({ langCode }: { langCode: string }) {
  const t = getPack(langCode).ui;
  const lang = findLanguage(langCode);
  const [selectedSlug, setSelectedSlug] = useState<SubjectSlug>(TODAYS_PATH);
  const selected: Subject = SUBJECTS[selectedSlug];
  const labels = useMemo(() => subjectLabels(langCode, selectedSlug), [langCode, selectedSlug]);

  // Letters rotates with the picked language; other subjects use the
  // i18n override or the catalog default.
  const todayItem =
    selectedSlug === "letters" ? lang.todayLetter : (labels.today?.item ?? selected.today.item);
  const todayDescription =
    selectedSlug === "letters"
      ? `${lang.todayLetter} · ${lang.todayWord}`
      : (labels.today?.description ?? selected.today.description);
  const todayWordEmoji = labels.today?.wordEmoji ?? selected.today.wordEmoji;

  // Pick what goes inside the 88×88 icon tile. Long words (Circle,
  // Happy, Brave Bunny) used to overflow; now Letters/Numbers show
  // the short character, and everything else shows the subject's
  // emoji so the tile never overlaps the title.
  const isShortItem = todayItem.length <= 2;
  const tileGlyph = isShortItem ? todayItem : selected.emoji;
  const tileFontSize = isShortItem ? 52 : 44;

  // Soft confirmation when the world changes: Milo says the
  // localized subject name so the child hears what's queued.
  const [hasInteracted, setHasInteracted] = useState(false);
  useEffect(() => {
    if (!hasInteracted) return;
    void speak(labels.name, lang.code);
  }, [selectedSlug, hasInteracted, labels.name, lang.code]);

  function pick(slug: SubjectSlug) {
    setHasInteracted(true);
    setSelectedSlug(slug);
  }

  return (
    <main
      id="main"
      style={{
        minHeight: "100vh",
        background: selected.gradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
        transition: "background .35s ease",
      }}
    >
      <KidsHeader langCode={langCode} title={t.appName} />

      {/* Greeting */}
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "6px 18px 0",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        <Milo size={96} />

        <h1
          style={{
            margin: "4px 0 0",
            fontSize: "clamp(22px, 4.5vw, 28px)",
            fontWeight: 800,
            color: "#9a3412",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {t.helloReady}
        </h1>
        <p style={{ margin: "6px 0 0", color: "#9a3412", opacity: 0.7, fontSize: 13 }}>
          {t.helloSubtitle}
        </p>
      </section>

      {/* TOP — dynamic today's-lesson preview */}
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "16px 18px 8px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.65,
            letterSpacing: ".08em",
            margin: "0 0 8px",
            textAlign: "center",
          }}
        >
          {t.todaysLesson}
        </div>

        <div
          key={selectedSlug}
          style={{
            padding: 22,
            borderRadius: 28,
            background: "#fff",
            boxShadow: `0 20px 50px ${selected.accent}22`,
            border: `2px solid ${selected.accent}`,
            display: "grid",
            gap: 14,
            animation: "kFloatIn .35s ease-out",
          }}
        >
          {/* Item + headline */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 22,
                background: selected.accentBg,
                color: selected.accent,
                display: "grid",
                placeItems: "center",
                fontSize: tileFontSize,
                fontWeight: 800,
                flexShrink: 0,
                overflow: "hidden",
              }}
              aria-hidden
            >
              {tileGlyph}
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: "clamp(18px, 4vw, 22px)",
                  fontWeight: 800,
                  color: "#0f1430",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.15,
                }}
              >
                {todayDescription} {todayWordEmoji}
              </div>
              <div style={{ fontSize: 12, color: "#9a3412", opacity: 0.75, marginTop: 4 }}>
                {labels.name} · 3 mini-games
              </div>
            </div>
          </div>

          {/* Today you will play: */}
          <div>
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: "#9a3412",
                opacity: 0.6,
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              {t.todayWillPlay}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: 8,
              }}
            >
              {selected.games.map((g) => (
                <div
                  key={g.id}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: selected.accentBg,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    minWidth: 0,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden>
                    {g.emoji}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "#9a3412",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {g.title.replace(selected.today.item, todayItem)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Single dynamic CTA — opens the activity intro page. */}
          <Link
            href={`/learn/kids/${selected.slug}?lang=${langCode}`}
            style={{
              padding: "16px",
              borderRadius: 16,
              background: `linear-gradient(135deg, #22c55e, #16a34a)`,
              color: "#fff",
              fontSize: 18,
              fontWeight: 800,
              textDecoration: "none",
              textAlign: "center",
              boxShadow: "0 10px 22px rgba(34,197,94,.45)",
            }}
          >
            {startLabelFor(langCode, selectedSlug)}
          </Link>
        </div>
      </section>

      {/* BOTTOM — world selector tiles */}
      <section
        style={{
          maxWidth: 720,
          margin: "0 auto",
          padding: "22px 18px 40px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.65,
            letterSpacing: ".08em",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {t.pickWorld}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
            gap: 12,
          }}
        >
          {SUBJECT_LIST.map((s) => {
            const sl = subjectLabels(langCode, s.slug);
            const item = s.slug === "letters" ? lang.todayLetter : (sl.today?.item ?? s.today.item);
            const isSelected = s.slug === selectedSlug;
            return (
              <button
                type="button"
                key={s.slug}
                onClick={() => pick(s.slug)}
                aria-pressed={isSelected}
                style={{
                  padding: "16px 12px",
                  borderRadius: 22,
                  background: "#fff",
                  textAlign: "center",
                  fontFamily: "inherit",
                  cursor: "pointer",
                  boxShadow: isSelected
                    ? `0 14px 30px ${s.accent}40`
                    : "0 8px 20px rgba(0,0,0,.06)",
                  border: isSelected ? `3px solid ${s.accent}` : "3px solid transparent",
                  transform: isSelected ? "translateY(-3px) scale(1.03)" : "none",
                  transition: "transform .2s, box-shadow .2s, border-color .2s",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  position: "relative",
                }}
              >
                {isSelected ? (
                  <span
                    style={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "3px 10px",
                      borderRadius: 99,
                      background: s.accent,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: ".06em",
                    }}
                  >
                    TODAY
                  </span>
                ) : null}
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 16,
                    background: s.accentBg,
                    color: s.accent,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 28,
                  }}
                  aria-hidden
                >
                  {s.emoji}
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#9a3412" }}>{sl.short}</div>
                <div
                  className="la-mono"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: s.accent,
                    letterSpacing: ".02em",
                  }}
                >
                  {item}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <style>{`
        @keyframes kFloatIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
