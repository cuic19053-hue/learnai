import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, WikiTestPromoCard } from "@/components/learn/SecondaryCards";
import WhyThisButton from "@/components/learn/WhyThisButton";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Scholar",
  description: "Exam preparation, weak-area focus, and study plans for ages 16–18.",
};

export default function ScholarPage() {
  const world = WORLDS.scholar;
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
      pageContext={{ kind: "world-home", worldLabel: world.journey.name, topic: "Trigonometry: sine and cosine basics" }}
    >
      <div className="text-[13px] text-ink-mute">{today}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        Welcome back, Jess 👋
      </h1>
      <p className="mt-1 mb-6 text-[15px] text-ink-soft">
        Trigonometry is your weakest area. 25-minute focused session today moves you up a band.{" "}
        <WhyThisButton
          reason="You scored 42% on trigonometry across your last 3 drills — the lowest of any topic this week."
          details={[
            "Diagnostic on May 14: sin/cos mistakes on 4 of 7 questions",
            "Last attempt (May 19): 8 min spent, 3 of 5 incorrect",
            "Adjacent topics you're strong on: algebra (78%), probability (75%)",
          ]}
        />
      </p>

      <MissionCard
        journey={journey}
        kicker="TODAY'S SESSION"
        title="Trigonometry: sine and cosine basics"
        description="Concept refresher, two worked examples, then 5 exam-style questions with feedback. Teach-until-learned loop on misses."
        currentStep={2}
        ctaLabel="Start session"
        meta="~25 min · +90 XP"
        ctaHref="/learn/lesson/scholar"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ContinueCard
          journey={journey}
          items={[
            { title: "Algebra: quadratic equations", subtitle: "Math · 68% mastery", progress: 68 },
            { title: "Probability fundamentals", subtitle: "Math · 75% mastery", progress: 75 },
          ]}
        />
        <WikiTestPromoCard worldLabel="Scholar" teacherName="Mentor Max" />
      </div>
    </LearnerHomeShell>
  );
}
