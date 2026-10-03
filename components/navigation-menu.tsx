"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { SiteMenuItem } from "@/repositories/menu-repository";

type Props = { items: SiteMenuItem[]; accountHref?: string; accountLabel?: string };

function MenuLink({ item, onNavigate }: { item: SiteMenuItem; onNavigate: () => void }) {
  if (!item.href) return <span className="navigation-label">{item.label}</span>;
  if (/^(https?:|mailto:|tel:)/i.test(item.href)) return <a href={item.href} className="navigation-link" onClick={onNavigate}>{item.label}</a>;
  return <Link href={item.href} className="navigation-link" onClick={onNavigate}>{item.label}</Link>;
}

function Branch({ item, root = false, onNavigate }: { item: SiteMenuItem; root?: boolean; onNavigate: () => void }) {
  if (item.separator) return <li className="navigation-separator" role="separator" />;
  if (!item.children.length) return <li><MenuLink item={item} onNavigate={onNavigate} /></li>;
  return <li><details className={root ? "navigation-root" : "navigation-branch"} onToggle={root ? (event) => {
    const current = event.currentTarget;
    if (current.open) current.closest("nav")?.querySelectorAll<HTMLDetailsElement>("details.navigation-root").forEach((other) => { if (other !== current) other.open = false; });
  } : undefined}>
    <summary>{item.label}<ChevronDown size={15} aria-hidden="true" /></summary>
    <ul className={root ? "navigation-panel" : "navigation-children"}>
      {item.href && <li><MenuLink item={{ ...item, label: `ดูทั้งหมด: ${item.label}`, children: [] }} onNavigate={onNavigate} /></li>}
      {item.children.map((child) => <Branch key={child.id} item={child} onNavigate={onNavigate} />)}
    </ul>
  </details></li>;
}

export function NavigationMenu({ items, accountHref = "/login", accountLabel = "เข้าสู่ระบบ" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const close = () => {
    setIsOpen(false);
    container.current?.querySelectorAll<HTMLDetailsElement>("details[open]").forEach((detail) => { detail.open = false; });
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!container.current?.contains(event.target as Node)) close(); };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !container.current?.contains(event.target as Node)) return;
      const detail = (event.target as HTMLElement).closest<HTMLDetailsElement>("details[open]");
      if (detail) { detail.open = false; detail.querySelector("summary")?.focus(); }
      else { close(); toggle.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  return <div ref={container}>
    <nav className="desktop-navigation" aria-label="เมนูหลัก"><ul className="navigation-top">{items.map((item) => <Branch key={item.id} item={item} root onNavigate={close} />)}</ul></nav>
    <button ref={toggle} className="icon-button mobile-navigation-trigger" type="button" aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-expanded={isOpen} aria-controls="mobile-navigation" onClick={() => setIsOpen((open) => !open)}>{isOpen ? <X size={21} /> : <Menu size={21} />}</button>
    {isOpen && <nav id="mobile-navigation" className="mobile-menu mobile-navigation-panel" aria-label="เมนูหลักสำหรับมือถือ"><ul>{items.map((item) => <Branch key={item.id} item={item} onNavigate={close} />)}<li className="border-t border-[var(--border)]"><Link href={accountHref} onClick={close} className="navigation-link font-bold">{accountLabel}</Link></li></ul></nav>}
  </div>;
}
