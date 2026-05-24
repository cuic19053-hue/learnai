/**
 * GET /api/certifications
 *
 * Catalog of every published certification. The frontend hub uses
 * this for the per-vendor grouping on /learn/certifications.
 *
 * Read path: DB first. If the DB has no published certs (fresh
 * install, seed not run, or DB unavailable), falls back to the
 * legacy on-disk JSON packs so the platform still renders something.
 */

import { fail, handler, ok } from "@/lib/api";
import { listCertifications, type CertificationListItem } from "@/lib/certifications/db";
import { legacyListCertifications } from "@/lib/certifications/legacy-bridge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const vendor = url.searchParams.get("vendor") || undefined;
  const level = url.searchParams.get("level") || undefined;
  const status = url.searchParams.get("status") || undefined;

  let items: CertificationListItem[] = [];
  let source: "db" | "legacy" = "db";
  try {
    items = await listCertifications({
      vendor: vendor as CertificationListItem["vendor"] | undefined,
      level: level as CertificationListItem["level"] | undefined,
      status: status as CertificationListItem["status"] | undefined,
    });
  } catch (err) {
    // Treat any DB read error as "fall back to legacy". The legacy
    // path doesn't need Postgres, so guest-mode installs still work.
    // eslint-disable-next-line no-console
    console.warn("[certifications] DB list failed, falling back to legacy", err);
    source = "legacy";
  }

  if (items.length === 0) {
    items = await legacyListCertifications();
    source = items.length > 0 ? "legacy" : source;
  }

  const byVendor = items.reduce<Record<string, CertificationListItem[]>>((acc, item) => {
    (acc[item.vendor] ??= []).push(item);
    return acc;
  }, {});

  return ok({ items, byVendor, source });
});

export const POST = handler(async () =>
  fail(405, "Use the admin endpoints to create certifications.")
);
