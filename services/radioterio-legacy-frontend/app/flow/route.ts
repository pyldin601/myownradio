import { NextRequest, NextResponse } from "next/server";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export function GET(request: NextRequest) {
  const url = new URL("/flow", LEGACY_API_BASE_URL);

  for (const [key, value] of request.nextUrl.searchParams) {
    url.searchParams.append(key, value);
  }

  return NextResponse.redirect(url);
}
