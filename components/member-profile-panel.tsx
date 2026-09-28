"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { ArrowLeft, KeyRound, Pencil } from "lucide-react";
import { MemberProfileForm } from "./member-profile-form";
import { ProfileDetailsEditor } from "./profile-details-editor";
import { changeMemberPassword } from "@/app/profile/actions";
import type { MemberProfile } from "@/repositories/member-profile-repository";
import type { ProfileDetails } from "@/repositories/profile-details-repository";

const button = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-bold hover:bg-[var(--secondary)] focus-visible:outline-2 focus-visible:outline-[var(--primary)]";

function PasswordForm() {
  const [state, action, pending] = useActionState(changeMemberPassword, {});
  return <form action={action} className="mt-6 grid max-w-lg gap-5">
    <p className="text-sm text-[var(--muted)]">ยืนยันรหัสผ่านปัจจุบันก่อนตั้งรหัสผ่านใหม่ ความยาวอย่างน้อย 12 ตัวอักษร</p>
    {[{ name: "currentPassword", label: "รหัสผ่านปัจจุบัน", auto: "current-password" }, { name: "newPassword", label: "รหัสผ่านใหม่", auto: "new-password" }, { name: "confirmPassword", label: "ยืนยันรหัสผ่านใหม่", auto: "new-password" }].map(field => <label key={field.name} className="grid gap-2 text-sm font-bold">{field.label}<input type="password" name={field.name} autoComplete={field.auto} required minLength={field.name === "currentPassword" ? 1 : 12} maxLength={256} className="h-12 rounded-xl border border-[var(--border)] px-4 focus:outline-[var(--primary)]" /></label>)}
    {state.error && <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{state.success}</p>}
    <button disabled={pending} className="button-primary w-fit disabled:opacity-60">{pending ? "กำลังบันทึก…" : "บันทึกรหัสผ่านใหม่"}</button>
  </form>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-[var(--border)] p-5 sm:p-6"><h2 className="mb-4 text-lg font-extrabold">{title}</h2><div className="grid gap-4 text-sm leading-7">{children}</div></section>;
}
const empty = <p className="text-[var(--muted)]">ยังไม่มีข้อมูล</p>;

export function MemberProfilePanel({ profile, details }: { profile: MemberProfile; details: ProfileDetails }) {
  const [mode, setMode] = useState<"view" | "edit" | "password">("view");
  const portrait = details.gallery.find(row => row.isProfilePicture);
  const visibility = (id: number) => <span className="mt-2 inline-block rounded-full bg-[var(--secondary)] px-3 py-1 text-xs text-[var(--muted)]">{details.visibility.find(row => row.id === id)?.name || "ไม่ระบุการแสดงผล"}</span>;
  return <div>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-xl font-extrabold">{mode === "edit" ? "แก้ไขโปรไฟล์" : mode === "password" ? "เปลี่ยนรหัสผ่าน" : "โปรไฟล์ของฉัน"}</h2>
      <div className="flex flex-wrap gap-2">{mode === "view" ? <><button className="button-primary gap-2" onClick={() => setMode("edit")}><Pencil size={17} />แก้ไขโปรไฟล์</button><button className={button} onClick={() => setMode("password")}><KeyRound size={17} />เปลี่ยนรหัสผ่าน</button></> : <button className={button} onClick={() => { if (mode !== "edit" || window.confirm("กลับไปดูโปรไฟล์? ข้อมูลที่ยังไม่ได้กดบันทึกจะไม่ถูกเก็บ")) setMode("view"); }}><ArrowLeft size={17} />กลับไปดูโปรไฟล์</button>}</div>
    </div>
    {mode === "password" ? <PasswordForm /> : mode === "edit" ? <><p className="text-sm text-[var(--muted)]">แก้ไขข้อมูลแล้วกดบันทึกในแต่ละส่วน เลือกหัวข้อด้านล่างเพื่อเปิดฟอร์ม</p><MemberProfileForm profile={profile} /><ProfileDetailsEditor details={details} /></> : <div className="grid gap-5">
      <Section title="ข้อมูลส่วนตัว"><div className="flex flex-wrap items-start gap-5">{portrait && <Image src={portrait.imageUrl} alt="รูปโปรไฟล์" width={96} height={96} unoptimized className="h-24 w-24 rounded-2xl object-cover" />}<dl className="grid flex-1 gap-4 sm:grid-cols-2">{[["ชื่อ–นามสกุล", [profile.title, profile.firstname, profile.lastname].filter(Boolean).join(" ")], ["อีเมล", profile.email], ["เพศ", profile.sex === 1 ? "ชาย" : profile.sex === 2 ? "หญิง" : "ไม่ระบุ"], ...(profile.memtype === 2 ? [["เลขที่ใบประกอบวิชาชีพเวชกรรม", profile.licn]] : [])].map(([label, value]) => <div key={label}><dt className="text-[var(--muted)]">{label}</dt><dd className="break-words font-bold">{value || "ยังไม่ระบุ"}</dd></div>)}</dl></div></Section>
      <Section title="ประวัติการศึกษา">{details.education.length ? details.education.map(row => <article key={row.id} className="border-b border-[var(--border)] pb-4 last:border-0"><h3 className="font-bold">{row.institution}</h3><p>{[details.educationTypes.find(type => type.id === row.educationTypeId)?.name, row.subject, row.year || null, row.honor].filter(Boolean).join(" · ")}</p><p className="whitespace-pre-wrap break-words">{row.details}</p>{visibility(row.visibilityId)}</article>) : empty}{details.educationOverview.map(row => <div key={row.id}><p className="whitespace-pre-wrap break-words">{row.details}</p>{visibility(row.visibilityId)}</div>)}</Section>
      {([['ประวัติวิชาชีพ', details.profession], ['ผลงานวิชาการ', details.academic]] as const).map(([title, rows]) => <Section key={title} title={title}>{rows.length ? rows.map(row => <div key={row.id}><p className="whitespace-pre-wrap break-words">{row.details}</p>{visibility(row.visibilityId)}</div>) : empty}</Section>)}
      <Section title="ข้อมูลติดต่อ">{details.contacts.length ? details.contacts.map(row => <article key={row.id}><h3 className="font-bold">{row.name}</h3><p className="whitespace-pre-wrap">{row.address} {row.postcode}</p><p>{[row.telephone, row.mobile, row.email].filter(Boolean).join(" · ")}</p><p className="break-all">{[row.url, row.mapUrl, row.gps].filter(Boolean).join(" · ")}</p><p className="whitespace-pre-wrap">{row.details}</p>{visibility(row.visibilityId)}</article>) : empty}</Section>
      <Section title="โซเชียลมีเดีย">{details.social.length ? details.social.map(row => <div key={row.id}><p className="font-bold">{row.name}</p><p className="break-all">{row.url}</p>{visibility(row.visibilityId)}</div>) : empty}</Section>
      <Section title="รูปภาพ">{details.gallery.length ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{details.gallery.map(row => <figure key={row.id}><Image src={row.imageUrl} alt={row.name} width={240} height={180} unoptimized className="aspect-[4/3] w-full rounded-xl object-cover" /><figcaption className="mt-2 break-words">{row.name}{row.isProfilePicture && " · รูปโปรไฟล์"}</figcaption><p>{row.details}</p>{visibility(row.visibilityId)}</figure>)}</div> : empty}</Section>
    </div>}
  </div>;
}
