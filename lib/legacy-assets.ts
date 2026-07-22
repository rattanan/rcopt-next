import { env } from "@/lib/env";

export type LegacyAssetArea = "uploads" | "banner";

const PLACEHOLDER = "/brand/rcopt-crest.png";

function isSafeRelativePath(value: string): boolean {
  try {
    const decoded = decodeURIComponent(value);
    return !decoded.startsWith("/") && !decoded.includes("\\") && !decoded.split("/").includes("..");
  } catch {
    return false;
  }
}

export function resolveLegacyAsset(
  path: string | null | undefined,
  area: LegacyAssetArea,
  baseUrl = env.LEGACY_ASSET_BASE_URL,
): string {
  const value = path?.trim();
  if (!value) return PLACEHOLDER;

  try {
    const absolute = new URL(value);
    return absolute.protocol === "http:" || absolute.protocol === "https:" ? absolute.toString() : PLACEHOLDER;
  } catch {
    // Legacy rows normally store a filename only. Relative paths are validated below.
  }

  if (!baseUrl || !isSafeRelativePath(value)) return PLACEHOLDER;
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const cleanPath = value.replace(/^\.\/+/u, "").replace(/\/+/gu, "/");
  return `${cleanBase}/images/${area}/${encodeURIComponent(cleanPath).replace(/%2F/gu, "/")}`;
}

export const legacyAssetPlaceholder = PLACEHOLDER;
