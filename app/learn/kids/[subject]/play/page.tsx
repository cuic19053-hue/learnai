import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PlaySequence from "./PlaySequence";
import { findLanguage } from "@/lib/letterforge/languages";
import { findSubject } from "@/lib/letterforge/subjects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: raw } = await params;
  const s = findSubject(raw);
  if (!s) return { title: "Play" };
  return { title: `${s.name} · Play` };
}

/**
 * /learn/kids/[subject]/play — 3-mini-game sequence + reward.
 *
 * The PlaySequence client walks the subject's three games in order;
 * every interaction is positively reinforced (no failure state) and
 * the run ends on a 3-star reward.
 */
export default async function PlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ subject: string }>;
  searchParams?: Promise<{ lang?: string }>;
}) {
  const { subject: raw } = await params;
  const subject = findSubject(raw);
  if (!subject) notFound();
  const sp = (await searchParams) ?? {};
  const initial = findLanguage(sp.lang);
  return <PlaySequence subject={subject} langCode={initial.code} />;
}
