import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export type PublicBanner = { id: number; title: string; description: string; imagePath: string; href: string | null };

export async function getPublicBanners(): Promise<PublicBanner[]> {
  await connection();
  const [rows] = await db.execute<RowDataPacket[]>("SELECT id, name, dsca, pimg, href FROM cmban010 WHERE enbl = 'Yes' ORDER BY id DESC LIMIT 5");
  return rows.map((row) => ({ id: Number(row.id), title: String(row.name), description: String(row.dsca ?? ""), imagePath: String(row.pimg), href: row.href ? String(row.href) : null }));
}
