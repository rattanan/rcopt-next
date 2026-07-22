import { NextRequest, NextResponse } from "next/server";
import { createCommunityCaptcha } from "@/lib/community-captcha";
import { clientAddress } from "@/lib/public-request-protection";

export async function GET(request: NextRequest) { const captcha = await createCommunityCaptcha(clientAddress(request.headers)); return NextResponse.json(captcha, { headers: { "Cache-Control": "no-store" } }); }
