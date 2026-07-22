"use client";

import Link from "next/link";
import { FileText, Image as ImageIcon, LayoutDashboard, Users } from "lucide-react";
import { usePathname } from "next/navigation";

const items = [{ href: "/admin", label: "ภาพรวม", icon: LayoutDashboard, exact: true }, { href: "/admin/users", label: "ผู้ใช้และโปรไฟล์", icon: Users }, { href: "/admin/articles", label: "บทความและข่าว", icon: FileText }, { href: "/admin/banners", label: "แบนเนอร์", icon: ImageIcon }];

export function AdminNav() {
  const pathname = usePathname();
  return <nav className="flex gap-2 overflow-x-auto lg:grid" aria-label="เมนูผู้ดูแล">{items.map(({ href, label, icon: Icon, exact }) => { const active = exact ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`admin-nav-link ${active ? "admin-nav-link-active" : ""}`}><Icon size={17} />{label}</Link>; })}</nav>;
}
