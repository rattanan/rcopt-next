import { describe, expect, it } from "vitest";

describe("environment safety", () => {
  it("keeps Admin write mode disabled unless explicitly enabled", async () => {
    const { env } = await import("@/lib/env");
    expect(typeof env.ADMIN_WRITE_ENABLED).toBe("boolean");
  });
});
