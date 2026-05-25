"use client";

/**
 * /learn/certifications hub — one card per certification, with the
 * version selector living inside the card. Prevents the previous
 * "SAA-C03 v1 · SAA-C03 v2 · SAA-C03 v3" wall of repeats.
 *
 *   ┌────────────────────────────────────────────┐
 *   │ SAA-C03                                AWS │
 *   │ AWS Solutions Architect — Associate        │
 *   │ Versions: 4   Latest: v4                   │
 *   │ [ Version v4 — Latest ▾ ]  [ Open → ]      │
 *   └────────────────────────────────────────────┘
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { Arrow } from "@/components/design/icons";
import { VENDOR_META } from "@/lib/certifications/catalog";
import type { CertificationGroup, VersionEntry } from "@/lib/certifications/groups";
import type { CertificationVendor } from "@/lib/certifications/types";

const ALL_VENDOR = "All" as const;

const VENDORS: ReadonlyArray<"All" | CertificationVendor> = [
  ALL_VENDOR,
  "AWS",
  "Azure",
  "GCP",
  "IBM",
];

export default function CertificationsClient({ groups }: { groups: CertificationGroup[] }) {
  const [vendor, setVendor] = useState<"All" | CertificationVendor>(ALL_VENDOR);
  const [q, setQ] = useState("");

  const totalQuestions = useMemo(
    () => groups.reduce((sum, g) => sum + g.totalQuestions, 0),
    [groups]
  );

  const filtered = useMemo(() => {
    const lq = q.trim().toLowerCase();
    return groups.filter((g) => {
      if (vendor !== ALL_VENDOR && g.vendor !== vendor) return false;
      if (!lq) return true;
      return (
        g.code.toLowerCase().includes(lq) ||
        g.title.toLowerCase().includes(lq) ||
        (g.blurb ?? "").toLowerCase().includes(lq)
      );
    });
  }, [groups, vendor, q]);

  // Group by vendor for the section headings ("Amazon Web Services · 5 exams").
  const byVendor = useMemo(() => {
    const buckets = new Map<string, CertificationGroup[]>();
    for (const g of filtered) {
      const list = buckets.get(g.vendor) ?? [];
      list.push(g);
      buckets.set(g.vendor, list);
    }
    return Array.from(buckets.entries());
  }, [filtered]);

  return (
    <div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className="la-pill text-[12px]"
          style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
        >
          🏛 {groups.length} certifications · {totalQuestions.toLocaleString()} cited questions
        </span>
        <span
          className="la-pill text-[12px]"
          style={{ background: "#efe7ff", color: "#7c3aed", fontWeight: 800 }}
        >
          ✨ AI-generated from official vendor docs
        </span>
        <div style={{ flex: 1 }} />
        <Link
          href="/learn/certifications/create"
          className="la-pill text-[12.5px]"
          style={{
            background: "var(--ink)",
            color: "#fff",
            fontWeight: 800,
            textDecoration: "none",
            padding: "8px 14px",
          }}
        >
          + Create certification
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {VENDORS.map((v) => {
          const active = vendor === v;
          const count =
            v === ALL_VENDOR ? groups.length : groups.filter((g) => g.vendor === v).length;
          const accent = v === ALL_VENDOR ? "var(--ink)" : (VENDOR_META[v]?.color ?? "var(--ink)");
          return (
            <button
              type="button"
              key={v}
              onClick={() => setVendor(v)}
              aria-pressed={active}
              style={{
                padding: "8px 14px",
                borderRadius: 99,
                background: active ? accent : "#fff",
                color: active ? "#fff" : "var(--ink-soft)",
                border: active ? "none" : "1px solid var(--line)",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              {v === ALL_VENDOR ? "All providers" : v} · {count}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 search…"
          aria-label="Search certifications"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid var(--line)",
            fontFamily: "inherit",
            fontSize: 13,
            width: 220,
            maxWidth: "100%",
          }}
        />
      </div>

      {byVendor.map(([vendorName, list]) => (
        <section key={vendorName} className="mt-7">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink">
              {VENDOR_META[vendorName as CertificationVendor]?.label ?? vendorName}
            </h2>
            <span className="text-[12px] font-bold text-ink-mute">
              {list.length} {list.length === 1 ? "exam" : "exams"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {list.map((g) => (
              <CertificationCard key={g.baseSlug} group={g} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 ? (
        <div
          className="mt-6 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-mute"
          style={{ background: "var(--surface-soft)" }}
        >
          No certifications match that filter. Try clearing the search or another vendor.
        </div>
      ) : null}

      <p className="mt-8 text-[12.5px] leading-relaxed text-ink-mute">
        ✨ Every question is AI-generated from official vendor docs and cited back to the source. No
        proprietary exam content is ever copied.
      </p>
    </div>
  );
}

function CertificationCard({ group }: { group: CertificationGroup }) {
  const meta = VENDOR_META[group.vendor as CertificationVendor];
  const [selectedSlug, setSelectedSlug] = useState<string>(group.latest.slug);
  const selected = group.versions.find((v) => v.slug === selectedSlug) ?? group.latest;

  return (
    <article
      className="la-card flex flex-col p-4"
      style={{ borderRadius: 16, transition: "transform .15s" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <code
          className="rounded px-1.5 py-0.5 text-[11px] font-bold"
          style={{ background: `${meta?.color}1f`, color: meta?.color }}
        >
          {group.code}
        </code>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[.04em]"
          style={{ background: `${meta?.color}1f`, color: meta?.color }}
        >
          {group.vendor}
        </span>
      </div>

      <h3 className="mt-2 text-[15px] font-bold leading-snug text-ink">{group.title}</h3>
      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-soft">{group.blurb}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-ink-mute">
        <span>
          Level <b className="text-ink-soft">{group.level}</b>
        </span>
        <span>
          Versions <b className="text-ink-soft">{group.versions.length}</b>
        </span>
        <span>
          Latest <b className="text-ink-soft">v{group.latest.version}</b>
        </span>
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        <div className="relative flex-1">
          <select
            value={selectedSlug}
            onChange={(e) => setSelectedSlug(e.target.value)}
            aria-label="Choose a version"
            className="w-full appearance-none rounded-lg border border-[var(--line)] bg-white px-3 py-2 pr-8 text-[12.5px] font-bold text-ink"
          >
            {group.versions.map((v) => (
              <option key={v.slug} value={v.slug}>
                {versionOptionLabel(v)}
              </option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-ink-mute"
            aria-hidden
          >
            ▾
          </span>
        </div>
        <Link
          href={`/learn/certifications/${selected.slug}`}
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[12.5px] font-bold text-white"
          style={{ background: meta?.color ?? "var(--ink)" }}
        >
          Open
          <Arrow color="#fff" />
        </Link>
      </div>

      <div className="mt-2 text-[11px] text-ink-mute">
        {selected.questions.toLocaleString()} questions · {selected.status}
      </div>
    </article>
  );
}

function versionOptionLabel(v: VersionEntry): string {
  const tag =
    v.status === "Latest" ? " — Latest" : v.status === "Published" ? "" : ` · ${v.status}`;
  return `Version v${v.version}${tag}`;
}
