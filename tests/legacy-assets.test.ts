import { describe, expect, it } from "vitest";
import { resolveLegacyAsset } from "@/lib/legacy-assets";

describe("legacy asset resolver", () => {
  it("normalizes a legacy upload filename without exposing a local path", () => {
    expect(resolveLegacyAsset("poster one.jpg", "uploads", "https://legacy.example.org/")).toBe("/images/uploads/poster%20one.jpg");
  });

  it("rejects traversal and unsafe protocols", () => {
    expect(resolveLegacyAsset("../private.jpg", "uploads", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
    expect(resolveLegacyAsset("javascript:alert(1)", "banner", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
    expect(resolveLegacyAsset("%", "uploads", "https://legacy.example.org")).toBe("/brand/rcopt-crest.png");
  });

  it("supports the fixed legacy sponsor-logo folders", () => {
    expect(resolveLegacyAsset("logo-avc.png", "banners", "https://legacy.example.org")).toBe("/images/banners/logo-avc.png");
    expect(resolveLegacyAsset("topcon.png", "banner2019", "https://legacy.example.org")).toBe("/images/banner2019/topcon.png");
  });
});

describe("runtime profile uploads", () => {
  it("serves new profile uploads through the dynamic file route without a restart", () => {
    const filename = "profile-2292-51034a28-0ba3-40c4-8735-cc4599e83a82.png";
    expect(resolveLegacyAsset(filename, "member")).toBe(`/api/legacy-assets/member/${filename}`);
  });
  it("keeps existing member photos on their static URLs", () => {
    expect(resolveLegacyAsset("legacy-photo.jpg", "member")).toBe("/images/member/legacy-photo.jpg");
  });
});
