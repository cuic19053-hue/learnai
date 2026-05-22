import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import WikiQuizView from "@/components/wiki/WikiQuizView";
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
        title: `Test — ${test.article.title}`,
        description: "Timed WikiTest exam.",
      }
    : { title: "WikiTest exam" };
}

export default async function WikiQuizPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const stored = getStoredTest(testId);
  if (!stored) notFound();

  const { sections: _sections, ...test } = stored;
  const world = WORLDS.scholar;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "wikitest" })}
      pageContext={{ kind: "wiki-quiz", topic: test.article.title, worldLabel: world.journey.name }}
    >
      <Link
        href={`/learn/wiki/${testId}`}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to test overview
      </Link>

      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        Test · {test.article.title}
      </h1>
      <p className="mt-1 max-w-[720px] text-[14px] leading-relaxed text-ink-soft">
        Timed and graded. No reveals during the test — you&apos;ll get the full readiness scorecard
        with cited paragraphs when you submit.
      </p>

      <div className="mt-6">
        <WikiQuizView test={test} />
      </div>
    </LearnerHomeShell>
  );
}
