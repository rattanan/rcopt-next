import path from "node:path";
import { realpath, readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";

const mediaTypes: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp" };

export async function GET(_request: Request, { params }: { params: Promise<{ area: string; path: string[] }> }) {
  const { area, path: segments } = await params;
  if (!env.LEGACY_UPLOAD_PATH || !["uploads", "banner", "member", "banners", "banner2019"].includes(area) || !segments.length) return new NextResponse("Not found", { status: 404 });
  if (segments.some((segment) => !segment || segment === "." || segment === ".." || segment.includes("\\"))) return new NextResponse("Not found", { status: 404 });
  const extension = path.extname(segments.at(-1) ?? "").toLowerCase();
  const contentType = mediaTypes[extension];
  if (!contentType) return new NextResponse("Not found", { status: 404 });

  try {
    const root = await realpath(path.join(env.LEGACY_UPLOAD_PATH, area));
    const target = await realpath(path.join(root, ...segments));
    if (!target.startsWith(`${root}${path.sep}`)) return new NextResponse("Not found", { status: 404 });
    return new NextResponse(await readFile(target), { headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=3600" } });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
