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
  GRADE_7: [
    {
      topic: "生命科学",
      items: [
        { title: "沪教版七年级生命科学 - 显微镜的使用", durationMin: 8, mastery: 50 },
        { title: "自然地理：水循环与降雨的形成", durationMin: 7, mastery: 100 },
        { title: "地球自转与昼夜交替的成因", durationMin: 6 },
      ],
    },
    {
      topic: "数学",
      items: [
        { title: "沪教版六年级数学：分数的四则运算", durationMin: 6 },
        { title: "有理数的加减乘除与数轴", durationMin: 7 },
      ],
    },
  ],
  GRADE_8: [
    {
      topic: "信息技术",
      items: [
        { title: "Python 编程：变量与数据类型", durationMin: 8, mastery: 80 },
        { title: "Python 编程：函数定义与参数传递", durationMin: 10, mastery: 60 },
        { title: "逻辑电路：与门、或门与非门原理", durationMin: 6, mastery: 30 },
        { title: "综合实践：制作井字棋小游戏", durationMin: 25 },
      ],
    },
    {
      topic: "数学与物理",
      items: [
        { title: "沪教版八年级数学：一元一次方程求解", durationMin: 12, mastery: 100 },
        { title: "沪科版八年级物理：光的折射与反射", durationMin: 10 },
      ],
    },
  ],
  GRADE_9: [
    {
      topic: "数学",
      items: [
        { title: "沪教版九年级数学：锐角三角函数 (sin, cos, tan)", durationMin: 25, mastery: 42 },
        { title: "沪教版九年级数学：一元二次方程求根公式", durationMin: 22, mastery: 68 },
        { title: "九年级数学中考复习：概率初步与树状图", durationMin: 20, mastery: 75 },
      ],
    },
    { topic: "中考模拟套卷", items: [{ title: "上海中考全科模拟套卷 A", durationMin: 60 }] },
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
