import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { LegacyImage } from "@/components/legacy-image";
import { formatThaiDate, sanitizeLegacyHtml } from "@/lib/content-utils";
import { findPublicContentById, type ContentKind } from "@/repositories/content-repository";

export async function ContentDetailPage({ id, kind }: { id: number; kind: ContentKind }) {
  const item = await findPublicContentById(id);
  if (!item || (kind === "news" && item.category.id !== 1)) notFound();
  const sectionHref = kind === "news" ? "/news" : "/articles";
  return <><SiteHeader /><main className="container-shell max-w-4xl py-12"><nav className="text-sm text-[var(--muted)]" aria-label="Breadcrumb"><Link href="/">หน้าหลัก</Link><span className="px-2">/</span><Link href={sectionHref}>{kind === "news" ? "ข่าวสาร" : "บทความ"}</Link><span className="px-2">/</span><span aria-current="page">{item.category.name}</span></nav><article className="mt-7"><p className="eyebrow">{item.category.name}</p><h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-[-.03em] sm:text-5xl">{item.title}</h1><div className="mt-5 flex items-center gap-2 text-sm text-[var(--muted)]"><CalendarDays size={16} className="text-[var(--primary)]" /><time dateTime={item.publishedAt}>{formatThaiDate(item.publishedAt)}</time></div><LegacyImage path={item.imagePath} area="uploads" alt="" className="mt-8 max-h-[520px] w-full rounded-2xl border border-[var(--border)] object-contain" /><div className="legacy-content mt-9 text-[17px] leading-8 text-[#3e363b]" dangerouslySetInnerHTML={{ __html: sanitizeLegacyHtml(item.body) }} /></article></main><SiteFooter /></>;
}
