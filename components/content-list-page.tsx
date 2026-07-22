import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ContentCard } from "@/components/content-card";
import { getArticleCategories, listPublicContent, type ContentKind } from "@/repositories/content-repository";

export async function ContentListPage({ kind, searchParams }: { kind: ContentKind; searchParams: Promise<{ category?: string; page?: string }> }) {
  const query = await searchParams;
  const categoryId = kind === "article" && /^\d+$/u.test(query.category ?? "") ? Number(query.category) : undefined;
  const page = /^\d+$/u.test(query.page ?? "") ? Math.min(Number(query.page), 10_000) : 1;
  const [result, categories] = await Promise.all([listPublicContent({ kind, categoryId, page }), kind === "article" ? getArticleCategories() : Promise.resolve([])]);
  const title = kind === "news" ? "ข่าวสารและกิจกรรม" : "บทความและคลังความรู้";
  const basePath = kind === "news" ? "/news" : "/articles";
  const totalPages = Math.ceil(result.total / 12);
  return <><SiteHeader /><main className="container-shell py-14"><p className="eyebrow mb-3">{kind === "news" ? "NEWS" : "KNOWLEDGE"}</p><h1 className="section-title">{title}</h1><p className="mt-3 max-w-2xl leading-7 text-[var(--muted)]">ข้อมูลที่เผยแพร่จากฐานข้อมูลเดิมของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย</p>{kind === "article" && <nav className="mt-7 flex flex-wrap gap-2" aria-label="หมวดบทความ"><Link href={basePath} className={`rounded-full border px-3 py-2 text-sm ${!categoryId ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>ทุกหมวด</Link>{categories.map((category) => <Link key={category.id} href={`${basePath}?category=${category.id}`} className={`rounded-full border px-3 py-2 text-sm ${categoryId === category.id ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>{category.name}</Link>)}</nav>}<p className="mt-8 text-sm text-[var(--muted)]">พบ {result.total.toLocaleString("th-TH")} รายการ</p><div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{result.rows.map((item) => <ContentCard key={item.id} item={item} kind={kind} />)}</div>{result.rows.length === 0 && <p className="py-16 text-center text-[var(--muted)]">ไม่พบเนื้อหาที่เผยแพร่ในขณะนี้</p>}{totalPages > 1 && <nav className="mt-10 flex flex-wrap justify-center gap-2" aria-label="เปลี่ยนหน้า">{Array.from({ length: Math.min(totalPages, 20) }, (_, index) => { const value = index + 1; const params = new URLSearchParams(); if (categoryId) params.set("category", String(categoryId)); params.set("page", String(value)); return <Link key={value} href={`${basePath}?${params}`} className={`rounded-lg border px-3 py-2 text-sm ${value === page ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)]"}`}>{value}</Link>; })}</nav>}</main><SiteFooter /></>;
}
