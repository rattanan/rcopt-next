import { createHash, timingSafeEqual } from "node:crypto";

export function verifyLegacyMd5Password(password: string, legacyHash: string): boolean {
  const submitted = createHash("md5").update(password, "utf8").digest("hex");
  const expected = legacyHash.trim().toLowerCase();
  if (!/^[a-f0-9]{32}$/u.test(expected)) return false;
  return timingSafeEqual(Buffer.from(submitted, "utf8"), Buffer.from(expected, "utf8"));
}
