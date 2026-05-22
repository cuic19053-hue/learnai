import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import QuizPlayer from "@/components/certifications/QuizPlayer";
import {
  findCertification,
  loadCertificationPage,
  sampleCertification,
} from "@/lib/certifications/load";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await findCertification(slug);
  return meta
    ? { title: `${meta.code} — Quiz`, description: `Drill ${meta.title}.` }
    : { title: "Certification quiz" };
}

type QueryParams = { mode?: string; offset?: string; limit?: string; size?: string };

export default async function CertQuizPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<QueryParams>;
}) {
  const { slug } = await params;
  const sp = (await searchParams) ?? {};

  const meta = await findCertification(slug);
  if (!meta) notFound();

  const mode = sp.mode === "page" ? "page" : "sample";
  const world = WORLDS.adult;

  let questions;
  if (mode === "sample") {
    const size = clampInt(sp.size, 1, 50, 10);
    questions = await sampleCertification(slug, size);
  } else {
    const offset = clampInt(sp.offset, 0, 2000, 0);
    const limit = clampInt(sp.limit, 1, 100, 20);
    const page = await loadCertificationPage(slug, offset, limit);
    questions = page.items;
  }

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <QuizPlayer meta={meta} questions={questions} mode={mode} />
    </LearnerHomeShell>
  );
}

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}
