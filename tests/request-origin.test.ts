import { describe, expect, it } from "vitest";
import { isTrustedRequestOrigin, requestHost } from "@/lib/request-origin";

describe("request origin validation", () => {
  it("uses the first forwarded host behind a reverse proxy", () => {
    const headers = new Headers({ host: "localhost:3002", "x-forwarded-host": "rcopt.rattanan.dev, proxy.internal", origin: "https://rcopt.rattanan.dev" });
    expect(requestHost(headers)).toBe("rcopt.rattanan.dev");
    expect(isTrustedRequestOrigin(headers)).toBe(true);
  });

  it("accepts an explicitly configured public host", () => {
    const headers = new Headers({ host: "localhost:3002", origin: "https://rcopt.rattanan.dev" });
    expect(isTrustedRequestOrigin(headers, ["rcopt.rattanan.dev"])).toBe(true);
  });

  it("rejects malformed and unrelated origins", () => {
    expect(isTrustedRequestOrigin(new Headers({ host: "rcopt.rattanan.dev", origin: "not a url" }))).toBe(false);
    expect(isTrustedRequestOrigin(new Headers({ host: "rcopt.rattanan.dev", origin: "https://attacker.example" }))).toBe(false);
  });
});
