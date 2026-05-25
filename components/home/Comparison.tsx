/**
 * Traditional learning vs LearnAI — quick visual proof of the
 * "what's different" question. Two columns, four rows.
 */

const ROWS = [
  { trad: "Same lesson for everyone", us: "Personalized by age, pace, and goal" },
  { trad: "Delayed feedback", us: "Instant feedback after every tap" },
  { trad: "Fixed curriculum path", us: "Adaptive learning journey" },
  { trad: "Hard to track progress", us: "Live progress dashboard for parents" },
];

export default function Comparison() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-14 md:px-12">
      <div className="mb-7 text-center">
        <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
          Why LearnAI
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          A lesson that fits the learner — not the other way round.
        </h2>
      </div>

      <div
        className="overflow-hidden rounded-3xl"
        style={{
          border: "1px solid var(--line-soft)",
          background: "#fff",
        }}
      >
        <div
          className="grid items-center text-center font-bold"
          style={{
            gridTemplateColumns: "1fr 1fr",
            padding: "16px 18px",
            background: "var(--bg-2)",
            borderBottom: "1px solid var(--line-soft)",
            color: "var(--ink-soft)",
            fontSize: 13,
            letterSpacing: ".02em",
          }}
        >
          <div>Traditional learning</div>
          <div style={{ color: "var(--brand-1)" }}>LearnAI</div>
        </div>
        {ROWS.map((r, i) => (
          <div
            key={i}
            className="grid"
            style={{
              gridTemplateColumns: "1fr 1fr",
              borderBottom: i < ROWS.length - 1 ? "1px solid var(--line-soft)" : "none",
            }}
          >
            <div
              style={{
                padding: "18px 22px",
                color: "var(--ink-mute)",
                borderRight: "1px solid var(--line-soft)",
                fontSize: 14.5,
              }}
            >
              <span aria-hidden style={{ marginInlineEnd: 8 }}>
                ✗
              </span>
              {r.trad}
            </div>
            <div
              style={{
                padding: "18px 22px",
                color: "var(--ink)",
                fontWeight: 600,
                fontSize: 14.5,
              }}
            >
              <span aria-hidden style={{ marginInlineEnd: 8, color: "var(--ok)", fontWeight: 800 }}>
                ✓
              </span>
              {r.us}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
