import type { Metadata } from "next";
import { Chip, Crumbs, KpiBig, PageHeader } from "@/components/admin/shared";
import { aiSummary } from "@/lib/ai/provider";

export const metadata: Metadata = {
  title: "Admin · Overview",
  description: "LearnAI admin overview — KPIs, system health, and recent activity.",
};

export const dynamic = "force-dynamic";

const SPARK = [4, 6, 5, 8, 7, 9, 6, 8, 10, 9, 11, 13];

const LOOP_STAGES: Array<{
  label: string;
  color: string;
  pct: number[];
  emphasis?: boolean;
}> = [
  { label: "Hook", color: "#ef4444", pct: [98, 99, 98, 97, 98, 96, 97] },
  { label: "Explain", color: "#f59e0b", pct: [92, 94, 91, 89, 91, 88, 90] },
  { label: "Practice", color: "#fb923c", pct: [85, 88, 84, 81, 84, 76, 80] },
  { label: "Feedback", color: "#8b5cf6", pct: [78, 82, 77, 73, 76, 68, 72] },
  { label: "Reflect", color: "#ec4899", pct: [71, 79, 73, 67, 71, 61, 65] },
  { label: "Evolve", color: "#22c55e", pct: [68, 78, 71, 64, 69, 58, 62], emphasis: true },
];

export default function AdminOverview() {
  const ai = aiSummary();
  return (
    <>
      <Crumbs trail={["Admin", "Overview"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          eyebrow={
            <span
              className="la-pill text-[11px]"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              <span
                aria-hidden
                className="inline-block"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 99,
                  background: "#16a34a",
                  marginRight: 6,
                }}
              />
              all systems green · v1.4.2 · 14 days uptime
            </span>
          }
          title="Overview"
          subtitle="Today's pulse · 24-hour window · refreshes every 60 s"
          right={
            <>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                Last 24 h ▾
              </button>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                Export CSV
              </button>
            </>
          }
        />

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
          <KpiBig
            label="Active learners"
            value="2,148"
            delta="+184 vs yest."
            color="var(--brand-1)"
            sparkline={SPARK}
          />
          <KpiBig
            label="Sessions · 24h"
            value="6,402"
            delta="+12%"
            color="var(--brand-2)"
            sparkline={SPARK}
          />
          <KpiBig
            label="AI requests"
            value="14,230"
            delta={`${ai.activeChainSize} provider${ai.activeChainSize === 1 ? "" : "s"} · OllaBridge primary`}
            color="#0ea5a4"
            sparkline={SPARK}
          />
          <KpiBig label="Spend · MTD" value="$71.40" delta="under cap · 32%" color="#16a34a" />
          <KpiBig label="Safety blocks" value="48" delta="0.34% of req" color="#f59e0b" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[16px] font-extrabold text-ink">Loop completion · last 7 days</h3>
              <span className="la-mono text-[11px] text-ink-mute">
                % of started sessions reaching Evolve
              </span>
            </div>
            <div className="mt-3">
              <LoopChart />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line-soft pt-3 text-center">
              <MiniStat label="Best day" v="Tue · 78%" />
              <MiniStat label="Worst step" v="Reflect" detail="dropout 22%" />
              <MiniStat label="Avg / session" v="11.2 min" />
            </div>
          </section>

          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[16px] font-extrabold text-ink">System health</h3>
            <div className="mt-2 divide-y divide-line-soft">
              <HealthRow
                name="OllaBridge"
                latency="780 ms"
                status="ok"
                detail="HF Space · 99.94%"
              />
              <HealthRow name="OpenAI" latency="640 ms" status="ok" detail="failover ready" />
              <HealthRow
                name="Database (Neon)"
                latency="34 ms"
                status="ok"
                detail="PostgreSQL · 99.99%"
              />
              <HealthRow
                name="Safety classifier"
                latency="82 ms"
                status="ok"
                detail="LlamaGuard-7B in-line"
              />
              <HealthRow
                name="Object storage"
                latency="—"
                status="warn"
                detail="2 retries last hr"
              />
              <HealthRow name="Email service" latency="—" status="ok" detail="SES · 100%" />
            </div>
            <div
              className="mt-3 rounded-xl border border-line-soft px-3 py-2 text-[11.5px] text-ink-soft"
              style={{ background: "var(--surface-soft)" }}
            >
              <b>Note:</b> object storage retries on a tracked S3 throttling event. No impact on
              learners.
            </div>
          </section>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <ActiveByWorldCard />
          <RecentActivityCard />
          <QuickActionsCard />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <Chip on>24h</Chip>
          <Chip>7d</Chip>
          <Chip>30d</Chip>
          <Chip>This month</Chip>
        </div>
      </div>
    </>
  );
}

function LoopChart() {
  const W = 700;
  const H = 200;
  const padL = 30;
  const padB = 22;
  const padT = 8;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-label="Loop completion chart">
      {[0, 25, 50, 75, 100].map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={padT + ((100 - v) / 100) * (H - padT - padB)}
            x2={W - 10}
            y2={padT + ((100 - v) / 100) * (H - padT - padB)}
            stroke="var(--line)"
            strokeDasharray="2 3"
            strokeWidth="0.6"
          />
          <text
            x={padL - 6}
            y={padT + ((100 - v) / 100) * (H - padT - padB) + 3}
            fontSize="9"
            textAnchor="end"
            fontFamily="var(--font-mono)"
            fill="var(--ink-mute)"
          >
            {v}%
          </text>
        </g>
      ))}
      {LOOP_STAGES.map((s) => (
        <polyline
          key={s.label}
          fill="none"
          stroke={s.color}
          strokeWidth={s.emphasis ? 2.5 : 1.2}
          strokeDasharray={s.emphasis ? "" : "3 3"}
          opacity={s.emphasis ? 1 : 0.6}
          points={s.pct
            .map((v, i) => {
              const x = padL + (i / (s.pct.length - 1)) * (W - padL - 10);
              const y = padT + ((100 - v) / 100) * (H - padT - padB);
              return `${x},${y}`;
            })
            .join(" ")}
        />
      ))}
      {days.map((d, i) => (
        <text
          key={d}
          x={padL + (i / (days.length - 1)) * (W - padL - 10)}
          y={H - 6}
          fontSize="10"
          textAnchor="middle"
          fontFamily="var(--font-mono)"
          fill="var(--ink-mute)"
        >
          {d}
        </text>
      ))}
      <g transform={`translate(${padL}, ${padT + 6})`}>
        {LOOP_STAGES.map((s, i) => (
          <g key={s.label} transform={`translate(${i * 78}, 0)`}>
            <rect x="0" y="0" width="10" height="3" fill={s.color} />
            <text x="14" y="4" fontSize="9.5" fontFamily="var(--font-mono)" fill="var(--ink-soft)">
              {s.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

function HealthRow({
  name,
  latency,
  status,
  detail,
}: {
  name: string;
  latency: string;
  status: "ok" | "warn" | "bad";
  detail: string;
}) {
  const c = status === "ok" ? "#16a34a" : status === "warn" ? "#f59e0b" : "#dc2626";
  return (
    <div
      className="grid items-center gap-3 py-2.5"
      style={{ gridTemplateColumns: "14px 1.2fr 70px 1fr" }}
    >
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: 99, background: c }} />
      <span className="text-[13px] font-extrabold text-ink">{name}</span>
      <span className="la-mono text-right text-[11px] text-ink-soft">{latency}</span>
      <span className="la-mono text-[11px] text-ink-mute">{detail}</span>
    </div>
  );
}

function MiniStat({ label, v, detail }: { label: string; v: string; detail?: string }) {
  return (
    <div>
      <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </div>
      <div className="mt-1 text-[14px] font-extrabold text-ink">{v}</div>
      {detail ? <div className="la-mono text-[10px] text-ink-mute">{detail}</div> : null}
    </div>
  );
}

function ActiveByWorldCard() {
  const rows = [
    { w: "Little Learner", n: 312, pct: 14, c: "#ec4899" },
    { w: "GRADE_7", n: 488, pct: 23, c: "#4338ca" },
    { w: "GRADE_8", n: 402, pct: 19, c: "#7c3aed" },
    { w: "GRADE_9", n: 580, pct: 27, c: "#c2410c" },
    { w: "Professional", n: 286, pct: 13, c: "#0f766e" },
    { w: "Senior Learner", n: 80, pct: 4, c: "#16a34a" },
  ];
  return (
    <section className="la-card p-5" style={{ borderRadius: 18 }}>
      <h4 className="text-[14px] font-extrabold text-ink">Active by world · today</h4>
      <div className="mt-3 space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.w}
            className="grid items-center gap-3 py-1"
            style={{ gridTemplateColumns: "110px 40px 1fr" }}
          >
            <span className="text-[12px] font-semibold text-ink">{r.w}</span>
            <span className="la-mono text-[11px] text-ink-mute">{r.n}</span>
            <div className="wt-meter">
              <div className="fill" style={{ width: `${r.pct * 4}%`, background: r.c }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentActivityCard() {
  const events = [
    {
      ic: "✨",
      t: "New WikiTest generated",
      sub: "Linear algebra · jess@school",
      when: "just now",
    },
    { ic: "🎯", t: "Sofia (5) completed Loop", sub: "Counting 1–10 · Active recall", when: "2m" },
    {
      ic: "🛡️",
      t: "Safety block · profanity",
      sub: "GRADE_8 · auto-resolved",
      when: "6m",
      tone: "warn" as const,
    },
    { ic: "🎓", t: "Mock defense rehearsal", sub: "Transformer · 78% readiness", when: "14m" },
    { ic: "💳", t: "OpenAI usage · $1.20", sub: "below cap", when: "20m", tone: "muted" as const },
    { ic: "✨", t: "New persona added", sub: "Forge (GRADE_8) · admin@", when: "1h" },
  ];
  return (
    <section className="la-card p-5" style={{ borderRadius: 18 }}>
      <h4 className="text-[14px] font-extrabold text-ink">Recent activity</h4>
      <div className="mt-2 divide-y divide-line-soft">
        {events.map((e, i) => (
          <div
            key={i}
            className="grid items-center gap-3 py-2"
            style={{ gridTemplateColumns: "24px 1fr auto" }}
          >
            <span aria-hidden className="text-[15px]">
              {e.ic}
            </span>
            <div>
              <div
                className="text-[12.5px] font-bold"
                style={{
                  color:
                    e.tone === "warn"
                      ? "#b45309"
                      : e.tone === "muted"
                        ? "var(--ink-mute)"
                        : "var(--ink)",
                }}
              >
                {e.t}
              </div>
              <div className="la-mono text-[10px] text-ink-mute">{e.sub}</div>
            </div>
            <span className="la-mono text-[10px] text-ink-mute">{e.when}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuickActionsCard() {
  const items = [
    {
      ic: "🎨",
      t: "Open the Design Gallery",
      sub: "Visual QA · all 52 screens",
      href: "/admin/design-gallery",
    },
    {
      ic: "🤖",
      t: "Add an AI provider",
      sub: "OllaBridge default · Grok recommended",
      href: "/admin/providers",
    },
    {
      ic: "🎭",
      t: "Edit Mentor Max's prompt",
      sub: "6 sessions with low score yest.",
      href: "/admin/personas",
    },
    {
      ic: "🛡️",
      t: "Review 3 safety incidents",
      sub: "all under 12 · auto-resolved",
      href: "/admin/safety",
    },
    {
      ic: "📜",
      t: "Export this week's audit log",
      sub: "for compliance review",
      href: "/admin/audit",
    },
  ];
  return (
    <section className="la-card p-5" style={{ borderRadius: 18 }}>
      <h4 className="text-[14px] font-extrabold text-ink">Quick actions</h4>
      <div className="mt-2 flex flex-col gap-1.5">
        {items.map((q) => (
          <a
            key={q.t}
            href={q.href}
            className="hover:bg-bg-2 grid items-center gap-3 rounded-lg px-2.5 py-2 transition"
            style={{ gridTemplateColumns: "22px 1fr 14px" }}
          >
            <span aria-hidden className="text-[14px]">
              {q.ic}
            </span>
            <div>
              <div className="text-[12.5px] font-extrabold text-ink">{q.t}</div>
              <div className="la-mono text-[10px] text-ink-mute">{q.sub}</div>
            </div>
            <span aria-hidden className="text-ink-mute">
              ›
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
