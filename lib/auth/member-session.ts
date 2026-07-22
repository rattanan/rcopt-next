import path from "node:path";
import { cookies } from "next/headers";
import { env } from "@/lib/env";
import { FileAdminSessionStore, type StoredAdminSession } from "@/lib/auth/session-store";

const COOKIE = "rcopt_member_session";
const MAX_AGE = 60 * 60 * 12;
const store = new FileAdminSessionStore(path.resolve(env.MEMBER_SESSION_STORE_PATH));
function options() { return { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: MAX_AGE, priority: "high" as const }; }

export async function createMemberSession(user: { id: number; username: string }): Promise<void> { const now = new Date(); const expiresAt = new Date(now.getTime() + MAX_AGE * 1000); const id = await store.create({ userId: user.id, username: user.username, createdAt: now.toISOString(), expiresAt: expiresAt.toISOString() }); (await cookies()).set(COOKIE, id, { ...options(), expires: expiresAt }); }
export async function getMemberSession(): Promise<StoredAdminSession | undefined> { return store.get((await cookies()).get(COOKIE)?.value); }
export async function destroyMemberSession(): Promise<void> { const cookieStore = await cookies(); await store.delete(cookieStore.get(COOKIE)?.value); cookieStore.set(COOKIE, "", { ...options(), maxAge: 0, expires: new Date(0) }); }
