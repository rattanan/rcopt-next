import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { connection } from "next/server";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2/promise";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { getAdminSession } from "@/lib/auth/session";
import { isTrustedRequestOrigin } from "@/lib/request-origin";

export const runtime = "nodejs";
const maxSize = 3 * 1024 * 1024;

function validImage(data: Buffer, extension: string) { return (extension === ".jpg" || extension === ".jpeg") ? data.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) : extension === ".png" ? data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) : extension === ".gif" ? ["GIF87a", "GIF89a"].includes(data.subarray(0, 6).toString("ascii")) : extension === ".webp" && data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP"; }

export async function POST(request: Request) {
  if (!isTrustedRequestOrigin(request.headers, [new URL(env.SITE_URL).host])) return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบผู้ดูแล" }, { status: 401 });
  await connection();
  const [admins] = await db.execute<(RowDataPacket & { id: number })[]>("SELECT id FROM tbl_users WHERE id=? AND username=? AND status=1 AND superuser=1 LIMIT 1", [session.userId, session.username]);
  if (!admins[0]) return NextResponse.json({ error: "ไม่มีสิทธิ์อัปโหลดรูป" }, { status: 403 });
  try {
    const formData = await request.formData();
    const image = formData.get("image");
    if (!(image instanceof File) || !env.LEGACY_UPLOAD_PATH || image.size < 1 || image.size > maxSize) return NextResponse.json({ error: "ไฟล์รูปภาพต้องมีขนาดไม่เกิน 3MB" }, { status: 400 });
    const extension = path.extname(image.name).toLowerCase();
    if (!new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]).has(extension) || !image.type.startsWith("image/")) return NextResponse.json({ error: "รองรับเฉพาะ JPG, PNG, GIF และ WebP" }, { status: 400 });
    const data = Buffer.from(await image.arrayBuffer());
    if (!validImage(data, extension)) return NextResponse.json({ error: "ไฟล์รูปภาพไม่ถูกต้อง" }, { status: 400 });
    const filename = `article-inline-${randomUUID()}${extension}`;
    const directory = path.join(env.LEGACY_UPLOAD_PATH, "uploads");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), data, { flag: "wx" });
    return NextResponse.json({ url: `/api/legacy-assets/uploads/${encodeURIComponent(filename)}` });
  } catch { return NextResponse.json({ error: "ไม่สามารถอัปโหลดรูปภาพได้" }, { status: 500 }); }
}
