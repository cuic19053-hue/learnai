import type { MetadataRoute } from "next";

const PUBLIC_PATHS = [
  "/",
  "/onboarding",
  "/teachers",
  "/learn/kids",
  "/learn/explorer",
  "/learn/builder",
  "/learn/scholar",
  "/learn/adult",
  "/learn/senior",
];

export default function sitemap(): MetadataRoute.Sitemap {
  // `||` (not `??`) so that an empty-string NEXTAUTH_URL — which CI can
  // set unintentionally — still falls back. An empty base produces
  // `new URL("/path")` which throws ERR_INVALID_URL during prerender.
  const raw = (process.env.NEXTAUTH_URL || "").trim();
  const base = (raw || "https://learnai.example").replace(/\/$/, "");
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
