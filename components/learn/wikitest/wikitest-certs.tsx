/**
 * Certifications gallery screens (Batch 3, 7 screens).
 *
 *   CertificationsHub  — AWS/Azure/GCP/IBM cert hub
 *   CertSimulator      — SAA-C03 simulator with cited explanation
 *   CertIngestion      — Sources databank · ingestion + chunking
 *   CertWizardStep1    — Vendor + metadata
 *   CertWizardStep2    — Sources (URLs)
 *   CertWizardStep3    — Generation config
 *   CertWizardStep4    — Preview & publish
 *
 * Faithful ports of the source JSX prototypes. Wires conceptually to:
 *   /api/certifications        list
 *   /api/certifications/:slug  detail
 *   /api/certifications/:slug/sessions   start simulator
 *   /api/admin/certifications/[create/sources/generate/publish]
 */

"use client";

import {
  LATopBar,
  LASidebar,
  WTBreadcrumb,
  WTFootAttribution,
} from "@/components/learn/shared/SidebarShell";
import { Icon } from "@/components/learn/shared/wikitest-icons";

// ─── Vendor styling ────────────────────────────────────────────────

const VENDOR_C: Record<string, { bg: string; fg: string; dot: string }> = {
  AWS: { bg: "#fef3c7", fg: "#b45309", dot: "#f59e0b" },
  Azure: { bg: "#e0e7ff", fg: "#3730a3", dot: "#4338ca" },
  GCP: { bg: "#fee2e2", fg: "#b91c1c", dot: "#dc2626" },
  IBM: { bg: "#e0e7ff", fg: "#3730a3", dot: "#6366f1" },
};

const CERT_PACKS = [
  {
    code: "CLF-C02",
    vendor: "AWS",
    title: "AWS Certified Cloud Practitioner",
    level: "Fundamentals",
    n: 542,
    popular: true,
    updated: "2 d",
  },
  {
    code: "SAA-C03",
    vendor: "AWS",
    title: "AWS Solutions Architect — Associate",
    level: "Associate",
    n: 720,
    flagship: true,
    updated: "2 d",
  },
  {
    code: "SAP-C02",
    vendor: "AWS",
    title: "AWS Solutions Architect — Professional",
    level: "Professional",
    n: 480,
    updated: "5 d",
  },
  {
    code: "DOP-C02",
    vendor: "AWS",
    title: "AWS DevOps Engineer — Professional",
    level: "Professional",
    n: 380,
    updated: "5 d",
  },
  {
    code: "AZ-900",
    vendor: "Azure",
    title: "Azure Fundamentals",
    level: "Fundamentals",
    n: 412,
    updated: "3 d",
  },
  {
    code: "AZ-104",
    vendor: "Azure",
    title: "Azure Administrator",
    level: "Associate",
    n: 640,
    popular: true,
    updated: "3 d",
  },
  {
    code: "AZ-204",
    vendor: "Azure",
    title: "Azure Developer (retiring Jul 2026)",
    level: "Associate",
    n: 480,
    updated: "1 wk",
    warn: "retires Jul 2026",
  },
  {
    code: "AZ-500",
    vendor: "Azure",
    title: "Azure Security Engineer",
    level: "Associate",
    n: 520,
    updated: "4 d",
  },
  {
    code: "GCP-PCA",
    vendor: "GCP",
    title: "Google Pro Cloud Architect",
    level: "Professional",
    n: 360,
    updated: "6 d",
  },
  {
    code: "GCP-PMLE",
    vendor: "GCP",
    title: "Google Pro ML Engineer",
    level: "Professional",
    n: 420,
    updated: "6 d",
  },
  {
    code: "C1000-185",
    vendor: "IBM",
    title: "IBM watsonx Generative AI Engineer",
    level: "Associate",
    n: 240,
    fresh: true,
    updated: "1 wk",
  },
];

// ─── 1 · Certifications hub ────────────────────────────────────────

export function CertificationsHub() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Professional" streak={2} xp={210} initials="R" avatarBg="#0f766e" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Prof. Turing" teacherIcon="💼" />
        <main>
          <WTBreadcrumb trail={["Professional", "Certifications"]} />

          <section style={{ padding: "32px 32px 12px", maxWidth: 1140, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: 18,
                flexWrap: "wrap",
              }}
            >
              <div style={{ maxWidth: 720 }}>
                <span
                  className="la-pill"
                  style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
                >
                  🏛 11 packs · 4,754 cited questions · all from official sources
                </span>
                <h1
                  style={{
                    fontSize: 38,
                    fontWeight: 800,
                    letterSpacing: "-0.025em",
                    margin: "12px 0 6px",
                    lineHeight: 1.05,
                  }}
                >
                  Certifications
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: 0, lineHeight: 1.55 }}>
                  Train with real exam-style questions for AWS, Azure, Google Cloud, and IBM. Every
                  question is synthesised from official vendor documentation and cited back to the
                  source. <b>Drill mode</b> samples randomly; <b>Review mode</b> walks every
                  question with its explanation.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="la-btn ghost" style={{ padding: "10px 14px", fontSize: 13 }}>
                  📊 Progress
                </button>
                <button className="la-btn" style={{ padding: "10px 14px", fontSize: 13 }}>
                  + Add a certification
                </button>
              </div>
            </div>

            {/* Vendor filter */}
            <div style={{ display: "flex", gap: 6, marginTop: 22, flexWrap: "wrap" }}>
              {["All vendors", "AWS (4)", "Azure (4)", "GCP (2)", "IBM (1)"].map((v, i) => (
                <button
                  key={v}
                  type="button"
                  className={"wt-tab" + (i === 0 ? " active" : "")}
                  style={{ fontSize: 13, padding: "8px 12px" }}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Pack grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
                marginTop: 16,
              }}
            >
              {CERT_PACKS.map((p) => {
                const v = VENDOR_C[p.vendor]!;
                return (
                  <div
                    key={p.code}
                    className="la-card"
                    style={{ padding: 16, position: "relative" }}
                  >
                    {p.flagship ? (
                      <span
                        className="la-pill"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "var(--brand-grad)",
                          color: "#fff",
                          fontSize: 10,
                          padding: "2px 8px",
                        }}
                      >
                        FLAGSHIP
                      </span>
                    ) : p.popular ? (
                      <span
                        className="la-pill"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "var(--warn-bg)",
                          color: "var(--warn)",
                          fontSize: 10,
                        }}
                      >
                        POPULAR
                      </span>
                    ) : p.fresh ? (
                      <span
                        className="la-pill"
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          background: "var(--ok-bg)",
                          color: "var(--ok)",
                          fontSize: 10,
                        }}
                      >
                        NEW
                      </span>
                    ) : null}

                    <span
                      className="la-pill"
                      style={{ background: v.bg, color: v.fg, fontSize: 11 }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: v.dot }} />{" "}
                      {p.vendor}
                    </span>
                    <div
                      className="la-serif"
                      style={{
                        fontSize: 17,
                        fontWeight: 800,
                        letterSpacing: "-0.01em",
                        marginTop: 10,
                        lineHeight: 1.25,
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="la-mono"
                      style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                    >
                      {p.code} · {p.level} · {p.n} q · {p.updated} ago
                    </div>
                    {p.warn ? (
                      <div
                        style={{
                          marginTop: 8,
                          padding: "4px 8px",
                          borderRadius: 6,
                          background: "var(--warn-bg)",
                          color: "var(--warn)",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        ⚠ {p.warn}
                      </div>
                    ) : null}
                    <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                      <button
                        className="la-btn ghost"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        Drill
                      </button>
                      <button
                        className="la-btn ghost"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                      >
                        Review
                      </button>
                      <button
                        className="la-btn"
                        style={{ padding: "6px 12px", fontSize: 12, marginLeft: "auto" }}
                      >
                        Start →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <WTFootAttribution />
        </main>
      </div>
    </div>
  );
}

// ─── 2 · CertSimulator (SAA-C03 with cited explanation) ───────────

export function CertSimulator() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900, background: "#fff" }}>
      <div
        style={{
          height: 64,
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 800 }}>SAA-C03</span>
          <span style={{ width: 1, height: 22, background: "rgba(255,255,255,.18)" }} />
          <span style={{ fontSize: 13, opacity: 0.7 }}>AWS Solutions Architect — Associate</span>
          <span className="la-pill" style={{ background: "rgba(46,91,255,.25)", color: "#cfe0ff" }}>
            DRILL · 40 / 720 q
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 13, opacity: 0.8 }}>Question 14 / 25</span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 99,
              background: "rgba(255,255,255,.1)",
            }}
          >
            <Icon.clock color="#fff" />
            <span
              className="la-mono"
              style={{ fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
            >
              32:18 / 60:00
            </span>
          </div>
          <button
            className="la-btn ghost"
            style={{
              background: "transparent",
              color: "#fff",
              boxShadow: "0 0 0 1px rgba(255,255,255,.25) inset",
            }}
          >
            Exit drill
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", minHeight: 836 }}>
        <main style={{ padding: "32px 48px", maxWidth: 880, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span
              className="la-pill"
              style={{ background: "var(--ok-bg)", color: "var(--ok)", fontSize: 11 }}
            >
              ✓ ANSWER REVEALED
            </span>
            <span
              className="la-pill"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)", fontSize: 11 }}
            >
              Domain 2 · Resilient Architectures · 30%
            </span>
            <span className="la-pill" style={{ background: "var(--bg-2)", fontSize: 11 }}>
              Generated · qwen2.5:14b · cited
            </span>
          </div>

          <h2
            className="la-serif"
            style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.4, margin: "0 0 22px" }}
          >
            A company runs a critical web application on Amazon EC2 in a single AZ. Traffic has
            grown 4× in 6 months and a recent AZ outage caused a 45-minute outage. The team must
            improve availability <i>without re-architecting the app</i>. Which approach BEST meets
            the requirement?
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            {[
              {
                k: "A",
                t: "Add an Application Load Balancer in front of the EC2 instance and enable cross-zone load balancing.",
                state: "wrong",
              },
              {
                k: "B",
                t: "Place the EC2 instance in an Auto Scaling group spanning multiple AZs, fronted by an Application Load Balancer.",
                state: "correct",
              },
              {
                k: "C",
                t: "Migrate the application to AWS Lambda for automatic multi-AZ resilience.",
                state: "",
              },
              {
                k: "D",
                t: "Take an AMI of the instance and store it in S3 for fast restore after an AZ outage.",
                state: "",
              },
            ].map((o) => (
              <div
                key={o.k}
                className={
                  "wt-mcq" +
                  (o.state === "correct" ? " correct" : o.state === "wrong" ? " wrong" : "")
                }
              >
                <span className="key">{o.k}</span>
                <span style={{ flex: 1 }}>{o.t}</span>
              </div>
            ))}
          </div>

          <div
            className="la-card"
            style={{
              padding: 20,
              background: "var(--surface-soft)",
              borderLeft: "4px solid var(--brand-1)",
            }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--brand-1)",
                letterSpacing: ".08em",
                fontWeight: 800,
              }}
            >
              WHY THIS IS THE ANSWER · CITED
            </div>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
                margin: "8px 0 12px",
              }}
            >
              An Auto Scaling group <b>spanning multiple Availability Zones</b> with an ALB in front
              meets the requirement without changing the app. Cross-zone LB on a single instance (A)
              doesn't add an AZ. Migrating to Lambda (C) re-architects the app. Restoring from an
              AMI (D) is recovery, not availability.
            </p>
            <div
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                background: "#fff",
                border: "1px solid var(--line-soft)",
                fontFamily: "var(--font-mono)",
                fontSize: 11.5,
                color: "var(--ink-mute)",
              }}
            >
              docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-benefits.html · "Better
              fault tolerance"
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
            <button className="la-btn ghost" style={{ padding: "10px 16px" }}>
              ← Previous
            </button>
            <button className="la-btn" style={{ padding: "10px 20px" }}>
              Next question <Icon.arrow color="#fff" />
            </button>
          </div>
        </main>

        <aside
          style={{
            padding: "24px 18px",
            borderLeft: "1px solid var(--line-soft)",
            background: "var(--surface-soft)",
          }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              marginBottom: 12,
            }}
          >
            DOMAIN COVERAGE
          </div>
          {[
            { d: "1 · Secure Architectures", n: 30, p: 80 },
            { d: "2 · Resilient Architectures", n: 26, p: 65 },
            { d: "3 · High-Performing Architectures", n: 24, p: 50 },
            { d: "4 · Cost-Optimized Architectures", n: 20, p: 40 },
          ].map((d) => (
            <div key={d.d} style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontWeight: 700, color: "var(--ink)" }}>{d.d}</span>
                <span className="la-mono" style={{ color: "var(--ink-mute)" }}>
                  {d.p}%
                </span>
              </div>
              <div className="wt-meter">
                <div className="fill" style={{ width: `${d.p}%` }} />
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 22,
              padding: 12,
              borderRadius: 10,
              background: "#fff",
              border: "1px solid var(--line-soft)",
            }}
          >
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-mute)",
                letterSpacing: ".08em",
                marginBottom: 6,
              }}
            >
              SOURCES USED
            </div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)", lineHeight: 1.5 }}>
              docs.aws.amazon.com/saa-c03
              <br />
              aws.amazon.com/architecture/well-architected
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── 3 · CertIngestion (Sources databank) ─────────────────────────

export function CertIngestion() {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world="Professional" streak={2} xp={210} initials="R" avatarBg="#0f766e" />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName="Prof. Turing" teacherIcon="💼" />
        <main>
          <WTBreadcrumb trail={["Admin", "Certifications", "Sources databank"]} />

          <section style={{ padding: "28px 32px", maxWidth: 1140, margin: "0 auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginBottom: 18,
              }}
            >
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
                  Sources databank
                </h1>
                <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>
                  Vendor-owned docs fetched, chunked, and indexed so the AI question generator can
                  cite back to the exact paragraph.
                </p>
              </div>
              <button className="la-btn">
                <Icon.spark /> Re-ingest all
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 12,
                marginBottom: 18,
              }}
            >
              {[
                { label: "Sources", value: "42" },
                { label: "Chunks", value: "18,427" },
                { label: "Last ingest", value: "2h ago" },
                { label: "Storage", value: "112 MB" },
              ].map((k) => (
                <div key={k.label} className="la-card" style={{ padding: 16 }}>
                  <div
                    className="la-mono"
                    style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".08em" }}
                  >
                    {k.label.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{k.value}</div>
                </div>
              ))}
            </div>

            <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--line-soft)",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span
                  className="la-mono"
                  style={{
                    fontSize: 10,
                    color: "var(--ink-mute)",
                    letterSpacing: ".08em",
                    fontWeight: 800,
                  }}
                >
                  PER-CERTIFICATION INGEST PIPELINE
                </span>
              </div>
              {[
                { cert: "SAA-C03", urls: 12, chunks: 4218, status: "fresh", when: "2h ago" },
                { cert: "CLF-C02", urls: 8, chunks: 2104, status: "fresh", when: "2h ago" },
                { cert: "AZ-204", urls: 6, chunks: 1872, status: "warn", when: "12 d ago" },
                { cert: "GCP-PMLE", urls: 14, chunks: 3204, status: "fresh", when: "1d ago" },
                { cert: "C1000-185", urls: 5, chunks: 840, status: "fresh", when: "1d ago" },
              ].map((s, i) => {
                const fg =
                  s.status === "fresh"
                    ? "var(--ok)"
                    : s.status === "warn"
                      ? "var(--warn)"
                      : "var(--bad)";
                const bg =
                  s.status === "fresh"
                    ? "var(--ok-bg)"
                    : s.status === "warn"
                      ? "var(--warn-bg)"
                      : "var(--bad-bg)";
                return (
                  <div
                    key={s.cert}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 100px 100px 110px 110px",
                      gap: 14,
                      padding: "12px 16px",
                      borderTop: i ? "1px solid var(--line-soft)" : "none",
                      alignItems: "center",
                    }}
                  >
                    <span className="la-mono" style={{ fontSize: 13, fontWeight: 800 }}>
                      {s.cert}
                    </span>
                    <span className="la-mono" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                      docs.aws.amazon.com · learn.microsoft.com · cloud.google.com (sample)
                    </span>
                    <span className="la-mono" style={{ fontSize: 12 }}>
                      {s.urls} URLs
                    </span>
                    <span className="la-mono" style={{ fontSize: 12 }}>
                      {s.chunks.toLocaleString()} chunks
                    </span>
                    <span className="la-pill" style={{ background: bg, color: fg, fontSize: 11 }}>
                      {s.status === "fresh"
                        ? "✓ Fresh"
                        : s.status === "warn"
                          ? "↻ Stale"
                          : "✗ Error"}{" "}
                      · {s.when}
                    </span>
                    <button className="la-btn ghost" style={{ padding: "6px 10px", fontSize: 11 }}>
                      Re-ingest
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ─── 4-7 · Add-cert wizard (4 steps) ──────────────────────────────

function WizardShell({
  step,
  title,
  sub,
  children,
}: {
  step: 1 | 2 | 3 | 4;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ width: 1280, minHeight: 900, background: "var(--bg)", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
        <LATopBar world="Professional" streak={2} xp={210} initials="R" avatarBg="#0f766e" />
        <div style={{ padding: 40 }}>
          <div style={{ height: 60, background: "#fff", borderRadius: 12, marginBottom: 16 }} />
          <div style={{ height: 200, background: "#fff", borderRadius: 18 }} />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(15,20,48,.4)" }} />

      <div
        style={{
          position: "absolute",
          top: 50,
          left: "50%",
          transform: "translateX(-50%)",
          width: 1000,
          background: "#fff",
          borderRadius: 22,
          boxShadow: "var(--shadow-3)",
          overflow: "hidden",
        }}
      >
        <div style={{ height: 6, background: "var(--brand-grad)" }} />
        <div style={{ padding: "20px 28px 14px", borderBottom: "1px solid var(--line-soft)" }}>
          <div
            className="la-mono"
            style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em" }}
          >
            ADMIN · ADD A CERTIFICATION
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
              {title}
            </h2>
            <button className="la-iconbtn">✕</button>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--ink-soft)" }}>{sub}</p>
        </div>

        <div style={{ padding: "14px 28px 6px", display: "flex", alignItems: "center", gap: 8 }}>
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              style={{ display: "flex", alignItems: "center", gap: 8, flex: s < 4 ? 1 : 0 }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 99,
                  background: s < step ? "var(--brand-grad)" : s === step ? "#fff" : "var(--bg-2)",
                  border: s === step ? "2px solid var(--brand-1)" : "none",
                  color: s < step ? "#fff" : s === step ? "var(--brand-1)" : "var(--ink-mute)",
                  display: "grid",
                  placeItems: "center",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {s < step ? "✓" : s}
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: s === step ? 800 : 600,
                  color: s === step ? "var(--ink)" : "var(--ink-mute)",
                }}
              >
                {["Vendor", "Sources", "Generation", "Preview"][s - 1]}
              </span>
              {s < 4 ? (
                <div style={{ flex: 1, height: 2, background: "var(--line)", margin: "0 4px" }} />
              ) : null}
            </div>
          ))}
        </div>

        <div style={{ padding: "24px 28px 18px" }}>{children}</div>

        <div
          style={{
            padding: "14px 28px",
            borderTop: "1px solid var(--line-soft)",
            background: "var(--surface-soft)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button className="la-btn ghost" style={{ padding: "9px 14px", fontSize: 13 }}>
            ← Back
          </button>
          <button className="la-btn" style={{ padding: "9px 18px", fontSize: 13 }}>
            {step === 4 ? "Publish certification" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function CertWizardStep1() {
  return (
    <WizardShell
      step={1}
      title="Vendor + metadata"
      sub="Start with the basics. Everything is editable after publish."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Field label="Vendor">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["AWS", "Azure", "GCP", "IBM", "Other"].map((v, i) => {
              const c = VENDOR_C[v];
              const sel = i === 0;
              return (
                <button
                  key={v}
                  type="button"
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: sel ? (c?.bg ?? "var(--bg-2)") : "#fff",
                    border: sel
                      ? `1.5px solid ${c?.fg ?? "var(--brand-1)"}`
                      : "1px solid var(--line)",
                    color: sel ? (c?.fg ?? "var(--ink)") : "var(--ink-soft)",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </Field>
        <Field label="Level">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Fundamentals", "Associate", "Professional", "Specialty", "Expert"].map((v, i) => (
              <button
                key={v}
                type="button"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: i === 1 ? "var(--brand-grad)" : "#fff",
                  color: i === 1 ? "#fff" : "var(--ink-soft)",
                  border: i === 1 ? "none" : "1px solid var(--line)",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Exam code">
          <Input placeholder="SAA-C03" />
        </Field>
        <Field label="Title">
          <Input placeholder="AWS Solutions Architect — Associate" />
        </Field>
        <Field label="Official certification page (vendor URL)">
          <Input
            placeholder="https://aws.amazon.com/certification/certified-solutions-architect-associate/"
            full
          />
        </Field>
        <Field label="Short description" full>
          <Textarea placeholder="One sentence shown on the certification card." />
        </Field>
      </div>
    </WizardShell>
  );
}

export function CertWizardStep2() {
  return (
    <WizardShell
      step={2}
      title="Sources (URLs)"
      sub="Add the official vendor docs the AI will cite. URLs are restricted to the vendor's own hosts."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          {
            url: "https://docs.aws.amazon.com/saa-c03/study-guide.pdf",
            type: "Study guide",
            ok: true,
          },
          {
            url: "https://docs.aws.amazon.com/saa-c03/exam-guide.pdf",
            type: "Exam guide",
            ok: true,
          },
          { url: "https://aws.amazon.com/certification/...", type: "Cert page", ok: true },
        ].map((s) => (
          <div
            key={s.url}
            className="la-card"
            style={{
              padding: 14,
              display: "grid",
              gridTemplateColumns: "auto 1fr 110px 30px",
              gap: 12,
              alignItems: "center",
              background: "var(--surface-soft)",
            }}
          >
            <Icon.check color="var(--ok)" />
            <div>
              <div className="la-mono" style={{ fontSize: 12, fontWeight: 700 }}>
                {s.url}
              </div>
              <div
                className="la-mono"
                style={{ fontSize: 10.5, color: "var(--ink-mute)", marginTop: 2 }}
              >
                {s.type} · vendor-owned · allowlisted
              </div>
            </div>
            <span
              className="la-pill"
              style={{ background: "var(--ok-bg)", color: "var(--ok)", fontSize: 11 }}
            >
              ✓ Allowed
            </span>
            <button className="la-iconbtn">✕</button>
          </div>
        ))}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 8,
            padding: 14,
            borderRadius: 12,
            border: "1.5px dashed var(--line)",
            background: "#fff",
          }}
        >
          <Input
            placeholder="Paste a vendor URL · only docs.aws.amazon.com / learn.microsoft.com / cloud.google.com / ibm.com"
            full
          />
          <button className="la-btn ghost" style={{ padding: "8px 12px", fontSize: 12 }}>
            + Add
          </button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--ink-mute)" }}>
          We refuse non-vendor URLs (no exam dumps, brain dumps, scraped content). The allowlist
          lives in <code>lib/certifications/source-policy.ts</code>.
        </p>
      </div>
    </WizardShell>
  );
}

export function CertWizardStep3() {
  return (
    <WizardShell
      step={3}
      title="Generation config"
      sub="Choose chunk size, difficulty mix, and the AI provider that synthesises the questions."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}>
        <Field label="Chunk size">
          <SegRow opts={["250 tok", "500 tok", "1000 tok"]} activeIdx={1} />
        </Field>
        <Field label="Chunk overlap">
          <SegRow opts={["0%", "20%", "40%"]} activeIdx={1} />
        </Field>
        <Field label="Difficulty mix" full>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { l: "Easy", pct: 30, c: "var(--ok)" },
              { l: "Medium", pct: 50, c: "var(--warn)" },
              { l: "Hard", pct: 20, c: "var(--bad)" },
            ].map((d) => (
              <div
                key={d.l}
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--surface-soft)",
                  textAlign: "center",
                }}
              >
                <div
                  className="la-mono"
                  style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".08em" }}
                >
                  {d.l.toUpperCase()}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: d.c, marginTop: 4 }}>
                  {d.pct}%
                </div>
              </div>
            ))}
          </div>
        </Field>
        <Field label="Question types">
          <SegRow opts={["SC", "MC", "T/F", "Scenario"]} activeIdx={0} />
        </Field>
        <Field label="Target count">
          <Input placeholder="500" />
        </Field>
        <Field label="AI provider" full>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: "1.5px solid var(--brand-1)",
                background: "var(--bg-2)",
                textAlign: "left",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🌐</span>
                <span style={{ fontWeight: 800 }}>OllaBridge Cloud</span>
                <span
                  className="la-pill"
                  style={{ background: "var(--brand-grad)", color: "#fff", fontSize: 10 }}
                >
                  DEFAULT
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                qwen2.5:14b · cited generation
              </div>
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: 14,
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "#fff",
                textAlign: "left",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>🤖</span>
                <span style={{ fontWeight: 800 }}>OpenAI gpt-4o-mini</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
                Fallback · paid · $0.15 / 1M tok
              </div>
            </button>
          </div>
        </Field>
      </div>
    </WizardShell>
  );
}

export function CertWizardStep4() {
  return (
    <WizardShell
      step={4}
      title="Preview & publish"
      sub="3 sample questions generated from your sources. Approve them and publish, or regenerate."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[
          {
            q: "A workload requires multi-AZ resilience without architectural changes. Which feature provides this with the least operational overhead?",
            opts: [
              "ALB cross-zone load balancing",
              "Auto Scaling group across AZs",
              "AWS Lambda migration",
              "AMI snapshots",
            ],
            correct: 1,
            src: "docs.aws.amazon.com/autoscaling — Benefits",
          },
          {
            q: "Which AWS service provides a centrally-managed allowed-host list for outbound HTTPS traffic from VPCs?",
            opts: ["AWS WAF", "AWS Network Firewall", "Amazon GuardDuty", "AWS Shield"],
            correct: 1,
            src: "docs.aws.amazon.com/network-firewall — Suricata rules",
          },
        ].map((q, i) => (
          <div key={i} className="la-card" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span
                className="la-mono"
                style={{ fontSize: 11, color: "var(--ink-mute)", letterSpacing: ".08em" }}
              >
                SAMPLE {i + 1} / 3
              </span>
              <span
                className="la-pill"
                style={{ background: "var(--ok-bg)", color: "var(--ok)", fontSize: 10.5 }}
              >
                ✓ Cited
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.5, marginBottom: 10 }}>
              {q.q}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {q.opts.map((o, j) => (
                <div
                  key={o}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    background: j === q.correct ? "var(--ok-bg)" : "var(--surface-soft)",
                    border: j === q.correct ? "1.5px solid var(--ok)" : "1px solid var(--line)",
                    fontSize: 13,
                    color: j === q.correct ? "var(--ok)" : "var(--ink-soft)",
                    fontWeight: j === q.correct ? 700 : 500,
                  }}
                >
                  {String.fromCharCode(65 + j)} · {o}
                </div>
              ))}
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 11,
                color: "var(--ink-mute)",
                fontFamily: "var(--font-mono)",
              }}
            >
              📎 {q.src}
            </div>
          </div>
        ))}
        <button
          className="la-btn ghost"
          style={{ padding: "10px 14px", fontSize: 13, alignSelf: "flex-start" }}
        >
          ↻ Regenerate samples
        </button>
      </div>
    </WizardShell>
  );
}

// ─── Form helpers ─────────────────────────────────────────────────

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label style={{ display: "block", gridColumn: full ? "1 / -1" : undefined }}>
      <span
        className="la-mono"
        style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".06em", fontWeight: 700 }}
      >
        {label.toUpperCase()}
      </span>
      <div style={{ marginTop: 6 }}>{children}</div>
    </label>
  );
}

function Input({ placeholder, full }: { placeholder: string; full?: boolean }) {
  return (
    <input
      placeholder={placeholder}
      style={{
        width: full ? "100%" : 240,
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--line)",
        fontFamily: "inherit",
        fontSize: 13,
        background: "#fff",
      }}
    />
  );
}

function Textarea({ placeholder }: { placeholder: string }) {
  return (
    <textarea
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid var(--line)",
        fontFamily: "inherit",
        fontSize: 13,
        background: "#fff",
        resize: "vertical",
      }}
    />
  );
}

function SegRow({ opts, activeIdx }: { opts: string[]; activeIdx: number }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {opts.map((o, i) => (
        <button
          key={o}
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            background: i === activeIdx ? "var(--brand-grad)" : "#fff",
            color: i === activeIdx ? "#fff" : "var(--ink-soft)",
            border: i === activeIdx ? "none" : "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
