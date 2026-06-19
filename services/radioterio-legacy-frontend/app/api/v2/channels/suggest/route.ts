import { NextRequest } from "next/server";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export async function GET(request: NextRequest) {
  const url = new URL("/api/v2/channels/suggest", LEGACY_API_BASE_URL);
  const query = request.nextUrl.searchParams.get("query");

  if (query) {
    url.searchParams.set("query", query);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  return new Response(response.body, {
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
    status: response.status,
    statusText: response.statusText,
  });
}
