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
  const base = (process.env.NEXTAUTH_URL ?? "https://learnai.example").replace(/\/$/, "");
  const lastModified = new Date();
  return PUBLIC_PATHS.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}
