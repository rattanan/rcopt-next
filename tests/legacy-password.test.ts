import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyLegacyMd5Password } from "@/lib/auth/legacy-password";
describe("legacy password compatibility", () => { it("verifies the legacy MD5 format without accepting malformed hashes", () => { const hash = createHash("md5").update("correct horse battery staple", "utf8").digest("hex"); expect(verifyLegacyMd5Password("correct horse battery staple", hash)).toBe(true); expect(verifyLegacyMd5Password("incorrect", hash)).toBe(false); expect(verifyLegacyMd5Password("correct horse battery staple", "not-a-hash")).toBe(false); }); });
