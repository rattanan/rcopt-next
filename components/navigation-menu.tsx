"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import type { SiteMenuItem } from "@/repositories/menu-repository";

type Props = { items: SiteMenuItem[] };

function MenuLink({ item, className, onClick }: { item: SiteMenuItem; className?: string; onClick?: () => void }) {
  const content = <>{item.label}{item.children.length > 0 && <ChevronDown size={15} aria-hidden />}</>;
  if (!item.href) return <span className={className}>{content}</span>;
  if (/^(https?:|mailto:|tel:)/i.test(item.href)) return <a href={item.href} className={className} onClick={onClick}>{content}</a>;
  return <Link href={item.href} className={className} onClick={onClick}>{content}</Link>;
}

function Dropdown({ items, depth = 0 }: { items: SiteMenuItem[]; depth?: number }) {
  return <ul className={depth === 0 ? "menu-dropdown" : "menu-subdropdown"}>
    {items.map((item) => item.separator ? <li key={item.id} className="menu-separator" role="separator" /> : (
      <li key={item.id} className={item.children.length ? "menu-dropdown-item has-children" : "menu-dropdown-item"}>
        <MenuLink item={item} className="menu-dropdown-link" />
        {item.children.length > 0 && <Dropdown items={item.children} depth={depth + 1} />}
      </li>
    ))}
  </ul>;
}

export function NavigationMenu({ items }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return <>
    <nav className="hidden items-center gap-1 lg:flex" aria-label="เมนูหลัก">
      {items.map((item) => item.separator ? null : (
        <div key={item.id} className="menu-root-item">
          <MenuLink item={item} className="nav-link menu-root-link" />
          {item.children.length > 0 && <Dropdown items={item.children} />}
        </div>
      ))}
    </nav>
    <button className="icon-button lg:hidden" type="button" aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"} aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? <X size={21} /> : <Menu size={21} />}
    </button>
    {isOpen && <nav className="mobile-menu lg:hidden" aria-label="เมนูหลักสำหรับมือถือ">
      {items.map((item) => item.separator ? null : (
        <details key={item.id} className="mobile-menu-item" open={item.children.length === 0 ? undefined : false}>
          <summary>
            <MenuLink item={item} className="mobile-menu-link" onClick={() => item.href && setIsOpen(false)} />
          </summary>
          {item.children.length > 0 && <Dropdown items={item.children} />}
        </details>
      ))}
    </nav>}
  </>;
}
