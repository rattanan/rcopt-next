export type LegacyAssetArea = "uploads" | "banner" | "member" | "banners" | "banner2019";

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
  baseUrl?: string,
): string {
  const value = path?.trim();
  if (!value) return PLACEHOLDER;

  try {
    const absolute = new URL(value);
    return absolute.protocol === "http:" || absolute.protocol === "https:" ? absolute.toString() : PLACEHOLDER;
  } catch {
    // Legacy rows normally store a filename only. Relative paths are validated below.
  }

  if (!isSafeRelativePath(value)) return PLACEHOLDER;
  const cleanPath = value.replace(/^\.\/+/u, "").replace(/\/+/gu, "/");
  // Legacy images are copied into public/images, so serve them from the same
  // HTTPS origin without a file-system or remote-host proxy.
  void baseUrl;
  return `/images/${area}/${encodeURIComponent(cleanPath).replace(/%2F/gu, "/")}`;
}

export const legacyAssetPlaceholder = PLACEHOLDER;
