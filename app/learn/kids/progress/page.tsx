import type { Metadata } from "next";
import LearningPath from "./LearningPath";
import { findLanguage } from "@/lib/letterforge/languages";

export const metadata: Metadata = {
  title: "My Learning Path",
  description: "What you learned, what's next, and the skills you've unlocked with Milo.",
};

/**
 * /learn/kids/progress — the MMORPG-style progression page.
 *
 * Reached by tapping the XP bar in the kids header. Shows current
 * level + total stars + streak + per-world progression tracks +
 * unlocked skill badges + an explicit "Continue: Learn X" CTA.
 */
export default async function ProgressPage({
  searchParams,
}: {
  searchParams?: Promise<{ lang?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const lang = findLanguage(sp.lang);
  return <LearningPath langCode={lang.code} />;
}
