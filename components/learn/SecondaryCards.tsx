import Link from "next/link";
import ImgSlot from "@/components/design/ImgSlot";
import type { Journey } from "@/lib/learn/journeys";

export type ContinueItem = {
  title: string;
  subtitle: string;
  /** Progress 0-100. */
  progress: number;
};

export function ContinueCard({
  items,
  journey,
}: {
  items: ContinueItem[];
  journey: Journey;
}) {
  return (
    <div className="la-card" style={{ padding: 18, borderRadius: 18 }}>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-mute">
        Continue practicing
      </div>
      {items.map((c, idx) => (
        <div
          key={c.title}
          className="mt-2 flex items-center gap-3 py-3"
          style={{
            borderTop: idx === 0 ? "1px solid var(--line-soft)" : "1px solid var(--line-soft)",
          }}
        >
          <ImgSlot label="Cover" height={48} style={{ width: 64, flex: "0 0 64px" }} />
          <div className="flex-1">
            <div className="text-sm font-bold text-ink">{c.title}</div>
            <div className="text-xs text-ink-mute">{c.subtitle}</div>
            <div className="mt-1.5 h-1 rounded-sm" style={{ background: "var(--bg-2)" }}>
              <div
                className="h-full rounded-sm"
                style={{
                  width: `${Math.max(0, Math.min(100, c.progress))}%`,
                  background: journey.color,
                }}
              />
            </div>
          </div>
          <div aria-hidden className="text-lg text-ink-mute">
            →
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationCard({
  journey,
  teacherName = "Nova",
  emoji,
  title,
  body,
  ctaLabel = "Start warm-up",
}: {
  journey: Journey;
  teacherName?: string;
  emoji: string;
  title: string;
  body: string;
  ctaLabel?: string;
}) {
  return (
    <div className="la-card" style={{ padding: 18, borderRadius: 18 }}>
      <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink-mute">
        {teacherName} recommends
      </div>
      <div
        className="mt-3 rounded-2xl p-3.5"
        style={{ background: journey.soft, border: `1px solid ${journey.bg}` }}
      >
        <div className="text-[22px]" aria-hidden>
          {emoji}
        </div>
        <div className="mt-1.5 text-[15px] font-bold text-ink">{title}</div>
        <div className="mt-1 text-xs leading-snug text-ink-soft">{body}</div>
        <button
          type="button"
          className="la-btn mt-3"
          style={{
            padding: "10px 14px",
            fontSize: 13,
            background: journey.color,
            boxShadow: "none",
          }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * WikiTest entry card for Scholar / Professional homes. Sits next to
 * "Continue practicing" — surfaces the paste-a-URL flow without going
 * heavy on copy. Pedagogy first.
 */
export function WikiTestPromoCard({
  worldLabel,
  teacherName,
}: {
  worldLabel: string;
  teacherName: string;
}) {
  return (
    <div
      className="la-card relative overflow-hidden"
      style={{
        padding: 18,
        borderRadius: 18,
        border: "1.5px solid var(--brand-1)",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{ background: "var(--brand-grad)" }}
      />
      <div className="relative">
        <div className="flex items-center gap-2">
          <span
            className="la-mono text-[10px] font-extrabold tracking-[0.08em]"
            style={{ color: "var(--brand-1)" }}
          >
            NEW IN {worldLabel.toUpperCase()} · WIKITEST
          </span>
          <span
            className="la-pill text-[10px]"
            style={{ background: "var(--brand-grad)", color: "#fff", padding: "2px 8px" }}
          >
            BETA
          </span>
        </div>
        <h3 className="mt-1 text-[20px] font-extrabold tracking-[-0.01em] text-ink">
          Build a test from any Wikipedia article
        </h3>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
          Paste a link. {teacherName} walks you through the article, then
          grades you on it. Same Loop — taught from a source you choose.
        </p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          <Link
            href="/learn/wiki"
            className="la-btn"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            ✨ Try WikiTest
          </Link>
          <Link
            href="/learn/wiki"
            className="la-btn ghost"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            How it works
          </Link>
        </div>
      </div>
    </div>
  );
}
