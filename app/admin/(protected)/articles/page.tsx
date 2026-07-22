import Link from "next/link";
import { ExternalLink, FileText, Search } from "lucide-react";
import { LegacyImage } from "@/components/legacy-image";
import { formatThaiDate } from "@/lib/content-utils";
import { env } from "@/lib/env";
import { type AdminPublishStatus, listAdminContent } from "@/repositories/admin-content-repository";
import type { ContentKind } from "@/repositories/content-repository";

type SearchParams = { kind?: string | string[]; keyword?: string | string[]; status?: string | string[]; page?: string | string[] };
function first(value: string | string[] | undefined): string | undefined { return Array.isArray(value) ? value[0] : value; }
function getPage(value: string | undefined): number { return value && /^\d+$/u.test(value) ? Math.min(Number(value), 10_000) : 1; }

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;
  const kind: ContentKind = first(query.kind) === "news" ? "news" : "article";
  const keyword = (first(query.keyword) ?? "").trim().slice(0, 100);
  const rawStatus = first(query.status);
  const status: AdminPublishStatus = rawStatus === "published" || rawStatus === "draft" ? rawStatus : "all";
  const page = getPage(first(query.page));
  const result = await listAdminContent({ kind, keyword: keyword || undefined, status, page });
  const totalPages = Math.ceil(result.total / 20);
  const baseParams = new URLSearchParams({ kind, status });
  if (keyword) baseParams.set("keyword", keyword);

  return <><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">CONTENT MANAGEMENT</p><h1 className="mt-2 text-3xl font-extrabold">บทความและข่าว</h1><p className="mt-2 text-sm text-[var(--muted)]">ตรวจสอบข้อมูลจาก `arart010` ได้ทั้งรายการเผยแพร่และฉบับร่าง</p></div><span className="rounded-full bg-amber-100 px-3 py-2 text-sm font-bold text-amber-800">{env.ADMIN_WRITE_ENABLED ? "เตรียมเปิดแก้ไข" : "Read-only"}</span></div>
    <form method="get" className="card mt-7 grid gap-3 p-4 lg:grid-cols-[150px_1fr_160px_auto]"><select name="kind" defaultValue={kind} aria-label="ประเภทเนื้อหา" className="h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"><option value="article">บทความ</option><option value="news">ข่าวสาร</option></select><label className="flex h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3"><Search size={17} className="text-[var(--primary)]" /><span className="sr-only">ค้นหาชื่อเนื้อหา</span><input name="keyword" defaultValue={keyword} placeholder="ค้นหาจากชื่อเรื่อง" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label><select name="status" defaultValue={status} aria-label="สถานะเผยแพร่" className="h-11 rounded-xl border border-[var(--border)] bg-white px-3 text-sm"><option value="all">ทุกสถานะ</option><option value="published">เผยแพร่แล้ว</option><option value="draft">ฉบับร่าง</option></select><button type="submit" className="button-primary justify-center">ค้นหา</button></form>
    <p className="mt-6 text-sm text-[var(--muted)]">พบ {result.total.toLocaleString("th-TH")} รายการ</p>
    <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--border)] bg-white"><div className="hidden grid-cols-[72px_minmax(0,1fr)_130px_115px] gap-4 border-b border-[var(--border)] bg-[#fff9fb] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[var(--muted)] md:grid"><span>รูป</span><span>เนื้อหา</span><span>สถานะ</span><span>ดูหน้าเว็บ</span></div>{result.rows.map((item) => <article key={item.id} className="grid gap-4 border-b border-[var(--border)] p-4 last:border-b-0 md:grid-cols-[72px_minmax(0,1fr)_130px_115px] md:items-center md:px-5"><LegacyImage path={item.imagePath} area="uploads" alt="" className="h-16 w-full rounded-xl border border-[var(--border)] bg-gradient-to-br from-white to-[#fff0f5] object-contain" /><div className="min-w-0"><h2 className="font-bold leading-6">{item.title}</h2><p className="mt-1 text-sm text-[var(--muted)]">{item.category.name} · แก้ไข {formatThaiDate(item.updatedAt)}</p>{item.featured && <span className="mt-2 inline-flex rounded-full bg-[#f9e4eb] px-2 py-1 text-xs font-bold text-[#8c3653]">รายการแนะนำ</span>}</div><div><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${item.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>{item.published ? "เผยแพร่แล้ว" : "ฉบับร่าง"}</span></div><Link href={`/${kind === "news" ? "news" : "articles"}/${item.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-[var(--primary-dark)]">เปิดดู <ExternalLink size={15} /></Link></article>)}{!result.rows.length && <div className="grid place-items-center gap-2 p-14 text-center text-[var(--muted)]"><FileText size={26} /><p>ไม่พบเนื้อหาที่ตรงกับเงื่อนไข</p></div>}</div>
    {totalPages > 1 && <nav className="mt-7 flex flex-wrap justify-center gap-2" aria-label="เปลี่ยนหน้ารายการเนื้อหา">{Array.from({ length: Math.min(totalPages, 20) }, (_, index) => { const value = index + 1; const params = new URLSearchParams(baseParams); params.set("page", String(value)); const url = `/admin/articles?${params.toString()}`; return <Link key={value} href={url} className={`rounded-lg border px-3 py-2 text-sm ${value === page ? "border-[var(--primary)] bg-[var(--primary)] text-white" : "border-[var(--border)] bg-white"}`}>{value}</Link>; })}</nav>}</>;
}
