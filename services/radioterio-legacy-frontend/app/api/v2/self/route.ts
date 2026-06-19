import { NextRequest } from "next/server";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export async function GET(request: NextRequest) {
  const url = new URL("/api/v2/self", LEGACY_API_BASE_URL);

  const cookie = request.headers.get("cookie");
  const headers = new Headers({
    Accept: "application/json",
  });

  if (cookie) {
    headers.set("cookie", cookie);
  }

  const response = await fetch(url, { headers });

  return new Response(response.body, {
    headers: {
      "Content-Type":
        response.headers.get("Content-Type") || "application/json",
    },
    status: response.status,
    statusText: response.statusText,
  });
}
