import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { normalizePagination } from "@/lib/pagination";
import type { ContentCategory, ContentKind } from "@/repositories/content-repository";

export type AdminPublishStatus = "all" | "published" | "draft";
export type AdminContentRow = { id: number; title: string; category: ContentCategory; imagePath: string | null; published: boolean; featured: boolean; createdAt: string; updatedAt: string };
type DatabaseRow = RowDataPacket & { id: number; title: string; category_id: number; category_name: string; image_path: string | null; published: "Yes" | "No"; featured: "Yes" | "No"; created_at: string; updated_at: string };

function contentKindCondition(kind: ContentKind): string { return kind === "news" ? "a.arcat010_id = 1" : "a.arcat010_id <> 1"; }

export async function listAdminContent(input: { kind: ContentKind; keyword?: string; status: AdminPublishStatus; page: number }): Promise<{ rows: AdminContentRow[]; total: number }> {
  await connection();
  const { pageSize, offset } = normalizePagination(input.page, 20, 50);
  const conditions = [contentKindCondition(input.kind)];
  const values: string[] = [];
  if (input.keyword) { conditions.push("a.name LIKE ?"); values.push(`%${input.keyword}%`); }
  if (input.status === "published") conditions.push("a.pubd = 'Yes'");
  if (input.status === "draft") conditions.push("a.pubd = 'No'");
  const where = conditions.join(" AND ");
  const [countRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM arart010 a WHERE ${where}`, values);
  const [rows] = await db.execute<DatabaseRow[]>(`SELECT a.id, a.name AS title, a.arcat010_id AS category_id, c.name AS category_name, a.pimg AS image_path, a.pubd AS published, a.fetd AS featured, a.crdt AS created_at, a.lmdt AS updated_at FROM arart010 a INNER JOIN arcat010 c ON c.id = a.arcat010_id WHERE ${where} ORDER BY a.lmdt DESC, a.id DESC LIMIT ${pageSize} OFFSET ${offset}`, values);
  return { total: Number(countRows[0]?.total ?? 0), rows: rows.map((row) => ({ id: Number(row.id), title: String(row.title), category: { id: Number(row.category_id), name: String(row.category_name) }, imagePath: row.image_path ? String(row.image_path) : null, published: row.published === "Yes", featured: row.featured === "Yes", createdAt: String(row.created_at), updatedAt: String(row.updated_at) })) };
}
