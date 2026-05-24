import type { Metadata } from "next";
import KidsHome from "./KidsHome";
import { findLanguage } from "@/lib/letterforge/languages";

export const metadata: Metadata = {
  title: "Little Learner",
  description: "Stories, numbers, letters, colors, animals, shapes, and feelings — with Milo.",
};

/**
 * /learn/kids — Little Learner home.
 *
 * Three layers in this tree:
 *   1. /learn/kids                — this home (today's lesson + 7 area tiles)
 *   2. /learn/kids/[subject]      — Milo X home (today's item + 3 games)
 *   3. /learn/kids/[subject]/play — game sequence + reward
 *
 * The parent area lives at /learn/kids/parent and is reached by holding
 * the 🔒 in the header — never by accidental child taps.
 */
export default async function KidsPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const initial = findLanguage(sp.lang);
  return <KidsHome langCode={initial.code} />;
}
