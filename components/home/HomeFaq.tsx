"use client";

/**
 * Conversion-focused FAQ. Six common pre-signup questions.
 * Plain `<details>` so the markup is one tap, no JS state, and
 * crawlable.
 */

import Link from "next/link";

const ITEMS = [
  {
    q: "平台是免费的吗？",
    a: "是的。幼龄启蒙、少儿探索和高中学者等核心功能均提供免费体验。后续我们将为机构和高级功能提供灵活的扩展服务。",
  },
  {
    q: "需要绑定信用卡吗？",
    a: "完全不需要。无需绑定信用卡，甚至无需注册登录即可直接体验儿童与启蒙模式。",
  },
  {
    q: "对儿童安全有保障吗？",
    a: "我们深度融合了因龄施教与家长控制安全机制。儿童专属界面零广告，配备防误触长按家长锁、单日使用时长限制及夜间静音模式。",
  },
  {
    q: "成年人或职场人士适用吗？",
    a: "非常适用！职场进阶与专业板块涵盖主流云认证（AWS、Azure、GCP、IBM）、备考复习、AI应用、编程与高等数学等内容。",
  },
  {
    q: "学校或企业可以部署使用吗？",
    a: "可以。AI智能学习助手支持私有化部署、团队定制与机构协同，无需复杂的商务谈判定制。",
  },
  {
    q: "支持哪些语言？",
    a: "目前已支持 12 种主流语言（汉语、英语、西班牙语、法语、德语、日语、韩语等）。儿童模式提供发音与词汇随心切换。",
  },
];

export default function HomeFaq() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-[860px] px-6 py-16 md:px-12"
      aria-label="常见问题解答"
    >
      <div className="mb-7 text-center">
        <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
          常见问题
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-[36px]">
          大家关心的问题解答
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
          需要为学校或团队定制方案？了解更多 →
        </Link>
      </div>
    </section>
  );
}
