import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { VENDOR_META } from "@/lib/certifications/catalog";
import { countCertification, findCertification } from "@/lib/certifications/load";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const meta = await findCertification(slug);
  if (!meta) return { title: "Certification" };
  return {
    title: `${meta.code} — ${meta.title}`,
    description: meta.blurb,
  };
}

export default async function CertificationDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = await findCertification(slug);
  if (!meta) notFound();

  const world = WORLDS.adult;
  const total = await countCertification(slug);
  const vendor = VENDOR_META[meta.vendor];

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
        href="/learn/certifications"
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to certifications
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <code
          className="rounded px-2 py-1 text-[14px] font-bold"
          style={{ background: `${vendor?.color}1f`, color: vendor?.color }}
        >
          {meta.code}
        </code>
        <span className="text-[12px] text-ink-mute">
          {vendor?.emoji} {vendor?.label}
        </span>
      </div>

      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        {meta.title}
      </h1>
      <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-ink-soft">{meta.blurb}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          label="Questions"
          value={total.toLocaleString()}
          accent={vendor?.color ?? "var(--brand-1)"}
        />
        <Stat label="Level" value={meta.level} accent={vendor?.color ?? "var(--brand-1)"} />
        <Stat label="Vendor" value={meta.vendor} accent={vendor?.color ?? "var(--brand-1)"} />
        <Stat label="Mode" value="Drill · Review" accent={vendor?.color ?? "var(--brand-1)"} />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <ModeCard
          href={`/learn/certifications/${slug}/quiz?mode=sample&size=10`}
          accent={vendor?.color ?? "var(--brand-1)"}
          emoji="⚡"
          title="Quick drill"
          body="A randomised 10-question session. Picks from the full bank — different every time."
          cta="Start a 10-question drill"
        />
        <ModeCard
          href={`/learn/certifications/${slug}/quiz?mode=page&offset=0&limit=20`}
          accent={vendor?.color ?? "var(--brand-1)"}
          emoji="📖"
          title="Review mode"
          body="Walk every question in order. Show the answer and explanation after each one. Best for first pass."
          cta="Open review · 20 at a time"
        />
      </div>
    </LearnerHomeShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="la-card p-3.5" style={{ borderRadius: 14 }}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-1 text-[20px] font-extrabold tracking-tight" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}

function ModeCard({
  href,
  accent,
  emoji,
  title,
  body,
  cta,
}: {
  href: string;
  accent: string;
  emoji: string;
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="la-card group flex flex-col p-5 transition hover:-translate-y-0.5"
      style={{ borderRadius: 18 }}
    >
      <div className="text-3xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-2 text-lg font-bold text-ink">{title}</h3>
      <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">{body}</p>
      <span
        className="mt-4 inline-flex items-center gap-2 self-start rounded-xl px-4 py-2 text-[13px] font-bold text-white"
        style={{ background: accent }}
      >
        {cta}
        <span className="transition-transform group-hover:translate-x-1">
          <Arrow color="#fff" />
        </span>
      </span>
    </Link>
  );
}
