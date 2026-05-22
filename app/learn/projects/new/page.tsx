import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProjectWizard from "@/components/projects/ProjectWizard";
import { configFor } from "@/lib/projects/wizard-config";
import { getLearnerFirstName } from "@/lib/learn/learner-name";
import { worldFromParam } from "@/lib/learn/worlds";
import { DEMO_PROJECTS } from "@/lib/projects/store";

export const metadata: Metadata = {
  title: "New project",
  description: "Wizard to draft a new project in your world.",
};

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams?: Promise<{ world?: string; prefill?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const world = worldFromParam(params.world);
  if (!world) redirect("/learn/projects");
  const config = configFor(world.slug);
  const closeHref = `/learn/projects?world=${world.slug}`;
  // Personalise the wizard question for signed-in learners; guests get
  // the generic "What do you want to build?" without an awkward name tag.
  const learnerName = (await getLearnerFirstName()) ?? undefined;

  // Optional demo prefill — when a learner picks a ready-to-use card.
  const demo = params.prefill ? DEMO_PROJECTS.find((d) => d.id === params.prefill) : undefined;
  const prefill = demo
    ? {
        topic: demo.topic,
        outcome: demo.outcome,
        sources: demo.sources,
        daysPerWeek: demo.daysPerWeek,
        minutesPerDay: demo.minutesPerDay,
        prefs: demo.prefs,
      }
    : undefined;

  return (
    <ProjectWizard
      config={config}
      journey={world.journey}
      closeHref={closeHref}
      learnerName={learnerName}
      prefill={prefill}
    />
  );
}
