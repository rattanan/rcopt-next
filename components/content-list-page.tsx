import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, FileText, Search } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ContentCard } from "@/components/content-card";
import { LegacyImage } from "@/components/legacy-image";
import { formatThaiDate, hasLegacyContentImage, stripLegacyHtml } from "@/lib/content-utils";
import { getArticleCategories, listPublicContent, type ContentKind } from "@/repositories/content-repository";

type SearchParams = Promise<{ category?: string; page?: string; q?: string }>;

export async function ContentListPage({ kind, searchParams }: { kind: ContentKind; searchParams: SearchParams }) {
  const query = await searchParams;
  const isArticle = kind === "article";
  const categoryId = isArticle && typeof query.category === "string" && /^\d+$/u.test(query.category) ? Number(query.category) : undefined;
  const requestedPage = typeof query.page === "string" && /^\d+$/u.test(query.page) ? Math.max(1, Math.min(Number(query.page), 10_000)) : 1;
  const keyword = isArticle && typeof query.q === "string" ? query.q.trim().slice(0, 200) : "";
  const [initialResult, categories] = await Promise.all([
    listPublicContent({ kind, categoryId, page: requestedPage, keyword }),
    isArticle ? getArticleCategories() : Promise.resolve([]),
  ]);
  const totalPages = Math.max(1, Math.ceil(initialResult.total / 12));
  const page = Math.min(requestedPage, totalPages);
  const result = page === requestedPage ? initialResult : await listPublicContent({ kind, categoryId, page, keyword });
  const title = isArticle ? "บทความและคลังความรู้" : "ข่าวสารและกิจกรรม";
  const basePath = isArticle ? "/articles" : "/news";
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const pageHref = (value: number) => {
    const params = new URLSearchParams();
    if (categoryId) params.set("category", String(categoryId));
    if (keyword) params.set("q", keyword);
    params.set("page", String(value));
    return `${basePath}?${params}`;
  };
  const pageNumbers = Array.from(new Set([1, page - 1, page, page + 1, totalPages])).filter((value) => value >= 1 && value <= totalPages).sort((a, b) => a - b);
  const pageLinkClass = "flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-sm hover:bg-[var(--primary-light)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]";

  return <><SiteHeader /><main className="container-shell py-10 sm:py-14">
    <p className="eyebrow mb-3">{isArticle ? "KNOWLEDGE" : "NEWS"}</p>
    <h1 className="section-title">{title}</h1>
    <p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">{isArticle ? "ค้นหาบทความ งานวิจัย และความรู้ด้านจักษุวิทยา เลือกหมวดหมู่ที่สนใจเพื่อเริ่มอ่าน" : "ข้อมูลที่เผยแพร่จากฐานข้อมูลเดิมของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย"}</p>

    {isArticle && <form key={`${categoryId ?? ""}:${keyword}`} action={basePath} method="get" role="search" aria-label="ค้นหาบทความ" className="mt-7 grid min-w-0 gap-4 rounded-2xl border border-[var(--border)] bg-[var(--secondary)] p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
      <div className="min-w-0"><label htmlFor="article-search" className="mb-2 block text-sm font-bold">ค้นหาบทความ</label><div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-white px-3 focus-within:ring-2 focus-within:ring-[var(--primary)]"><Search size={18} aria-hidden="true" className="shrink-0 text-[var(--muted)]" /><input id="article-search" type="search" name="q" defaultValue={keyword} maxLength={200} placeholder="พิมพ์ชื่อบทความหรือคำค้น…" className="h-12 min-w-0 w-full bg-transparent text-sm outline-none" /></div></div>
      <div className="min-w-0"><label htmlFor="article-category" className="mb-2 block text-sm font-bold">หมวดหมู่</label><select id="article-category" name="category" defaultValue={categoryId ?? ""} className="h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-white px-3 text-sm focus-visible:outline-2 focus-visible:outline-[var(--primary)]"><option value="">ทุกหมวดหมู่</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
      <button type="submit" className="button-primary h-12 gap-2"><Search size={17} aria-hidden="true" />ค้นหา</button>
    </form>}

    <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
      <div className="min-w-0"><h2 className="break-words font-bold">{selectedCategory?.name ?? (isArticle ? "บทความทั้งหมด" : "ข่าวสารทั้งหมด")}</h2><p className="mt-1 text-sm text-[var(--muted)]">{keyword && <>ผลการค้นหา “{keyword}” · </>}พบ {result.total.toLocaleString("th-TH")} รายการ{result.total > 0 && <> · แสดง {(page - 1) * 12 + 1}–{Math.min(page * 12, result.total)}</>}</p></div>
      {isArticle && (categoryId || keyword) && <Link href={basePath} className="rounded-lg px-3 py-2 text-sm font-bold text-[var(--primary-dark)] hover:bg-[var(--primary-light)]">ล้างตัวกรอง</Link>}
    </div>

    {isArticle ? <div className="divide-y divide-[var(--border)]">{result.rows.map((item) => <article key={item.id} className="group relative flex items-start gap-4 py-5 sm:gap-5 sm:py-6">
      {hasLegacyContentImage(item.imagePath) ? <LegacyImage path={item.imagePath} area="uploads" alt="" className="hidden h-24 w-32 shrink-0 rounded-xl object-cover sm:block" /> : <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)] text-[var(--primary)] sm:flex"><FileText size={24} aria-hidden="true" /></div>}
      <div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[var(--muted)]"><span className="rounded-md bg-[var(--primary-light)] px-2 py-1 leading-5 text-[var(--primary-dark)]">{item.category.name}</span><time dateTime={item.publishedAt}>{formatThaiDate(item.publishedAt)}</time></div><h3 className="text-base font-bold leading-7 sm:text-lg"><Link href={`/articles/${item.id}`} className="after:absolute after:inset-0 after:rounded-xl hover:text-[var(--primary-dark)] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-[var(--primary)]">{item.title}</Link></h3><p className="mt-1 line-clamp-2 text-sm leading-6 text-[var(--muted)]">{stripLegacyHtml(item.excerpt)}</p></div><ArrowUpRight size={20} aria-hidden="true" className="mt-2 shrink-0 text-[var(--primary)] transition-transform group-hover:translate-x-0.5" />
    </article>)}</div> : <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.rows.map((item) => <ContentCard key={item.id} item={item} kind={kind} />)}</div>}

    {result.rows.length === 0 && <div className="py-16 text-center"><Search size={28} aria-hidden="true" className="mx-auto mb-4 text-[var(--muted)]" /><h2 className="font-bold">ไม่พบ{isArticle ? "บทความ" : "เนื้อหา"}{keyword || categoryId ? "ที่ตรงกับการค้นหา" : "ที่เผยแพร่ในขณะนี้"}</h2>{isArticle && (keyword || categoryId) && <><p className="mt-2 text-sm text-[var(--muted)]">ลองใช้คำค้นอื่น หรือเลือกหมวดหมู่ทั้งหมด</p><Link href={basePath} className="button-outline mt-5">ดูบทความทั้งหมด</Link></>}</div>}
    {totalPages > 1 && <nav className="mt-8 border-t border-[var(--border)] pt-6" aria-label="เปลี่ยนหน้า"><p className="mb-4 text-center text-sm text-[var(--muted)]">หน้า {page} จาก {totalPages}</p><div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
      {page > 1 && <Link href={pageHref(page - 1)} className={pageLinkClass} aria-label="หน้าก่อนหน้า"><ChevronLeft size={18} /></Link>}
      {pageNumbers.map((value, index) => <span key={value} className="contents">{index > 0 && value - pageNumbers[index - 1] > 1 && <span className="px-1 text-[var(--muted)]">…</span>}<Link href={pageHref(value)} aria-label={`หน้า ${value}`} aria-current={value === page ? "page" : undefined} className={`${pageLinkClass} ${value === page ? "border-[var(--primary)] bg-[var(--primary)] font-bold text-white hover:bg-[var(--primary-dark)]" : ""}`}>{value}</Link></span>)}
      {page < totalPages && <Link href={pageHref(page + 1)} className={pageLinkClass} aria-label="หน้าถัดไป"><ChevronRight size={18} /></Link>}
    </div></nav>}
  </main><SiteFooter /></>;
}
