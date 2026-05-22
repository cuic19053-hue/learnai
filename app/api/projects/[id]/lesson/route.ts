import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import {
  ProjectLessonError,
  clearCachedLesson,
  generateLesson,
  getCachedLesson,
  putCachedLesson,
} from "@/lib/projects/lesson";
import { resolveProject } from "@/lib/projects/store";
import { getStaticLesson } from "@/lib/projects/static-lessons";

export const dynamic = "force-dynamic";

/**
 * GET /api/projects/[id]/lesson?force=1
 *
 * Returns the lesson for this project — AI-generated if possible, with
 * an automatic fallback to a hand-written static lesson for the 5 demo
 * projects so the demo path always works (even when the AI chain is
 * slow or down).
 *
 * Logs to stderr on AI failure so admins can see what's happening at
 * the chain level.
 */
export const GET = handler(
  async (
    req: Request,
    ctx: { params: Promise<{ id: string }> },
  ) => {
    const { id } = await ctx.params;
    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "1";
    const ip = clientIp(req);

    if (force) {
      const limit = rateLimit(`projects:lesson:force:${ip}`, {
        limit: 5,
        windowMs: 60_000,
      });
      if (!limit.allowed) {
        return fail(429, "Too many re-rolls — try again in a minute.");
      }
      clearCachedLesson(id);
    }

    const cached = getCachedLesson(id);
    if (cached) {
      return ok({ lesson: cached, fromCache: true, source: "cache" });
    }

    const draft = resolveProject(id);
    if (!draft) {
      return fail(
        404,
        "Project not found. It may have expired — start a new project.",
      );
    }

    // Try the AI chain first.
    try {
      const t0 = Date.now();
      const lesson = await generateLesson(draft);
      const ms = Date.now() - t0;
      putCachedLesson(lesson);
      // eslint-disable-next-line no-console
      console.log(
        `[lesson] generated id=${id} world=${draft.worldSlug} ms=${ms} ex=${lesson.exercises.length}`,
      );
      return ok({ lesson, fromCache: false, source: "ai", latencyMs: ms });
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown";
      // eslint-disable-next-line no-console
      console.error(
        `[lesson] AI generation failed id=${id} world=${draft.worldSlug}: ${message}`,
      );

      // Fallback path: serve the static lesson if this is one of the
      // 5 demo projects. Cache it so subsequent visits are instant.
      const fallback = getStaticLesson(id);
      if (fallback) {
        putCachedLesson(fallback);
        return ok({
          lesson: fallback,
          fromCache: false,
          source: "fallback",
          aiError: message,
        });
      }

      if (err instanceof ProjectLessonError) {
        return fail(err.status, err.message);
      }
      return fail(
        502,
        `AI lesson generator unavailable: ${message.slice(0, 200)}`,
      );
    }
  },
);
