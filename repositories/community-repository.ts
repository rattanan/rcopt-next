import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { normalizePagination } from "@/lib/pagination";

export type CommunityTopic = { id: number; title: string; body: string; createdAt: string; updatedAt: string; views: number; replies: number };
export type CommunityReply = { id: number; body: string; createdAt: string };
export type CommunityTopicDetail = CommunityTopic & { repliesList: CommunityReply[] };

type TopicRow = RowDataPacket & { id: number; title: string; body: string; created_at: string; updated_at: string; views: number; replies: number };

function mapTopic(row: TopicRow): CommunityTopic { return { id: row.id, title: row.title, body: row.body, createdAt: row.created_at, updatedAt: row.updated_at, views: Number(row.views), replies: Number(row.replies) }; }

export async function listPublicConsultations(input: { keyword?: string; page: number; pageSize?: number }): Promise<{ rows: CommunityTopic[]; total: number }> {
  await connection();
  const { pageSize, offset } = normalizePagination(input.page, input.pageSize ?? 15, 30);
  const where = ["t.wbcat010_id = 1", "t.enbl = 'Yes'"];
  const values: string[] = [];
  if (input.keyword) { where.push("(t.name LIKE ? OR t.dsca LIKE ?)"); values.push(`%${input.keyword}%`, `%${input.keyword}%`); }
  const clause = where.join(" AND ");
  const [countRows] = await db.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total FROM wbtpc010 t WHERE ${clause}`, values);
  const [rows] = await db.execute<TopicRow[]>(`
    SELECT t.id, t.name AS title, t.dsca AS body, t.crdt AS created_at, t.lmdt AS updated_at, t.hits AS views, COUNT(m.id) AS replies
    FROM wbtpc010 t LEFT JOIN wbmsg010 m ON m.wbtpc010_id = t.id
    WHERE ${clause}
    GROUP BY t.id, t.name, t.dsca, t.crdt, t.lmdt, t.hits
    ORDER BY t.lmdt DESC, t.id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `, values);
  return { rows: rows.map(mapTopic), total: Number(countRows[0]?.total ?? 0) };
}

export async function findPublicConsultationById(id: number): Promise<CommunityTopicDetail | undefined> {
  await connection();
  const [topics] = await db.execute<TopicRow[]>("SELECT t.id, t.name AS title, t.dsca AS body, t.crdt AS created_at, t.lmdt AS updated_at, t.hits AS views, COUNT(m.id) AS replies FROM wbtpc010 t LEFT JOIN wbmsg010 m ON m.wbtpc010_id=t.id WHERE t.id=? AND t.wbcat010_id=1 AND t.enbl='Yes' GROUP BY t.id,t.name,t.dsca,t.crdt,t.lmdt,t.hits LIMIT 1", [id]);
  const topic = topics[0];
  if (!topic) return undefined;
  const [replies] = await db.execute<(RowDataPacket & { id: number; body: string; created_at: string })[]>("SELECT id, name AS body, crdt AS created_at FROM wbmsg010 WHERE wbtpc010_id=? ORDER BY crdt ASC,id ASC", [id]);
  return { ...mapTopic(topic), repliesList: replies.map((reply) => ({ id: reply.id, body: reply.body, createdAt: reply.created_at })) };
}
