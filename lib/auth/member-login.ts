import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { verifyLegacyMd5Password } from "@/lib/auth/legacy-password";

type LoginRow = RowDataPacket & { id: number; username: string; password: string; superuser: number };
export async function verifyLegacyMemberLogin(identifier: string, password: string): Promise<{ id: number; username: string; isSuperuser: boolean } | undefined> { await connection(); const [rows] = await db.execute<LoginRow[]>("SELECT u.id,u.username,u.password,u.superuser FROM tbl_users u WHERE (u.username=? OR u.email=?) AND u.status=1 LIMIT 1", [identifier, identifier]); const user = rows[0]; return user && verifyLegacyMd5Password(password, user.password) ? { id: user.id, username: user.username, isSuperuser: Number(user.superuser) === 1 } : undefined; }
