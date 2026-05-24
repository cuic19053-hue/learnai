/**
 * /admin/design-gallery
 *
 * Visual QA tool for the WikiTest design system. Renders all 52
 * screens from the handoff bundle in a sidebar-driven gallery so an
 * admin can step through them with arrow keys and verify each one
 * matches the prototype.
 *
 * Admin-only (the page is under /admin which is gated by the existing
 * `app/admin/layout.tsx`).
 */

import type { Metadata } from "next";
import GalleryClient from "@/components/admin/design-gallery/GalleryClient";

export const metadata: Metadata = {
  title: "Design Gallery · LearnAI Admin",
  description: "Step through every WikiTest screen.",
};

export const dynamic = "force-dynamic";

export default function DesignGalleryPage() {
  return <GalleryClient />;
}
