import type { Metadata } from "next";
import { Crumbs, KpiBig, PageHeader, Toggle2 } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Safety" };

const POLICY: Array<{ cat: string; row: string[] }> = [
  { cat: "Violence & gore", row: ["✕", "✕", "⚠", "⚠", "⚠", "✕"] },
  { cat: "Sexual content", row: ["✕", "✕", "✕", "✕", "⚠", "✕"] },
  { cat: "Self-harm", row: ["✕", "✕", "✕", "⚠", "⚠", "✕"] },
  { cat: "Profanity", row: ["✕", "✕", "⚠", "⚠", "✓", "✕"] },
  { cat: "External links", row: ["✕", "✕", "⚠", "✓", "✓", "⚠"] },
  { cat: "Off-topic chat", row: ["⚠", "⚠", "✓", "✓", "✓", "✓"] },
  { cat: "PII collection", row: ["✕", "✕", "⚠", "⚠", "⚠", "⚠"] },
  { cat: "AI image generation", row: ["✕", "✕", "⚠", "✓", "✓", "⚠"] },
];

const INCIDENTS: Array<{
  sev: "low" | "med" | "high";
  t: string;
  sub: string;
  when: string;
}> = [
  {
    sev: "low",
    t: "Profanity · GRADE_8",
    sub: "Maya R. · auto-blocked · friendly redirect",
    when: "6m",
  },
  {
    sev: "med",
    t: "Off-topic · Little Learner",
    sub: "Sofia C. · 'tell me about phones' · redirected",
    when: "42m",
  },
  {
    sev: "low",
    t: "External link · GRADE_7",
    sub: "link to YouTube · stripped · learner notified",
    when: "2h",
  },
  {
    sev: "high",
    t: "Self-harm reference · GRADE_9",
    sub: "auto-blocked · safety team paged · resolved by Anna in 4m",
    when: "yest.",
  },
];

export default function AdminSafety() {
  return (
    <>
      <Crumbs trail={["Admin", "Safety"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          eyebrow={
            <span
              className="la-pill text-[11px] font-extrabold"
              style={{ background: "#dcfce7", color: "#16a34a" }}
            >
              🛡 LlamaGuard-7B · in-line · 82 ms · 99.96% pass
            </span>
          }
          title="Safety"
          subtitle="One policy engine, six profiles. Strict for under-12s; standard for adults. Every block is logged."
          right={
            <button type="button" className="la-btn" style={{ padding: "9px 14px", fontSize: 13 }}>
              Save policy
            </button>
          }
        />

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiBig label="Blocks today" value="48" delta="0.34% of requests" color="#f59e0b" />
          <KpiBig
            label="Incidents · open"
            value="3"
            delta="all under-12 auto-resolved"
            color="#dc2626"
          />
          <KpiBig
            label="False positives"
            value="0.8%"
            delta="acceptable · target ≤ 1%"
            color="#16a34a"
          />
          <KpiBig
            label="Classifier P50"
            value="82 ms"
            delta="in-line · before LLM"
            color="var(--brand-1)"
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
          <section className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[16px] font-extrabold text-ink">Policy matrix · by world</h3>
            <p className="mt-1 text-[12.5px] text-ink-soft">
              Six categories × six worlds. ✓ = allowed in-line, ⚠ = allowed with warning, ✕ =
              blocked.
            </p>

            <div
              className="la-mono mt-3 grid items-center gap-1.5 text-[11px]"
              style={{ gridTemplateColumns: "1.4fr repeat(6, 1fr)" }}
            >
              <span />
              {["🦁", "🚀", "🛠️", "🎓", "💼", "🌿"].map((e, i) => (
                <span key={i} className="text-center text-[14px]">
                  {e}
                </span>
              ))}
            </div>
            <div className="mt-1 divide-y divide-line-soft">
              {POLICY.map((r) => (
                <div
                  key={r.cat}
                  className="grid items-center gap-1.5 py-1.5"
                  style={{ gridTemplateColumns: "1.4fr repeat(6, 1fr)" }}
                >
                  <span className="text-[12.5px] font-extrabold text-ink">{r.cat}</span>
                  {r.row.map((cell, i) => (
                    <SafetyCell key={i} v={cell} />
                  ))}
                </div>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <section className="la-card p-5" style={{ borderRadius: 18 }}>
              <h3 className="text-[16px] font-extrabold text-ink">Recent incidents</h3>
              <div className="mt-2 divide-y divide-line-soft">
                {INCIDENTS.map((inc, i) => {
                  const tone =
                    inc.sev === "high"
                      ? { c: "#dc2626", bg: "#fee2e2" }
                      : inc.sev === "med"
                        ? { c: "#b45309", bg: "#fef3c7" }
                        : { c: "var(--ink-mute)", bg: "var(--bg-2)" };
                  return (
                    <div
                      key={i}
                      className="grid items-center gap-2 py-2"
                      style={{ gridTemplateColumns: "36px 1fr auto" }}
                    >
                      <span
                        className="la-mono rounded-md px-1.5 py-1 text-center text-[9px] font-extrabold uppercase tracking-[0.04em]"
                        style={{ background: tone.bg, color: tone.c }}
                      >
                        {inc.sev}
                      </span>
                      <div>
                        <div className="text-[12.5px] font-extrabold text-ink">{inc.t}</div>
                        <div className="la-mono text-[10.5px] text-ink-mute">{inc.sub}</div>
                      </div>
                      <span className="la-mono text-[10px] text-ink-mute">{inc.when}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="la-card p-5" style={{ borderRadius: 18 }}>
              <h3 className="text-[16px] font-extrabold text-ink">Global toggles</h3>
              <div className="mt-1">
                <Toggle2
                  label="Force LlamaGuard-7B in-line"
                  sub="every prompt · every response"
                  on
                />
                <Toggle2
                  label="Block external links for under-13"
                  sub="learner sees friendly note"
                  on
                />
                <Toggle2
                  label="Pseudonymise PII before LLM"
                  sub="emails, full names, addresses"
                  on
                />
                <Toggle2
                  label="Vision moderator on uploads"
                  sub="image safety · scanned before LLM"
                  on
                />
                <Toggle2 label="Page on-call for HIGH severity" sub="≤ 5 min · 24/7" on />
                <Toggle2
                  label="COPPA mode (US under-13)"
                  sub="parental consent flow + extra audit"
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

function SafetyCell({ v }: { v: string }) {
  const map: Record<string, { c: string; bg: string }> = {
    "✓": { c: "#16a34a", bg: "#dcfce7" },
    "⚠": { c: "#b45309", bg: "#fef3c7" },
    "✕": { c: "#dc2626", bg: "#fee2e2" },
  };
  const m = map[v] ?? map["✕"]!;
  return (
    <span
      className="la-mono grid place-items-center rounded-md text-[13px] font-extrabold"
      style={{ height: 24, background: m.bg, color: m.c }}
    >
      {v}
    </span>
  );
}
