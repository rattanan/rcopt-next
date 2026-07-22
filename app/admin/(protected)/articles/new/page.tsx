import Link from "next/link";
import { AdminArticleEditor } from "@/components/admin-article-editor";
import { listAdminCategories } from "@/repositories/admin-cms-repository";
export default async function NewArticlePage(){const categories=await listAdminCategories();return <><Link href="/admin/articles" className="text-sm font-bold text-[var(--primary-dark)]">← กลับไปรายการบทความ</Link><p className="eyebrow mt-6">CONTENT MANAGEMENT</p><h1 className="mt-2 text-3xl font-extrabold">เพิ่มบทความหรือข่าว</h1><AdminArticleEditor categories={categories}/></>}
