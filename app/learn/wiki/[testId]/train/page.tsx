import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import WikiTrainView from "@/components/wiki/WikiTrainView";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";
import { getStoredTest } from "@/lib/wiki/cache";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ testId: string }>;
}): Promise<Metadata> {
  const { testId } = await params;
  const test = getStoredTest(testId);
  return test
    ? {
        title: `Train — ${test.article.title}`,
        description: "Walk the article with cited check-ins before you take the test.",
      }
    : { title: "Train" };
}

export default async function WikiTrainPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const stored = getStoredTest(testId);
  if (!stored) notFound();

  const { sections, ...test } = stored;
  const world = WORLDS.GRADE_9;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "wikitest" })}
      pageContext={{
        kind: "wiki-train",
        topic: test.article.title,
        worldLabel: world.journey.name,
      }}
    >
      <Link
        href={`/learn/wiki/${testId}`}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to test overview
      </Link>

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
            Train · {test.article.title}
          </h1>
          <p className="mt-1 max-w-[720px] text-[14px] leading-relaxed text-ink-soft">
            Read each section, then answer the check-in. Wrong answers reveal the exact citation —
            so you learn from the source, not from a guess. Correct answers earn XP toward your{" "}
            <span className="font-bold text-ink">{world.journey.name}</span> track.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <WikiTrainView test={test} sections={sections} worldSlug={world.slug} />
      </div>

      <p className="mt-8 text-[11px] leading-relaxed text-ink-mute">
        Source:{" "}
        <a
          className="underline"
          href={test.article.canonicalUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {test.article.canonicalUrl}
        </a>{" "}
        · Wikipedia contributors, CC BY-SA 4.0.
      </p>
    </LearnerHomeShell>
  );
}
