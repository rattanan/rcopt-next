import { env } from "@/lib/env";

export function publicSiteUrl(fallback?: string): string {
  return process.env.NODE_ENV === "production" ? env.SITE_URL.replace(/\/$/u, "") : (fallback ?? env.SITE_URL).replace(/\/$/u, "");
}
