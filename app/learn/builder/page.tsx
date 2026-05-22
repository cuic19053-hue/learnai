import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, RecommendationCard } from "@/components/learn/SecondaryCards";
import { getLearnerDisplayName, isAuthenticated } from "@/lib/learn/learner-name";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Builder",
  description: "Project-first learning with hints and feedback for ages 12–15.",
};

// getServerSession (via isAuthenticated) can't run during SSG.
export const dynamic = "force-dynamic";

export default async function BuilderPage() {
  const learnerName = await getLearnerDisplayName();
  const signedIn = await isAuthenticated();
  const world = WORLDS.builder;
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
        Welcome back, {learnerName} 👋
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        You&apos;re 30 minutes from finishing your Python calculator project.
      </p>

      <MissionCard
        journey={journey}
        title="Build a calculator in Python"
        description="Last time you wrote the add() function. Today: handle division by zero — and make Nova proud."
        currentStep={4}
        meta="~12 min · +60 XP"
        ctaHref="/learn/lesson/builder"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "Logic gates: AND, OR, NOT",
                subtitle: "Coding · 6 mins left",
                progress: 70,
                href: "/learn/lesson/builder",
              },
              {
                title: "Algebra: solving for x",
                subtitle: "Math · 12 mins left",
                progress: 30,
                href: "/learn/lesson/builder",
              },
            ]}
          />
        ) : null}
        <RecommendationCard
          journey={journey}
          emoji="🧩"
          title="Try a logic puzzle before today's mission"
          body="Yesterday's session showed you flew through patterns but slowed on edge cases. 10-min warm-up sharpens both."
        />
      </div>
    </LearnerHomeShell>
  );
}
