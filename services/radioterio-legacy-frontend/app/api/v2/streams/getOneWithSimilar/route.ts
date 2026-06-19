import { NextRequest } from "next/server";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export async function GET(request: NextRequest) {
  const url = new URL("/api/v2/streams/getOneWithSimilar", LEGACY_API_BASE_URL);
  const streamId = request.nextUrl.searchParams.get("stream_id");

  if (streamId) {
    url.searchParams.set("stream_id", streamId);
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
