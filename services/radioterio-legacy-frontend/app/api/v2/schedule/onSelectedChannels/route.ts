import { NextRequest } from "next/server";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export async function GET(request: NextRequest) {
  const url = new URL("/api/v2/schedule/onSelectedChannels", LEGACY_API_BASE_URL);
  const streamIds = request.nextUrl.searchParams.getAll("stream_ids");

  if (streamIds.length > 0) {
    url.searchParams.set("stream_ids", streamIds.join(","));
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
