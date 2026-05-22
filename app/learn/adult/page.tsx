import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import MissionCard from "@/components/learn/MissionCard";
import { ContinueCard, WikiTestPromoCard } from "@/components/learn/SecondaryCards";
import WhyThisButton from "@/components/learn/WhyThisButton";
import { Arrow } from "@/components/design/icons";
import { getLearnerDisplayName, isAuthenticated } from "@/lib/learn/learner-name";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Professional",
  description: "Learning paths and certification preparation for adults.",
};

// getServerSession (via isAuthenticated) can't run during SSG.
export const dynamic = "force-dynamic";

export default async function AdultPage() {
  const learnerName = await getLearnerDisplayName();
  const signedIn = await isAuthenticated();
  const world = WORLDS.adult;
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
        topic: "VPC networking: subnets, route tables, NAT",
      }}
    >
      <div className="text-[13px] text-ink-mute">{today}</div>
      <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        Welcome back, {learnerName} 👋
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        AWS Solutions Architect track · VPC Networking is your current weak domain.{" "}
        <WhyThisButton
          reason="VPC sits at 50% mastery — the lowest of the four SAA-C03 domains in your last diagnostic."
          details={[
            "Domain 1 (Design Secure Architectures): 78%",
            "Domain 2 (Resilient Architectures): 64%",
            "Domain 3 (High-Performing): 72%",
            "Domain 4 (Cost-Optimised): 60% — second weakest",
          ]}
        />
      </p>

      <MissionCard
        journey={journey}
        kicker="TODAY'S MODULE"
        title="VPC networking: subnets, route tables, NAT"
        description="Mental model, three real-world scenarios, and two exam-grade questions. Builds toward the SAA-C03 certification."
        currentStep={3}
        ctaLabel="Open module"
        meta="~30 min · +120 XP"
        ctaHref="/learn/lesson/adult"
      />

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {!signedIn ? (
          <ContinueCard
            journey={journey}
            items={[
              {
                title: "IAM policies in practice",
                subtitle: "Security · 12 mins left",
                progress: 55,
                href: "/learn/lesson/adult",
              },
              {
                title: "S3 lifecycle and storage classes",
                subtitle: "Storage · 18 mins left",
                progress: 40,
                href: "/learn/lesson/adult",
              },
            ]}
          />
        ) : null}
        <WikiTestPromoCard worldLabel="Professional" teacherName="Professor Turing" />
      </div>

      {/* ───── AI Interview Trainer entry ───── */}
      <Link
        href="/learn/adult/interview"
        className="la-card group mt-5 block p-5 transition hover:-translate-y-0.5"
        style={{ borderRadius: 18 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🎙️
              </span>
              <span
                className="la-pill text-[11px]"
                style={{ background: journey.bg, color: journey.color }}
              >
                NEW · AI Interview Trainer
              </span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-ink">
              Prepare for a real job interview
            </h3>
            <p className="mt-1 max-w-[640px] text-[14px] leading-relaxed text-ink-soft">
              Paste your CV and a job description. Train the right questions, rehearse a 5-minute
              self-presentation, run a recorded mock interview, and get an AI readiness report.
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: journey.color }}
          >
            Start
            <span className="transition-transform group-hover:translate-x-1">
              <Arrow color="#fff" />
            </span>
          </span>
        </div>
      </Link>

      {/* ───── Languages entry ───── */}
      <Link
        href="/learn/languages"
        className="la-card group mt-4 block p-5 transition hover:-translate-y-0.5"
        style={{ borderRadius: 18 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                🌐
              </span>
              <span
                className="la-pill text-[11px]"
                style={{ background: journey.bg, color: journey.color }}
              >
                LANGUAGES · 7 languages, A1 → B2
              </span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-ink">Learn a new language from zero</h3>
            <p className="mt-1 max-w-[640px] text-[14px] leading-relaxed text-ink-soft">
              English · Spanish · German · Russian · Japanese · Chinese · Arabic. CEFR-aligned
              flashcard drills with mock tests modelled on A1 → B2 can-do statements.
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: journey.color }}
          >
            Open
            <span className="transition-transform group-hover:translate-x-1">
              <Arrow color="#fff" />
            </span>
          </span>
        </div>
      </Link>

      {/* ───── Certifications entry ───── */}
      <Link
        href="/learn/certifications"
        className="la-card group mt-4 block p-5 transition hover:-translate-y-0.5"
        style={{ borderRadius: 18 }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden>
                📜
              </span>
              <span
                className="la-pill text-[11px]"
                style={{ background: journey.bg, color: journey.color }}
              >
                CERT PREP · 20 exam packs
              </span>
            </div>
            <h3 className="mt-2 text-xl font-extrabold text-ink">
              Drill real exam-style questions
            </h3>
            <p className="mt-1 max-w-[640px] text-[14px] leading-relaxed text-ink-soft">
              AWS · Azure · Google Cloud · IBM. Quick drill or full review, answer reveal with
              explanation, self-rated mastery.
            </p>
          </div>
          <span
            className="inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white"
            style={{ background: journey.color }}
          >
            Open
            <span className="transition-transform group-hover:translate-x-1">
              <Arrow color="#fff" />
            </span>
          </span>
        </div>
      </Link>
    </LearnerHomeShell>
  );
}
