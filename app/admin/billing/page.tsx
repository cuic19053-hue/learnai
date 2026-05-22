import type { Metadata } from "next";
import { Crumbs, PageHeader, Toggle2 } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Billing" };

const INVOICES = [
  { mo: "May 2026", amt: "$71.40", status: "open" as const, due: "Jun 1" },
  { mo: "Apr 2026", amt: "$93.20", status: "paid" as const, due: "—" },
  { mo: "Mar 2026", amt: "$88.45", status: "paid" as const, due: "—" },
  { mo: "Feb 2026", amt: "$54.10", status: "paid" as const, due: "—" },
  { mo: "Jan 2026", amt: "$42.80", status: "paid" as const, due: "—" },
];

const BREAKDOWN = [
  {
    label: "OllaBridge · HF Space",
    value: "$0.00",
    pct: 0,
    c: "var(--brand-2)",
    detail: "bundled · free",
  },
  { label: "OpenAI", value: "$24.40", pct: 34, c: "#10a37f", detail: "3,180 reqs" },
  {
    label: "xAI · Grok",
    value: "$11.20",
    pct: 16,
    c: "#0f1430",
    detail: "free credits · $13.80 left",
  },
  { label: "Anthropic", value: "$0.00", pct: 0, c: "#d97706", detail: "not enabled" },
  {
    label: "Hosting · Vercel Pro",
    value: "$20.00",
    pct: 28,
    c: "var(--ink)",
    detail: "frontend + edge",
  },
  {
    label: "Database · Neon",
    value: "$15.80",
    pct: 22,
    c: "#2dbb6c",
    detail: "Postgres + branching",
  },
];

export default function AdminBilling() {
  return (
    <>
      <Crumbs trail={["Admin", "Billing"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          eyebrow={
            <span
              className="la-pill text-[11px]"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              💳 Vercel · Neon Postgres · OpenAI · xAI
            </span>
          }
          title="Billing & usage"
          subtitle="LearnAI itself is open-source and free. Costs come from AI providers, hosting, and database. Most learners cost $0 — they run on OllaBridge."
          right={
            <>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                Download invoice
              </button>
              <button
                type="button"
                className="la-btn"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                Update payment
              </button>
            </>
          }
        />

        {/* MTD hero */}
        <div className="la-card mt-5 overflow-hidden p-0" style={{ borderRadius: 22 }}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-6">
              <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                Month to date · May 2026
              </div>
              <div
                className="mt-1 text-[44px] font-extrabold tracking-[-0.02em]"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                $71.<span className="text-ink-mute">40</span>
              </div>
              <div className="mt-1 text-[13px] text-ink-soft">
                Projected end-of-month: <b>$94 · under budget</b> ($250 cap)
              </div>
              <div className="mt-4 flex flex-wrap gap-4">
                <Mini label="vs last month" v="−$22" tone="ok" />
                <Mini label="cost / learner" v="$0.033" tone="ok" />
                <Mini label="free-tier coverage" v="78%" tone="ok" />
              </div>
            </div>
            <div
              className="border-t border-line-soft p-6 md:border-l md:border-t-0"
              style={{ background: "linear-gradient(135deg, var(--bg-2), #f7f4ff)" }}
            >
              <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                Breakdown
              </div>
              <div className="mt-2 space-y-3">
                {BREAKDOWN.map((b) => (
                  <BreakdownRow key={b.label} {...b} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[16px] font-extrabold text-ink">Invoices</h3>
            <div className="mt-2 divide-y divide-line-soft">
              {INVOICES.map((r) => (
                <div
                  key={r.mo}
                  className="grid items-center gap-3 py-2.5"
                  style={{ gridTemplateColumns: "1.2fr 1fr 1fr 80px" }}
                >
                  <span className="text-[13px] font-extrabold text-ink">{r.mo}</span>
                  <span className="la-mono text-[13px] font-extrabold">{r.amt}</span>
                  <span
                    className="la-pill text-[10px] font-extrabold"
                    style={{
                      background: r.status === "paid" ? "#dcfce7" : "#fef3c7",
                      color: r.status === "paid" ? "#16a34a" : "#b45309",
                    }}
                  >
                    {r.status}
                  </span>
                  <button
                    type="button"
                    className="la-btn ghost"
                    style={{ padding: "4px 10px", fontSize: 11 }}
                  >
                    PDF ↓
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <section className="la-card p-5" style={{ borderRadius: 18 }}>
              <h3 className="text-[16px] font-extrabold text-ink">Payment method</h3>
              <div
                className="mt-2 flex items-center gap-3 rounded-xl p-3"
                style={{ background: "var(--surface-soft)" }}
              >
                <div
                  className="la-mono grid h-7 w-10 place-items-center rounded-md text-[11px] font-extrabold text-white"
                  style={{ background: "var(--ink)" }}
                >
                  VISA
                </div>
                <div className="flex-1">
                  <div className="la-mono text-[12px] font-extrabold">•••• 4392</div>
                  <div className="la-mono text-[10px] text-ink-mute">exp 09/28 · Ruslan M.</div>
                </div>
                <button
                  type="button"
                  className="la-btn ghost"
                  style={{ padding: "5px 10px", fontSize: 11 }}
                >
                  Edit
                </button>
              </div>
            </section>

            <section className="la-card p-5" style={{ borderRadius: 18 }}>
              <h3 className="text-[16px] font-extrabold text-ink">Alerts</h3>
              <div className="mt-1">
                <Toggle2 label="50 / 80 / 95% cap alerts" sub="emailed + Slack" on />
                <Toggle2 label="Hard stop at 95%" sub="learners fall back to OllaBridge" on />
                <Toggle2 label="Daily spend digest" sub="9 am email" on />
                <Toggle2
                  label="Free-tier exhaustion ping"
                  sub="when Grok credits drop below 10%"
                  on
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

function Mini({ label, v, tone }: { label: string; v: string; tone?: "ok" }) {
  return (
    <div>
      <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        {label}
      </div>
      <div
        className="la-mono text-[13px] font-extrabold"
        style={{ color: tone === "ok" ? "#16a34a" : "var(--ink)" }}
      >
        {v}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  pct,
  c,
  detail,
}: {
  label: string;
  value: string;
  pct: number;
  c: string;
  detail: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] font-extrabold text-ink">{label}</span>
        <span className="la-mono text-[12px] font-extrabold">{value}</span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,.6)" }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: c }} />
      </div>
      <div className="la-mono mt-1 text-[10px] text-ink-mute">{detail}</div>
    </div>
  );
}
