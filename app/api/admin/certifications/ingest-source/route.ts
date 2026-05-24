/**
 * POST /api/admin/certifications/ingest-source
 *
 * Idempotently imports the legacy `certifications/questions/*.json`
 * packs into the DB. Maps each file slug to its modern Certification
 * row via `OFFICIAL_CERTIFICATION_SEED.legacySlugs`. Existing
 * questions (matched by `certificationId + prompt`) are skipped.
 *
 * Run this once after `/api/admin/certifications/seed` to back-fill
 * the originally-authored question bank into the DB. The response
 * surfaces per-pack stats plus any file slugs that didn't map to a
 * known certification so the admin can extend the seed.
 */

import { fail, handler, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { ingestJsonPacks } from "@/lib/certifications/json-ingest";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  const result = await ingestJsonPacks();
  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event: "certifications.ingest_source",
      packs: result.packs.length,
      notMapped: result.notMapped.length,
      inserted: result.packs.reduce((acc, p) => acc + p.inserted, 0),
    })
  );
  return ok(result);
});
