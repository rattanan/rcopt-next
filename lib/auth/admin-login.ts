import { connection } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { verifyLegacyMd5Password } from "@/lib/auth/legacy-password";
type LoginRow = RowDataPacket & { id: number; username: string; password: string };
export async function verifyLegacyAdminLogin(identifier: string, password: string): Promise<{ id: number; username: string } | undefined> { await connection(); const [rows] = await db.execute<LoginRow[]>("SELECT id, username, password FROM tbl_users WHERE (username=? OR email=?) AND status=1 AND superuser=1 LIMIT 1", [identifier, identifier]); const user = rows[0]; return user && verifyLegacyMd5Password(password, user.password) ? { id: user.id, username: user.username } : undefined; }
