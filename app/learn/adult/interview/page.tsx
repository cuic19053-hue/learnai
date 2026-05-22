import type { Metadata } from "next";
import InterviewWizardClient from "@/components/interview/InterviewWizardClient";

export const metadata: Metadata = {
  title: "AI Interview Trainer",
  description:
    "Prepare for real job interviews. Train key questions, practise a 5-minute self-presentation, and run a recorded mock interview with AI feedback.",
};

export default function AdultInterviewPage() {
  return <InterviewWizardClient />;
}
