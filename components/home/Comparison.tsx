/**
 * Traditional learning vs LearnAI — quick visual proof of the
 * "what's different" question. Two columns, four rows.
 */

const ROWS = [
  { trad: "千人一面的传统统一教材", us: "根据年龄、节奏与目标量身定制" },
  { trad: "反馈延迟，无法及时解惑", us: "每次交互即时精准智能反馈" },
  { trad: "固定僵化的课程大纲路线", us: "动态调整的自适应学习旅程" },
  { trad: "难以追踪具体学习效果", us: "家长与学员可实时查看多维看板" },
];

export default function Comparison() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 py-14 md:px-12">
      <div className="mb-7 text-center">
        <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
          为什么选择 LearnAI
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          让课程适应学习者 — 而非让学习者去适应课程。
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
          <div>传统学习方式</div>
          <div style={{ color: "var(--brand-1)" }}>LearnAI 智能辅导</div>
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
