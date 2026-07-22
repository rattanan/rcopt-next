import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { getAdminSession, type AdminSession } from "@/lib/auth/session";
type AdminRow = RowDataPacket & { id: number; username: string };
export async function requireActiveAdmin(): Promise<AdminSession> { const session = await getAdminSession(); if (!session) redirect("/admin/login"); await connection(); const [rows] = await db.execute<AdminRow[]>("SELECT id, username FROM tbl_users WHERE id=? AND username=? AND status=1 AND superuser=1 LIMIT 1", [session.userId, session.username]); if (!rows[0]) redirect("/admin/login"); return session; }
