import type { Metadata } from "next";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MemberProfileForm } from "@/components/member-profile-form";
import { requireActiveMember } from "@/lib/auth/guards";
import { logoutMember } from "./actions";
import { findMemberProfileById } from "@/repositories/member-profile-repository";
import { getProfileDetails } from "@/repositories/profile-details-repository";
import { ProfileDetailsEditor } from "@/components/profile-details-editor";

export const metadata: Metadata = { title: "ข้อมูลส่วนตัว", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const member = await requireActiveMember();
  const [profile, details] = await Promise.all([findMemberProfileById(member.userId), getProfileDetails(member.userId)]);
  if (!profile) return null;
  return <><SiteHeader /><main className="bg-[var(--secondary)] py-10 sm:py-14"><div className="container-shell max-w-4xl"><section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow)]"><div className="border-b border-[var(--border)] bg-gradient-to-r from-[#fff0f5] via-white to-[#fff8ea] p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-5"><div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[var(--primary)] shadow-sm"><UserRound size={27} /></span><div><p className="eyebrow">MEMBER PROFILE</p><h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">ข้อมูลส่วนตัว</h1><p className="mt-1 text-sm text-[var(--muted)]">ชื่อผู้ใช้: {profile.username}</p></div></div><span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-emerald-800 shadow-sm"><ShieldCheck size={16} />{member.isDoctor ? "สมาชิกจักษุแพทย์" : "สมาชิกทั่วไป"}</span></div></div><div className="p-6 sm:p-8"><p className="text-sm leading-6 text-[var(--muted)]">แก้ไขข้อมูลของบัญชีที่เข้าสู่ระบบอยู่ การเปลี่ยนแปลงจะถูกบันทึกในฐานข้อมูล RCOPT</p><MemberProfileForm profile={profile} /><ProfileDetailsEditor details={details} /><div className="mt-8 border-t border-[var(--border)] pt-6"><form action={logoutMember}><button type="submit" className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold text-[var(--muted)] hover:bg-[#fff7f9]"><LogOut size={17} />ออกจากระบบ</button></form></div></div></section></div></main><SiteFooter /></>;
}
