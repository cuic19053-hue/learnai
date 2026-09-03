import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { authOptions } from "@/lib/auth";
import { buildLearnerNav, worldFromParam } from "@/lib/learn/worlds";
import { isMissingProjectTable, listUserProjects } from "@/lib/projects/db-store";
import { DEMO_PROJECTS, listDrafts, SUBJECT_ACCENT } from "@/lib/projects/store";
import { configFor } from "@/lib/projects/wizard-config";

export const metadata: Metadata = {
  title: "Projects",
  description: "Build something real. In-progress and completed projects in your journey.",
};

// Reads the NextAuth session, so cannot be statically prerendered —
// at build time there's no request URL and getServerSession throws
// ERR_INVALID_URL. Force per-request rendering so production builds
// succeed.
export const dynamic = "force-dynamic";

type Project = {
  title: string;
  brief: string;
  status: "in_progress" | "completed" | "idea";
  tags: string[];
};

const SAMPLE: Record<string, Project[]> = {
  kids: [
    {
      title: "Paint a jungle scene",
      brief: "Pick colours and animals to paint your jungle.",
      status: "in_progress",
      tags: ["colours", "animals"],
    },
    {
      title: "Tell a 3-word story",
      brief: "Make a tiny story with only three words.",
      status: "idea",
      tags: ["stories"],
    },
  ],
  GRADE_6: [
    {
      title: "沪教版六年级数学：分数通分与应用题手抄报",
      brief: "整理异分母分数加减法步骤与日常生活中的分数实际应用。",
      status: "in_progress",
      tags: ["数学", "分数", "手抄报"],
    },
    {
      title: "长方体展开图与表面积实践测算",
      brief: "动手制作长方体纸盒并绘制展开图，计算表面积与容积。",
      status: "idea",
      tags: ["几何", "动手实践"],
    },
  ],
  GRADE_7: [
    {
      title: "沪教版七年级数学：平行线截角模型推导",
      brief: "梳理同位角、内错角、同旁内角的几何几何推演逻辑。",
      status: "in_progress",
      tags: ["几何", "平行线"],
    },
    {
      title: "实数与二次根式化简错题集整理",
      brief: "归纳二次根式最简形式与分母有理化的常见错因。",
      status: "idea",
      tags: ["代数", "错题归纳"],
    },
  ],
  GRADE_8: [
    {
      title: "沪教版八年级数学：一次函数图象与几何综合探究",
      brief: "探究一次函数 y = kx + b 中 k 与 b 对图象象限分布的影响。",
      status: "in_progress",
      tags: ["函数", "一次函数"],
    },
    {
      title: "一元二次方程三种解法对比总结",
      brief: "比较配法、公式法、因式分解法在不同系数下的最优适用方案。",
      status: "completed",
      tags: ["方程", "一元二次方程"],
    },
    {
      title: "全等三角形辅助线添加技巧图解",
      brief: "总结倍长中线、截长补短等全等证明辅助线作法。",
      status: "idea",
      tags: ["几何证明"],
    },
  ],
  GRADE_9: [
    {
      title: "沪教版九年级数学：锐角三角函数测量高塔高度模型",
      brief: "运用正切公式 tan A 解直角三角形，设计实地测高方案。",
      status: "in_progress",
      tags: ["三角函数", "中考应用"],
    },
    {
      title: "上海中考数学第24题圆与相似三角形压轴专练",
      brief: "梳理近 5 年上海中考数学第 24 题切线与相似三角形的联立证明。",
      status: "idea",
      tags: ["中考压轴", "几何综合"],
    },
  ],
  adult: [
    {
      title: "VPC reference diagram",
      brief: "Hand-drawn map of subnets, route tables, NAT.",
      status: "in_progress",
      tags: ["aws", "networking"],
    },
    {
      title: "IAM policy library",
      brief: "10 production-ready least-privilege policies.",
      status: "idea",
      tags: ["aws", "security"],
    },
    {
      title: "Cost-bounded chatbot",
      brief: "Add token budgeting to an LLM endpoint.",
      status: "completed",
      tags: ["ai", "cost"],
    },
  ],
  senior: [
    {
      title: "My contacts cheat-sheet",
      brief: "A simple list of who to call for what.",
      status: "in_progress",
      tags: ["practical"],
    },
    {
      title: "Password notebook",
      brief: "Write down logins safely, on paper.",
      status: "idea",
      tags: ["safety"],
    },
  ],
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string; created?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  const config = configFor(world.slug);
  const wizardHref = `/learn/projects/new?world=${world.slug}`;
  const justCreatedId = params.created;

  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? null;

  // Per-user view: signed-in users get only their own DB-backed drafts.
  // Guests still see SAMPLE + DEMO so the empty wizard page isn't a
  // wall of nothing. The legacy in-memory store keeps the onboarding
  // guest path working until they sign in.
  let userDrafts: Project[] = [];
  if (userId) {
    try {
      const rows = await listUserProjects(userId, world.slug);
      userDrafts = rows.map<Project>((d) => ({
        title: d.topic,
        brief: d.outcome || "Draft from the wizard.",
        status: d.status,
        tags: d.prefs.length ? d.prefs.slice(0, 3) : ["draft"],
      }));
    } catch (err) {
      // Tables missing in production → fall through to the legacy in-
      // memory drafts so the page still loads (with a hint that the
      // schema needs deploying — surfaced via /api/diagnose/auth).
      if (!isMissingProjectTable(err)) throw err;
    }
  }

  const guestDrafts: Project[] = userId
    ? []
    : listDrafts(world.slug).map<Project>((d) => ({
        title: d.topic,
        brief: d.outcome || "Draft from the wizard.",
        status: d.status,
        tags: d.prefs.length ? d.prefs.slice(0, 3) : ["draft"],
      }));
  const baseProjects = userId ? [] : (SAMPLE[world.slug] ?? []);
  const projects = [...userDrafts, ...guestDrafts, ...baseProjects];
  // Demos are templates — useful when the user has nothing yet, noisy
  // for someone who has real work going. Show them to guests always,
  // and to signed-in users only when their drafts list is empty.
  const showDemos = !userId || userDrafts.length === 0;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "projects" })}
      pageContext={{ kind: "missions", worldLabel: world.journey.name }}
    >
      <Link href={world.homePath} className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← 返回{world.journey.name}首页
      </Link>

      {justCreatedId ? (
        <div
          role="status"
          className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
        >
          ✓ 项目草稿已保存。在列表顶部查看。
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
            实战项目
          </h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            学以致用。{world.journey.name}阶段共包含 {projects.length} 个项目案例与练习。
          </p>
        </div>
        <Link
          href={wizardHref}
          className="la-btn"
          style={{
            padding: "10px 16px",
            fontSize: 13,
            background: world.journey.color,
            boxShadow: "none",
          }}
        >
          + 新建实战项目
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
        {projects.map((p, i) => (
          <ProjectCard key={i} project={p} accent={world.journey.color} />
        ))}
      </div>

      {/* Empty-state nudge → wizard */}
      <div
        className="la-card mt-6 flex flex-wrap items-center gap-4 p-5"
        style={{
          borderRadius: 20,
          border: `1.5px dashed ${world.journey.color}`,
          background: world.journey.soft,
        }}
      >
        <div
          className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-[26px] text-white"
          style={{ background: world.journey.color }}
          aria-hidden
        >
          ✨
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] font-extrabold tracking-tight text-ink">
            没有灵感？{world.teacherName} 导师可以与你一起在线构建专属学习项目。
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            告知你想学习的知识点与目标，我们将为你定制专属于你的复习与实践计划。
          </p>
        </div>
        <Link
          href={wizardHref}
          className="la-btn"
          style={{ background: world.journey.color, padding: "12px 18px" }}
        >
          开启向导 →
        </Link>
      </div>

      {/* Ready-to-use demo gallery — uniform rendering for every topic.
          Hidden when a signed-in user already has their own drafts so
          their workspace stays focused on their own work. */}
      {showDemos ? (
        <>
          <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-ink">
                {userId ? "Try a template" : "Ready-to-use examples"}
              </h2>
              <p className="mt-1 text-[13px] text-ink-mute">
                {userId
                  ? "Tap one to copy the wizard answers and start your own version."
                  : "Five real projects built with this wizard. Each one is one tap away from running."}
              </p>
            </div>
            <span className="la-pill text-[11px]" style={{ background: "var(--bg-2)" }}>
              5 examples · same shape, six audiences
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_PROJECTS.map((d) => {
              const accent = SUBJECT_ACCENT[d.subject];
              return (
                <Link
                  key={d.id}
                  href={`/learn/projects/${d.id}`}
                  className="la-card group flex flex-col p-4 transition hover:-translate-y-0.5"
                  style={{ borderRadius: 18 }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="la-pill text-[10px] font-extrabold"
                      style={{ background: accent.bg, color: accent.color }}
                    >
                      {accent.label}
                    </span>
                    <span
                      className="la-pill text-[10px] font-extrabold uppercase"
                      style={{ background: "var(--bg-2)", color: "var(--ink-mute)" }}
                    >
                      {d.audience}
                    </span>
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-[16px] font-extrabold tracking-tight text-ink">
                    {d.topic}
                  </h3>
                  <p className="mt-1 line-clamp-3 flex-1 text-[12.5px] leading-relaxed text-ink-soft">
                    {d.blurb}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-mute">
                    <span className="la-mono">
                      {d.daysPerWeek}d × {d.minutesPerDay}m
                    </span>
                    <span
                      className="font-extrabold transition-transform group-hover:translate-x-0.5"
                      style={{ color: accent.color }}
                    >
                      Use this →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ) : null}
    </LearnerHomeShell>
  );
}

function ProjectCard({ project, accent }: { project: Project; accent: string }) {
  const STATUS_META: Record<Project["status"], { label: string; color: string }> = {
    in_progress: { label: "进行中", color: accent },
    completed: { label: "已完成", color: "var(--j-little)" },
    idea: { label: "创意草稿", color: "var(--ink-mute)" },
  };
  const meta = STATUS_META[project.status];
  return (
    <div className="la-card flex h-full flex-col p-4" style={{ borderRadius: 16 }}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[16px] font-bold leading-snug text-ink">{project.title}</h3>
        <span
          className="la-pill text-[11px]"
          style={{ background: "#fff", boxShadow: `0 0 0 1px ${meta.color}40`, color: meta.color }}
        >
          {meta.label}
        </span>
      </div>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft">{project.brief}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((t) => (
          <span key={t} className="la-pill text-[10px]" style={{ background: "var(--bg-2)" }}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}
