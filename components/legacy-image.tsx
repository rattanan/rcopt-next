/* eslint-disable @next/next/no-img-element */
import { resolveLegacyAsset, type LegacyAssetArea } from "@/lib/legacy-assets";

export function LegacyImage({ path, area, alt, className }: { path: string | null | undefined; area: LegacyAssetArea; alt: string; className?: string }) {
  return <img src={resolveLegacyAsset(path, area)} alt={alt} className={className} loading="lazy" />;
}
