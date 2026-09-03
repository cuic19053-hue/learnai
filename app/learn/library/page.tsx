import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Library",
  description: "Every lesson available in your learning world, grouped by topic.",
};

type LibraryItem = { title: string; durationMin: number; mastery?: number };
type LibraryGroup = { topic: string; items: LibraryItem[] };

const SAMPLE: Record<string, LibraryGroup[]> = {
  kids: [
    {
      topic: "Numbers",
      items: [
        { title: "Count to 5", durationMin: 3 },
        { title: "Count to 10", durationMin: 5 },
        { title: "Bigger or smaller?", durationMin: 4 },
      ],
    },
    {
      topic: "Letters",
      items: [
        { title: "Find the letter A", durationMin: 3 },
        { title: "First sounds", durationMin: 4 },
      ],
    },
  ],
  GRADE_6: [
    {
      topic: "数与运算 (沪教版六年级上)",
      items: [
        { title: "分数的意义、性质与约分通分", durationMin: 12, mastery: 85 },
        { title: "分数的四则混合运算与应用题", durationMin: 15, mastery: 60 },
        { title: "分数与小数的互化及大小比较", durationMin: 10 },
      ],
    },
    {
      topic: "有理数与方程 (沪教版六年级下)",
      items: [
        { title: "有理数概念、数轴与绝对值", durationMin: 12 },
        { title: "有理数的加减乘除与乘方运算", durationMin: 15 },
        { title: "一元一次方程求解与实际应用", durationMin: 18 },
      ],
    },
  ],
  GRADE_7: [
    {
      topic: "几何初步与平行线 (沪教版七年级上)",
      items: [
        { title: "线段、射线、直线与角的度量", durationMin: 10, mastery: 90 },
        { title: "相交线与平行线的性质与判定", durationMin: 15, mastery: 50 },
        { title: "余角、补角与尺规作图画法", durationMin: 12 },
      ],
    },
    {
      topic: "代数式与实数 (沪教版七年级下)",
      items: [
        { title: "整式的加减、乘除与因式分解", durationMin: 18, mastery: 70 },
        { title: "实数、平方根与立方根概念", durationMin: 12 },
        { title: "二次根式的乘除与加减化简", durationMin: 16 },
      ],
    },
  ],
  GRADE_8: [
    {
      topic: "函数与方程 (沪教版八年级上)",
      items: [
        { title: "一元二次方程配方法与求根公式", durationMin: 20, mastery: 67 },
        { title: "正比例函数与一次函数的图象性质", durationMin: 18, mastery: 80 },
        { title: "一次函数的实际应用与方程组结合", durationMin: 22 },
      ],
    },
    {
      topic: "全等三角形与定理 (沪教版八年级下)",
      items: [
        { title: "全等三角形判定 (SAS/ASA/AAS/SSS)", durationMin: 25, mastery: 60 },
        { title: "勾股定理及其逆定理在几何中的应用", durationMin: 20 },
        { title: "命题与证明的规范逻辑表述", durationMin: 15 },
      ],
    },
  ],
  GRADE_9: [
    {
      topic: "相似与三角函数 (沪教版九年级上)",
      items: [
        { title: "相似三角形判定定理与比例线段", durationMin: 22, mastery: 68 },
        { title: "锐角三角函数 (sin, cos, tan) 定义", durationMin: 25, mastery: 42 },
        { title: "解直角三角形及其测量应用题", durationMin: 20, mastery: 75 },
      ],
    },
    {
      topic: "二次函数与圆 (沪教版九年级下/中考总复习)",
      items: [
        { title: "二次函数的图象、顶点式与最值", durationMin: 25 },
        { title: "圆的性质、切线判定与弧长计算", durationMin: 25 },
        { title: "上海中考数学第24、25题几何与函数压轴综合", durationMin: 45 },
      ],
    },
  ],
  adult: [
    {
      topic: "AWS · Networking",
      items: [
        { title: "VPC subnets and route tables", durationMin: 28, mastery: 50 },
        { title: "NAT and internet gateways", durationMin: 22 },
        { title: "VPC peering & transit gateway", durationMin: 25 },
      ],
    },
    {
      topic: "AWS · Security",
      items: [
        { title: "IAM policies in practice", durationMin: 30, mastery: 55 },
        { title: "KMS encryption basics", durationMin: 18 },
      ],
    },
    {
      topic: "AWS · Storage",
      items: [
        { title: "S3 lifecycle and storage classes", durationMin: 18, mastery: 40 },
        { title: "EBS volume types", durationMin: 12 },
      ],
    },
  ],
  senior: [
    {
      topic: "Digital safety",
      items: [
        { title: "Spotting scam messages", durationMin: 8, mastery: 60 },
        { title: "Use WhatsApp safely", durationMin: 10 },
        { title: "Online banking basics", durationMin: 12 },
      ],
    },
    { topic: "Memory practice", items: [{ title: "Daily memory walk", durationMin: 5 }] },
  ],
};

export default async function LibraryPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const groups = SAMPLE[world.slug] ?? [];
  const total = groups.reduce((acc, g) => acc + g.items.length, 0);

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← 返回{world.journey.name}首页
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
        知识库
      </h1>
      <p className="mb-6 mt-1 text-[15px] text-ink-soft">
        {world.journey.name}阶段共包含 {groups.length} 个学科主题、{total} 门知识课程。
      </p>

      {(world.slug === "GRADE_9" || world.slug === "adult") && (
        <Link
          href="/learn/wiki"
          className="la-card mb-6 flex flex-wrap items-center justify-between gap-4 p-5 transition hover:-translate-y-0.5"
          style={{ borderRadius: 20, background: "var(--brand-grad-soft)" }}
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="la-pill text-[11px] font-extrabold"
                style={{ background: "var(--brand-grad)", color: "#fff" }}
              >
                新功能
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-ink-mute">
                维基智考
              </span>
            </div>
            <h3 className="mt-1 text-[18px] font-extrabold tracking-tight text-ink">
              输入任意百科文章链接，一键生成专属试题
            </h3>
            <p className="mt-1 max-w-[560px] text-[13px] leading-relaxed text-ink-soft">
              粘贴链接，生成包含针对性练习与定时模拟测验的专属学习会话。
            </p>
          </div>
          <span className="la-btn" style={{ background: "var(--brand-grad)" }}>
            体验维基智考 →
          </span>
        </Link>
      )}

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.topic}>
            <div className="flex items-baseline justify-between border-b border-line-soft pb-2">
              <h2 className="text-lg font-extrabold tracking-tight text-ink">{g.topic}</h2>
              <span className="text-[11px] text-ink-mute">{g.items.length} 门课程</span>
            </div>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {g.items.map((it, i) => (
                <li
                  key={i}
                  className="la-card flex items-center justify-between gap-3 p-3"
                  style={{ borderRadius: 12 }}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-bold text-ink">{it.title}</div>
                    <div className="text-[11px] text-ink-mute">
                      {it.durationMin} 分钟
                      {typeof it.mastery === "number" ? ` · 掌握度 ${it.mastery}%` : ""}
                    </div>
                  </div>
                  <span className="text-[12px] font-bold" style={{ color: world.journey.color }}>
                    开启课程 →
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </LearnerHomeShell>
  );
}
