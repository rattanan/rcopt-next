import sanitizeHtml from "sanitize-html";
import { resolveLegacyAsset } from "@/lib/legacy-assets";

export function toSafeYouTubeEmbed(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (!["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].includes(url.hostname)) return undefined;
    const id = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]{11})$/u)?.[1];
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : undefined;
  } catch { return undefined; }
}

export function stripLegacyHtml(value: string | null | undefined): string {
  return sanitizeHtml(value ?? "", { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/gu, " ")
    .trim();
}

export function sanitizeLegacyHtml(value: string | null | undefined): string {
  return sanitizeHtml(value ?? "", {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "a", "img", "iframe", "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"], iframe: ["src", "title", "width", "height", "allow", "allowfullscreen", "loading", "referrerpolicy"], "*": ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: resolveLegacyAsset(attribs.src, "uploads") } }),
      iframe: (tagName, attribs) => { const src = toSafeYouTubeEmbed(attribs.src); const safeAttributes: Record<string, string> = src ? { src, title: attribs.title || "YouTube video", loading: "lazy", referrerpolicy: "strict-origin-when-cross-origin", allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share", allowfullscreen: "" } : { class: "legacy-embed-removed" }; return { tagName: src ? tagName : "span", attribs: safeAttributes }; },
    },
  });
}

export function formatThaiDate(value: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(value));
}

export function redactPublicContactInfo(value: string): string {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, "[ข้อมูลติดต่อถูกซ่อน]")
    .replace(/(?:\+?66|0)\d(?:[\s-]?\d){7,9}/gu, "[ข้อมูลติดต่อถูกซ่อน]");
}

export function hasLegacyContentImage(path: string | null | undefined): boolean {
  const value = path?.trim();
  if (!value) return false;
  // The legacy CMS reused these RCOPT crest files as article thumbnails, including
  // ID-prefixed copies such as "2234original.jpg". Render them as the compact
  // branded fallback instead of cropping a crest into the thumbnail frame.
  return !/(?:rcoptapplogo|\d*original)\.(?:jpe?g|png)$/iu.test(value);
}
