import { describe, expect, it } from "vitest";
import { mapLegacyRoute } from "@/lib/legacy-routes";

describe("legacy URL compatibility", () => {
  it("maps public doctor and content routes", () => {
    expect(mapLegacyRoute("users/profile", "42")).toBe("/doctors/42");
    expect(mapLegacyRoute("arart010/list", "1")).toBe("/news");
    expect(mapLegacyRoute("arart010/list", "2")).toBe("/articles?category=2");
    expect(mapLegacyRoute("arart010/detail", "2235")).toBe("/articles/2235");
    expect(mapLegacyRoute("wbtpc010/list", "1")).toBe("/community/questions");
    expect(mapLegacyRoute("wbtpc010/detail", "7659")).toBe("/community/questions/7659");
    expect(mapLegacyRoute("site/contact", null)).toBe("/contact");
    expect(mapLegacyRoute("site/page", null, "about")).toBe("/about");
  });

  it("does not manufacture a destination for unsafe ids", () => {
    expect(mapLegacyRoute("users/profile", "x")).toBeUndefined();
    expect(mapLegacyRoute("wbtpc010/detail", "not-an-id")).toBeUndefined();
  });
});
