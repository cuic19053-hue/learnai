import Link from "next/link";
import { LOOP } from "@/lib/learn/loop";
import type { Journey } from "@/lib/learn/journeys";

type MissionCardProps = {
  journey: Journey;
  /** "TODAY'S MISSION" / "TODAY'S LESSON" / etc. */
  kicker?: string;
  title: string;
  /** Lead paragraph under the title; supports plain text only. */
  description: string;
  /** Completed-loop-steps count (0-6). The "current" step is `currentStep` (zero-indexed). */
  currentStep: number;
  /** Total steps in the loop (default 6). */
  totalSteps?: number;
  /**
   * CTA label override. When omitted, the component picks a state-aware
   * default: "Start session" when currentStep === 0, "Continue with X"
   * (where X is the next step's label) otherwise.
   */
  ctaLabel?: string;
  /** When set, the CTA renders as a link to this href (otherwise a static button). */
  ctaHref?: string;
  /** Tertiary text shown next to the CTA, e.g. "~12 min · +60 XP". */
  meta?: string;
};

/**
 * The "today's mission" hero card — gradient slab tinted by the journey
 * accent, with a conic-gradient progress ring and the Loop steps inline.
 *
 * UX notes:
 *   - The kicker reads "X of N completed" so the count isn't mistaken
 *     for "you are on step X" (X is past tense, the active step is X+1).
 *   - A subline names the next step ("Next: Practice") so the action
 *     state and the progress state aren't conflated.
 *   - Locked steps are visually demoted (opacity, no border, grayscale
 *     icon, small "lock" indicator) so they don't look interactive.
 *   - The active step is emphasised with a thicker border + brighter
 *     background and a "Current step" label.
 *   - Icons are wrapped in a uniform circular badge so the mixed-style
 *     emoji set reads as one visual family.
 */
export default function MissionCard({
  journey,
  kicker = "TODAY'S MISSION",
  title,
  description,
  currentStep,
  totalSteps = LOOP.length,
  ctaLabel,
  ctaHref,
  meta,
}: MissionCardProps) {
  const safeStep = Math.max(0, Math.min(totalSteps, currentStep));
  const pct = Math.round((safeStep / totalSteps) * 100);
  const nextStep = LOOP[safeStep]; // undefined when all steps done
  const resolvedCta =
    ctaLabel ??
    (safeStep === 0
      ? "开始学习"
      : nextStep
        ? `继续：${nextStep.label}`
        : "复习本课");

  const ctaClasses =
    "inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold shadow-sm transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white";
  const ctaStyle = { color: journey.color } as const;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-7 text-white md:p-8"
      style={{
        background: `linear-gradient(135deg, ${journey.color} 0%, #2a1958 110%)`,
      }}
    >
      <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] opacity-80">
            {kicker} · 已完成 {safeStep} / {totalSteps} 步
          </div>
          <h2 className="mt-3 text-[28px] font-extrabold leading-tight tracking-[-0.01em]">
            {title}
          </h2>
          {nextStep ? (
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: "rgba(255,255,255,.18)" }}
            >
              <span aria-hidden>→</span>
              <span>
                下一环节：步骤 {safeStep + 1} · {nextStep.label}
              </span>
            </div>
          ) : (
            <div
              className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold"
              style={{ background: "rgba(255,255,255,.18)" }}
            >
              <span aria-hidden>✓</span>
              <span>全环节学习完成</span>
            </div>
          )}
          <p className="mt-3 max-w-[460px] text-[14px] leading-relaxed opacity-85">{description}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {ctaHref ? (
              <Link href={ctaHref} className={ctaClasses} style={ctaStyle}>
                ▶ {resolvedCta}
              </Link>
            ) : (
              <button type="button" className={ctaClasses} style={ctaStyle}>
                ▶ {resolvedCta}
              </button>
            )}
            {meta ? <span className="text-[13px] opacity-85">{meta}</span> : null}
          </div>
        </div>

        {/* Progress ring — moved into its own column with explicit
            labels so it doesn't read as overlapping the title. */}
        <div className="flex flex-col items-center md:items-end" aria-hidden>
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] opacity-75">
            教学环进度
          </div>
          <div
            className="grid place-items-center rounded-full"
            style={{
              width: 150,
              height: 150,
              background: `conic-gradient(#fff 0% ${pct}%, rgba(255,255,255,.18) ${pct}% 100%)`,
            }}
          >
            <div
              className="grid h-[126px] w-[126px] place-items-center rounded-full text-center"
              style={{ background: "rgba(20,15,40,0.55)" }}
            >
              <div>
                <div className="text-[30px] font-extrabold leading-none">
                  {safeStep}
                  <span className="text-[18px] font-bold opacity-70">/{totalSteps}</span>
                </div>
                <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider opacity-80">
                  {pct}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loop chips inline. Three visual states:
            done     — translucent fill, check icon, normal opacity
            current  — bright border + brighter fill + raised, "Current step" label
            locked   — heavy opacity drop, no border, grayscale icon, tiny 🔒 */}
      <div
        className="relative z-10 mt-7 grid grid-cols-3 gap-2 md:grid-cols-6"
        role="list"
        aria-label={`Loop progress: ${safeStep} of ${totalSteps} steps complete.`}
      >
        {LOOP.map((l, i) => {
          const done = i < safeStep;
          const current = i === safeStep;
          const locked = i > safeStep;
          return (
            <div
              key={l.n}
              role="listitem"
              aria-current={current ? "step" : undefined}
              className="rounded-xl p-3 transition-transform"
              style={{
                background: current
                  ? "rgba(255,255,255,0.22)"
                  : done
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(255,255,255,0.04)",
                border: current
                  ? "2px solid #fff"
                  : done
                    ? "1px solid rgba(255,255,255,0.18)"
                    : "1px dashed rgba(255,255,255,0.10)",
                opacity: locked ? 0.45 : 1,
                transform: current ? "translateY(-2px)" : "none",
                boxShadow: current ? "0 6px 16px -4px rgba(0,0,0,0.35)" : "none",
              }}
            >
              {/* Uniform circular icon badge so the mixed-emoji set
                  reads as one visual family across steps. */}
              <div
                className="grid h-7 w-7 place-items-center rounded-full text-[14px]"
                style={{
                  background: "rgba(255,255,255,0.16)",
                  filter: locked ? "grayscale(0.85)" : "none",
                }}
                aria-hidden
              >
                {l.icon}
              </div>
              <div
                className="mt-2 text-[12px] font-bold leading-tight"
                style={{ opacity: locked ? 0.85 : 1 }}
              >
                {l.label}
              </div>
              <div
                className="mt-0.5 text-[10px] font-semibold"
                style={{
                  opacity: current ? 1 : 0.7,
                }}
              >
                {done ? (
                  <span>✓ 已完成</span>
                ) : current ? (
                  <span className="uppercase tracking-wide">当前步骤</span>
                ) : (
                  <span className="inline-flex items-center gap-0.5">
                    <span aria-hidden>🔒</span> 未解锁
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
