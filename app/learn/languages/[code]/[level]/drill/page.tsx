import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import VocabDrill from "@/components/languages/VocabDrill";
import { findLanguage, findLevel } from "@/lib/languages/catalog";
import { curriculumFor } from "@/lib/languages/seed";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; level: string }>;
}): Promise<Metadata> {
  const { code, level } = await params;
  const lang = findLanguage(code);
  return lang
    ? { title: `${lang.name} · ${level} drill` }
    : { title: "Drill" };
}

export default async function LanguageDrillPage({
  params,
}: {
  params: Promise<{ code: string; level: string }>;
}) {
  const { code, level } = await params;
  const lang = findLanguage(code);
  const descriptor = findLevel(level);
  if (!lang || !descriptor) notFound();

  const curriculum = curriculumFor(lang.code).find((c) => c.level === descriptor.level);
  const cards = curriculum?.modules.flatMap((m) => m.cards) ?? [];

  const world = WORLDS.adult;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <VocabDrill language={lang} level={descriptor.level} cards={cards} />
    </LearnerHomeShell>
  );
}
