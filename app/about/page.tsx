import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Landmark, MapPin, Users } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "เกี่ยวกับเรา", description: "ประวัติ ภาระหน้าที่ คณะกรรมการ และสถานที่ติดต่อของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" };

const aboutLinks = [
  { title: "ประวัติราชวิทยาลัยฯ", text: "ความเป็นมาและเหตุการณ์สำคัญของราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", href: "/articles/1135", icon: Landmark },
  { title: "ภาระหน้าที่", text: "บทบาท มาตรฐานวิชาชีพ และหน้าที่ตามข้อบังคับแพทยสภา", href: "/articles/1136", icon: BookOpen },
  { title: "คณะกรรมการ", text: "ข้อมูลคณะกรรมการและการดำเนินงานของราชวิทยาลัยฯ", href: "/articles?category=11", icon: Users },
  { title: "สถานที่ติดต่อ", text: "ที่ตั้งสำนักงาน ช่องทางติดต่อ และข้อมูลการประสานงาน", href: "/articles/1137", icon: MapPin },
];

export default function AboutPage() {
  return <><SiteHeader /><main><section className="bg-[var(--secondary)] py-14 sm:py-20"><div className="container-shell max-w-4xl"><p className="eyebrow mb-3">ABOUT RCOPT</p><h1 className="section-title text-3xl sm:text-5xl">ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย</h1><p className="mt-5 max-w-3xl text-base leading-8 text-[var(--muted)]">ดำเนินงานเพื่อยกระดับมาตรฐานการประกอบวิชาชีพจักษุวิทยา ส่งเสริมการศึกษาและวิจัย รวมถึงเผยแพร่ความรู้ที่เป็นประโยชน์ต่อประชาชน</p></div></section><section className="container-shell py-14 sm:py-20"><div className="grid gap-5 sm:grid-cols-2">{aboutLinks.map(({ title, text, href, icon: Icon }) => <Link key={title} href={href} className="card group flex gap-5 p-6 sm:p-7"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]"><Icon size={22} /></span><span><span className="block text-lg font-extrabold text-[var(--ink)]">{title}</span><span className="mt-2 block text-sm leading-7 text-[var(--muted)]">{text}</span><span className="mt-4 block text-sm font-bold text-[var(--primary-dark)]">ดูรายละเอียด →</span></span></Link>)}</div></section></main><SiteFooter /></>;
}
