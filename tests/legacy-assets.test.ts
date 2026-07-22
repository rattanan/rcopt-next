import { describe, expect, it } from "vitest";
import { resolveLegacyAsset } from "@/lib/legacy-assets";

describe("legacy asset resolver", () => {
  it("normalizes a legacy upload filename without exposing a local path", () => {
    expect(resolveLegacyAsset("poster one.jpg", "uploads", "https://legacy.example.org/")).toBe("https://legacy.example.org/images/uploads/poster%20one.jpg");
  });

  it("rejects traversal and unsafe protocols", () => {
    expect(resolveLegacyAsset("../private.jpg", "uploads", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
    expect(resolveLegacyAsset("javascript:alert(1)", "banner", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
    expect(resolveLegacyAsset("%", "uploads", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
  });
});
