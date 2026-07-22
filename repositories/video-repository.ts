import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";

export type PublicVideo = { id: number; youtubeId: string; title: string; description: string | null };

export function extractYouTubeId(embed: string): string | undefined {
  const match = embed.match(/(?:youtube\.com\/(?:v|embed)\/|youtu\.be\/)([A-Za-z0-9_-]{11})/u);
  return match?.[1];
}

export async function getFeaturedVideos(limit = 4): Promise<PublicVideo[]> {
  await connection();
  const [rows] = await db.execute<(RowDataPacket & { id: number; title: string; detail: string | null; embed: string })[]>(`
    SELECT id, title, detail, embed
    FROM vdo
    WHERE activated = 1
    ORDER BY ordering ASC, post_date DESC, id DESC
    LIMIT ${Math.min(Math.max(Math.floor(limit), 1), 8)}
  `);
  return rows.flatMap((row) => {
    const youtubeId = extractYouTubeId(row.embed);
    return youtubeId ? [{ id: row.id, youtubeId, title: row.title, description: row.detail }] : [];
  });
}
