import Link from "next/link";
import Image from "next/image";
import { NavigationMenu } from "./navigation-menu";
import { getPublicMenu } from "@/repositories/menu-repository";

export async function SiteHeader() {
  const menu = await getPublicMenu();

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="container-shell flex h-[76px] items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3" aria-label="ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย">
          <Image src="/brand/rcopt-crest.png" alt="ตราราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย" width={42} height={56} priority className="h-14 w-auto object-contain" />
          <span className="leading-tight"><strong className="block text-[15px] text-[var(--ink)]">RCOPT</strong><span className="text-xs text-[var(--muted)]">ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย</span></span>
        </Link>
        <NavigationMenu items={menu} />
      </div>
    </header>
  );
}
