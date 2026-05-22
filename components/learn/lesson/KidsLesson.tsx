import Link from "next/link";
import CountingTask from "@/components/learn/kids/CountingTask";
import { stageToPath } from "@/lib/learn/stages";
import type { Journey } from "@/lib/learn/journeys";

/**
 * Kids lesson surface — single big task, no chrome, no scrolling.
 * Wraps the existing CountingTask in a calm gradient backdrop tinted by
 * the Little Learner journey color.
 */
export default function KidsLesson({ journey }: { journey: Journey }) {
  return (
    <main
      id="main"
      className="mx-auto min-h-screen max-w-[480px] px-4 pb-20 pt-5"
      style={{ background: `linear-gradient(180deg, ${journey.soft}, #fff 60%)` }}
    >
      <div className="flex items-center justify-between">
        <Link
          href={stageToPath(journey.stage)}
          className="text-[26px] text-ink-mute"
          aria-label="Back home"
        >
          ←
        </Link>
        <span
          className="la-pill"
          style={{ background: journey.bg, color: journey.color }}
        >
          {journey.emoji} Counting
        </span>
        <Link
          href="/parent"
          className="text-[22px] text-ink-mute"
          aria-label="Parent area"
        >
          👨‍👩‍👧
        </Link>
      </div>

      <div className="mt-4">
        <CountingTask />
      </div>
    </main>
  );
}
