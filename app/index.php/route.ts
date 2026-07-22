import { NextRequest, NextResponse } from "next/server";
import { mapLegacyRoute } from "@/lib/legacy-routes";

export function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get("r");
  const id = request.nextUrl.searchParams.get("id");
  const destination = mapLegacyRoute(route, id);
  if (destination) return NextResponse.redirect(new URL(destination, request.url), 301);
  return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
