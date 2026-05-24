import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SubjectHome from "./SubjectHome";
import { findLanguage } from "@/lib/letterforge/languages";
import { findSubject } from "@/lib/letterforge/subjects";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ subject: string }>;
}): Promise<Metadata> {
  const { subject: raw } = await params;
  const s = findSubject(raw);
  if (!s) return { title: "Milo" };
  return {
    title: s.name,
    description: `${s.today.description} · 3 short games with Milo.`,
  };
}

/**
 * /learn/kids/[subject] — Milo X home.
 *
 * One subject per page. Shows today's item, the 3 mini-games in
 * tiles, and one big Start CTA that opens the Play sequence.
 */
export default async function SubjectPage({
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
  return <SubjectHome subject={subject} langCode={initial.code} />;
}
