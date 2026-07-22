import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.rcopt.org"; return ["", "/doctors", "/articles", "/news", "/about", "/contact"].map((path, index) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: index === 0 ? "weekly" : "monthly", priority: index === 0 ? 1 : 0.7 })); }
