"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActiveDoctorIdentity } from "@/lib/auth/guards";
import { verifyCommunityCaptcha } from "@/lib/community-captcha";
import { FileLoginRateLimiter } from "@/lib/auth/login-rate-limit";
import { env } from "@/lib/env";
import { clientAddress } from "@/lib/public-request-protection";
import { createDoctorConsultationReply, createPublicConsultation } from "@/repositories/community-repository";

const questionSchema = z.object({ title: z.string().trim().min(10).max(255), body: z.string().trim().min(20).max(5000), captchaToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/u), captchaAnswer: z.string().trim().regex(/^\d{1,2}$/u), consent: z.literal("yes") });
const replySchema = z.object({ topicId: z.coerce.number().int().positive(), body: z.string().trim().min(10).max(5000) });
export type CommunityActionState = { error?: string; success?: string };
const genericError = "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง";
function submissionLimiter() { return new FileLoginRateLimiter(env.COMMUNITY_SUBMISSION_RATE_LIMIT_STORE_PATH, 3, 60 * 60_000); }

export async function submitCommunityQuestion(_previous: CommunityActionState, formData: FormData): Promise<CommunityActionState> { if (!env.ADMIN_WRITE_ENABLED) return { error: "ระบบรับคำถามยังไม่เปิดใช้งาน" }; const parsed = questionSchema.safeParse({ title: formData.get("title"), body: formData.get("body"), captchaToken: formData.get("captchaToken"), captchaAnswer: formData.get("captchaAnswer"), consent: formData.get("consent") }); const requestHeaders = await headers(); const address = clientAddress(requestHeaders); const limiter = submissionLimiter(); if (!parsed.success) return { error: "กรุณากรอกข้อมูลให้ครบถ้วน และยอมรับเงื่อนไขก่อนส่งคำถาม" }; if (!(await limiter.allowed(`question:${address}`))) return { error: "ส่งคำถามครบจำนวนที่อนุญาตแล้ว กรุณาลองใหม่ภายหลัง" }; if (!(await verifyCommunityCaptcha(parsed.data.captchaToken, parsed.data.captchaAnswer, address))) return { error: "คำตอบ CAPTCHA ไม่ถูกต้องหรือหมดอายุ กรุณาลองใหม่" }; try { await createPublicConsultation({ title: parsed.data.title, body: parsed.data.body, address }); await limiter.failed(`question:${address}`); revalidatePath("/community/questions"); return { success: "รับคำถามแล้ว ข้อความจะปรากฏหลังผ่านการตรวจสอบโดยทีมงาน" }; } catch { return { error: genericError }; } }

export async function submitDoctorReply(_previous: CommunityActionState, formData: FormData): Promise<CommunityActionState> { if (!env.ADMIN_WRITE_ENABLED) return { error: "ระบบตอบคำถามยังไม่เปิดใช้งาน" }; const parsed = replySchema.safeParse({ topicId: formData.get("topicId"), body: formData.get("body") }); if (!parsed.success) return { error: "กรุณาพิมพ์คำตอบอย่างน้อย 10 ตัวอักษร" }; const doctor = await getActiveDoctorIdentity(); if (!doctor) return { error: "เฉพาะจักษุแพทย์ที่เข้าสู่ระบบแล้วเท่านั้นที่ตอบคำถามได้" }; const address = clientAddress(await headers()); try { await createDoctorConsultationReply({ topicId: parsed.data.topicId, body: parsed.data.body, doctorId: doctor.userId, doctorName: doctor.firstName, address }); revalidatePath(`/community/questions/${parsed.data.topicId}`); revalidatePath("/community/questions"); return { success: "เผยแพร่คำตอบของคุณแล้ว" }; } catch { return { error: genericError }; } }
