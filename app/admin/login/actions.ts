"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminSession } from "@/lib/auth/session";
import { verifyLegacyAdminLogin } from "@/lib/auth/admin-login";
import { FileLoginRateLimiter } from "@/lib/auth/login-rate-limit";
import { env } from "@/lib/env";
const loginSchema = z.object({ identifier: z.string().trim().min(1).max(128), password: z.string().min(1).max(256), csrf: z.string().regex(/^[A-Za-z0-9_-]{43}$/u) });
const CSRF_COOKIE = "rcopt_admin_login_csrf";
export type LoginState = { error?: string };
function requestClientAddress(requestHeaders: Headers): string { return requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip")?.trim() || "unknown"; }
export async function loginAdmin(_previous: LoginState, formData: FormData): Promise<LoginState> { const parsed = loginSchema.safeParse({ identifier: formData.get("identifier"), password: formData.get("password"), csrf: formData.get("csrf") }); const cookieStore = await cookies(); const requestHeaders = await headers(); const csrfCookie = cookieStore.get(CSRF_COOKIE)?.value; const origin = requestHeaders.get("origin"); const host = requestHeaders.get("host"); if (!parsed.success || !csrfCookie || csrfCookie !== parsed.data.csrf || (origin && host && new URL(origin).host !== host)) return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; const limiter = new FileLoginRateLimiter(env.ADMIN_LOGIN_RATE_LIMIT_STORE_PATH); const subject = `${requestClientAddress(requestHeaders)}:${parsed.data.identifier.toLocaleLowerCase("en-US")}`; if (!(await limiter.allowed(subject))) return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; const user = await verifyLegacyAdminLogin(parsed.data.identifier, parsed.data.password); if (!user) { await limiter.failed(subject); return { error: "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" }; } await limiter.succeeded(subject); await createAdminSession(user); cookieStore.set(CSRF_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 0, expires: new Date(0) }); redirect("/admin"); }
