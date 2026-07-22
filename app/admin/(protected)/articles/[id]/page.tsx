import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminArticleEditor } from "@/components/admin-article-editor";
import { findAdminArticle, listAdminCategories } from "@/repositories/admin-cms-repository";
export default async function EditArticlePage({params}:{params:Promise<{id:string}>}){const id=Number((await params).id);if(!Number.isSafeInteger(id)||id<1)notFound();const [article,categories]=await Promise.all([findAdminArticle(id),listAdminCategories()]);if(!article)notFound();return <><Link href="/admin/articles" className="text-sm font-bold text-[var(--primary-dark)]">← กลับไปรายการบทความ</Link><p className="eyebrow mt-6">CONTENT MANAGEMENT</p><h1 className="mt-2 text-3xl font-extrabold">แก้ไขบทความ</h1><AdminArticleEditor article={article} categories={categories}/></>}
