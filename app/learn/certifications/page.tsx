import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { countCertification, discoverCertifications } from "@/lib/certifications/load";
import { groupCertifications } from "@/lib/certifications/groups";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";
import CertificationsClient from "./CertificationsClient";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Train with real exam-style questions for AWS, Azure, Google Cloud, and IBM certifications. Every question cited to official sources.",
};

export default async function CertificationsHub() {
  const world = WORLDS.adult;
  const catalog = await discoverCertifications();
  const counts = await Promise.all(catalog.map((c) => countCertification(c.slug)));
  const flat = catalog.map((c, i) => ({ ...c, questions: counts[i] ?? 0 }));
  // Collapse per-version rows into one card per certification — the
  // version picker lives inside the card, not as separate tiles.
  const groups = groupCertifications(flat);

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        Certifications
      </h1>
      <p className="mt-1 max-w-[640px] text-[15px] text-ink-soft">
        Real exam-style practice for AWS, Azure, Google Cloud, and IBM. Pick a pack, drill or review
        — every question cites the official source.
      </p>

      <CertificationsClient groups={groups} />
    </LearnerHomeShell>
  );
}
