/**
 * GET /api/synthetic/ping
 *
 * Live smoke test for the synthetic-quiz pipeline. Generates one
 * question from a tiny built-in stub and returns latency + accepted
 * count. Catches AI-provider misconfiguration, schema drift in the
 * prompt template, or filter rules that have become too strict.
 *
 * Safe to expose publicly — the input and output are constant and
 * carry no learner data.
 */

import { handler, ok, fail } from "@/lib/api";
import { ChunkGenerationError, generateForChunk, generatorStats } from "@/lib/synthetic/generate";
import { JobFilter } from "@/lib/synthetic/filter";
import { quizCacheStats } from "@/lib/synthetic/persistence/quiz-cache";
import { registryStats } from "@/lib/synthetic/jobs/registry";
import { uploadStats } from "@/lib/synthetic/jobs/upload-store";
import type { Chunk, QuizConfig } from "@/lib/synthetic/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const STUB_TEXT =
  "Amazon S3 is an object storage service that stores data as objects within buckets. " +
  "Each object consists of a key, the object data, and metadata. S3 is designed for " +
  "99.999999999% (11 nines) of durability by replicating objects across multiple " +
  "Availability Zones within a Region.";

const STUB_CHUNK: Chunk = {
  id: "ping-stub",
  index: 0,
  text: STUB_TEXT,
  charOffset: 0,
  anchorHeading: "Amazon S3 overview",
};

const STUB_CONFIG: QuizConfig = {
  count: 1,
  types: ["multiple_choice"],
  difficulty: "easy",
  language: "en",
  questionsPerChunk: 1,
};

export const GET = handler(async () => {
  const start = Date.now();
  try {
    const raw = await generateForChunk(STUB_CHUNK, STUB_CONFIG, {
      documentTitle: "Synthetic Ping",
      maxTokens: 500,
      temperature: 0,
      timeoutMs: 12_000,
    });
    const filter = new JobFilter();
    let accepted = 0;
    let rejectedReason: string | undefined;
    for (const q of raw) {
      const result = filter.evaluate(q, STUB_CHUNK);
      if (result.ok) accepted++;
      else if (!rejectedReason) rejectedReason = result.reason;
    }
    return ok({
      reachable: true,
      latencyMs: Date.now() - start,
      produced: raw.length,
      accepted,
      sampleQuestion: raw[0]?.prompt?.slice(0, 120),
      rejectedReason: accepted === 0 ? rejectedReason : undefined,
      caches: {
        chunk: generatorStats(),
        quiz: quizCacheStats(),
      },
      runtime: {
        ...registryStats(),
        uploads: uploadStats(),
      },
    });
  } catch (err) {
    if (err instanceof ChunkGenerationError) {
      return fail(err.status, err.message, {
        reachable: false,
        latencyMs: Date.now() - start,
      });
    }
    throw err;
  }
});
