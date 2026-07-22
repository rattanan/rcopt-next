import { describe, expect, it } from "vitest";
import { isPublishedLegacyContent } from "@/repositories/content-repository";
import { normalizePagination } from "@/lib/pagination";

describe("bounded public queries", () => {
  it("normalizes malformed pagination to a bounded stable offset", () => {
    expect(normalizePagination(-4, 400, 30)).toEqual({ page: 1, pageSize: 30, offset: 0 });
    expect(normalizePagination(3, 12)).toEqual({ page: 3, pageSize: 12, offset: 24 });
  });

  it("only treats the legacy published status as public", () => {
    expect(isPublishedLegacyContent("Yes")).toBe(true);
    expect(isPublishedLegacyContent("No")).toBe(false);
  });
});
