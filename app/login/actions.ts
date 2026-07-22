"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createMemberSession } from "@/lib/auth/member-session";
import { destroyMemberSession } from "@/lib/auth/member-session";
import { verifyLegacyMemberLogin } from "@/lib/auth/member-login";
import { createAdminSession, destroyAdminSession } from "@/lib/auth/session";
import { FileLoginRateLimiter } from "@/lib/auth/login-rate-limit";
import { env } from "@/lib/env";
import { clientAddress } from "@/lib/public-request-protection";
import { isTrustedRequestOrigin } from "@/lib/request-origin";
const schema = z.object({ identifier: z.string().trim().min(1).max(128), password: z.string().min(1).max(256), csrf: z.string().regex(/^[A-Za-z0-9_-]{43}$/u) });
export type MemberLoginState = { error?: string };
export async function loginMember(_previous: MemberLoginState, formData: FormData): Promise<MemberLoginState> { const parsed = schema.safeParse({ identifier: formData.get("identifier"), password: formData.get("password"), csrf: formData.get("csrf") }); const cookieStore = await cookies(); const requestHeaders = await headers(); const csrf = cookieStore.get("rcopt_member_login_csrf")?.value; const publicHost = new URL(env.SITE_URL).host; if (!parsed.success || !csrf || csrf !== parsed.data.csrf || !isTrustedRequestOrigin(requestHeaders, [publicHost])) return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; const limiter = new FileLoginRateLimiter(env.ADMIN_LOGIN_RATE_LIMIT_STORE_PATH); const subject = `member:${clientAddress(requestHeaders)}:${parsed.data.identifier.toLocaleLowerCase("en-US")}`; if (!(await limiter.allowed(subject))) return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; const user = await verifyLegacyMemberLogin(parsed.data.identifier, parsed.data.password); if (!user) { await limiter.failed(subject); return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; } await limiter.succeeded(subject); await destroyAdminSession(); if (user.isSuperuser) { await destroyMemberSession(); await createAdminSession(user); cookieStore.set("rcopt_member_login_csrf", "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0, expires: new Date(0) }); redirect("/admin"); } await createMemberSession(user); cookieStore.set("rcopt_member_login_csrf", "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0, expires: new Date(0) }); redirect("/profile"); }
