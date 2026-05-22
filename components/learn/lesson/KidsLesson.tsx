import type { Journey } from "@/lib/learn/journeys";
import KidsLessonPlayer from "@/components/learn/kids/KidsLessonPlayer";

/**
 * Kids lesson surface — mobile-first, touch-friendly, voice-enabled.
 * The full player lives in components/learn/kids/KidsLessonPlayer so
 * /learn/lesson/kids and any future deep-link route share the same
 * implementation.
 *
 * Journey is accepted for API symmetry with the other stage lessons
 * but the kids player picks its own theme palette from the catalogue.
 */
export default function KidsLesson({ journey: _journey }: { journey: Journey }) {
  return <KidsLessonPlayer />;
}
