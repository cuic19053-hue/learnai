"use client";

/**
 * Conversion-focused FAQ. Six common pre-signup questions.
 * Plain `<details>` so the markup is one tap, no JS state, and
 * crawlable.
 */

import Link from "next/link";

const ITEMS = [
  {
    q: "Is it free?",
    a: "Yes. The full Little Learner, Explorer, and Scholar surfaces are free to try. We'll add paid tiers later for organizations and advanced features.",
  },
  {
    q: "Do I need a credit card?",
    a: "No. Sign-in is optional too — you can go straight to the kids surface without an account.",
  },
  {
    q: "Is it safe for children?",
    a: "Built with age-aware learning and parent controls. The Little Learner surface has no ads, a hold-to-open parent lock, daily time limits, and quiet hours.",
  },
  {
    q: "Can adults use it?",
    a: "Yes. The Professional and Scholar journeys cover certifications (AWS · Azure · GCP · IBM), exam prep, coding, math, and more.",
  },
  {
    q: "Can schools or companies use it?",
    a: "Yes — LearnAI is open source (MIT). The community page covers self-hosting, contributing, and sponsoring the project. There are no enterprise contracts or sales calls.",
  },
  {
    q: "Which languages are supported?",
    a: "Twelve so far: English, Spanish, French, Italian, German, Portuguese, Arabic, Russian, Hindi, Japanese, Korean, and Chinese. The kids surface speaks letters and example words in the picked language.",
  },
];

export default function HomeFaq() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-[860px] px-6 py-16 md:px-12"
      aria-label="Frequently asked questions"
    >
      <div className="mb-7 text-center">
        <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
          FAQ
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          Questions we get a lot
        </h2>
      </div>

      <div className="rounded-3xl bg-white" style={{ border: "1px solid var(--line-soft)" }}>
        {ITEMS.map((item, i) => (
          <details
            key={item.q}
            style={{
              borderBottom: i < ITEMS.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}
          >
            <summary
              className="cursor-pointer select-none"
              style={{
                padding: "18px 22px",
                fontSize: 15.5,
                fontWeight: 700,
                color: "var(--ink)",
                listStyle: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <span>{item.q}</span>
              <span
                aria-hidden
                className="text-ink-mute"
                style={{ fontSize: 22, lineHeight: 1, fontWeight: 400 }}
              >
                +
              </span>
            </summary>
            <p
              style={{
                padding: "0 22px 18px",
                margin: 0,
                fontSize: 14.5,
                color: "var(--ink-soft)",
                lineHeight: 1.6,
              }}
            >
              {item.a}
            </p>
          </details>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/organizations"
          className="text-sm font-bold"
          style={{ color: "var(--brand-1)" }}
        >
          Need a custom plan for your school or team? →
        </Link>
      </div>
    </section>
  );
}
