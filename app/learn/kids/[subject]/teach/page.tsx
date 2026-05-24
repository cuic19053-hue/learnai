import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TeachSequence from "./TeachSequence";
import { findLanguage } from "@/lib/letterforge/languages";
import { findSubject } from "@/lib/letterforge/subjects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: raw } = await params;
  const s = findSubject(raw);
  if (!s) return { title: "Learn" };
  return { title: `${s.name} · Learn` };
}

/**
 * /learn/kids/[subject]/teach — 3-step warm-up before practice.
 *
 * Pedagogical layer requested for 3-year-olds: teach the concept,
 * model it, then do one easy guided tap. After that the child moves
 * on to the 6-game practice sequence at /play.
 */
export default async function TeachPage({
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
  return <TeachSequence subject={subject} langCode={initial.code} />;
}
