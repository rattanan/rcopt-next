"use server";

import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireActiveAdmin, requireActiveMember } from "@/lib/auth/guards";
import { env } from "@/lib/env";
import { clientAddress } from "@/lib/public-request-protection";
import { isTrustedRequestOrigin } from "@/lib/request-origin";
import { deleteProfileDetail, saveGalleryDetail, saveProfileDetail } from "@/repositories/profile-details-repository";

const id = z.coerce.number().int().positive();
const section = z.enum(["education", "educationOverview", "profession", "academic", "contact", "social"]);
const itemId = z.preprocess((value) => value === "" || value == null ? undefined : value, id.optional());
const text = (max: number) => z.string().trim().max(max);
const email = text(45).refine((value) => !value || z.email().safeParse(value).success);
const commonSchema = z.object({ section, itemId, visibilityId: id, targetUserId: z.preprocess((value) => value === "" || value == null ? undefined : value, id.optional()) });
export type ProfileDetailsActionState = { error?: string; success?: string };

async function editorTarget(targetUserId: number | undefined): Promise<{ userId: number; actorId: number }> {
  if (targetUserId) {
    const admin = await requireActiveAdmin();
    if (!env.ADMIN_WRITE_ENABLED) throw new Error("WRITE_DISABLED");
    return { userId: targetUserId, actorId: admin.userId };
  }
  const member = await requireActiveMember();
  if (!env.ADMIN_WRITE_ENABLED) throw new Error("WRITE_DISABLED");
  return { userId: member.userId, actorId: member.userId };
}

async function requestContext(): Promise<{ address: string }> {
  const requestHeaders = await headers();
  if (!isTrustedRequestOrigin(requestHeaders, [new URL(env.SITE_URL).host])) throw new Error("BAD_ORIGIN");
  return { address: clientAddress(requestHeaders) };
}

function strings(formData: FormData) {
  return { institution: formData.get("institution"), subject: formData.get("subject"), year: formData.get("year"), honor: formData.get("honor"), details: formData.get("details"), educationTypeId: formData.get("educationTypeId"), name: formData.get("name"), address: formData.get("address"), provinceId: formData.get("provinceId"), districtId: formData.get("districtId"), postcode: formData.get("postcode"), telephone: formData.get("telephone"), mobile: formData.get("mobile"), email: formData.get("email"), contactTypeId: formData.get("contactTypeId"), gps: formData.get("gps"), mapUrl: formData.get("mapUrl"), url: formData.get("url"), socialTypeId: formData.get("socialTypeId"), customSocial: formData.get("customSocial") };
}

export async function saveProfileDetails(_previous: ProfileDetailsActionState, formData: FormData): Promise<ProfileDetailsActionState> {
  const common = commonSchema.safeParse({ section: formData.get("section"), itemId: formData.get("itemId"), visibilityId: formData.get("visibilityId"), targetUserId: formData.get("targetUserId") });
  if (!common.success) return { error: "ข้อมูลรายการไม่ถูกต้อง" };
  try {
    const values = strings(formData);
    let parsed: z.ZodSafeParseResult<Record<string, string | number>>;
    if (common.data.section === "education") parsed = z.object({ institution: text(255).min(1), subject: text(255), year: z.coerce.number().int().min(0).max(3000), honor: text(100), details: text(4000), educationTypeId: id }).safeParse(values);
    else if (common.data.section === "educationOverview" || common.data.section === "profession" || common.data.section === "academic") parsed = z.object({ details: text(4000).min(1) }).safeParse(values);
    else if (common.data.section === "contact") parsed = z.object({ name: text(100).min(1), details: text(4000), address: text(255), provinceId: z.coerce.number().int().min(0), districtId: z.coerce.number().int().min(0), postcode: text(5), telephone: text(45), mobile: text(45), email, contactTypeId: id, gps: text(45), mapUrl: text(255), url: text(255) }).safeParse(values);
    else parsed = z.object({ socialTypeId: id, customSocial: text(100), name: text(4000).min(1), url: text(4000).min(1) }).safeParse(values);
    if (!parsed.success) return { error: "กรุณาตรวจสอบข้อมูลในรายการให้ครบถ้วนและถูกต้อง" };
    const [editor, context] = await Promise.all([editorTarget(common.data.targetUserId), requestContext()]);
    await saveProfileDetail({ userId: editor.userId, actorId: editor.actorId, address: context.address, section: common.data.section, itemId: common.data.itemId, values: { ...parsed.data, visibilityId: common.data.visibilityId } });
    revalidatePath("/profile");
    revalidatePath(`/admin/users/${editor.userId}/profile`);
    return { success: "บันทึกรายการเรียบร้อยแล้ว" };
  } catch {
    return { error: "ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

export async function removeProfileDetails(_previous: ProfileDetailsActionState, formData: FormData): Promise<ProfileDetailsActionState> {
  const parsed = z.object({ section: z.enum(["education", "educationOverview", "profession", "academic", "contact", "social", "gallery"]), itemId: id, targetUserId: z.preprocess((value) => value === "" || value == null ? undefined : value, id.optional()) }).safeParse({ section: formData.get("section"), itemId: formData.get("itemId"), targetUserId: formData.get("targetUserId") });
  if (!parsed.success) return { error: "ไม่พบรายการที่ต้องการลบ" };
  try {
    const [editor, context] = await Promise.all([editorTarget(parsed.data.targetUserId), requestContext()]);
    if (!(await deleteProfileDetail({ userId: editor.userId, actorId: editor.actorId, address: context.address, section: parsed.data.section, itemId: parsed.data.itemId }))) return { error: "ไม่พบรายการ หรือคุณไม่มีสิทธิ์แก้ไข" };
    revalidatePath("/profile");
    revalidatePath(`/admin/users/${editor.userId}/profile`);
    return { success: "ลบรายการเรียบร้อยแล้ว" };
  } catch { return { error: "ไม่สามารถลบรายการได้ กรุณาลองใหม่อีกครั้ง" }; }
}

const gallerySchema = z.object({ itemId, targetUserId: z.preprocess((value) => value === "" || value == null ? undefined : value, id.optional()), name: text(45).min(1), details: text(4000), visibilityId: id, isProfilePicture: z.enum(["yes", "no"]) });

async function persistGalleryImage(file: File, userId: number): Promise<string> {
  if (!env.LEGACY_UPLOAD_PATH) throw new Error("UPLOAD_PATH_UNAVAILABLE");
  if (file.size < 1 || file.size > 3 * 1024 * 1024) throw new Error("INVALID_IMAGE_SIZE");
  const extension = path.extname(file.name).toLowerCase();
  if (!new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]).has(extension) || !file.type.startsWith("image/")) throw new Error("INVALID_IMAGE");
  const content = Buffer.from(await file.arrayBuffer());
  const validImage = (extension === ".jpg" || extension === ".jpeg") ? content.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) : extension === ".png" ? content.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) : extension === ".gif" ? content.subarray(0, 6).toString("ascii") === "GIF87a" || content.subarray(0, 6).toString("ascii") === "GIF89a" : content.subarray(0, 4).toString("ascii") === "RIFF" && content.subarray(8, 12).toString("ascii") === "WEBP";
  if (!validImage) throw new Error("INVALID_IMAGE_CONTENT");
  const filename = `profile-${userId}-${randomUUID()}${extension}`;
  const memberDirectory = path.join(env.LEGACY_UPLOAD_PATH, "member");
  await mkdir(memberDirectory, { recursive: true });
  await writeFile(path.join(memberDirectory, filename), content, { flag: "wx" });
  return filename;
}

export async function saveGallery(_previous: ProfileDetailsActionState, formData: FormData): Promise<ProfileDetailsActionState> {
  const parsed = gallerySchema.safeParse({ itemId: formData.get("itemId"), targetUserId: formData.get("targetUserId"), name: formData.get("name"), details: formData.get("details"), visibilityId: formData.get("visibilityId"), isProfilePicture: formData.get("isProfilePicture") });
  if (!parsed.success) return { error: "กรุณากรอกชื่อภาพและข้อมูลให้ถูกต้อง" };
  try {
    const [editor, context] = await Promise.all([editorTarget(parsed.data.targetUserId), requestContext()]);
    const upload = formData.get("image");
    const picture = upload instanceof File && upload.size ? await persistGalleryImage(upload, editor.userId) : undefined;
    if (!parsed.data.itemId && !picture) return { error: "กรุณาเลือกไฟล์รูปภาพ" };
    await saveGalleryDetail({ userId: editor.userId, actorId: editor.actorId, address: context.address, itemId: parsed.data.itemId, name: parsed.data.name, details: parsed.data.details, picture, visibilityId: parsed.data.visibilityId, isProfilePicture: parsed.data.isProfilePicture === "yes" });
    revalidatePath("/profile");
    revalidatePath(`/admin/users/${editor.userId}/profile`);
    return { success: "บันทึกรูปภาพเรียบร้อยแล้ว" };
  } catch { return { error: "ไม่สามารถบันทึกรูปภาพได้ กรุณาตรวจสอบไฟล์แล้วลองใหม่" }; }
}
