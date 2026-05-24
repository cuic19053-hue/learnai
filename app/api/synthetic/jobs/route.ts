/**
 * POST /api/synthetic/jobs
 *   Create a synthetic-quiz generation job.
 *
 *   Body: { source: SourceInput; config: QuizConfig }
 *
 *   Synchronously extracts text + chunks it (fast — seconds at most),
 *   then spawns background generation and returns the job id and the
 *   plan summary so the UI can subscribe to the SSE stream.
 *
 * GET /api/synthetic/jobs
 *   List the current owner's recent jobs. Convenience for guest
 *   reconnect — the wizard UI can rehydrate after a refresh.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { chunkSource } from "@/lib/synthetic/chunker";
import { extractSource, ExtractionError } from "@/lib/synthetic/extract";
import { DEFAULT_QUESTIONS_PER_CHUNK } from "@/lib/synthetic/types";
import { createJob, registryStats } from "@/lib/synthetic/jobs/registry";
import { resolveOwner } from "@/lib/synthetic/jobs/owner";
import { spawnJob } from "@/lib/synthetic/jobs/runner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SourceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("wiki"),
    url: z.string().min(8).max(2_000),
    language: z.string().min(2).max(8).optional(),
  }),
  z.object({
    kind: z.literal("upload"),
    uploadId: z.string().min(8).max(64),
    mime: z.string().min(3).max(200),
    filename: z.string().min(1).max(200),
  }),
  z.object({
    kind: z.literal("text"),
    body: z.string().min(40).max(200_000),
    title: z.string().min(1).max(200).optional(),
  }),
]);

const BodySchema = z.object({
  source: SourceSchema,
  config: z
    .object({
      count: z.number().int().min(3).max(60).default(10),
      types: z
        .array(z.enum(["multiple_choice", "true_false", "short_answer"]))
        .min(1)
        .max(3)
        .default(["multiple_choice"]),
      difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
      focusKeywords: z.array(z.string().min(1).max(60)).max(10).optional(),
      language: z.string().min(2).max(8).optional(),
      questionsPerChunk: z.number().int().min(1).max(3).default(DEFAULT_QUESTIONS_PER_CHUNK),
    })
    .default({
      count: 10,
      types: ["multiple_choice"],
      difficulty: "medium",
      questionsPerChunk: DEFAULT_QUESTIONS_PER_CHUNK,
    }),
});

export const POST = handler(async (req: Request) => {
  // Rate limit per IP — 5 job creations/minute is plenty for a wizard.
  const limit = rateLimit(`synthetic:jobs:${clientIp(req)}`, { limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return fail(429, "Too many quiz generations. Try again in a minute.");
  }

  const body = BodySchema.parse(await req.json());
  const owner = await resolveOwner(req);

  // Extract source — fast, synchronous.
  let extracted;
  try {
    extracted = await extractSource(body.source);
  } catch (err) {
    if (err instanceof ExtractionError) {
      return fail(
        err.status,
        err.message,
        err.remediation ? { remediation: err.remediation } : undefined
      );
    }
    throw err;
  }

  // Chunk synchronously so we can return a real plan in the create response.
  const chunks = chunkSource(extracted);
  if (chunks.length === 0) {
    return fail(422, "Source had no usable content after chunking.");
  }

  // Build the final config (filling defaults from the extracted source).
  const config = {
    ...body.config,
    language: body.config.language ?? extracted.language,
  };

  const job = createJob({
    ownerId: owner.id,
    source: extracted,
    config,
    chunks,
  });

  // Spawn the background runner. Never await it.
  spawnJob(job.id, { sourceInput: body.source });

  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event: "synthetic.job.created",
      jobId: job.id,
      sourceKind: body.source.kind,
      chunkCount: chunks.length,
      requestedCount: config.count,
      ownerKind: owner.isGuest ? "guest" : "user",
    })
  );

  return ok(
    {
      jobId: job.id,
      plan: {
        totalChunks: chunks.length,
        sourceTitle: extracted.title,
        sourceLanguage: extracted.language,
        canonicalUrl: extracted.canonicalUrl,
      },
      streamUrl: `/api/synthetic/jobs/${job.id}/stream`,
      snapshotUrl: `/api/synthetic/jobs/${job.id}`,
    },
    { status: 202 }
  );
});

export const GET = handler(async () => {
  // Diagnostics-only listing. Per-owner listing of *persisted* quizzes
  // lives on `/api/synthetic/quizzes` so guests can hit `/jobs` without
  // leaking other guests' jobs.
  return ok({ registry: registryStats() });
});
