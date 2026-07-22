import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/content-detail-page";
import { findPublicContentById } from "@/repositories/content-repository";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> { const { id } = await params; if (!/^\d+$/u.test(id)) return {}; const item = await findPublicContentById(Number(id)); return item?.category.id === 1 ? { title: item.title, description: item.excerpt ?? item.title, alternates: { canonical: `/news/${item.id}` }, openGraph: { type: "article", title: item.title, description: item.excerpt ?? item.title } } : {}; }
export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; if (!/^\d+$/u.test(id)) notFound(); return <ContentDetailPage id={Number(id)} kind="news" />; }
