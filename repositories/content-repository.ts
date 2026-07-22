import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export type ContentKind = "article" | "news";
export type ContentCategory = { id: number; name: string };
export type PublicContent = { id: number; title: string; excerpt: string | null; body?: string; category: ContentCategory; imagePath: string | null; publishedAt: string; featured: boolean };

type ContentRow = RowDataPacket & { id: number; title: string; intro: string | null; body?: string; category_id: number; category_name: string; image_path: string | null; published_at: string; featured: "Yes" | "No" };

const NEWS_CATEGORY_ID = 1;

export function mapContentRow(row: ContentRow): PublicContent {
  return { id: row.id, title: row.title, excerpt: row.intro, body: row.body, category: { id: row.category_id, name: row.category_name }, imagePath: row.image_path, publishedAt: row.published_at, featured: row.featured === "Yes" };
}

function getKindWhere(kind: ContentKind): string {
  return kind === "news" ? "a.arcat010_id = 1" : "a.arcat010_id <> 1";
}

export async function listPublicContent(input: { kind: ContentKind; categoryId?: number; page: number; pageSize?: number }): Promise<{ rows: PublicContent[]; total: number }> {
  await connection();
  const pageSize = Math.min(Math.max(Math.floor(input.pageSize ?? 12), 1), 30);
  const page = Math.min(Math.max(Math.floor(input.page), 1), 10_000);
  const conditions = ["a.pubd = 'Yes'", getKindWhere(input.kind)];
  const values: number[] = [];
  if (input.categoryId && input.kind === "article") { conditions.push("a.arcat010_id = ?"); values.push(input.categoryId); }
  const where = conditions.join(" AND ");
  const [countRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM arart010 a WHERE ${where}`, values);
  const offset = (page - 1) * pageSize;
  const [rows] = await db.execute<ContentRow[]>(`
    SELECT a.id, a.name AS title, a.intro, a.arcat010_id AS category_id, c.name AS category_name,
           a.pimg AS image_path, a.crdt AS published_at, a.fetd AS featured
    FROM arart010 a INNER JOIN arcat010 c ON c.id = a.arcat010_id
    WHERE ${where}
    ORDER BY a.awtp ASC, a.crdt DESC, a.id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `, values);
  return { rows: rows.map(mapContentRow), total: Number(countRows[0]?.total ?? 0) };
}

export async function findPublicContentById(id: number): Promise<PublicContent | undefined> {
  await connection();
  const [rows] = await db.execute<ContentRow[]>(`
    SELECT a.id, a.name AS title, a.intro, a.body, a.arcat010_id AS category_id, c.name AS category_name,
           a.pimg AS image_path, a.crdt AS published_at, a.fetd AS featured
    FROM arart010 a INNER JOIN arcat010 c ON c.id = a.arcat010_id
    WHERE a.id = ? AND a.pubd = 'Yes'
    LIMIT 1
  `, [id]);
  return rows[0] ? mapContentRow(rows[0]) : undefined;
}

export async function getArticleCategories(): Promise<ContentCategory[]> {
  await connection();
  const [rows] = await db.execute<RowDataPacket[]>("SELECT id, name FROM arcat010 WHERE id <> ? ORDER BY name, id", [NEWS_CATEGORY_ID]);
  return rows.map((row) => ({ id: Number(row.id), name: String(row.name) }));
}

export async function getHomepageContent(): Promise<{ news: PublicContent[]; articles: PublicContent[] }> {
  const [news, articles] = await Promise.all([
    listPublicContent({ kind: "news", page: 1, pageSize: 3 }),
    listPublicContent({ kind: "article", page: 1, pageSize: 3 }),
  ]);
  return { news: news.rows, articles: articles.rows };
}
