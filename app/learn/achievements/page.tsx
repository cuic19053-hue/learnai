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
  GRADE_6: [
    { emoji: "🔢", name: "分数运算达人", desc: "完成了分数的通分与四则运算任务。", earned: true },
    { emoji: "📏", name: "长方体小能手", desc: "成功测算长方体表面积与容积。", earned: true },
    { emoji: "📐", name: "数轴探索者", desc: "掌握有理数加减法与数轴对应关系。", earned: false },
  ],
  GRADE_7: [
    { emoji: "📐", name: "平行线性质勋章", desc: "完成了平行线截角性质探究任务。", earned: true },
    { emoji: "✂️", name: "因式分解大师", desc: "掌握十字相乘法与平方差公式。", earned: true },
    { emoji: "🧩", name: "二次根式化简能手", desc: "完成 10 道二次根式最简形式化简题。", earned: false },
  ],
  GRADE_8: [
    { emoji: "📊", name: "一次函数分析师", desc: "掌握一次函数图象与 k、b 符号规律。", earned: true },
    { emoji: "🔥", name: "求根公式专家", desc: "熟练运用 b²-4ac 解一元二次方程。", earned: true },
    { emoji: "📐", name: "全等三角形几何神童", desc: "熟练运用 SAS/ASA 进行几何证明。", earned: true },
    { emoji: "📐", name: "勾股定理巧用", desc: "解决几何图形折叠与最短路径问题。", earned: false },
  ],
  GRADE_9: [
    { emoji: "🎓", name: "中考三角函数全胜", desc: "在锐角三角函数测量应用中获得满分。", earned: true },
    { emoji: "📈", name: "相似三角形与圆", desc: "攻克近 5 年上海中考第 24 题切线证明。", earned: true },
    { emoji: "📝", name: "上海中考数学压轴突破", desc: "成功解答二次函数顶点式与动点综合题。", earned: false },
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
