"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, ArrowUpRight, RotateCcw, LoaderCircle, BookOpen } from "lucide-react";
import { chatActions, type ChatSource } from "@/lib/article-chat";

type Message = { role: "user" | "assistant"; content: string; sources?: ChatSource[]; suggestions?: string[] };
const topics = ["ต้อกระจก", "ต้อหิน", "การดูแลสุขภาพตา"];

export function ArticleChatbot() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const pending = useRef<AbortController | null>(null);
  const articleId = Number(pathname.match(/^\/articles\/(\d+)$/u)?.[1]) || undefined;
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (open) end.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy, error, open]);
  useEffect(() => () => pending.current?.abort(), []);
  if (/^\/(admin|member|login|register|api)(\/|$)/u.test(pathname)) return null;
  function close() { setOpen(false); launcher.current?.focus(); }
  async function send(text: string) {
    const message = text.trim();
    if (!message || pending.current) return;
    const controller = new AbortController(); pending.current = controller;
    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    setMessages(current => [...current, { role: "user", content: message }]); setDraft(""); setError(""); setBusy(true);
    try {
      const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history, articleId }), signal: controller.signal });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "กรุณาลองอีกครั้ง");
      setMessages(current => [...current, { role: "assistant", content: data.answer, sources: data.sources, suggestions: data.suggestions }]);
    } catch (reason) {
      if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "เชื่อมต่อไม่ได้ กรุณาลองอีกครั้ง"); setDraft(message); setMessages(current => current.slice(0, -1)); }
    } finally { pending.current = null; setBusy(false); }
  }
  return <div className="fixed bottom-4 right-4 z-[1200] sm:bottom-6 sm:right-6">
    {open && <section id="article-assistant" role="dialog" aria-labelledby="assistant-title" onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); close(); } }} className="mb-3 flex h-[min(650px,calc(100dvh-110px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-white text-[var(--ink)] shadow-[0_18px_70px_rgba(80,25,50,.24)]">
      <header className="flex shrink-0 items-center gap-3 bg-[var(--primary-dark)] px-5 py-4 text-white">
        <span className="rounded-2xl bg-white/15 p-2"><MessageCircle size={23} aria-hidden="true" /></span>
        <div className="flex-1"><h2 id="assistant-title" className="font-bold">ผู้ช่วย RCOPT</h2><p className="text-xs text-white/85">ค้นคำตอบจากบทความของเรา</p></div>
        <button type="button" onClick={() => { setMessages([]); setError(""); setDraft(""); input.current?.focus(); }} disabled={busy} aria-label="เริ่มบทสนทนาใหม่" className="rounded-full p-2 hover:bg-white/15 disabled:opacity-40"><RotateCcw size={17} /></button>
        <button type="button" onClick={close} aria-label="ปิดแชต" className="rounded-full p-2 hover:bg-white/15"><X size={21} /></button>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#fcf9fb] px-4 py-5">
        <div className="mb-5 rounded-2xl rounded-tl-sm border border-[var(--border)] bg-white p-4 text-sm leading-7"><p className="font-semibold">สวัสดีค่ะ มีเรื่องไหนให้ช่วยค้นหาคะ?</p><p className="mt-1 text-[var(--muted)]">ถามเรื่องสุขภาพตาหรือเลือกหัวข้อด้านล่าง ฉันจะช่วยสรุปพร้อมบทความให้อ่านต่อค่ะ</p>
          <div className="mt-3 flex flex-wrap gap-2">{topics.map(topic => <button type="button" key={topic} disabled={busy} onClick={() => void send(`ขอความรู้เรื่อง${topic}จากบทความ`)} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold text-[var(--primary-dark)] hover:bg-pink-50 disabled:opacity-50">{topic}</button>)}</div>
          {articleId && <button type="button" disabled={busy} onClick={() => void send("ช่วยสรุปบทความที่กำลังอ่านให้เข้าใจง่าย")} className="mt-3 flex items-center gap-2 text-sm font-bold text-[var(--primary-dark)] disabled:opacity-50"><BookOpen size={16} /> สรุปบทความนี้</button>}
        </div>
        <div role="log" aria-label="บทสนทนากับผู้ช่วย RCOPT" aria-live="polite" aria-relevant="additions" className="space-y-4">
          {messages.map((message, index) => <div key={index} className={message.role === "user" ? "ml-8" : "mr-2"}>
            <div className={`whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === "user" ? "rounded-tr-sm bg-[var(--primary-dark)] text-white" : "rounded-tl-sm border border-[var(--border)] bg-white"}`}>{message.content}</div>
            {!!message.sources?.length && <div className="mt-2 space-y-2"><p className="text-xs font-semibold text-[var(--muted)]">บทความอ้างอิง</p>{message.sources.map(source => <Link key={source.id} href={source.href} onClick={close} className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-white p-3 text-xs leading-5 text-[var(--primary-dark)] hover:bg-pink-50"><BookOpen size={14} className="mt-1 shrink-0" /><span>{source.title}</span><ArrowUpRight size={14} className="ml-auto shrink-0" /></Link>)}</div>}
            {index === messages.length - 1 && message.suggestions && <div className="mt-3 flex flex-wrap gap-2">{message.suggestions.map(suggestion => <button type="button" key={suggestion} disabled={busy} onClick={() => void send(suggestion)} className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-left text-xs text-[var(--primary-dark)] hover:bg-pink-50 disabled:opacity-50">{suggestion}</button>)}</div>}
          </div>)}
        </div>
        {busy && <p role="status" className="mt-4 flex items-center gap-2 text-xs text-[var(--muted)]"><LoaderCircle size={16} className="animate-spin" /> กำลังอ่านบทความและเรียบเรียงคำตอบ…</p>}
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div ref={end} />
      </div>
      <div className="shrink-0 border-t border-[var(--border)] bg-white p-4">
        <div className="mb-3 flex flex-wrap gap-x-3 gap-y-2">{chatActions.map(action => <Link key={action.href} href={action.href} onClick={close} className="text-xs font-semibold text-[var(--primary-dark)] underline-offset-2 hover:underline">{action.label} ↗</Link>)}</div>
        <form onSubmit={event => { event.preventDefault(); void send(draft); }} className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[#fcf9fb] p-2 focus-within:ring-2 focus-within:ring-[var(--primary)]">
          <input ref={input} aria-label="พิมพ์คำถามถึงผู้ช่วย" placeholder="พิมพ์คำถามของคุณ…" maxLength={1200} value={draft} onChange={event => setDraft(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 py-2 text-base outline-none" />
          <button type="submit" disabled={busy || !draft.trim()} aria-label="ส่งคำถาม" className="rounded-xl bg-[var(--primary-dark)] p-3 text-white disabled:opacity-40"><Send size={18} /></button>
        </form>
        <p className="mt-2 text-[10px] leading-4 text-[var(--muted)]">คำตอบจาก AI เพื่อความรู้ ไม่ทดแทนการตรวจโดยแพทย์<br />หลีกเลี่ยงการส่งข้อมูลส่วนตัวหรือประวัติสุขภาพที่ระบุตัวตน</p>
      </div>
    </section>}
    <div className="flex justify-end"><button ref={launcher} type="button" onClick={() => open ? close() : setOpen(true)} aria-expanded={open} aria-controls="article-assistant" aria-label={open ? "ย่อผู้ช่วย RCOPT" : "เปิดผู้ช่วย RCOPT"} className="flex items-center gap-2 rounded-full bg-[var(--primary-dark)] px-5 py-4 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]">{open ? <X size={23} /> : <MessageCircle size={23} />}<span className="text-sm">{open ? "ย่อแชต" : "สอบถาม RCOPT"}</span></button></div>
  </div>;
}
