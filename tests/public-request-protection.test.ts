import { describe, expect, it } from "vitest";
import { PublicRequestRateLimiter, classifyProtectedRequest, isSafePublicQuery, publicCacheControl } from "@/lib/public-request-protection";

describe("public request protection", () => {
  it("classifies database-backed pages and rejects legacy query pollution", () => {
    expect(classifyProtectedRequest("/doctors")).toBe("listing");
    expect(classifyProtectedRequest("/doctors/42")).toBe("detail");
    expect(isSafePublicQuery(new URLSearchParams("r=users%2Fprofile&id=42"), "legacy")).toBe(true);
    expect(isSafePublicQuery(new URLSearchParams("r=users%2Fprofile&id=42&Urcon010_sort=name"), "legacy")).toBe(false);
  });

  it("limits a legacy client while allowing short CDN caching for public pages", () => {
    const limiter = new PublicRequestRateLimiter();
    for (let index = 0; index < 60; index += 1) expect(limiter.check("198.51.100.10", "legacy", 0).allowed).toBe(true);
    expect(limiter.check("198.51.100.10", "legacy", 0)).toMatchObject({ allowed: false, retryAfterSeconds: 60 });
    expect(publicCacheControl("detail")).toContain("s-maxage=300");
  });
});
