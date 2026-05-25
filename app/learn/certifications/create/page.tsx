import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";
import CreatePackWizard, { type ExistingPack } from "./CreatePackWizard";

export const metadata: Metadata = {
  title: "Create a pack",
  description:
    "Build a citation-grounded certification practice pack — pick the vendor, add official sources, generate questions, publish.",
};

export const dynamic = "force-dynamic";

export default async function CreatePackPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login?returnTo=/learn/certifications/create");
  }

  const world = WORLDS.adult;

  // Existing published packs the user might want to fork as a new
  // version. Kept short — we only need slug/title/code/vendor.
  let existing: ExistingPack[] = [];
  try {
    const rows = await prisma.certification.findMany({
      where: { isPublished: true },
      orderBy: [{ vendor: "asc" }, { code: "asc" }],
      select: { slug: true, code: true, title: true, vendor: true },
      take: 40,
    });
    existing = rows;
  } catch {
    existing = [];
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
      <div className="text-[12px] font-bold uppercase tracking-[.16em] text-ink-mute">
        <Link href="/learn/certifications" className="text-ink-mute hover:text-ink">
          ← Certifications
        </Link>
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        Create or update a certification pack
      </h1>
      <p className="mt-1 max-w-[680px] text-[15px] text-ink-soft">
        Four steps, citation-grounded by default. Start fresh or fork an existing pack as a new
        version — every generated question must cite an official vendor source, so packs stay
        trustworthy.
      </p>

      <CreatePackWizard existing={existing} />
    </LearnerHomeShell>
  );
}
