import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Streaks, XP, and badges earned in your learning world.",
};

type Badge = {
  emoji: string;
  name: string;
  desc: string;
  earned: boolean;
};

const SAMPLE: Record<string, Badge[]> = {
  kids: [
    { emoji: "🌟", name: "First star", desc: "Finished your first activity.", earned: true },
    { emoji: "🦁", name: "Animal counter", desc: "Counted the jungle animals.", earned: true },
    { emoji: "🎨", name: "Colour master", desc: "Match every colour.", earned: false },
  ],
  GRADE_7: [
    { emoji: "🌋", name: "Science GRADE_7", desc: "Solved the volcano quest.", earned: true },
    { emoji: "🦊", name: "Quick fox", desc: "5-day streak.", earned: true },
    { emoji: "🧩", name: "Logic puzzler", desc: "Finish 10 logic puzzles.", earned: false },
  ],
  GRADE_8: [
    { emoji: "🛠️", name: "First commit", desc: "Wrote your first function.", earned: true },
    { emoji: "🔥", name: "Streak: 12 days", desc: "Train every day for 12 days.", earned: true },
    { emoji: "⚡", name: "Speed run", desc: "Finish a mission in under 10 min.", earned: true },
    { emoji: "🐍", name: "Calculator GRADE_8", desc: "Ship the Python calculator.", earned: false },
    { emoji: "🧠", name: "Logic master", desc: "100% on the AND/OR/NOT mission.", earned: false },
  ],
  GRADE_9: [
    { emoji: "🎓", name: "Exam ready", desc: "Pass a mock exam.", earned: false },
    { emoji: "📈", name: "Mastery +10", desc: "Lift any weak area by 10 points.", earned: true },
    { emoji: "📝", name: "30-day plan", desc: "Stick to a 30-day study plan.", earned: false },
  ],
  adult: [
    { emoji: "☁️", name: "Networking sprint", desc: "Finish the VPC sprint.", earned: true },
    { emoji: "🔐", name: "Security drill", desc: "Drill IAM policies.", earned: true },
    { emoji: "📜", name: "SAA-C03 mock", desc: "Pass the SAA-C03 mock exam.", earned: false },
    { emoji: "🏆", name: "Certified", desc: "Mark a certification as earned.", earned: false },
  ],
  senior: [
    { emoji: "🛡️", name: "Scam spotter", desc: "Pass three scam-message lessons.", earned: true },
    { emoji: "🌿", name: "Calm streak", desc: "Practise for 7 calm days.", earned: false },
  ],
};

export default async function AchievementsPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const badges = SAMPLE[world.slug] ?? [];
  const earned = badges.filter((b) => b.earned).length;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "achievements" })}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← Back to {world.journey.name} home
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        Achievements
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        {earned} of {badges.length} badges earned in the {world.journey.name} world.
      </p>

      {/* Headline stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Current streak" value={`${world.streakDays} days`} accent="#b15c00" />
        <Stat label="XP" value={world.xp.toLocaleString()} accent={world.journey.color} />
        <Stat
          label="Badges earned"
          value={`${earned} / ${badges.length}`}
          accent="var(--brand-1)"
        />
        <Stat label="Lessons completed" value="—" accent="var(--ink-mute)" />
      </div>

      {/* Badge grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {badges.map((b, i) => (
          <div
            key={i}
            className="la-card flex flex-col items-center p-4 text-center"
            style={{ borderRadius: 16, opacity: b.earned ? 1 : 0.55 }}
          >
            <div
              className="grid h-14 w-14 place-items-center rounded-full text-3xl"
              style={{
                background: b.earned ? `${world.journey.color}1f` : "var(--bg-2)",
                filter: b.earned ? "none" : "grayscale(0.8)",
              }}
              aria-hidden
            >
              {b.emoji}
            </div>
            <div className="mt-2 text-[13px] font-bold text-ink">{b.name}</div>
            <div className="mt-1 text-[11px] leading-snug text-ink-soft">{b.desc}</div>
            {!b.earned ? (
              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                Locked
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </LearnerHomeShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="la-card p-4" style={{ borderRadius: 14 }}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-1 text-[22px] font-extrabold tracking-tight" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
