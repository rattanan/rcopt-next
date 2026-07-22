import Link from "next/link";
import { ArrowLeft, ClipboardPenLine } from "lucide-react";
import { findAdminUser } from "@/repositories/admin-user-repository";
import { AdminUserEditor } from "@/components/admin-user-editor";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await findAdminUser(Number(id));
  if (!user) return <p>ไม่พบผู้ใช้</p>;
  return <><Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary-dark)]"><ArrowLeft size={16} />กลับไปผู้ใช้ทั้งหมด</Link><div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">USER MANAGEMENT</p><h1 className="mt-2 text-3xl font-extrabold">จัดการผู้ใช้: {user.username}</h1></div><Link href={`/admin/users/${user.id}/profile`} className="button-primary gap-2"><ClipboardPenLine size={17} />จัดการข้อมูลประกอบโปรไฟล์</Link></div><p className="mt-2 text-sm text-[var(--muted)]">แก้ไข Education, Profession, Academic, Contact, Social และ Gallery ได้จากปุ่มด้านบน</p><AdminUserEditor user={user}/></>;
}
