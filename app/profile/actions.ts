"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireActiveMember } from "@/lib/auth/guards";
import { destroyMemberSession } from "@/lib/auth/member-session";
import { env } from "@/lib/env";
import { clientAddress } from "@/lib/public-request-protection";
import { isTrustedRequestOrigin } from "@/lib/request-origin";
import { updateOwnMemberProfile } from "@/repositories/member-profile-repository";

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
