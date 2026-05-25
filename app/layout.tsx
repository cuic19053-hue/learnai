// MUST be first — clears empty-string NEXTAUTH_URL etc. before any
// other module (next-auth, in particular) reads them at import time.
import "@/lib/env-bootstrap";
import "./globals.css";
import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import ProgressProvider from "@/components/progress/ProgressProvider";
import { warnAboutMissingEnv } from "@/lib/env";

warnAboutMissingEnv();

// `||` (not `??`) so an empty-string env var also falls back —
// without this, Next.js's metadata resolver can build `new URL("")`
// during prerender of static pages (eg /licenses) and crash with
// ERR_INVALID_URL. The fallback is a development hostname; production
// deploys set NEXTAUTH_URL to the real origin.
const SITE_BASE =
  (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "").trim() ||
  "http://localhost:3000";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE),
  title: {
    default: "LearnAI · One teacher. Every learner.",
    template: "%s · LearnAI",
  },
  description:
    "Adaptive AI teaching for every age. One pedagogical loop, six learning worlds — playful, mission, exam, professional, calm.",
  applicationName: "LearnAI",
  keywords: [
    "AI tutor",
    "lifelong learning",
    "kids education",
    "exam preparation",
    "adult learning",
    "senior learning",
  ],
  authors: [{ name: "LearnAI" }],
  openGraph: {
    title: "LearnAI — One teacher. Every learner.",
    description: "Adaptive AI teaching for every age. Same six-step loop, six different worlds.",
    type: "website",
    siteName: "LearnAI",
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnAI — One teacher. Every learner.",
    description: "Adaptive AI teaching for every age.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2e5bff",
  width: "device-width",
  initialScale: 1,
  // viewportFit cover lets content slip behind the iOS notch / home
  // indicator; fixed-bottom UI then opts back in via
  // `padding-bottom: env(safe-area-inset-bottom)`.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${jakarta.variable} ${geistMono.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-1 focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SessionProviderWrapper>
          <ProgressProvider>{children}</ProgressProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
