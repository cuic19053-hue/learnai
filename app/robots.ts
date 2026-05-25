import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  // `||` (not `??`) so an empty-string env var still falls back.
  const raw = (process.env.NEXTAUTH_URL || "").trim();
  const base = raw || "https://learnai.example";
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/parent", "/classroom", "/bookings"],
      },
    ],
    sitemap: `${base.replace(/\/$/, "")}/sitemap.xml`,
  };
}
