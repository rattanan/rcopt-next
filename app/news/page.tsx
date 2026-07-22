import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";

export const metadata: Metadata = { title: "ข่าวสารและกิจกรรม", description: "ข่าวสารและกิจกรรมจากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", alternates: { canonical: "/news" } };
export default function NewsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) { return <ContentListPage kind="news" searchParams={searchParams} />; }
