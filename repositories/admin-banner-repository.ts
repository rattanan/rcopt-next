import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export type AdminBanner = { id: number; title: string; description: string; imagePath: string; href: string | null; enabled: boolean };

export async function listAdminBanners(): Promise<AdminBanner[]> {
  await connection();
  const [rows] = await db.execute<RowDataPacket[]>("SELECT id, name, dsca, pimg, href, enbl FROM cmban010 ORDER BY id DESC");
  return rows.map((row) => ({ id: Number(row.id), title: String(row.name), description: String(row.dsca ?? ""), imagePath: String(row.pimg ?? ""), href: row.href ? String(row.href) : null, enabled: row.enbl === "Yes" }));
}
