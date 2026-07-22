import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FileLoginRateLimiter } from "@/lib/auth/login-rate-limit";

describe("file-backed login rate limiter", () => {
  it("blocks after its failure threshold and clears a successful login", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "rcopt-login-limit-"));
    try {
      const limiter = new FileLoginRateLimiter(path.join(directory, "limits.json"), 2, 60_000);
      await limiter.failed("127.0.0.1:admin");
      expect(await limiter.allowed("127.0.0.1:admin")).toBe(true);
      await limiter.failed("127.0.0.1:admin");
      expect(await limiter.allowed("127.0.0.1:admin")).toBe(false);
      await limiter.succeeded("127.0.0.1:admin");
      expect(await limiter.allowed("127.0.0.1:admin")).toBe(true);
    } finally { await rm(directory, { recursive: true, force: true }); }
  });
});
