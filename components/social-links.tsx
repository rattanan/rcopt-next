import { ArrowUpRight } from "lucide-react";

export const socialLinks = [
  { name: "Facebook", handle: "RCOPThailand", href: "https://www.facebook.com/RCOPThailand" },
  { name: "YouTube", handle: "AllAboutEyebyRCOPT", href: "https://www.youtube.com/@AllAboutEyebyRCOPT" },
  { name: "Instagram", handle: "AllAboutEyebyRCOPT", href: "https://www.instagram.com/AllAboutEyebyRCOPT" },
  { name: "TikTok", handle: "@rcopt.official", href: "https://www.tiktok.com/@rcopt.official" },
];

export function SocialLinks() {
  return <section className="container-shell py-12" aria-labelledby="social-title">
    <p className="eyebrow">FOLLOW RCOPT</p><h2 id="social-title" className="mt-2 text-2xl font-extrabold">ติดตามข่าวสารและความรู้สุขภาพตา</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{socialLinks.map((item) => <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className="flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-[var(--border)] p-5 hover:bg-[var(--secondary)]"><span className="min-w-0"><strong className="block text-[var(--primary-dark)]">{item.name}</strong><span className="mt-1 block break-all text-xs text-[var(--muted)]">{item.handle}</span></span><ArrowUpRight size={18} aria-hidden="true" className="shrink-0" /><span className="sr-only">เปิดในแท็บใหม่</span></a>)}</div>
  </section>;
}
