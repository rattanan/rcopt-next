import Link from "next/link";
import Image from "next/image";
import { LogIn, UserRound } from "lucide-react";
import { NavigationMenu } from "./navigation-menu";
import { getActiveAdminHeaderIdentity } from "@/lib/auth/guards";
import { getActiveDoctorIdentity } from "@/lib/auth/guards";
import { getPublicMenu } from "@/repositories/menu-repository";

export async function SiteHeader() {
  const [menu, doctorIdentity, adminIdentity] = await Promise.all([getPublicMenu(), getActiveDoctorIdentity(), getActiveAdminHeaderIdentity()]);
  const identity = doctorIdentity ? { firstName: doctorIdentity.firstName, href: "/community/questions" } : adminIdentity ? { firstName: adminIdentity.firstName, href: "/admin" } : undefined;

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย">
          <Image src="/brand/rcopt-crest.png" alt="ตราราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" width={42} height={56} priority className="h-14 w-auto object-contain" />
          <span className="leading-tight"><strong className="block text-[15px] text-[var(--ink)]">RCOPT</strong><span className="text-xs text-[var(--muted)]">ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย</span></span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <NavigationMenu items={menu} />
          {identity ? <Link href={identity.href} className="hidden items-center gap-2 rounded-xl bg-[var(--primary-light)] px-3 py-2 text-sm font-bold text-[var(--primary-dark)] sm:inline-flex"><UserRound size={16} />Hi, {identity.firstName}</Link> : <Link href="/login" className="hidden items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-sm font-bold text-[var(--primary-dark)] hover:bg-[var(--primary-light)] sm:inline-flex"><LogIn size={16} />เข้าสู่ระบบ</Link>}
        </div>
      </div>
    </header>
  );
}
