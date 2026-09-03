import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLearnerDisplayName } from "@/lib/learn/learner-name";
import {
  resolveActiveMission,
  STEP_LABELS,
  PRACTICE_TRACKS,
  type MissionView,
  type StepView,
} from "@/lib/builder/missions";
import { prisma } from "@/lib/prisma";
import { BuilderContinueButton } from "@/components/learn/builder/BuilderContinueButton";

export const metadata: Metadata = {
  title: "GRADE_8 Academy",
  description:
    "Enterprise-grade GRADE_8 portal · Hook → Explain → Practice → Feedback → Reflect → Evolve loops, project-first learning for ages 12-15.",
};

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
  { ic: "🏠", l: "Home", href: "/learn/GRADE_8", active: true },
  { ic: "🎯", l: "My missions", href: "/learn/GRADE_8?tab=missions", active: false },
  { ic: "🛠️", l: "Projects", href: "/learn/projects?world=GRADE_8", active: false },
  { ic: "📚", l: "Library", href: "/learn/wiki?world=GRADE_8", active: false },
  { ic: "🏅", l: "Achievements", href: "/learn/GRADE_8?tab=achievements", active: false },
  { ic: "🌍", l: "Switch world", href: "/learn/journeys", active: false },
] as const;

async function getUserXp(userId: string | null): Promise<number> {
  if (!userId) return 1240;
  try {
    const row = await prisma.userProgress.findUnique({ where: { userId } });
    return row?.xp ?? 0;
  } catch {
    return 0;
  }
}

export default async function GRADE_8Page() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;
  const learnerName = await getLearnerDisplayName();
  const mission = await resolveActiveMission(userId);
  const xp = await getUserXp(userId);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#020617",
        display: "grid",
        gridTemplateColumns: "280px 1fr",
      }}
    >
      <GRADE_8Sidebar />
      <section style={{ padding: "32px 40px" }}>
        <GRADE_8Header today={today} learnerName={learnerName} xp={xp} />
        <div
          className="GRADE_8-portal-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <TodaysMission mission={mission} />
            <ContinuePracticing />
          </div>
          <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <NovaRecommends />
            <EnterpriseEssentials mission={mission} />
          </aside>
        </div>
      </section>
      {/* Collapse the right rail on narrow viewports so the portal stays
          usable on a tablet without rebuilding the whole layout. */}
      <style>{`
        @media (max-width: 1100px) {
          .GRADE_8-portal-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 760px) {
          [data-GRADE_8-shell] { grid-template-columns: 1fr !important; }
          [data-GRADE_8-sidebar] { border-right: none; border-bottom: 1px solid #e2e8f0; }
        }
      `}</style>
    </div>
  );
}

function GRADE_8Sidebar() {
  return (
    <aside
      data-GRADE_8-sidebar
      style={{
        borderRight: "1px solid #e2e8f0",
        background: "#fff",
        padding: "24px 20px",
        position: "sticky",
        top: 0,
        alignSelf: "start",
        height: "100vh",
      }}
    >
      <Link
        href="/learn/GRADE_8"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 32,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 14,
            background: "#020617",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          B
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>
            GRADE_8 Academy
          </div>
          <div style={{ fontSize: 12, color: "#64748b" }}>Learning portal</div>
        </div>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {NAV_ITEMS.map((it) => (
          <Link
            key={it.l}
            href={it.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              background: it.active ? "#020617" : "transparent",
              color: it.active ? "#fff" : "#475569",
              boxShadow: it.active ? "0 4px 12px rgba(2,6,23,.15)" : "none",
            }}
          >
            <span style={{ fontSize: 18 }}>{it.ic}</span> {it.l}
          </Link>
        ))}
      </nav>

      <div
        style={{
          marginTop: 32,
          padding: 16,
          borderRadius: 22,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: ".18em",
            color: "#94a3b8",
            marginBottom: 12,
          }}
        >
          YOUR TEACHER
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 22,
              boxShadow: "0 2px 6px rgba(0,0,0,.06)",
            }}
          >
            🦉
          </div>
          <div>
            <div style={{ fontWeight: 800 }}>Nova</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 11.5,
                color: "#059669",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 99, background: "#10b981" }} />
              Online
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function GRADE_8Header({
  today,
  learnerName,
  xp,
}: {
  today: string;
  learnerName: string;
  xp: number;
}) {
  return (
    <header
      style={{
        marginBottom: 24,
        padding: 20,
        borderRadius: 22,
        border: "1px solid #e2e8f0",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#64748b" }}>{today}</div>
        <h1
          style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "4px 0 6px" }}
        >
          Welcome back, {learnerName} 👋
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: 0, maxWidth: 540 }}>
          You&apos;re 30 minutes from finishing your Python calculator project.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 16px",
          borderRadius: 16,
          background: "#f8fafc",
        }}
      >
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "#94a3b8",
            }}
          >
            Level
          </div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>GRADE_8 · {xp.toLocaleString()} XP</div>
        </div>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: "#e0e7ff",
            display: "grid",
            placeItems: "center",
            fontSize: 22,
          }}
        >
          🏅
        </div>
      </div>
    </header>
  );
}

function TodaysMission({ mission }: { mission: MissionView }) {
  const current = mission.currentStep;
  const ctaLabel = current ? STEP_LABELS[current.type] : "Recap";
  const isSeed = mission.id.startsWith("seed-");

  return (
    <section
      style={{
        borderRadius: 32,
        border: "1px solid #e2e8f0",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: 26, borderBottom: "1px solid #f1f5f9" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              padding: "5px 14px",
              borderRadius: 99,
              background: "#eef2ff",
              color: "#4338ca",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".04em",
              textTransform: "uppercase",
            }}
          >
            Today&apos;s mission · {mission.completedSteps} of {mission.totalSteps} completed
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
            ~{mission.estimatedMinutes} min · +{mission.xpReward} XP
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ maxWidth: 580 }}>
            <h2
              style={{
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "-0.02em",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              {mission.title}
            </h2>
            <p
              style={{ marginTop: 10, color: "#475569", fontSize: 14, lineHeight: 1.55 }}
              // Allow inline <code>; description is a fixed string we own.
              dangerouslySetInnerHTML={{ __html: linkifyCode(mission.description) }}
            />
          </div>
          <BuilderContinueButton
            stepId={current?.id ?? null}
            stepLabel={ctaLabel}
            isSeed={isSeed}
          />
        </div>
      </div>

      <div
        style={{
          padding: 26,
          display: "grid",
          gridTemplateColumns: "220px 1fr",
          gap: 20,
        }}
      >
        <LoopProgressCard mission={mission} />
        <LoopTileGrid steps={mission.steps} />
      </div>
    </section>
  );
}

function LoopProgressCard({ mission }: { mission: MissionView }) {
  return (
    <div style={{ padding: 20, borderRadius: 24, background: "#f8fafc" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 800 }}>Loop progress</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: "#4338ca" }}>
          {mission.progressPercent}%
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 99,
          background: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${mission.progressPercent}%`,
            height: "100%",
            background: "#4f46e5",
            borderRadius: 99,
            transition: "width 220ms ease-out",
          }}
        />
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b", marginTop: 12 }}>
        {mission.completedSteps}/{mission.totalSteps} steps complete
      </div>
    </div>
  );
}

function LoopTileGrid({ steps }: { steps: StepView[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}
    >
      {steps.map((s) => {
        const done = s.loopState === "Done";
        const cur = s.loopState === "Current step";
        const locked = s.loopState === "Locked";
        return (
          <div
            key={s.id}
            style={{
              padding: 14,
              borderRadius: 20,
              border: "1px solid " + (cur ? "#c7d2fe" : done ? "#bbf7d0" : "#e2e8f0"),
              background: cur ? "#eef2ff" : done ? "#ecfdf5" : "#f8fafc",
              opacity: locked ? 0.65 : 1,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{s.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                {done ? "✓" : cur ? "Now" : locked ? "🔒" : ""}
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>{STEP_LABELS[s.type]}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginTop: 2 }}>
              {s.loopState}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ContinuePracticing() {
  return (
    <section>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Continue practicing</h2>
        <Link
          href="/learn/GRADE_8?tab=missions"
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: "#4338ca",
            textDecoration: "none",
          }}
        >
          View all
        </Link>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {PRACTICE_TRACKS.map((c) => (
          <Link
            key={c.slug}
            href={`/learn/lesson/GRADE_8?mission=${c.slug}`}
            style={{
              padding: 20,
              borderRadius: 24,
              border: "1px solid #e2e8f0",
              background: "#fff",
              boxShadow: "0 1px 2px rgba(0,0,0,.04)",
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div
              style={{
                height: 100,
                borderRadius: 16,
                background: c.gradient,
                marginBottom: 18,
              }}
            />
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 14,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{c.title}</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>{c.subtitle}</p>
              </div>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: 99,
                  background: "#f1f5f9",
                  fontWeight: 800,
                }}
              >
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function NovaRecommends() {
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 32,
        border: "1px solid #e2e8f0",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "#fef3c7",
            display: "grid",
            placeItems: "center",
            fontSize: 22,
          }}
        >
          🦉
        </div>
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".18em",
              color: "#94a3b8",
            }}
          >
            NOVA RECOMMENDS
          </div>
          <h2 style={{ margin: "2px 0 0", fontSize: 15, fontWeight: 900, lineHeight: 1.3 }}>
            Try a logic puzzle before today&apos;s mission
          </h2>
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
        Yesterday&apos;s session showed you flew through patterns but slowed on edge cases. A
        10-minute warm-up sharpens both.
      </p>
      <Link
        href="/learn/lesson/GRADE_8?mission=logic-gates"
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 18,
          padding: "12px",
          borderRadius: 14,
          fontSize: 13.5,
          fontWeight: 800,
          background: "#4f46e5",
          color: "#fff",
          textDecoration: "none",
          boxShadow: "0 4px 14px rgba(79,70,229,.3)",
        }}
      >
        Start warm-up
      </Link>
    </section>
  );
}

function EnterpriseEssentials({ mission }: { mission: MissionView }) {
  const onTrack = mission.progressPercent >= 50;
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 32,
        border: "1px solid #e2e8f0",
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      <h2 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 900 }}>Enterprise essentials</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <EntRow label="Current mission" value={onTrack ? "On track" : "Catch up"} tone="ok" />
        <EntRow label="Skill evidence" value={`${mission.completedSteps} artifacts`} />
        <EntRow label="Next review" value="Friday" />
      </div>
    </section>
  );
}

function EntRow({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderRadius: 14,
        background: "#f8fafc",
        fontSize: 13,
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      <span style={{ fontWeight: 800, color: tone === "ok" ? "#059669" : "#020617" }}>{value}</span>
    </div>
  );
}

// Replace literal "add()" (and similar bare identifiers wrapped in
// backticks) with an inline code element. Authored content is trusted
// — we only own the seed strings, not arbitrary user input.
function linkifyCode(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /\badd\(\)/g,
      '<code style="padding:1px 6px;border-radius:4px;background:#f1f5f9;font-family:var(--font-mono)">add()</code>'
    );
}
