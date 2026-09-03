import { redirect } from "next/navigation";
import type { LearnerStage } from "@/lib/learn/stages";
import { stageToPath } from "@/lib/learn/stages";
import { readProfile } from "@/lib/learn/profile";

const VALID: LearnerStage[] = [
  "GRADE_6",
  "GRADE_7",
  "GRADE_8",
  "GRADE_9",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

export default async function LearnPage({
  searchParams,
}: {
  searchParams?: Promise<{ stage?: string }>;
}) {
  const params = await (searchParams ?? Promise.resolve({} as { stage?: string }));
  const queryStage = (VALID as string[]).includes(params.stage ?? "")
    ? (params.stage as LearnerStage)
    : undefined;
  if (queryStage) redirect(stageToPath(queryStage));

  const profile = await readProfile();
  if (profile?.stage && (VALID as string[]).includes(profile.stage)) {
    redirect(stageToPath(profile.stage as LearnerStage));
  }

  redirect("/onboarding");
}
