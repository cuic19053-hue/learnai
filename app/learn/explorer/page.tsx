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
        今天的学习任务：探究沪教版七年级生命科学 - 显微镜的使用。
      </p>

      <MissionCard
        journey={journey}
        kicker="今日学习任务"
        title="沪教版七年级生命科学 - 显微镜的使用 🔬"
        description="观看 2 分钟动画讲解，拖拽部件标签至显微镜结构图对应位置，完成 3 道随堂即时测验。"
        currentStep={3}
        ctaLabel="继续学习"
        meta="约 8 分钟 · 🏅 七年级生命科学勋章"
        ctaHref="/learn/lesson/GRADE_7?mission=GRADE_7-volcano"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "自然地理：水循环与降水",
                subtitle: "地理 · 剩余 4 分钟",
                progress: 60,
                href: "/learn/lesson/GRADE_7?mission=GRADE_7-clouds",
              },
              {
                title: "语文阅读：动物观察与心理推断",
                subtitle: "语文 · 剩余 9 分钟",
                progress: 25,
                href: "/learn/lesson/GRADE_7?mission=GRADE_7-reading",
              },
            ]}
          />
        ) : null}
        <RecommendationCard
          journey={journey}
          teacherName="露娜导师"
          emoji="📖"
          title="课前 5 分钟趣味导入"
          body="课前热身故事有助于集中注意力。今天的内容将带领你一起探索微观世界的奥秘。"
          ctaLabel="开启热身导入"
        />
      </div>
    </LearnerHomeShell>
  );
}
