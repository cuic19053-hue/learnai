import type { Metadata } from "next";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import { groupByLicense, IMAGE_MANIFEST } from "@/lib/img/manifest";

export const metadata: Metadata = {
  title: "Asset licenses",
  description:
    "Every image, illustration, and typeface shipped by LearnAI, with author and license. Auto-generated from public/img/_manifest.json.",
};

const LICENSE_LINKS: Record<string, string> = {
  CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
  "CC-BY-4.0": "https://creativecommons.org/licenses/by/4.0/",
  MIT: "https://opensource.org/licenses/MIT",
  "Apache-2.0": "https://www.apache.org/licenses/LICENSE-2.0",
  Unsplash: "https://unsplash.com/license",
  Pexels: "https://www.pexels.com/license/",
  Pixabay: "https://pixabay.com/service/license-summary/",
};

const LICENSE_BLURB: Record<string, string> = {
  CC0: "Public domain dedication. Free for any use, commercial or otherwise. No attribution required (though always welcomed).",
  "CC-BY-4.0":
    "Free to use, share, and adapt, including commercially, as long as you credit the author.",
  MIT: "Permissive open-source license. Free for any use, commercial or otherwise.",
  "Apache-2.0":
    "Permissive open-source license with explicit patent grant. Free for any use, commercial or otherwise.",
  Unsplash:
    "Free to use for any purpose, including commercial, without attribution (attribution is appreciated).",
  Pexels: "Free to use for any purpose, including commercial, without attribution.",
  Pixabay: "Free to use for any purpose, including commercial, without attribution.",
};

export default function LicensesPage() {
  const groups = groupByLicense();
  const totalAssets = IMAGE_MANIFEST.length;

  return (
    <main id="main" className="min-h-screen bg-white">
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-6 py-5 md:px-10">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <Link href="/" className="la-navlink">
            ← Back home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-[960px] px-6 py-12 md:px-10">
        <p className="la-mono text-xs font-bold tracking-wider text-brand-1">ASSET LICENSES</p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.02em] text-ink md:text-5xl">
          Every image we ship — and where it&apos;s from.
        </h1>
        <p className="mt-4 max-w-[680px] text-base leading-relaxed text-ink-soft">
          LearnAI&apos;s visuals are 100&nbsp;% open-source. Everything below is either authored
          in-house under CC0, bundled from an open-source font project, or sourced from a license
          that permits commercial use and redistribution. This page is auto-generated from{" "}
          <code className="rounded bg-line-soft px-1.5 py-0.5 text-[13px]">
            lib/img/manifest.ts
          </code>
          .
        </p>
        <p className="mt-3 text-sm text-ink-mute">
          {totalAssets} asset{totalAssets === 1 ? "" : "s"} · {groups.length} license
          {groups.length === 1 ? "" : "s"}.
        </p>

        <div className="mt-10 space-y-10">
          {groups.map(({ license, assets }) => (
            <section key={license}>
              <div className="flex items-baseline justify-between gap-3 border-b border-line-soft pb-2">
                <h2 className="text-xl font-extrabold tracking-tight text-ink">{license}</h2>
                {LICENSE_LINKS[license] ? (
                  <a
                    href={LICENSE_LINKS[license]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold text-brand-1 hover:underline"
                  >
                    Read the license →
                  </a>
                ) : null}
              </div>
              {LICENSE_BLURB[license] ? (
                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  {LICENSE_BLURB[license]}
                </p>
              ) : null}
              <ul className="mt-4 grid gap-2.5">
                {assets.map((a) => (
                  <li key={a.id} className="rounded-xl border border-line-soft p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <code className="rounded bg-line-soft px-1.5 py-0.5 text-[13px]">{a.id}</code>
                      <span className="text-[12px] text-ink-mute">{a.author}</span>
                    </div>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{a.description}</p>
                    {a.source ? (
                      <a
                        href={a.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-[12px] text-ink-mute hover:text-brand-1 hover:underline"
                      >
                        {a.source}
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <hr className="mt-12 border-line-soft" />
        <p className="mt-6 text-sm text-ink-mute">
          Adding a new asset? Register it in{" "}
          <code className="rounded bg-line-soft px-1.5 py-0.5 text-[12px]">
            lib/img/manifest.ts
          </code>{" "}
          and add a renderer case in{" "}
          <code className="rounded bg-line-soft px-1.5 py-0.5 text-[12px]">
            components/design/Illustration.tsx
          </code>
          . The page below updates automatically.
        </p>
      </section>
    </main>
  );
}
