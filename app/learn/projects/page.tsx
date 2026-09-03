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
  GRADE_7: [
    {
      title: "Volcano lab notebook",
      brief: "Record your three volcano experiments.",
      status: "in_progress",
      tags: ["science", "notebook"],
    },
    {
      title: "Mini weather diary",
      brief: "Track temperature and clouds for one week.",
      status: "idea",
      tags: ["science"],
    },
  ],
  GRADE_8: [
    {
      title: "Python calculator",
      brief: "Build add, subtract, divide-by-zero handling.",
      status: "in_progress",
      tags: ["python", "logic"],
    },
    {
      title: "Number-guessing game",
      brief: "Random number, 5 attempts, helpful hints.",
      status: "completed",
      tags: ["python", "loops"],
    },
    {
      title: "Tic-tac-toe in HTML",
      brief: "Two-player game, no framework.",
      status: "idea",
      tags: ["html", "js"],
    },
  ],
  GRADE_9: [
    {
      title: "Trigonometry study notes",
      brief: "One-page reference signal for sine/cosine.",
      status: "in_progress",
      tags: ["math", "exam"],
    },
    {
      title: "Probability flashcard set",
      brief: "Build 25 spaced-repetition cards.",
      status: "idea",
      tags: ["math"],
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
        ← Back to {world.journey.name} home
      </Link>

      {justCreatedId ? (
        <div
          role="status"
          className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700"
        >
          ✓ Project draft saved. Find it at the top of the list.
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
            Projects
          </h1>
          <p className="mt-1 text-[15px] text-ink-soft">
            Build something real. {projects.length} project{projects.length === 1 ? "" : "s"} in the{" "}
            {world.journey.name} world.
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
          + New project
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
            Stuck for an idea? {world.teacherName} can build one with you in{" "}
            {config.variant === "calm" ? "2" : config.variant === "parent" ? "1" : "4"} step
            {config.variant === "standard" ? "s" : ""}.
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
            Tell us the topic and the goal — we'll generate a {config.defaultPaceCopy} plan grounded
            in your weak areas and your real sources.
          </p>
        </div>
        <Link
          href={wizardHref}
          className="la-btn"
          style={{ background: world.journey.color, padding: "12px 18px" }}
        >
          Start the wizard →
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
    in_progress: { label: "In progress", color: accent },
    completed: { label: "Completed", color: "var(--j-little)" },
    idea: { label: "Idea", color: "var(--ink-mute)" },
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
