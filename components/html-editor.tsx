"use client";

import { useRef, useState } from "react";
import { Bold, Code2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";

type Command = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList" | "formatBlock" | "createLink" | "undo" | "redo";

export function HtmlEditor({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [html, setHtml] = useState(defaultValue);
  const [source, setSource] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const editor = useRef<HTMLDivElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const run = (command: Command, value?: string) => {
    editor.current?.focus();
    if (command === "createLink") {
      const href = window.prompt("URL ของลิงก์");
      if (!href) return;
      document.execCommand(command, false, href);
    } else document.execCommand(command, false, value);
    setHtml(editor.current?.innerHTML ?? html);
  };
  const uploadImage = async (file: File) => {
    setUploading(true); setUploadError("");
    try {
      const data = new FormData(); data.set("image", file);
      const response = await fetch("/api/admin/article-images", { method: "POST", body: data });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error || "อัปโหลดรูปภาพไม่สำเร็จ");
      editor.current?.focus(); document.execCommand("insertImage", false, payload.url);
      setHtml(editor.current?.innerHTML ?? html);
    } catch (error) { setUploadError(error instanceof Error ? error.message : "อัปโหลดรูปภาพไม่สำเร็จ"); } finally { setUploading(false); if (imageInput.current) imageInput.current.value = ""; }
  };
  const tool = (label: string, command: Command, icon: React.ReactNode, value?: string) => <button type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={() => run(command, value)} className="grid h-9 w-9 place-items-center rounded-lg border border-transparent hover:border-[var(--border)] hover:bg-white">{icon}</button>;
  return <div className="mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-white"><input type="hidden" name={name} value={html} /><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadImage(file); }} /><div className="flex flex-wrap items-center gap-1 border-b border-[var(--border)] bg-[#fff8fa] p-2"><button type="button" onClick={() => setSource((value) => !value)} className={`mr-2 inline-flex h-9 items-center gap-1 rounded-lg px-3 text-xs font-bold ${source ? "bg-[var(--primary)] text-white" : "hover:bg-white"}`}><Code2 size={15} />HTML</button>{!source && <><span className="flex gap-1 border-r border-[var(--border)] pr-2">{tool("ตัวหนา", "bold", <Bold size={16} />)}{tool("ตัวเอียง", "italic", <Italic size={16} />)}</span><span className="flex gap-1 border-r border-[var(--border)] px-2">{tool("รายการหัวข้อ", "insertUnorderedList", <List size={16} />)}{tool("รายการแบบตัวเลข", "insertOrderedList", <ListOrdered size={16} />)}{tool("คำคม", "formatBlock", <Quote size={16} />, "blockquote")}</span><span className="flex gap-1 border-r border-[var(--border)] px-2">{tool("เพิ่มลิงก์", "createLink", <Link2 size={16} />)}<button type="button" disabled={uploading} onClick={() => imageInput.current?.click()} className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold hover:bg-white disabled:opacity-60"><ImagePlus size={16} />{uploading ? "กำลังอัปโหลด…" : "แทรกรูป"}</button></span><span className="flex gap-1 px-2">{tool("ย้อนกลับ", "undo", <Undo2 size={16} />)}{tool("ทำซ้ำ", "redo", <Redo2 size={16} />)}</span></>}</div>{uploadError&&<p role="alert" className="border-b border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-800">{uploadError}</p>}{source ? <textarea aria-label="HTML source" value={html} onChange={(event) => setHtml(event.target.value)} rows={18} className="block w-full resize-y p-4 font-mono text-sm outline-none" /> : <div ref={editor} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" tabIndex={0} onInput={(event) => setHtml(event.currentTarget.innerHTML)} className="legacy-content min-h-[360px] p-5 text-[16px] leading-8 outline-none focus:bg-[#fffdfd]" dangerouslySetInnerHTML={{ __html: html }} />}</div>;
}
