import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { getAdminSession, type AdminSession } from "@/lib/auth/session";
import { getMemberSession } from "@/lib/auth/member-session";
type AdminRow = RowDataPacket & { id: number; username: string };
export async function requireActiveAdmin(): Promise<AdminSession> { const session = await getAdminSession(); if (!session) redirect("/admin/login"); await connection(); const [rows] = await db.execute<AdminRow[]>("SELECT id, username FROM tbl_users WHERE id=? AND username=? AND status=1 AND superuser=1 LIMIT 1", [session.userId, session.username]); if (!rows[0]) redirect("/admin/login"); return session; }

type HeaderIdentityRow = RowDataPacket & { username: string; firstname: string | null };
export async function getActiveAdminHeaderIdentity(): Promise<{ firstName: string; username: string } | undefined> { const session = await getAdminSession(); if (!session) return undefined; await connection(); const [rows] = await db.execute<HeaderIdentityRow[]>("SELECT u.username, p.firstname FROM tbl_users u LEFT JOIN tbl_profiles p ON p.user_id = u.id WHERE u.id=? AND u.username=? AND u.status=1 AND u.superuser=1 LIMIT 1", [session.userId, session.username]); const user = rows[0]; if (!user) return undefined; return { firstName: user.firstname?.trim() || user.username, username: user.username }; }

type DoctorRow = RowDataPacket & { id: number; username: string; firstname: string | null };
export async function getActiveDoctorIdentity(): Promise<{ userId: number; username: string; firstName: string } | undefined> { const session = await getMemberSession(); if (!session) return undefined; await connection(); const [rows] = await db.execute<DoctorRow[]>("SELECT u.id, u.username, p.firstname FROM tbl_users u INNER JOIN tbl_profiles p ON p.user_id=u.id WHERE u.id=? AND u.username=? AND u.status=1 AND p.memtype=2 LIMIT 1", [session.userId, session.username]); const doctor = rows[0]; return doctor ? { userId: doctor.id, username: doctor.username, firstName: doctor.firstname?.trim() || doctor.username } : undefined; }
