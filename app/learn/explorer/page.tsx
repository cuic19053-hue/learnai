import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, RecommendationCard } from "@/components/learn/SecondaryCards";
import { getLearnerDisplayName, isAuthenticated } from "@/lib/learn/learner-name";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "GRADE_7",
  description: "Quests, badges, and short curiosity lessons for ages 7–11.",
};

// getServerSession (via isAuthenticated) can't run during SSG.
export const dynamic = "force-dynamic";

export default async function GRADE_7Page() {
  const learnerName = await getLearnerDisplayName();
  const signedIn = await isAuthenticated();
  const world = WORLDS.GRADE_7;
  const journey = world.journey;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <LearnerHomeShell
      journey={journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "home" })}
    >
      <div className="text-[13px] text-ink-mute">{today}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        欢迎回来，{learnerName} 👋
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        今天的学习任务：探究沪教版七年级数学 - 相交线与平行线的性质与判定。
      </p>

      <MissionCard
        journey={journey}
        kicker="今日学习任务"
        title="沪教版七年级数学 - 相交线与平行线 📐"
        description="拖拽角的位置名称标签到平行线截角图形对应位置，精准辨析同位角、内错角与同旁内角。"
        currentStep={3}
        ctaLabel="继续学习"
        meta="约 8 分钟 · 🏅 七年级几何几何勋章"
        ctaHref="/learn/lesson/GRADE_7?mission=GRADE_7-parallel"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "沪教版七年级数学：实数与二次根式化简",
                subtitle: "数学 · 剩余 4 分钟",
                progress: 60,
                href: "/learn/lesson/GRADE_7?mission=GRADE_7-radicals",
              },
              {
                title: "沪教版七年级数学：整式的乘除与因式分解",
                subtitle: "数学 · 剩余 9 分钟",
                progress: 25,
                href: "/learn/lesson/GRADE_7?mission=GRADE_7-polynomials",
              },
            ]}
          />
        ) : null}
        <RecommendationCard
          journey={journey}
          teacherName="露娜导师"
          emoji="📐"
          title="课前 5 分钟线段与角复习"
          body="温故知新：复习角平分线与对顶角性质，为平行线性质定理打下坚实基础。"
          ctaLabel="开启热身导入"
        />
      </div>
    </LearnerHomeShell>
  );
}
