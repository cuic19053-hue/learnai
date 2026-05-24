"use client";

/**
 * Activity intro screen — one subject, one decision.
 *
 * The prior version listed the 3 mini-games here, which competed
 * visually with the Start button. Per the spec, this page now does
 * exactly two things: teach the day's item, then start practice.
 *
 *   1. Today's item (big, centered)
 *   2. Example word + emoji
 *   3. "Hear A" button (spoken via TTS)
 *   4. ONE main CTA: "▶ Start Practice"
 *
 * The 3 mini-game preview lives on the home page; the guided sequence
 * itself plays out on /learn/kids/[subject]/play.
 */

import Link from "next/link";
import KidsHeader from "@/components/learn/kids/KidsHeader";
import { speak } from "@/components/learn/kids/audio";
import { findLanguage } from "@/lib/letterforge/languages";
import type { Subject } from "@/lib/letterforge/subjects";
import { getPack, subjectLabels } from "@/lib/letterforge/i18n";

export default function SubjectHome({ subject, langCode }: { subject: Subject; langCode: string }) {
  const lang = findLanguage(langCode);
  const t = getPack(langCode).ui;
  const labels = subjectLabels(langCode, subject.slug);
  const todayItem =
    subject.slug === "letters" ? lang.todayLetter : (labels.today?.item ?? subject.today.item);
  const todayWord =
    subject.slug === "letters" ? lang.todayWord : (labels.today?.word ?? subject.today.word);
  const todayEmoji =
    subject.slug === "letters"
      ? lang.todayEmoji
      : (labels.today?.wordEmoji ?? subject.today.wordEmoji);
  const todayDescription = (labels.today?.description ?? subject.today.description).replace(
    subject.today.item,
    todayItem
  );

  function sayItem() {
    void speak(todayItem, lang.code);
  }

  return (
    <main
      id="main"
      dir={lang.direction}
      style={{
        minHeight: "100vh",
        background: subject.gradient,
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <KidsHeader
        langCode={langCode}
        title={labels.name}
        backHref={`/learn/kids?lang=${langCode}`}
      />

      <section
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "20px 18px 8px",
          display: "grid",
          justifyItems: "center",
          gap: 18,
          textAlign: "center",
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
          }}
        >
          {t.todaysItem(labels.short)}
        </div>

        {/* Big centered item card */}
        <div
          style={{
            width: "min(220px, 60vw)",
            aspectRatio: "1 / 1",
            borderRadius: 32,
            background: "#fff",
            boxShadow: "0 18px 40px rgba(0,0,0,.1)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <span
            style={{
              fontSize: subject.slug === "stories" ? 36 : "clamp(80px, 20vw, 130px)",
              fontWeight: 800,
              color: subject.accent,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              padding: "0 12px",
              textAlign: "center",
            }}
          >
            {todayItem}
          </span>
        </div>

        <p
          style={{
            margin: 0,
            fontSize: "clamp(20px, 4.5vw, 26px)",
            fontWeight: 800,
            color: "#9a3412",
            lineHeight: 1.2,
          }}
        >
          {todayDescription} <span aria-hidden>{todayEmoji}</span>
        </p>
      </section>

      {/* Two clear actions — Hear (passive), Start Practice (primary) */}
      <section
        style={{
          maxWidth: 540,
          margin: "0 auto",
          padding: "18px 18px 40px",
          display: "grid",
          justifyItems: "center",
          gap: 14,
          position: "relative",
          zIndex: 1,
        }}
      >
        <button
          type="button"
          onClick={sayItem}
          aria-label={`${t.tapToHear} ${todayWord}`}
          style={{
            padding: "12px 22px",
            borderRadius: 99,
            background: "#fff",
            border: `2px solid ${subject.accent}`,
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: 16,
            fontWeight: 800,
            color: subject.accent,
            boxShadow: `0 6px 16px ${subject.accent}20`,
          }}
        >
          {t.hearItem(todayItem)}
        </button>

        <Link
          href={`/learn/kids/${subject.slug}/teach?lang=${langCode}`}
          style={{
            padding: "18px 44px",
            borderRadius: 99,
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            color: "#fff",
            fontSize: 20,
            fontWeight: 800,
            textDecoration: "none",
            boxShadow: "0 14px 30px rgba(34,197,94,.45)",
          }}
        >
          {t.learnWithMilo}
        </Link>

        <p
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#9a3412",
            opacity: 0.65,
            textAlign: "center",
          }}
        >
          {t.parentHold}
        </p>
      </section>
    </main>
  );
}
