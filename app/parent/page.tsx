import type { Metadata } from "next";
import ParentDashboard from "@/components/parent/ParentDashboard";

export const metadata: Metadata = {
  title: "Parent dashboard",
  description:
    "Customize what your child sees, how long, and how loud. YouTube-Kids-style controls with multi-child profiles, quiet hours, approved-content-only safety, and weekly reports.",
};

export default function ParentPage() {
  return <ParentDashboard />;
}
