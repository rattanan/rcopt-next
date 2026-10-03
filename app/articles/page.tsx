import type { Metadata } from "next";
import { ContentListPage } from "@/components/content-list-page";
import { getArticleCategories } from "@/repositories/content-repository";

type Props = { searchParams: Promise<{ category?: string; page?: string; q?: string }> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const selected = typeof category === "string" && /^\d+$/u.test(category) ? (await getArticleCategories()).find((item) => item.id === Number(category)) : undefined;
  return { title: selected?.name ?? "บทความและคลังความรู้", description: selected ? `${selected.name} — ราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย` : "บทความและคลังความรู้จากราชวิทยาลัยจักษุแพทย์แห่งประเทศไทย", alternates: { canonical: selected ? `/articles?category=${selected.id}` : "/articles" } };
}
export default function ArticlesPage({ searchParams }: Props) { return <ContentListPage kind="article" searchParams={searchParams} />; }
