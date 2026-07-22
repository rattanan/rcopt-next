import Link from "next/link";
import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { formatThaiDate, hasLegacyContentImage, stripLegacyHtml } from "@/lib/content-utils";
import { LegacyImage } from "@/components/legacy-image";
import type { ContentKind, PublicContent } from "@/repositories/content-repository";

export function ContentCard({ item, kind }: { item: PublicContent; kind: ContentKind }) {
  const href = `/${kind === "news" ? "news" : "articles"}/${item.id}`;
  const hasImage = hasLegacyContentImage(item.imagePath);
  return <article className="card overflow-hidden">
    {hasImage ? <LegacyImage path={item.imagePath} area="uploads" alt="" className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-[#fff7fa] via-[#fbeaf1] to-[#f5d4e1]"><Image src="/brand/rcopt-crest.png" alt="" width={92} height={120} className="h-28 w-auto object-contain opacity-90" /></div>}
    <div className="p-6"><div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"><CalendarDays size={14} className="text-[var(--primary)]" /><time dateTime={item.publishedAt}>{formatThaiDate(item.publishedAt)}</time><span className="rounded-full bg-[var(--primary-light)] px-2 py-1 text-[var(--primary-dark)]">{item.category.name}</span></div><h2 className="line-clamp-2 text-lg font-bold leading-7"><Link href={href}>{item.title}</Link></h2><p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">{stripLegacyHtml(item.excerpt) || "อ่านรายละเอียดเพิ่มเติม"}</p><Link href={href} className="mt-4 inline-flex text-sm font-bold text-[var(--primary-dark)]">อ่านต่อ</Link></div>
  </article>;
}
