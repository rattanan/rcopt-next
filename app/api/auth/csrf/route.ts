import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
export async function GET() { const token = randomBytes(32).toString("base64url"); const response = NextResponse.json({ token }, { headers: { "Cache-Control": "no-store" } }); response.cookies.set("rcopt_member_login_csrf", token, { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 }); return response; }
