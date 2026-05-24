/**
 * GET /api/certifications/ping
 *
 * Live smoke test for the certifications subsystem. Reports:
 *   - Total certifications in the DB and how many are published.
 *   - Total published questions across all certs.
 *   - Whether the legacy JSON loader is finding any packs.
 *
 * Safe to expose publicly — no learner data, no answer keys.
 */

import { handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { discoverCertifications } from "@/lib/certifications/load";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async () => {
  const start = Date.now();

  let dbCerts = 0;
  let dbPublishedCerts = 0;
  let dbPublishedQuestions = 0;
  let dbReachable = true;
  try {
    [dbCerts, dbPublishedCerts, dbPublishedQuestions] = await Promise.all([
      prisma.certification.count(),
      prisma.certification.count({ where: { isPublished: true } }),
      prisma.certificationQuestion.count({ where: { isPublished: true } }),
    ]);
  } catch {
    dbReachable = false;
  }

  let legacyPacks = 0;
  try {
    legacyPacks = (await discoverCertifications()).length;
  } catch {
    /* swallow */
  }

  return ok({
    reachable: true,
    latencyMs: Date.now() - start,
    db: {
      reachable: dbReachable,
      certifications: dbCerts,
      publishedCertifications: dbPublishedCerts,
      publishedQuestions: dbPublishedQuestions,
    },
    legacy: {
      packsFound: legacyPacks,
    },
  });
});
