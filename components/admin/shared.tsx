import type { ReactNode } from "react";

/** Crumb trail rendered above page content. */
export function Crumbs({ trail }: { trail: string[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 px-5 py-3 text-[12px] text-ink-mute md:px-9"
      style={{ borderBottom: "1px solid var(--line-soft)", background: "rgba(255,255,255,0.6)" }}
    >
      {trail.map((t, i) => (
        <span key={i} className="contents">
          {i > 0 ? <span aria-hidden>/</span> : null}
          <span
            className={i === trail.length - 1 ? "font-bold text-ink" : "font-semibold"}
          >
            {t}
          </span>
        </span>
      ))}
    </nav>
  );
}

/** Pill-styled toggle chip used on filter rows. */
export function Chip({
  on,
  children,
}: {
  on?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="la-pill text-[12px] font-extrabold transition"
      style={{
        background: on ? "var(--brand-grad)" : "#fff",
        color: on ? "#fff" : "var(--ink-soft)",
        boxShadow: on ? "none" : "0 0 0 1px var(--line)",
        padding: "5px 11px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

/** Big KPI tile with optional inline sparkline. */
export function KpiBig({
  label,
  value,
  delta,
  color = "var(--ink)",
  sparkline,
}: {
  label: string;
  value: string;
  delta?: string;
  color?: string;
  sparkline?: number[];
}) {
  return (
    <div
      className="la-card relative overflow-hidden p-4"
      style={{ borderRadius: 16 }}
    >
      <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </div>
      <div
        className="mt-1 text-[28px] font-extrabold tracking-[-0.01em]"
        style={{ color, fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        {value}
      </div>
      {delta ? (
        <div className="la-mono mt-1 text-[11px] text-ink-mute">{delta}</div>
      ) : null}
      {sparkline ? <MiniSpark data={sparkline} color={color} /> : null}
    </div>
  );
}

export function MiniSpark({
  data,
  color,
}: {
  data: number[];
  color: string;
}) {
  const max = Math.max(...data) || 1;
  return (
    <svg
      viewBox="0 0 80 24"
      aria-hidden
      className="absolute"
      style={{ bottom: 8, right: 8, width: 80, height: 24, opacity: 0.6 }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        points={data
          .map((v, i) => `${(i / (data.length - 1)) * 80},${24 - (v / max) * 22}`)
          .join(" ")}
      />
    </svg>
  );
}

/** Compact toggle row used across Safety and Billing panels. */
export function Toggle2({
  label,
  sub,
  on = true,
}: {
  label: string;
  sub?: string;
  on?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line-soft py-2.5 first:border-t-0 first:pt-0">
      <div className="min-w-0">
        <div className="text-[13px] font-extrabold text-ink">{label}</div>
        {sub ? <div className="mt-0.5 text-[11px] text-ink-mute">{sub}</div> : null}
      </div>
      <span
        className="relative inline-block flex-none rounded-full"
        style={{
          width: 38,
          height: 22,
          background: on ? "#16a34a" : "var(--ink-faint)",
        }}
        aria-hidden
      >
        <span
          className="absolute top-[2px] grid h-[18px] w-[18px] place-items-center rounded-full bg-white transition-all"
          style={{ left: on ? 18 : 2 }}
        />
      </span>
    </div>
  );
}

/** Header block used at the top of every admin page. */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow}
        <h1 className="mt-2 text-[28px] font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 max-w-[720px] text-[14px] text-ink-soft">{subtitle}</p>
        ) : null}
      </div>
      {right ? <div className="flex flex-wrap gap-2">{right}</div> : null}
    </div>
  );
}
