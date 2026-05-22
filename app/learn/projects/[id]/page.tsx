import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import ProjectWorkspace from "@/components/projects/ProjectWorkspace";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";
import { resolveProject } from "@/lib/projects/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const project = resolveProject(id);
  return project
    ? {
        title: `${project.topic} — Project`,
        description: project.outcome || `LearnAI project for ${project.topic}.`,
      }
    : { title: "Project" };
}

export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = resolveProject(id);
  if (!project) notFound();

  const world = WORLDS[project.worldSlug];

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "projects" })}
      pageContext={{
        kind: "lesson",
        topic: project.topic,
        worldLabel: world.journey.name,
      }}
    >
      <Link
        href={`/learn/projects?world=${world.slug}`}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to projects
      </Link>

      <div className="mt-4">
        <ProjectWorkspace project={project} journey={world.journey} />
      </div>
    </LearnerHomeShell>
  );
}
