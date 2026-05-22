import { handler, ok } from "@/lib/api";
import { groupByVendor } from "@/lib/certifications/catalog";
import { countCertification, discoverCertifications } from "@/lib/certifications/load";

export const dynamic = "force-dynamic";

/**
 * GET /api/certifications
 *   → { items, byVendor }  where items carry a live question count.
 *
 * Catalog is discovered from certifications/questions/*.json at request
 * time. Drop a new JSON in that folder and it appears here.
 */
export const GET = handler(async () => {
  const catalog = await discoverCertifications();
  const items = await Promise.all(
    catalog.map(async (c) => ({
      ...c,
      questionCount: await countCertification(c.slug),
    }))
  );

  return ok({
    items,
    byVendor: groupByVendor(items),
  });
});
