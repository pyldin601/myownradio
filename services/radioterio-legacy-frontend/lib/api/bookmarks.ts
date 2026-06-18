import { apiDelete, apiPut } from "./client";
import type { EmptyResponse, Stream } from "./types";

export function addBookmark(stream: Pick<Stream, "sid">) {
  return apiPut<EmptyResponse>("/api/v2/bookmark", { stream_id: stream.sid });
}

export function removeBookmark(stream: Pick<Stream, "sid">) {
  return apiDelete<EmptyResponse>("/api/v2/bookmark", {
    stream_id: stream.sid,
  });
}
