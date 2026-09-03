import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, WikiTestPromoCard } from "@/components/learn/SecondaryCards";
import WhyThisButton from "@/components/learn/WhyThisButton";
import { getLearnerDisplayName, isAuthenticated } from "@/lib/learn/learner-name";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "GRADE_9",
  description: "Exam preparation, weak-area focus, and study plans for ages 16–18.",
};

// getServerSession (via isAuthenticated) can't run during SSG.
export const dynamic = "force-dynamic";

export default async function GRADE_9Page() {
  const learnerName = await getLearnerDisplayName();
  const signedIn = await isAuthenticated();
  const world = WORLDS.GRADE_9;
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
      pageContext={{
        kind: "world-home",
        worldLabel: world.journey.name,
        topic: "Trigonometry: sine and cosine basics",
      }}
    >
      <div className="text-[13px] text-ink-mute">{today}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        欢迎回来，{learnerName} 👋
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        锐角三角函数是当前的薄弱知识点。今天的 25 分钟专项强化训练将助你提高分数。{" "}
        <WhyThisButton
          reason="近 3 次练习中三角函数的正确率为 42%，是本周较低的知识板块。"
          details={[
            "5月14日诊断测验：正弦/余弦定义题错 4 题",
            "上次练习（5月19日）：用时 8 分钟，5 题错 3 题",
            "已掌握的相邻板块：代数方程 (78%)，概率初步 (75%)",
          ]}
        />
      </p>

      <MissionCard
        journey={journey}
        kicker="今日中考冲刺专题"
        title="沪教版九年级数学：锐角三角函数 (sin, cos, tan)"
        description="知识点精讲、2 道典型例题解析，紧扣 5 道中考真题题型演练。AI 导师全程针对性纠错。"
        currentStep={2}
        meta="约 25 分钟 · +90 XP"
        ctaHref="/learn/lesson/GRADE_9?mission=GRADE_9-trig"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "沪教版九年级数学：一元二次方程求根公式",
                subtitle: "数学 · 68% 掌握度",
                progress: 68,
                href: "/learn/lesson/GRADE_9?mission=GRADE_9-quadratics",
              },
              {
                title: "九年级数学中考复习：概率初步与树状图",
                subtitle: "数学 · 75% 掌握度",
                progress: 75,
                href: "/learn/lesson/GRADE_9?mission=GRADE_9-probability",
              },
            ]}
          />
        ) : null}
        <WikiTestPromoCard worldLabel="初三 (九年级)" teacherName="导师 Max" />
      </div>
    </LearnerHomeShell>
  );
}
