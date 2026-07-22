import { NextResponse } from "next/server";
import { pingDatabase } from "../../../../lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const result = await pingDatabase();
    return NextResponse.json({ ok: true, database: result });
  } catch {
    return NextResponse.json({ ok: false, database: { status: "unavailable" } }, { status: 503 });
  }
}
