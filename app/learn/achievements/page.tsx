import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Streaks, XP, and badges earned in your learning world.",
};

type Badge = {
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
};

const SAMPLE: Record<string, Badge[]> = {
  kids: [
    { emoji: "🌟", name: "First star", desc: "Finished your first activity.", earned: true },
    { emoji: "🦁", name: "Animal counter", desc: "Counted the jungle animals.", earned: true },
    { emoji: "🎨", name: "Colour master", desc: "Match every colour.", earned: false },
  ],
  GRADE_7: [
    { emoji: "🔬", name: "七年级生命科学勋章", desc: "完成了显微镜结构探究任务。", earned: true },
    { emoji: "🦊", name: "持之以恒", desc: "连续打卡学习 5 天。", earned: true },
    { emoji: "🧩", name: "逻辑小达人", desc: "完成 10 道逻辑思维推理题。", earned: false },
  ],
  GRADE_8: [
    { emoji: "🛠️", name: "初次尝试", desc: "编写并运行了你的第一个 Python 函数。", earned: true },
    { emoji: "🔥", name: "连续打卡 12 天", desc: "坚持每天完成一项学科练习。", earned: true },
    { emoji: "⚡", name: "神速达人", desc: "在 10 分钟内高效完成一项任务。", earned: true },
    { emoji: "🐍", name: "计算器专家", desc: "成功发布 Python 计算器防错程序。", earned: false },
    { emoji: "🧠", name: "逻辑电路宗师", desc: "在与门/或门/非门任务中斩获满分。", earned: false },
  ],
  GRADE_9: [
    { emoji: "🎓", name: "中考备战完备", desc: "通过一次全真中考模拟考试。", earned: false },
    { emoji: "📈", name: "突破自我", desc: "提升任意薄弱学科掌握度 10 分。", earned: true },
    { emoji: "📝", name: "30 天冲刺打卡", desc: "按计划坚持 30 天冲刺学习。", earned: false },
  ],
  adult: [
    { emoji: "☁️", name: "Networking sprint", desc: "Finish the VPC sprint.", earned: true },
    { emoji: "🔐", name: "Security drill", desc: "Drill IAM policies.", earned: true },
    { emoji: "📜", name: "SAA-C03 mock", desc: "Pass the SAA-C03 mock exam.", earned: false },
    { emoji: "🏆", name: "Certified", desc: "Mark a certification as earned.", earned: false },
  ],
  senior: [
    { emoji: "🛡️", name: "Scam spotter", desc: "Pass three scam-message lessons.", earned: true },
    { emoji: "🌿", name: "Calm streak", desc: "Practise for 7 calm days.", earned: false },
  ],
};

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const badges = SAMPLE[world.slug] ?? [];
  const earned = badges.filter((b) => b.earned).length;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "achievements" })}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← 返回{world.journey.name}首页
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        成就与勋章
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        在{world.journey.name}阶段已获得 {earned} / {badges.length} 枚成就勋章。
      </p>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="当前连续打卡" value={`${world.streakDays} 天`} accent="#b15c00" />
        <Stat label="累计积分" value={world.xp.toLocaleString()} accent={world.journey.color} />
        <Stat
          label="已解锁勋章"
          value={`${earned} / ${badges.length}`}
          accent="var(--brand-1)"
        />
        <Stat label="已完成课程" value="—" accent="var(--ink-mute)" />
      </div>

      {/* Badge grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b, i) => (
          <div
            key={i}
            className="la-card flex flex-col items-center p-4 text-center"
            style={{ borderRadius: 16, opacity: b.earned ? 1 : 0.55 }}
          >
            <div
              className="grid h-14 w-14 place-items-center rounded-full text-3xl"
              style={{
                background: b.earned ? `${world.journey.color}1f` : "var(--bg-2)",
                filter: b.earned ? "none" : "grayscale(0.8)",
              }}
              aria-hidden
            >
              {b.emoji}
            </div>
            <div className="mt-2 text-[13px] font-bold text-ink">{b.name}</div>
            <div className="mt-1 text-[11px] leading-snug text-ink-soft">{b.desc}</div>
            {!b.earned ? (
              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                未解锁
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </LearnerHomeShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="la-card p-4" style={{ borderRadius: 14 }}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-1 text-[22px] font-extrabold tracking-tight" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
