import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { verifyLegacyMd5Password } from "@/lib/auth/legacy-password";

type LoginRow = RowDataPacket & { id: number; username: string; password: string; firstname: string | null };
export async function verifyLegacyMemberLogin(identifier: string, password: string): Promise<{ id: number; username: string } | undefined> { await connection(); const [rows] = await db.execute<LoginRow[]>("SELECT u.id, u.username, u.password, p.firstname FROM tbl_users u LEFT JOIN tbl_profiles p ON p.user_id=u.id WHERE (u.username=? OR u.email=?) AND u.status=1 LIMIT 1", [identifier, identifier]); const user = rows[0]; return user && verifyLegacyMd5Password(password, user.password) ? { id: user.id, username: user.username } : undefined; }
