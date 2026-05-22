import type { Metadata } from "next";
import UserSettingsClient from "@/components/settings/UserSettingsClient";

export const metadata: Metadata = {
  title: "Your settings — LearnAI",
  description:
    "Pick your AI tutor, voice, and speech engine. Everything saves on your device — no account required.",
};

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return <UserSettingsClient />;
}
