"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProfile, type ProfileActionState } from "@/app/profile/actions";
import type { MemberProfile } from "@/repositories/member-profile-repository";

const initialState: ProfileActionState = {};
const inputClass = "h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

export function MemberProfileForm({ profile }: { profile: MemberProfile }) {
  const [state, action, pending] = useActionState(updateProfile, initialState);
  return <form action={action} className="mt-7 grid gap-5">
    <div className="grid gap-5 sm:grid-cols-[140px_1fr_1fr]">
      <div><label htmlFor="title" className="mb-2 block text-sm font-bold">คำนำหน้า</label><input id="title" name="title" defaultValue={profile.title ?? ""} maxLength={15} className={inputClass} /></div>
      <div><label htmlFor="firstName" className="mb-2 block text-sm font-bold">ชื่อ <span className="text-[var(--primary)]">*</span></label><input id="firstName" name="firstName" defaultValue={profile.firstname ?? ""} required maxLength={50} autoComplete="given-name" className={inputClass} /></div>
      <div><label htmlFor="lastName" className="mb-2 block text-sm font-bold">นามสกุล <span className="text-[var(--primary)]">*</span></label><input id="lastName" name="lastName" defaultValue={profile.lastname ?? ""} required maxLength={50} autoComplete="family-name" className={inputClass} /></div>
    </div>
    <div className="grid gap-5 sm:grid-cols-2">
      <div><label htmlFor="email" className="mb-2 block text-sm font-bold">อีเมล</label><input id="email" name="email" type="email" defaultValue={profile.email ?? ""} maxLength={128} autoComplete="email" className={inputClass} /></div>
      <div><label htmlFor="sex" className="mb-2 block text-sm font-bold">เพศ</label><select id="sex" name="sex" defaultValue={String(profile.sex ?? 0)} className={inputClass}><option value="0">ไม่ระบุ</option><option value="1">ชาย</option><option value="2">หญิง</option></select></div>
    </div>
    {profile.memtype === 2 && <div><label htmlFor="licenseNumber" className="mb-2 block text-sm font-bold">เลขที่ใบประกอบวิชาชีพเวชกรรม</label><input id="licenseNumber" name="licenseNumber" defaultValue={profile.licn ?? ""} maxLength={45} className={inputClass} /></div>}
    {profile.memtype !== 2 && <input type="hidden" name="licenseNumber" value={profile.licn ?? ""} />}
    {state.error && <p className="rounded-xl bg-[#fff0f4] px-4 py-3 text-sm text-[#9b2f59]" role="alert">{state.error}</p>}
    {state.success && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{state.success}</p>}
    <button type="submit" disabled={pending} className="button-primary w-fit gap-2 disabled:cursor-not-allowed disabled:opacity-60"><Save size={17} />{pending ? "กำลังบันทึก…" : "บันทึกข้อมูล"}</button>
  </form>;
}
