import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Library",
  description: "Every lesson available in your learning world, grouped by topic.",
};

type LibraryItem = { title: string; durationMin: number; mastery?: number };
type LibraryGroup = { topic: string; items: LibraryItem[] };

const SAMPLE: Record<string, LibraryGroup[]> = {
  kids: [
    {
      topic: "Numbers",
      items: [
        { title: "Count to 5", durationMin: 3 },
        { title: "Count to 10", durationMin: 5 },
        { title: "Bigger or smaller?", durationMin: 4 },
      ],
    },
    {
      topic: "Letters",
      items: [
        { title: "Find the letter A", durationMin: 3 },
        { title: "First sounds", durationMin: 4 },
      ],
    },
  ],
  explorer: [
    {
      topic: "Science",
      items: [
        { title: "Why does a volcano erupt?", durationMin: 8, mastery: 50 },
        { title: "How do clouds make rain?", durationMin: 7, mastery: 100 },
        { title: "Where does the sun go at night?", durationMin: 6 },
      ],
    },
    {
      topic: "Math",
      items: [
        { title: "Times tables: 2 and 5", durationMin: 6 },
        { title: "Fractions with a pizza", durationMin: 7 },
      ],
    },
  ],
  builder: [
    {
      topic: "Coding",
      items: [
        { title: "Python: variables", durationMin: 8, mastery: 80 },
        { title: "Python: functions", durationMin: 10, mastery: 60 },
        { title: "Logic gates: AND, OR, NOT", durationMin: 6, mastery: 30 },
        { title: "Build a tic-tac-toe game", durationMin: 25 },
      ],
    },
    {
      topic: "Math",
      items: [
        { title: "Algebra: solving for x", durationMin: 12, mastery: 100 },
        { title: "Probability: dice", durationMin: 10 },
      ],
    },
  ],
  scholar: [
    {
      topic: "Math",
      items: [
        { title: "Trigonometry: sine & cosine", durationMin: 25, mastery: 42 },
        { title: "Algebra: quadratic equations", durationMin: 22, mastery: 68 },
        { title: "Probability fundamentals", durationMin: 20, mastery: 75 },
      ],
    },
    { topic: "Practice exams", items: [{ title: "Mock exam: Set A", durationMin: 60 }] },
  ],
  adult: [
    {
      topic: "AWS · Networking",
      items: [
        { title: "VPC subnets and route tables", durationMin: 28, mastery: 50 },
        { title: "NAT and internet gateways", durationMin: 22 },
        { title: "VPC peering & transit gateway", durationMin: 25 },
      ],
    },
    {
      topic: "AWS · Security",
      items: [
        { title: "IAM policies in practice", durationMin: 30, mastery: 55 },
        { title: "KMS encryption basics", durationMin: 18 },
      ],
    },
    {
      topic: "AWS · Storage",
      items: [
        { title: "S3 lifecycle and storage classes", durationMin: 18, mastery: 40 },
        { title: "EBS volume types", durationMin: 12 },
      ],
    },
  ],
  senior: [
    {
      topic: "Digital safety",
      items: [
        { title: "Spotting scam messages", durationMin: 8, mastery: 60 },
        { title: "Use WhatsApp safely", durationMin: 10 },
        { title: "Online banking basics", durationMin: 12 },
      ],
    },
    { topic: "Memory practice", items: [{ title: "Daily memory walk", durationMin: 5 }] },
  ],
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const groups = SAMPLE[world.slug] ?? [];
  const total = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← Back to {world.journey.name} home
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        Library
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        {total} lesson{total === 1 ? "" : "s"} across {groups.length} topic
        {groups.length === 1 ? "" : "s"} in the {world.journey.name} world.
      </p>

      {(world.slug === "scholar" || world.slug === "adult") && (
        <Link
          href="/learn/wiki"
          className="la-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5"
          style={{ borderRadius: 20, background: "var(--brand-grad-soft)" }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="la-pill text-[11px] font-extrabold"
                style={{ background: "var(--brand-grad)", color: "#fff" }}
              >
                NEW
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
                WikiTest
              </span>
            </div>
            <h3 className="mt-1 text-[18px] font-extrabold tracking-tight text-ink">
              Turn any Wikipedia article into a graded test
            </h3>
            <p className="mt-1 max-w-[560px] text-[13px] leading-relaxed text-ink-soft">
              Paste a link — get a cited study session with train mode, practice drills, and a timed
              exam. Perfect for prep on any topic your library doesn&apos;t cover yet.
            </p>
          </div>
          <span className="la-btn" style={{ background: "var(--brand-grad)" }}>
            Try WikiTest →
          </span>
        </Link>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.topic}>
            <div className="flex items-baseline justify-between border-b border-line-soft pb-2">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">{g.topic}</h2>
              <span className="text-[11px] text-ink-mute">{g.items.length} lessons</span>
            </div>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {g.items.map((it, i) => (
                <li
                  key={i}
                  className="la-card flex items-center justify-between gap-3 p-3"
                  style={{ borderRadius: 12 }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold text-ink">{it.title}</div>
                    <div className="text-[11px] text-ink-mute">
                      {it.durationMin} min
                      {typeof it.mastery === "number" ? ` · mastery ${it.mastery}%` : ""}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: world.journey.color }}>
                    Open →
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </LearnerHomeShell>
  );
}
