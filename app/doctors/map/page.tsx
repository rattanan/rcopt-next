import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DoctorMap } from "@/components/doctor-map";
import { findDoctors, getDoctorMapOverview, type Doctor, type DoctorMapOverview } from "@/repositories/doctor-repository";

export const metadata: Metadata = { title: "ค้นหาจักษุแพทย์จากแผนที่", description: "ดูจำนวนและรายชื่อจักษุแพทย์รายจังหวัดบนแผนที่ประเทศไทย" };

export default async function DoctorMapPage({ searchParams }: { searchParams: Promise<{ province?: string; page?: string }> }) {
  await connection();
  const query = await searchParams;
  const provinceId = typeof query.province === "string" && /^\d+$/u.test(query.province) ? Number(query.province) : undefined;
  const requestedPage = typeof query.page === "string" && /^\d+$/u.test(query.page) ? Math.max(1, Math.min(Number(query.page), 10000)) : 1;
  let overview: DoctorMapOverview = { total: 0, unlocated: 0, provinces: [] };
  let result: { total: number; rows: Doctor[] } = { total: 0, rows: [] };
  let unavailable = false;
  let page = requestedPage;
  try {
    overview = await getDoctorMapOverview();
    if (overview.provinces.some((province) => province.id === provinceId)) {
      result = await findDoctors({ provinceId, page, pageSize: 12 });
      const lastPage = Math.max(1, Math.ceil(result.total / 12));
      if (page > lastPage) { page = lastPage; result = await findDoctors({ provinceId, page, pageSize: 12 }); }
    }
  } catch { unavailable = true; }
  const selected = overview.provinces.find((province) => province.id === provinceId);
  const pages = Math.max(1, Math.ceil(result.total / 12));
  return <><SiteHeader /><main className="container-shell py-10 sm:py-14">
    <p className="eyebrow">DOCTOR MAP</p><h1 className="section-title mt-3">ค้นหาจักษุแพทย์จากแผนที่</h1><p className="mt-3 max-w-3xl leading-7 text-[var(--muted)]">สำรวจจำนวนจักษุแพทย์ทั่วประเทศไทย และเลือกจังหวัดเพื่อดูรายชื่อจากข้อมูลสถานที่ทำงานที่เปิดเผยต่อสาธารณะ</p>
    {unavailable ? <p role="alert" className="my-8 rounded-2xl bg-amber-50 p-5 text-amber-900">ยังเชื่อมต่อฐานข้อมูลไม่ได้ กรุณาลองใหม่ภายหลัง</p> : <>
      <div className="my-7 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[var(--primary-light)] p-5"><p className="text-sm text-[var(--primary-dark)]">จักษุแพทย์ทั่วประเทศ</p><strong className="mt-2 block text-3xl">{overview.total.toLocaleString("th-TH")} <span className="text-sm font-normal">คน</span></strong></div><div className="rounded-2xl bg-[var(--secondary)] p-5"><p className="text-sm text-[var(--muted)]">จังหวัดที่มีข้อมูลแพทย์</p><strong className="mt-2 block text-3xl">{overview.provinces.filter((province) => province.count > 0).length} <span className="text-sm font-normal">จังหวัด</span></strong></div><div className="col-span-2 rounded-2xl border border-[var(--border)] p-5 sm:col-span-1"><p className="text-sm text-[var(--muted)]">ยังไม่ระบุจังหวัดสาธารณะ</p><strong className="mt-2 block text-3xl">{overview.unlocated.toLocaleString("th-TH")} <span className="text-sm font-normal">คน</span></strong></div></div>
      <DoctorMap overview={overview} selectedProvinceId={selected?.id} />
      <p className="mt-3 text-xs leading-6 text-[var(--muted)]">ยอดรวมประเทศนับแพทย์แต่ละคนครั้งเดียว แพทย์ที่ทำงานหลายจังหวัดอาจปรากฏในจำนวนของแต่ละจังหวัด</p>
      <section id="province-results" className="mt-8 scroll-mt-24 rounded-2xl border border-[var(--border)] p-5 sm:p-7">
        <form key={selected?.id ?? "all"} action="/doctors/map#province-results" method="get" className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="min-w-0 flex-1"><label htmlFor="map-province" className="mb-2 block text-sm font-bold">เลือกจังหวัดเพื่อดูรายชื่อ</label><select id="map-province" name="province" defaultValue={selected?.id ?? ""} className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-3"><option value="">เลือกจังหวัด</option>{overview.provinces.map((province) => <option value={province.id} key={province.id}>{province.name} ({province.count.toLocaleString("th-TH")} คน)</option>)}</select></div><button className="button-primary h-12">ดูรายชื่อ</button><Link className="button-outline h-12" href="/doctors">ค้นหาจากชื่อหรือโรงพยาบาล</Link></form>
        <div aria-live="polite" className="mt-7"><h2 className="text-xl font-bold">{selected ? `จักษุแพทย์ใน${selected.name}` : "เลือกจังหวัดบนแผนที่หรือจากเมนูด้านบน"}</h2>{selected && <p className="mt-2 text-sm text-[var(--muted)]">พบ {result.total.toLocaleString("th-TH")} คน{result.total > 0 && ` · หน้า ${page} จาก ${pages}`}</p>}</div>
        {selected && result.total === 0 && <p className="py-8 text-[var(--muted)]">ยังไม่มีข้อมูลสถานที่ทำงานสาธารณะของจักษุแพทย์ในจังหวัดนี้</p>}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.rows.map((doctor) => <Link href={`/doctors/${doctor.user_id}`} key={doctor.user_id} className="rounded-xl border border-[var(--border)] p-4 hover:bg-[var(--secondary)]"><h3 className="font-bold">{doctor.title} {doctor.firstname} {doctor.lastname}</h3><p className="mt-2 text-sm text-[var(--muted)]">โรงพยาบาล: {doctor.workplaceNames?.join(" / ") || "ไม่ระบุชื่อโรงพยาบาล"}</p><span className="mt-3 block text-sm font-bold text-[var(--primary-dark)]">ดูประวัติและสถานที่ทำงาน →</span></Link>)}</div>
        {pages > 1 && <nav aria-label="เปลี่ยนหน้ารายชื่อจักษุแพทย์" className="mt-6 flex items-center justify-center gap-4">{page > 1 && <Link className="button-outline" href={`/doctors/map?province=${selected?.id}&page=${page - 1}#province-results`}>ก่อนหน้า</Link>}<span className="text-sm">{page} / {pages}</span>{page < pages && <Link className="button-outline" href={`/doctors/map?province=${selected?.id}&page=${page + 1}#province-results`}>ถัดไป</Link>}</nav>}
      </section>
    </>}
  </main><SiteFooter /></>;
}
