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
  /** Inclusive loop step the learner is on (1-6). */
  currentStep: number;
  /** Total steps in the loop (default 6). */
  totalSteps?: number;
  ctaLabel?: string;
  /** When set, the CTA renders as a link to this href (otherwise a static button). */
  ctaHref?: string;
  /** Tertiary text shown next to the CTA, e.g. "~12 min · +60 XP". */
  meta?: string;
};

/**
 * The "today's mission" hero card — gradient slab tinted by the journey
 * accent, with a conic-gradient progress ring and the Loop steps inline.
 */
export default function MissionCard({
  journey,
  kicker = "TODAY'S MISSION",
  title,
  description,
  currentStep,
  totalSteps = LOOP.length,
  ctaLabel = "Resume mission",
  ctaHref,
  meta,
}: MissionCardProps) {
  const safeStep = Math.max(0, Math.min(totalSteps, currentStep));
  const pct = Math.round((safeStep / totalSteps) * 100);
  const ctaClasses = "flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold";
  const ctaStyle = { color: journey.color } as const;

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 text-white"
      style={{
        background: `linear-gradient(135deg, ${journey.color} 0%, #2a1958 110%)`,
      }}
    >
      <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] opacity-80">
            {kicker} · {safeStep}/{totalSteps} STEPS
          </div>
          <h2 className="mt-2 text-[28px] font-extrabold tracking-[-0.01em]">{title}</h2>
          <p className="mt-2 max-w-[460px] text-[14px] leading-relaxed opacity-85">{description}</p>
          <div className="mt-4 flex items-center gap-3">
            {ctaHref ? (
              <Link href={ctaHref} className={ctaClasses} style={ctaStyle}>
                ▶ {ctaLabel}
              </Link>
            ) : (
              <button type="button" className={ctaClasses} style={ctaStyle}>
                ▶ {ctaLabel}
              </button>
            )}
            {meta ? <span className="text-[13px] opacity-85">{meta}</span> : null}
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex justify-end" aria-hidden>
          <div
            className="grid place-items-center rounded-full"
            style={{
              width: 160,
              height: 160,
              background: `conic-gradient(#fff 0% ${pct}%, rgba(255,255,255,.2) ${pct}% 100%)`,
            }}
          >
            <div
              className="grid h-[132px] w-[132px] place-items-center rounded-full text-center"
              style={{ background: "rgba(255,255,255,.05)" }}
            >
              <div>
                <div className="text-[32px] font-extrabold">
                  {safeStep}/{totalSteps}
                </div>
                <div className="text-[11px] opacity-85">Loop progress</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loop chips inline */}
      <div className="relative z-10 mt-6 flex gap-2">
        {LOOP.map((l, i) => {
          const done = i < safeStep;
          const upNext = i === safeStep;
          return (
            <div
              key={l.n}
              className="flex-1 rounded-xl"
              style={{
                padding: "10px 12px",
                background: done ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.06)",
                border: upNext ? "1.5px solid #fff" : "1px solid rgba(255,255,255,.1)",
              }}
            >
              <div className="text-lg" aria-hidden>
                {l.icon}
              </div>
              <div className="mt-1 text-[12px] font-bold">{l.label}</div>
              <div className="mt-0.5 text-[10px] opacity-70">
                {done ? "✓ Done" : upNext ? "Up next" : "Locked"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
