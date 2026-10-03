import { z } from "zod";

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1200),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(5000) })).max(8).default([]),
  articleId: z.number().int().positive().optional(),
});
export type ChatSource = { id: number; title: string; href: string; updatedAt: string };
export type ChatArticle = ChatSource & { intro: string; body: string; category: string };
export const chatActions = [
  { label: "ค้นหาจักษุแพทย์", href: "/doctors/map" },
  { label: "บทความทั้งหมด", href: "/articles" },
  { label: "ติดต่อราชวิทยาลัยฯ", href: "/contact" },
] as const;

const ignoredTerms = new Set(["อะไร", "อย่างไร", "ไหม", "ครับ", "ค่ะ", "ช่วย", "เกี่ยว", "เรื่อง", "ของ", "การ", "และ", "ใน", "ที่", "ให้", "เป็น", "ได้", "มี", "กับ", "อยาก", "ทราบ", "บทความ", "สรุป", "อ่าน", "นี้", "the", "what", "about", "is"]);
export function searchTerms(value: string): string[] {
  const segmenter = new Intl.Segmenter("th", { granularity: "word" });
  return [...new Set([...segmenter.segment(value.toLowerCase())].filter(s => s.isWordLike).map(s => s.segment).filter(s => s.length > 1 && !ignoredTerms.has(s)))].slice(0, 20);
}
export function rankArticles(articles: ChatArticle[], question: string, previous: string, articleId?: number): ChatArticle[] {
  if (articleId && /บทความ(?:นี้|ที่กำลังอ่าน)|this article/iu.test(question)) return articles.filter(article => article.id === articleId);
  const terms = searchTerms(question);
  const contextTerms = searchTerms(previous);
  return articles.map(article => {
    const title = article.title.toLowerCase(), intro = article.intro.toLowerCase(), body = article.body.toLowerCase();
    const scoreTerms = (words: string[]) => words.reduce((score, term) => score + (title.includes(term) ? 12 : 0) + (intro.includes(term) ? 5 : 0) + (body.includes(term) ? 1 : 0), 0);
    return { article, score: scoreTerms(terms) + scoreTerms(contextTerms) * .25 + (article.id === articleId ? 1000 : 0) };
  }).filter(item => item.score > 0).sort((a,b) => b.score-a.score).slice(0, 6).map(item => item.article);
}
export function articleExcerpt(body: string, question: string): string {
  if (body.length <= 5500) return body;
  const terms = searchTerms(question);
  const index = terms.map(term => body.toLowerCase().indexOf(term)).find(index => index >= 0) ?? 0;
  const start = Math.max(0, index - 500);
  return body.slice(0, 1500) + "\n…\n" + body.slice(start, start + 4000);
}
const replySchema = z.object({ answer: z.string().trim().min(1).max(5000), sourceIds: z.array(z.number().int()).max(6), suggestions: z.array(z.string().trim().min(1).max(100)).max(3).default([]) });
export function parseChatReply(text: string, articles: ChatArticle[]) {
  const parsed = replySchema.parse(JSON.parse(text.replace(/^```(?:json)?\s*/u, "").replace(/\s*```$/u, "")));
  const ids = new Set(parsed.sourceIds);
  return { answer: parsed.answer, sources: articles.filter(a => ids.has(a.id)).map(({ id, title, href, updatedAt }) => ({ id, title, href, updatedAt })), suggestions: parsed.suggestions, actions: chatActions };
}
export function completionUrl(value: string): string {
  const url = new URL(value);
  if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("Invalid AI endpoint");
  url.pathname = url.pathname.replace(/\/$/u, "");
  if (!url.pathname.endsWith("/chat/completions")) url.pathname += "/chat/completions";
  return url.toString();
}

// Require Thai prose while allowing English medical terms and abbreviations.
export function isThaiChatText(text: string): boolean {
  return /[\u0E01-\u0E5B]/u.test(text) && !/\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(text);
}
export function isThaiChatReply(reply: ReturnType<typeof parseChatReply>): boolean {
  return isThaiChatText(reply.answer) && reply.suggestions.every(isThaiChatText);
}
export const thaiChatFallback = {
  answer: "ขณะนี้ยังเรียบเรียงคำตอบภาษาไทยได้ไม่สมบูรณ์ กรุณาลองถามอีกครั้ง หรือเลือกเปิดคลังบทความด้านล่างค่ะ",
  sources: [], suggestions: ["ต้อกระจก", "ต้อหิน", "การดูแลสุขภาพตา"], actions: chatActions,
};
