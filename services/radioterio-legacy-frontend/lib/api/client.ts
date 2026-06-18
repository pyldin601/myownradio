import type { LegacyApiEnvelope } from "./types";

export type ApiQueryValue =
  | boolean
  | number
  | string
  | null
  | undefined
  | Array<boolean | number | string>;

export type ApiQuery = Record<string, ApiQueryValue>;

export type ApiRequestOptions = {
  body?: unknown;
  headers?: HeadersInit;
  method?: "DELETE" | "GET" | "POST" | "PUT";
  query?: ApiQuery;
  signal?: AbortSignal;
};

export class LegacyApiError extends Error {
  readonly response?: Response;

  constructor(message: string, response?: Response) {
    super(message);
    this.name = "LegacyApiError";
    this.response = response;
  }
}

const DEFAULT_API_BASE_URL = "";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

function makeUrl(path: string, query?: ApiQuery) {
  const base =
    apiBaseUrl.length > 0
      ? apiBaseUrl
      : typeof window === "undefined"
        ? "http://localhost"
        : window.location.origin;
  const url = new URL(path, base);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === null || typeof value === "undefined") {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          url.searchParams.append(key, String(item));
        }
      } else {
        url.searchParams.set(key, String(value));
      }
    }
  }

  if (apiBaseUrl.length === 0) {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}

async function parseLegacyResponse<T>(response: Response): Promise<T> {
  const envelope = (await response.json()) as LegacyApiEnvelope<T>;

  if (!response.ok) {
    throw new LegacyApiError(
      "message" in envelope && envelope.message
        ? envelope.message
        : response.statusText,
      response,
    );
  }

  if (envelope.code !== 1) {
    throw new LegacyApiError(envelope.message, response);
  }

  return envelope.data;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const method = options.method ?? (options.body ? "POST" : "GET");
  const headers = new Headers(options.headers);

  let body: BodyInit | undefined;

  if (options.body instanceof FormData) {
    body = options.body;
  } else if (typeof options.body !== "undefined") {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const response = await fetch(makeUrl(path, options.query), {
    body,
    credentials: "include",
    headers,
    method,
    signal: options.signal,
  });

  return parseLegacyResponse<T>(response);
}

export function apiGet<T>(
  path: string,
  query?: ApiQuery,
  signal?: AbortSignal,
) {
  return apiRequest<T>(path, { method: "GET", query, signal });
}

export function apiPost<T>(path: string, body?: unknown, signal?: AbortSignal) {
  return apiRequest<T>(path, { body, method: "POST", signal });
}

export function apiPut<T>(
  path: string,
  query?: ApiQuery,
  body?: unknown,
  signal?: AbortSignal,
) {
  return apiRequest<T>(path, { body, method: "PUT", query, signal });
}

export function apiDelete<T>(
  path: string,
  query?: ApiQuery,
  signal?: AbortSignal,
) {
  return apiRequest<T>(path, { method: "DELETE", query, signal });
}
