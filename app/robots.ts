import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcopt.org"; return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/index.php"] }, sitemap: `${base}/sitemap.xml` }; }
