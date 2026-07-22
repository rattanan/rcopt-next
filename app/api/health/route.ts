import { NextResponse } from "next/server";

export const runtime = "nodejs";

export function GET() {
  return NextResponse.json({ ok: true, service: "rcopt-web", timestamp: new Date().toISOString() });
}
