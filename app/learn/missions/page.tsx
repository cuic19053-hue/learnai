import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "My missions",
  description: "Active, completed, and locked missions in your learning journey.",
};

type Mission = {
  title: string;
  subject: string;
  status: "active" | "completed" | "locked";
  progressPct: number;
};

const SAMPLE: Record<string, Mission[]> = {
  kids: [
    {
      title: "Count jungle animals with Milo",
      subject: "Numbers",
      status: "active",
      progressPct: 30,
    },
    { title: "Find the letter A", subject: "Letters", status: "active", progressPct: 0 },
    { title: "Match the colours", subject: "Colours", status: "locked", progressPct: 0 },
  ],
  explorer: [
    { title: "Why does a volcano erupt?", subject: "Science", status: "active", progressPct: 50 },
    {
      title: "How do clouds make rain?",
      subject: "Science",
      status: "completed",
      progressPct: 100,
    },
    { title: "Solve the river puzzle", subject: "Logic", status: "active", progressPct: 20 },
  ],
  builder: [
    { title: "Build a calculator in Python", subject: "Coding", status: "active", progressPct: 67 },
    { title: "Logic gates: AND, OR, NOT", subject: "Coding", status: "active", progressPct: 30 },
    { title: "Algebra: solving for x", subject: "Math", status: "completed", progressPct: 100 },
    { title: "Build a tic-tac-toe game", subject: "Coding", status: "locked", progressPct: 0 },
  ],
  scholar: [
    { title: "Trigonometry: sine & cosine", subject: "Math", status: "active", progressPct: 40 },
    { title: "Probability fundamentals", subject: "Math", status: "active", progressPct: 75 },
    { title: "Practice exam: Set A", subject: "Exam", status: "locked", progressPct: 0 },
  ],
  adult: [
    {
      title: "VPC networking: subnets & routes",
      subject: "Cloud",
      status: "active",
      progressPct: 50,
    },
    { title: "IAM policies in practice", subject: "Security", status: "active", progressPct: 55 },
    {
      title: "S3 lifecycle & storage classes",
      subject: "Storage",
      status: "active",
      progressPct: 40,
    },
    { title: "Mock SAA-C03: Block 2", subject: "Exam", status: "locked", progressPct: 0 },
  ],
  senior: [
    {
      title: "Spotting scam messages",
      subject: "Digital safety",
      status: "active",
      progressPct: 60,
    },
    { title: "Use WhatsApp safely", subject: "Digital safety", status: "active", progressPct: 0 },
  ],
};

export default async function MissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const missions = SAMPLE[world.slug] ?? [];

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "missions" })}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← Back to {world.journey.name} home
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        My missions
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        {missions.length} mission{missions.length === 1 ? "" : "s"} in the {world.journey.name}{" "}
        world.
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {missions.map((m, i) => (
          <MissionRow key={i} mission={m} accent={world.journey.color} />
        ))}
      </div>
    </LearnerHomeShell>
  );
}

function MissionRow({ mission, accent }: { mission: Mission; accent: string }) {
  const isLocked = mission.status === "locked";
  const isDone = mission.status === "completed";
  const badge = isDone ? "Completed" : isLocked ? "Locked" : `${mission.progressPct}%`;
  const badgeColor = isDone ? "var(--j-little)" : isLocked ? "var(--ink-mute)" : accent;
  return (
    <div
      className="la-card flex items-center gap-4 p-4"
      style={{ borderRadius: 16, opacity: isLocked ? 0.65 : 1 }}
    >
      <div
        className="grid h-12 w-12 place-items-center rounded-2xl text-2xl"
        style={{ background: `${accent}1f` }}
        aria-hidden
      >
        {isDone ? "✓" : isLocked ? "🔒" : "🎯"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="truncate text-[15px] font-bold text-ink">{mission.title}</h3>
          <span
            className="la-pill text-[11px]"
            style={{
              background: "#fff",
              boxShadow: `0 0 0 1px ${badgeColor}40`,
              color: badgeColor,
            }}
          >
            {badge}
          </span>
        </div>
        <div className="mt-1 text-[12px] text-ink-mute">{mission.subject}</div>
        <div className="mt-2 h-1 rounded-sm" style={{ background: "var(--bg-2)" }}>
          <div
            className="h-full rounded-sm"
            style={{ width: `${mission.progressPct}%`, background: accent }}
          />
        </div>
      </div>
      {!isLocked ? (
        <Link
          href="/learn/lesson/builder"
          className="rounded-xl px-3 py-2 text-[13px] font-bold text-white"
          style={{ background: accent }}
        >
          {isDone ? "Review" : "Resume"} <Arrow color="#fff" />
        </Link>
      ) : null}
    </div>
  );
}
