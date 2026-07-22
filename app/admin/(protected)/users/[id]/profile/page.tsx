import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";
import { findAdminUser } from "@/repositories/admin-user-repository";
import { getProfileDetails } from "@/repositories/profile-details-repository";
import { ProfileDetailsEditor } from "@/components/profile-details-editor";

export default async function AdminUserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isSafeInteger(userId) || userId < 1) return <p>ไม่พบผู้ใช้</p>;
  const [user, details] = await Promise.all([findAdminUser(userId), getProfileDetails(userId)]);
  if (!user) return <p>ไม่พบผู้ใช้</p>;
  const name = [user.title, user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  return <><Link href="/admin/users" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--primary-dark)]"><ArrowLeft size={16} />กลับไปผู้ใช้ทั้งหมด</Link><section className="mt-5 rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8"><div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--primary-light)] text-[var(--primary)]"><UserRound size={23} /></span><div><p className="eyebrow">EDIT MEMBER PROFILE</p><h1 className="mt-1 text-2xl font-extrabold">{name}</h1><p className="mt-1 text-sm text-[var(--muted)]">{user.username} · #{user.id}</p></div></div><ProfileDetailsEditor details={details} targetUserId={user.id} /></section></>;
}
