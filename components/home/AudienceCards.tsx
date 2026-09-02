import Link from "next/link";

/**
 * "Who it's for" strip. Four audience cards above the journeys grid
 * so a visitor instantly recognises themselves and stops asking
 * "is this for me?".
 */
const AUDIENCES = [
  {
    emoji: "👨‍👩‍👧",
    title: "家长与儿童",
    desc: "面向 3–11 岁儿童的安全、因龄施教学习体验。",
    href: "/learn/kids",
    accent: "#ec4899",
    bg: "#fce0ec",
  },
  {
    emoji: "🎓",
    title: "在校学生",
    desc: "作业辅导、备考冲刺与建立自信的针对性反馈。",
    href: "/learn/scholar",
    accent: "#2e5bff",
    bg: "#e6ecff",
  },
  {
    emoji: "💼",
    title: "职场人士",
    desc: "包含权威引用的人工智能、云计算、编程与职业技能提升。",
    href: "/learn/adult",
    accent: "#0ea5a4",
    bg: "#d6f1f0",
  },
  {
    emoji: "🏫",
    title: "学校与机构",
    desc: "面向团队与班级的数据看板、定制学习路径与多维报告。",
    href: "/organizations",
    accent: "#7c3aed",
    bg: "#efe7ff",
  },
] as const;

export default function AudienceCards() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-12 md:px-12">
      <div className="mb-6 text-center">
        <span
          className="la-pill"
          style={{
            background: "#fff",
            boxShadow: "0 0 0 1px var(--line)",
            color: "var(--ink-soft)",
          }}
        >
          适用人群
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          单一平台，赋能每一位学习者。
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a) => (
          <Link
            key={a.title}
            href={a.href}
            className="group block rounded-2xl p-5 transition-shadow"
            style={{
              background: "#fff",
              border: "1px solid var(--line-soft)",
              boxShadow: "var(--shadow-1)",
            }}
          >
            <div
              className="mb-3 grid place-items-center rounded-2xl"
              style={{
                width: 56,
                height: 56,
                background: a.bg,
                color: a.accent,
                fontSize: 30,
              }}
              aria-hidden
            >
              {a.emoji}
            </div>
            <h3 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">{a.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{a.desc}</p>
            <span
              className="mt-3 inline-flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-0.5"
              style={{ color: a.accent }}
            >
              探索体验 →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
