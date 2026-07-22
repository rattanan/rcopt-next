import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";

export const metadata: Metadata = { title: "บทความและคลังความรู้", description: "บทความและคลังความรู้จากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", alternates: { canonical: "/articles" } };
export default function ArticlesPage({ searchParams }: { searchParams: Promise<{ category?: string; page?: string }> }) { return <ContentListPage kind="article" searchParams={searchParams} />; }
