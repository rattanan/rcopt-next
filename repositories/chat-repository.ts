import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { stripLegacyHtml } from "@/lib/content-utils";
import type { ChatArticle } from "@/lib/article-chat";

// Fetch only public knowledge, never member records or unpublished drafts.
export async function getChatArticles(): Promise<ChatArticle[]> {
  const [rows] = await db.query<RowDataPacket[]>(`SELECT a.id, a.name, a.intro, a.body, c.name AS category,
    CAST(CASE WHEN a.lmdt >= '1000-01-01' THEN a.lmdt ELSE a.crdt END AS CHAR) AS updated_at
    FROM arart010 a INNER JOIN arcat010 c ON c.id = a.arcat010_id
    WHERE a.pubd = 'Yes' AND a.arcat010_id <> 1 ORDER BY a.id DESC`);
  const plain = (value: string) => stripLegacyHtml(value?.replace(/<\/(?:p|div|li|h[1-6])>|<br\s*\/?\s*>/giu, " ")).replace(/&nbsp;/gu, " ").replace(/&amp;/gu, "&").replace(/&quot;/gu, '"');
  return rows.map(row => ({ id: row.id, title: plain(row.name), intro: plain(row.intro), body: plain(row.body), category: row.category, updatedAt: row.updated_at, href: `/articles/${row.id}` }));
}
