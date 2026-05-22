import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { VENDOR_META, groupByVendor } from "@/lib/certifications/catalog";
import {
  countCertification,
  discoverCertifications,
} from "@/lib/certifications/load";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Certifications",
  description:
    "Train with real exam-style questions for AWS, Google Cloud, and IBM certifications.",
};

export default async function CertificationsHub() {
  const world = WORLDS.adult;
  const catalog = await discoverCertifications();
  const byVendor = groupByVendor(catalog);
  const counts = new Map<string, number>();
  await Promise.all(
    catalog.map(async (c) => counts.set(c.slug, await countCertification(c.slug))),
  );

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <Link
        href={world.homePath}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to {world.journey.name} home
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        Certifications
      </h1>
      <p className="mt-1 text-[15px] text-ink-soft">
        Train with real exam-style questions for AWS, Azure, Google Cloud, and
        IBM. Drill mode picks a random sample; review mode walks every question
        with the explanation.
      </p>

      <div className="mt-8 space-y-10">
        {Object.entries(byVendor).map(([vendor, items]) => {
          const meta = VENDOR_META[vendor];
          return (
            <section key={vendor}>
              <div className="flex items-baseline justify-between border-b border-line-soft pb-2">
                <h2
                  className="text-xl font-extrabold tracking-tight text-ink"
                  style={{ color: meta?.color }}
                >
                  {meta?.emoji} {meta?.label ?? vendor}
                </h2>
                <span className="text-[11px] text-ink-mute">
                  {items.length} exam pack{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/learn/certifications/${c.slug}`}
                    className="la-card group flex flex-col p-4 transition hover:-translate-y-0.5"
                    style={{ borderRadius: 16 }}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <code
                        className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                        style={{ background: `${meta?.color}1f`, color: meta?.color }}
                      >
                        {c.code}
                      </code>
                      <span className="text-[11px] font-bold text-ink-mute">
                        {counts.get(c.slug) ?? 0} questions
                      </span>
                    </div>
                    <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink">
                      {c.title}
                    </h3>
                    <p className="mt-1 flex-1 text-[12px] leading-relaxed text-ink-soft">
                      {c.blurb}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="la-pill text-[11px]" style={{ background: "var(--bg-2)" }}>
                        {c.level}
                      </span>
                      <span
                        className="inline-flex items-center gap-1 text-[12px] font-bold transition-transform group-hover:translate-x-0.5"
                        style={{ color: meta?.color }}
                      >
                        Open <Arrow color={meta?.color} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </LearnerHomeShell>
  );
}
