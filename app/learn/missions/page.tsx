import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";
import { MISSIONS, type Mission } from "@/lib/learn/missions";

export const metadata: Metadata = {
  title: "My missions",
  description: "Active, completed, and locked missions in your learning journey.",
};

export default async function MissionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const missions = MISSIONS[world.slug] ?? [];

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
        ← 返回{world.journey.name}首页
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        我的任务
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        {world.journey.name}阶段共包含 {missions.length} 项核心学习任务。
      </p>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {missions.map((m) => (
          <MissionRow
            key={m.id}
            mission={m}
            accent={world.journey.color}
            // Resume routes per mission. The lesson route reads the
            // `mission` query param and looks up the practice payload
            // — so a Professional VPC mission no longer opens the
            // GRADE_7 volcano practice.
            lessonHref={`/learn/lesson/${world.slug}?mission=${m.id}`}
          />
        ))}
      </div>
    </LearnerHomeShell>
  );
}

function MissionRow({
  mission,
  accent,
  lessonHref,
}: {
  mission: Mission;
  accent: string;
  lessonHref: string;
}) {
  const isLocked = mission.status === "locked";
  const isDone = mission.status === "completed";
  const badge = isDone ? "已完成" : isLocked ? "未解锁" : `${mission.progressPct}%`;
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
          href={lessonHref}
          className="rounded-xl px-3 py-2 text-[13px] font-bold text-white"
          style={{ background: accent }}
        >
          {isDone ? "复习" : "继续学习"} <Arrow color="#fff" />
        </Link>
      ) : null}
    </div>
  );
}
