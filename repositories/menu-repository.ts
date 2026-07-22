import { connection } from "next/server";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";

type MenuRow = RowDataPacket & {
  id: number;
  parent_id: number | null;
  title: string;
  position: number | null;
  tooltip: string | null;
  url: string | null;
  icon: string | null;
  visible: number | boolean;
};

export type SiteMenuItem = {
  id: number;
  label: string;
  href?: string;
  tooltip?: string;
  icon?: string;
  separator?: boolean;
  children: SiteMenuItem[];
};

function toLegacyHref(url: string | null): string | undefined {
  const value = url?.trim();
  if (!value || value === "#") return undefined;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;

  // Syadm001 was built for Yii routes. Keep those routes functional while the
  // matching Next.js content is migrated incrementally through /index.php.
  return `/index.php?r=${value.replace(/^\/?/, "")}`;
}

export async function getPublicMenu(): Promise<SiteMenuItem[]> {
  // The menu is CMS data and must be read at request time, not at build time.
  await connection();

  const [rows] = await db.query<MenuRow[]>(`
    SELECT id, parent_id, title, position, tooltip, url, icon, visible
    FROM syadm001
    ORDER BY parent_id, position, id
  `);

  const items = new Map<number, SiteMenuItem>();
  const rootItems: SiteMenuItem[] = [];

  for (const row of rows) {
    if (!row.visible) continue;
    items.set(row.id, {
      id: row.id,
      label: row.title,
      href: toLegacyHref(row.url),
      tooltip: row.tooltip ?? undefined,
      icon: row.icon ?? undefined,
      separator: row.title === "---",
      children: [],
    });
  }

  for (const row of rows) {
    const item = items.get(row.id);
    if (!item) continue;

    if (!row.parent_id) {
      rootItems.push(item);
      continue;
    }

    const parent = items.get(row.parent_id);
    if (parent) parent.children.push(item);
  }

  return rootItems;
}
