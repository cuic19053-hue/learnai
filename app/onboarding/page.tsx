import type { Metadata } from "next";
import OnboardingWizard from "@/components/learn/OnboardingWizard";
import type { LearnerStage } from "@/lib/learn/stages";

export const metadata: Metadata = {
  title: "Get started",
  description: "Tell us who is learning. We tune the experience to that person.",
};

const VALID: LearnerStage[] = [
  "LITTLE_LEARNER",
  "EXPLORER",
  "BUILDER",
  "SCHOLAR",
  "UNIVERSITY",
  "PROFESSIONAL",
  "SENIOR",
];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ stage?: string }>;
}) {
  const params = await (searchParams ?? Promise.resolve({} as { stage?: string }));
  const initialStage = (VALID as string[]).includes(params.stage ?? "")
    ? (params.stage as LearnerStage)
    : undefined;
  return (
    <div id="main">
      <OnboardingWizard initialStage={initialStage} />
    </div>
  );
}
