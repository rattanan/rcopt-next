import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { MemberLoginForm } from "@/components/member-login-form";
export const metadata: Metadata = { title: "เข้าสู่ระบบสมาชิก", robots: { index: false, follow: false } };
export default function MemberLoginPage() { return <main className="grid min-h-screen place-items-center bg-[var(--secondary)] p-5"><section className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white p-7 shadow-[var(--shadow)] sm:p-9"><Link href="/" className="flex items-center gap-3"><Image src="/brand/rcopt-crest.png" alt="ตรา RCOPT" width={42} height={56} className="h-14 w-auto object-contain" /><strong>RCOPT</strong></Link><div className="mt-8 flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]"><Stethoscope size={21} /></span><div><h1 className="text-2xl font-extrabold">เข้าสู่ระบบสมาชิก</h1><p className="text-sm text-[var(--muted)]">สำหรับจักษุแพทย์ที่ต้องการตอบคำถาม</p></div></div><MemberLoginForm /><p className="mt-6 text-center text-sm text-[var(--muted)]">ผู้ดูแลระบบ <Link href="/admin/login" className="font-bold text-[var(--primary-dark)]">เข้าสู่ระบบที่นี่</Link></p></section></main>; }
