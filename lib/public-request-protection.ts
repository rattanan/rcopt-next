export type ProtectedRequestKind = "legacy" | "listing" | "detail" | "health";

type RateLimit = { maximum: number; windowMs: number };
type RateEntry = { count: number; resetAt: number };

const LIMITS: Record<ProtectedRequestKind, RateLimit> = {
  legacy: { maximum: 12, windowMs: 60_000 },
  listing: { maximum: 30, windowMs: 60_000 },
  detail: { maximum: 60, windowMs: 60_000 },
  health: { maximum: 10, windowMs: 60_000 },
};

export function classifyProtectedRequest(pathname: string): ProtectedRequestKind | undefined {
  if (pathname === "/index.php") return "legacy";
  if (pathname === "/api/health/database") return "health";
  if (["/doctors", "/articles", "/news", "/community/questions"].includes(pathname)) return "listing";
  if (pathname.startsWith("/doctors/") || pathname.startsWith("/articles/") || pathname.startsWith("/news/") || pathname.startsWith("/community/questions/")) return "detail";
  return undefined;
}

export function isSafePublicQuery(searchParams: URLSearchParams, kind: ProtectedRequestKind): boolean {
  const entries = [...searchParams.entries()];
  if (entries.length > 10) return false;
  if (entries.some(([key, value]) => key.length > 48 || value.length > 160)) return false;
  if (kind !== "legacy") return true;
  const legacyKeys = new Set(["r", "id", "view"]);
  return entries.every(([key]) => legacyKeys.has(key)) && new Set(entries.map(([key]) => key)).size === entries.length;
}

export function clientAddress(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip")?.trim() || "unknown";
}

export class PublicRequestRateLimiter {
  private readonly entries = new Map<string, RateEntry>();

  check(address: string, kind: ProtectedRequestKind, now = Date.now()): { allowed: boolean; retryAfterSeconds: number } {
    const key = `${kind}:${address}`;
    const limit = LIMITS[kind];
    const previous = this.entries.get(key);
    const entry = !previous || previous.resetAt <= now ? { count: 0, resetAt: now + limit.windowMs } : previous;
    entry.count += 1;
    this.entries.set(key, entry);
    return { allowed: entry.count <= limit.maximum, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
}

export function publicCacheControl(kind: ProtectedRequestKind): string {
  if (kind === "legacy") return "public, max-age=300, s-maxage=86400, stale-while-revalidate=86400";
  if (kind === "listing") return "public, max-age=30, s-maxage=60, stale-while-revalidate=300";
  if (kind === "detail") return "public, max-age=60, s-maxage=300, stale-while-revalidate=900";
  return "no-store";
}
