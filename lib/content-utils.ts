import sanitizeHtml from "sanitize-html";
import { resolveLegacyAsset } from "@/lib/legacy-assets";

export function stripLegacyHtml(value: string | null | undefined): string {
  return sanitizeHtml(value ?? "", { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/gu, " ")
    .trim();
}

export function sanitizeLegacyHtml(value: string | null | undefined): string {
  return sanitizeHtml(value ?? "", {
    allowedTags: ["p", "br", "strong", "b", "em", "i", "u", "ul", "ol", "li", "blockquote", "h2", "h3", "h4", "a", "img", "table", "thead", "tbody", "tr", "th", "td", "hr", "span", "div"],
    allowedAttributes: { a: ["href", "title", "target", "rel"], img: ["src", "alt", "width", "height"], "*": ["class"] },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    transformTags: {
      a: (tagName, attribs) => ({ tagName, attribs: { ...attribs, target: "_blank", rel: "noopener noreferrer" } }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: resolveLegacyAsset(attribs.src, "uploads") } }),
    },
  });
}

export function formatThaiDate(value: string | Date): string {
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(value));
}
