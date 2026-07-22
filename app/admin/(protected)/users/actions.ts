"use server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdminWrite } from "@/lib/admin-write";
import { clientAddress } from "@/lib/public-request-protection";
import { isTrustedRequestOrigin } from "@/lib/request-origin";
import { env } from "@/lib/env";
import { resetAdminUserPassword, updateAdminUser } from "@/repositories/admin-user-repository";
const id=z.coerce.number().int().positive(); export type UserAdminState={error?:string;success?:string};
async function context(){const h=await headers();if(!isTrustedRequestOrigin(h,[new URL(env.SITE_URL).host]))throw new Error("BAD_ORIGIN");const admin=await requireAdminWrite();return {admin,address:clientAddress(h)}}
export async function saveAdminUser(_p:UserAdminState,f:FormData):Promise<UserAdminState>{const p=z.object({id,username:z.string().trim().min(3).max(20),email:z.string().trim().max(128).refine(v=>!v||z.email().safeParse(v).success),firstName:z.string().trim().min(1).max(50),lastName:z.string().trim().min(1).max(50),title:z.string().trim().max(15),memberType:z.coerce.number().int().min(0).max(99),status:z.coerce.number().int().min(-1).max(1),superuser:z.enum(["yes","no"])}).safeParse(Object.fromEntries(f));if(!p.success)return{error:"กรุณาตรวจสอบข้อมูลผู้ใช้"};try{const{admin,address}=await context();await updateAdminUser({...p.data,superuser:p.data.superuser==="yes",actorId:admin.userId,address});revalidatePath("/admin/users");return{success:"บันทึกข้อมูลผู้ใช้แล้ว"}}catch{return{error:"ไม่สามารถบันทึกข้อมูลผู้ใช้ได้"}}}
export async function resetUserPassword(_p:UserAdminState,f:FormData):Promise<UserAdminState>{const p=z.object({id,password:z.string().min(8).max(128)}).safeParse(Object.fromEntries(f));if(!p.success)return{error:"รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร"};try{const{admin,address}=await context();await resetAdminUserPassword({id:p.data.id,password:p.data.password,actorId:admin.userId,address});return{success:"รีเซ็ตรหัสผ่านเรียบร้อยแล้ว"}}catch{return{error:"ไม่สามารถรีเซ็ตรหัสผ่านได้"}}}
