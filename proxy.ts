import { NextResponse, type NextRequest } from "next/server";
import { PublicRequestRateLimiter, classifyProtectedRequest, clientAddress, isSafePublicQuery, publicCacheControl } from "@/lib/public-request-protection";

// This is a fast, per-instance circuit breaker. Production must also enforce the
// documented reverse-proxy/CDN limits so bots cannot bypass it by spreading load.
const limiter = new PublicRequestRateLimiter();

export function proxy(request: NextRequest) {
  const kind = classifyProtectedRequest(request.nextUrl.pathname);
  if (!kind || (request.method !== "GET" && request.method !== "HEAD")) return NextResponse.next();
  if (request.nextUrl.search.length > 1_024 || !isSafePublicQuery(request.nextUrl.searchParams, kind)) {
    return new NextResponse("Invalid request", { status: 400, headers: { "Cache-Control": "no-store" } });
  }

  const result = limiter.check(clientAddress(request.headers), kind);
  if (!result.allowed) {
    return new NextResponse("Too many requests", { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(result.retryAfterSeconds) } });
  }
  return NextResponse.next({ headers: { "Cache-Control": publicCacheControl(kind), "Vary": "Accept-Encoding" } });
}

export const config = { matcher: ["/index.php", "/doctors/:path*", "/articles/:path*", "/news/:path*", "/community/questions/:path*", "/api/health/database"] };
