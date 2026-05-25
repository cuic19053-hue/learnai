import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, RecommendationCard } from "@/components/learn/SecondaryCards";
import { getLearnerDisplayName, isAuthenticated } from "@/lib/learn/learner-name";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Explorer",
  description: "Quests, badges, and short curiosity lessons for ages 7–11.",
};

// getServerSession (via isAuthenticated) can't run during SSG.
export const dynamic = "force-dynamic";

export default async function ExplorerPage() {
  const learnerName = await getLearnerDisplayName();
  const signedIn = await isAuthenticated();
  const world = WORLDS.explorer;
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
        Today&apos;s quest: discover how volcanoes work — and earn a Science Explorer badge.
      </p>

      <MissionCard
        journey={journey}
        kicker="TODAY'S QUEST"
        title="Why does a volcano erupt? 🌋"
        description="Watch a 2-minute explainer, drag the labels onto the diagram, then answer 3 quick questions."
        currentStep={3}
        ctaLabel="Resume quest"
        meta="~8 min · 🏅 Science Explorer"
        ctaHref="/learn/lesson/explorer?mission=explorer-volcano"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "How clouds make rain",
                subtitle: "Science · 4 mins left",
                progress: 60,
                href: "/learn/lesson/explorer?mission=explorer-clouds",
              },
              {
                title: "Reading: tiger cubs",
                subtitle: "Reading · 9 mins left",
                progress: 25,
                href: "/learn/lesson/explorer?mission=explorer-reading",
              },
            ]}
          />
        ) : null}
        <RecommendationCard
          journey={journey}
          teacherName="Luna"
          emoji="📖"
          title="A 5-minute story before science"
          body="Quick story warm-ups help you focus. Today's story features a curious fox who finds a volcano."
          ctaLabel="Start story"
        />
      </div>
    </LearnerHomeShell>
  );
}
