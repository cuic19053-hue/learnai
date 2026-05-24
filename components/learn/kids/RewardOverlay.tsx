"use client";

/**
 * Full-screen reward animation.
 *
 * Watches the XP provider's pending queue and shows ONE event at a
 * time as a big, audible celebration. Three event kinds:
 *
 *   1. levelup     — biggest. Confetti rain + Milo + level name +
 *                    fanfare chime + spoken praise.
 *   2. achievement — badge reveal with the achievement name + chime.
 *   3. bingo       — surprise variable-reward burst (3-4 seconds).
 *
 * Auto-dismisses after a short timer. The child can also tap to
 * dismiss early. The overlay is non-blocking for parents — the 🔒
 * still works because the overlay sits below the header z-index.
 */

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useXp } from "./XpProvider";
import { speak, useKidsAudio } from "./audio";

const AUTO_DISMISS_MS = 3200;

export default function RewardOverlay({ langCode }: { langCode?: string }) {
  // The layout doesn't have access to the language code (it sits above
  // the page server components). Read it from the URL search params at
  // the client; fall back to English if absent.
  const sp = useSearchParams();
  const resolvedLang = langCode ?? sp?.get("lang") ?? "en";
  const { pendingRewards, consumeReward } = useXp();
  const playChime = useKidsAudio();
  const active = pendingRewards[0] ?? null;
  // Mounted = we have something visible; hide otherwise.
  const [visible, setVisible] = useState(false);

  // Confetti pieces are stable per active reward.
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        left: 6 + (i / 18) * 88,
        delay: (i % 6) * 0.07,
        duration: 2.4 + (i % 4) * 0.3,
        emoji: ["🎉", "⭐", "✨", "🌈", "🌟", "💫"][i % 6]!,
        size: 18 + (i % 3) * 8,
      })),
    [active]
  );

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // Audio + voice tuned per kind.
    if (active.kind === "levelup") {
      playChime("complete");
      void speak(`Level up! ${active.levelName}.`, resolvedLang);
    } else if (active.kind === "achievement") {
      playChime("star3");
      void speak(active.achievement.blurb, resolvedLang);
    } else {
      playChime("correct");
      void speak("Bingo!", resolvedLang);
    }
    const dur = active.kind === "bingo" ? 2200 : AUTO_DISMISS_MS;
    const timer = setTimeout(() => {
      consumeReward();
    }, dur);
    return () => clearTimeout(timer);
  }, [active, consumeReward, langCode, playChime]);

  if (!active || !visible) return null;

  const isBingo = active.kind === "bingo";
  const isLevel = active.kind === "levelup";
  const isAch = active.kind === "achievement";

  return (
    <div
      role="dialog"
      aria-live="assertive"
      aria-label="Reward"
      onClick={consumeReward}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(255,241,214,.85)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        cursor: "pointer",
        animation: "kFadeIn .25s ease-out",
      }}
    >
      {/* Confetti rain (skipped on bingo to keep it short). */}
      {!isBingo
        ? pieces.map((p, i) => (
            <span
              key={i}
              aria-hidden
              style={{
                position: "absolute",
                top: -40,
                left: `${p.left}%`,
                fontSize: p.size,
                animation: `kConfetti ${p.duration}s linear forwards`,
                animationDelay: `${p.delay}s`,
              }}
            >
              {p.emoji}
            </span>
          ))
        : null}

      {/* Center card */}
      <div
        style={{
          padding: "28px 36px",
          borderRadius: 32,
          background: "#fff",
          boxShadow: "0 30px 80px rgba(245,158,11,.4)",
          textAlign: "center",
          maxWidth: 420,
          width: "min(420px, 88vw)",
          position: "relative",
          animation: "kPopBig .55s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        {/* Big emoji */}
        <div
          aria-hidden
          style={{
            fontSize: isLevel ? 96 : 84,
            lineHeight: 1,
            marginBottom: 8,
            animation: "kSpin 1.2s ease-out",
          }}
        >
          {isLevel ? active.emoji : isAch ? active.achievement.emoji : "🎉"}
        </div>

        {/* Ribbon label */}
        <div
          className="la-mono"
          style={{
            display: "inline-block",
            padding: "4px 14px",
            borderRadius: 99,
            background: isLevel ? "#f59e0b" : isAch ? "#ec4899" : "#22c55e",
            color: "#fff",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".1em",
            marginBottom: 10,
          }}
        >
          {isLevel ? "LEVEL UP!" : isAch ? "ACHIEVEMENT" : "BINGO BONUS"}
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "clamp(22px, 6vw, 30px)",
            fontWeight: 800,
            color: "#9a3412",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {isLevel ? active.levelName : isAch ? active.achievement.name : `+${active.xp} XP`}
        </div>

        {/* Subline */}
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, color: "#9a3412", opacity: 0.8 }}>
          {isLevel ? active.tagline : isAch ? active.achievement.blurb : "Surprise! Keep going!"}
        </p>

        <div
          style={{
            marginTop: 16,
            fontSize: 11,
            color: "#9a3412",
            opacity: 0.55,
            fontWeight: 700,
          }}
        >
          Tap anywhere to continue
        </div>
      </div>

      <style>{`
        @keyframes kFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes kPopBig {
          0%   { transform: scale(0.5) rotate(-6deg); opacity: 0; }
          60%  { transform: scale(1.1)  rotate(2deg);  opacity: 1; }
          100% { transform: scale(1)    rotate(0);     opacity: 1; }
        }
        @keyframes kSpin {
          0%   { transform: rotate(-20deg) scale(0.6); }
          50%  { transform: rotate(20deg)  scale(1.1); }
          100% { transform: rotate(0)      scale(1); }
        }
        @keyframes kConfetti {
          0%   { transform: translateY(0)    rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          100% { transform: translateY(95vh) rotate(720deg); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
