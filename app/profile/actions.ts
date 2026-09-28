"use server";

import { FileLoginRateLimiter } from "@/lib/auth/login-rate-limit";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireActiveMember } from "@/lib/auth/guards";
import { destroyMemberSession } from "@/lib/auth/member-session";
import { env } from "@/lib/env";
import { clientAddress } from "@/lib/public-request-protection";
import { isTrustedRequestOrigin } from "@/lib/request-origin";
import { updateOwnMemberProfile, updateOwnMemberPassword } from "@/repositories/member-profile-repository";

const profileSchema = z.object({
  title: z.string().trim().max(15),
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().max(128).refine((value) => !value || z.email().safeParse(value).success),
  sex: z.coerce.number().int().min(0).max(2),
  licenseNumber: z.string().trim().max(45),
});

export type ProfileActionState = { error?: string; success?: string };

export async function updateProfile(_previous: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const member = await requireActiveMember();
  const requestHeaders = await headers();
  if (!env.ADMIN_WRITE_ENABLED) return { error: "ระบบแก้ไขข้อมูลยังไม่เปิดใช้งาน" };
  if (!isTrustedRequestOrigin(requestHeaders, [new URL(env.SITE_URL).host])) return { error: "คำขอไม่ถูกต้อง กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" };
  const parsed = profileSchema.safeParse({ title: formData.get("title"), firstName: formData.get("firstName"), lastName: formData.get("lastName"), email: formData.get("email"), sex: formData.get("sex"), licenseNumber: formData.get("licenseNumber") });
  if (!parsed.success) return { error: "กรุณาตรวจสอบชื่อ นามสกุล และอีเมลให้ถูกต้อง" };
  try {
    const updated = await updateOwnMemberProfile({ userId: member.userId, ...parsed.data, address: clientAddress(requestHeaders) });
    if (!updated) return { error: "ไม่พบบัญชีที่เปิดใช้งาน กรุณาเข้าสู่ระบบใหม่" };
    revalidatePath("/profile");
    return { success: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว" };
  } catch {
    return { error: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function logoutMember(): Promise<void> {
  await destroyMemberSession();
  redirect("/");
}

export async function changeMemberPassword(_previous: ProfileActionState, formData: FormData): Promise<ProfileActionState> {
  const member = await requireActiveMember();
  const requestHeaders = await headers();
  if (!env.ADMIN_WRITE_ENABLED) return { error: "ระบบแก้ไขข้อมูลยังไม่เปิดใช้งาน" };
  if (!isTrustedRequestOrigin(requestHeaders, [new URL(env.SITE_URL).host])) return { error: "คำขอไม่ถูกต้อง กรุณาโหลดหน้าใหม่" };
  const parsed = z.object({ currentPassword: z.string().min(1).max(256), newPassword: z.string().min(12).max(256), confirmPassword: z.string() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "กรุณากรอกรหัสผ่านปัจจุบัน และรหัสผ่านใหม่อย่างน้อย 12 ตัวอักษร" };
  if (parsed.data.newPassword !== parsed.data.confirmPassword) return { error: "รหัสผ่านใหม่และการยืนยันไม่ตรงกัน" };
  if (parsed.data.newPassword === parsed.data.currentPassword) return { error: "กรุณาใช้รหัสผ่านใหม่ที่ต่างจากรหัสผ่านปัจจุบัน" };
  const limiter = new FileLoginRateLimiter(env.ADMIN_LOGIN_RATE_LIMIT_STORE_PATH);
  const subject = `password-change:${member.userId}:${clientAddress(requestHeaders)}`;
  try {
    if (!(await limiter.allowed(subject))) return { error: "ลองหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่" };
    if (!(await updateOwnMemberPassword({ userId: member.userId, ...parsed.data, address: clientAddress(requestHeaders) }))) {
      await limiter.failed(subject);
      return { error: "รหัสผ่านปัจจุบันไม่ถูกต้อง" };
    }
    await limiter.succeeded(subject);
    return { success: "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว" };
  } catch { return { error: "ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง" }; }
}
