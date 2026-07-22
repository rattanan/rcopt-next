import { NextRequest, NextResponse } from "next/server";
import { mapLegacyRoute } from "@/lib/legacy-routes";
import { publicSiteUrl } from "@/lib/site-url";

export function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get("r");
  const id = request.nextUrl.searchParams.get("id");
  const destination = mapLegacyRoute(route, id, request.nextUrl.searchParams.get("view"));
  if (destination) return NextResponse.redirect(new URL(destination, publicSiteUrl(request.nextUrl.origin)), 301);
  return new NextResponse("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
