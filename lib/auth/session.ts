import path from "node:path";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { FileAdminSessionStore, type StoredAdminSession } from "@/lib/auth/session-store";

const SESSION_COOKIE = "rcopt_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const sessionStore = new FileAdminSessionStore(path.resolve(env.ADMIN_SESSION_STORE_PATH));
export type AdminSession = StoredAdminSession;
function cookieOptions() { return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: SESSION_MAX_AGE_SECONDS, priority: "high" as const }; }
export async function createAdminSession(user: { id: number; username: string }): Promise<void> { const now = new Date(); const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000); const sessionId = await sessionStore.create({ userId: user.id, username: user.username, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() }); (await cookies()).set(SESSION_COOKIE, sessionId, { ...cookieOptions(), expires: expiresAt }); }
export async function getAdminSession(): Promise<AdminSession | undefined> { return sessionStore.get((await cookies()).get(SESSION_COOKIE)?.value); }
export async function destroyAdminSession(): Promise<void> { const cookieStore = await cookies(); await sessionStore.delete(cookieStore.get(SESSION_COOKIE)?.value); cookieStore.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0, expires: new Date(0) }); }
