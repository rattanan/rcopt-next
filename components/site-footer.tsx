import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
  return <footer className="border-t border-[var(--border)] bg-[#fff8fa]">
    <div className="container-shell grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
      <div><div className="mb-3 flex items-center gap-3"><Image src="/brand/rcopt-crest.png" alt="ตราราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" width={30} height={40} className="h-10 w-auto object-contain" /><strong>RCOPT</strong></div><p className="max-w-sm text-sm leading-7 text-[var(--muted)]">ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย<br />แหล่งข้อมูลความรู้ด้านจักษุวิทยาที่น่าเชื่อถือสำหรับประชาชนและบุคลากรทางการแพทย์</p></div>
      <div><h2 className="footer-title">ลิงก์ที่เกี่ยวข้อง</h2><div className="grid gap-2 text-sm text-[var(--muted)]"><Link href="/about">เกี่ยวกับเรา</Link><Link href="/articles">บทความสุขภาพตา</Link><Link href="/contact">ติดต่อเรา</Link></div></div>
      <div><h2 className="footer-title">ติดต่อเรา</h2><p className="text-sm leading-7 text-[var(--muted)]">อีเมล: admin@rcopt.org<br />เว็บไซต์: www.rcopt.org</p></div>
    </div><div className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--muted)]">© {new Date().getFullYear()} RCOPT. All rights reserved.</div>
  </footer>;
}
