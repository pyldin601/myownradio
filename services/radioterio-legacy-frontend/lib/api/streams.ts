import { apiGet, apiPost } from "./client";
import type {
  ChannelDetailWithSimilarResponse,
  EmptyResponse,
  LegacyId,
  NowPlaying,
  Stream,
  StreamMutationRequest,
  StreamsByUserResponse,
} from "./types";

export type StreamListResponse = {
  streams: Stream[];
};

export type StreamListParams = {
  busy?: boolean;
  category?: LegacyId | null;
  filter?: string | null;
  limit?: number;
  offset?: number;
};

export function getByID(streamID: LegacyId) {
  return apiGet<Stream>("/api/v2/streams/getOne", { stream_id: streamID });
}

export function getList(params: StreamListParams = {}) {
  return apiGet<StreamListResponse>("/api/v2/streams/getList", {
    filter: params.filter,
    category: params.category,
    offset: params.offset,
    limit: params.limit,
  });
}

export function getSimilarTo(streamID: LegacyId) {
  return apiGet<Stream[]>("/api/v2/streams/getSimilarTo", {
    stream_id: streamID,
  });
}

export function getByIdWithSimilar(streamID: LegacyId) {
  return apiGet<ChannelDetailWithSimilarResponse>(
    "/api/v2/streams/getOneWithSimilar",
    { stream_id: streamID },
  );
}

export function getByUser(userID: LegacyId, offset?: number) {
  return apiGet<StreamsByUserResponse>("/api/v2/streams/getStreamsByUser", {
    user: userID,
    offset,
  });
}

export function getBySelf() {
  return apiGet<StreamsByUserResponse>("/api/v2/streams/getStreamsByUser");
}

export function getBookmarks(offset?: number) {
  return apiGet<Stream[]>("/api/v2/streams/getBookmarks", { offset });
}

// The legacy `/api/v2/streams/getSchedule` returns a single-channel timeline
// envelope ({ time, position, range, current, tracks }) rather than a flat
// track array. Prefer `getChannelSchedule` from `./schedule` for the timeline
// widget; this shim is retained for callers that still expect the legacy
// shape and is typed loosely on purpose.
export function getSchedule(streamID: LegacyId) {
  return apiGet<unknown>("/api/v2/streams/getSchedule", {
    stream_id: streamID,
  });
}

export function getNowPlaying(streamID: LegacyId) {
  return apiGet<NowPlaying>("/api/v2/streams/getNowPlaying", {
    stream_id: streamID,
  });
}

export function updateStreamInfo(stream: StreamMutationRequest & { sid: number }) {
  return apiPost<EmptyResponse>("/api/v2/stream/modify", {
    stream_id: stream.sid,
    name: stream.name,
    info: stream.info,
    tags: stream.hashtags,
    permalink: stream.permalink,
    category: stream.category,
    access: stream.access,
  });
}

export function createNewStream(stream: StreamMutationRequest) {
  return apiPost<number>("/api/v2/stream/create", {
    name: stream.name,
    info: stream.info,
    tags: stream.hashtags,
    permalink: stream.permalink,
    category: stream.category,
    access: stream.access,
  });
}

export function createNewStreamWithCover(
  stream: StreamMutationRequest,
  cover?: File | null,
) {
  const form = new FormData();

  if (cover) {
    form.append("file", cover);
  }

  form.append("name", stream.name);
  form.append("info", stream.info ?? "");
  form.append("tags", stream.hashtags ?? "");
  form.append("permalink", stream.permalink ?? "");
  form.append("category", String(stream.category ?? ""));
  form.append("access", String(stream.access ?? ""));

  return apiPost<number>("/api/v2/stream/create", form);
}

export function deleteStream(stream: Pick<Stream, "sid">) {
  return apiPost<EmptyResponse>("/api/v2/stream/delete", {
    stream_id: stream.sid,
  });
}

export function changeCover(streamID: LegacyId, file: File) {
  const form = new FormData();
  form.append("file", file);
  form.append("stream_id", String(streamID));

  return apiPost<{ name: string; url: string }>("/api/v2/stream/changeCover", form);
}

export function removeCover(streamID: LegacyId) {
  return apiPost<EmptyResponse>("/api/v2/stream/removeCover", {
    stream_id: streamID,
  });
}
