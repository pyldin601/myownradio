import { apiPost } from "./client";
import type { EmptyResponse, LegacyId, Stream, Track } from "./types";

export function deleteTracksFromStream(streamID: LegacyId, uniqueIDs: LegacyId[]) {
  return apiPost<EmptyResponse>("/api/v2/stream/removeTracks", {
    stream_id: streamID,
    unique_ids: uniqueIDs,
  });
}

export function addTracksToStream(streamID: LegacyId, trackIDs: LegacyId[]) {
  return apiPost<EmptyResponse>("/api/v2/stream/addTracks", {
    stream_id: streamID,
    tracks: trackIDs,
  });
}

export function shuffle(streamID: LegacyId) {
  return apiPost<EmptyResponse>("/api/v2/control/shuffle", {
    stream_id: streamID,
  });
}

export function moveTrack(streamID: LegacyId, uniqueID: LegacyId, newIndex: number) {
  return apiPost<EmptyResponse>("/api/v2/stream/moveTrack", {
    stream_id: streamID,
    unique_id: uniqueID,
    new_index: newIndex,
  });
}

export function startStream(stream: Pick<Stream, "sid">) {
  return apiPost<EmptyResponse>("/api/v2/control/play", {
    stream_id: stream.sid,
  });
}

export function stopStream(stream: Pick<Stream, "sid">) {
  return apiPost<EmptyResponse>("/api/v2/control/stop", {
    stream_id: stream.sid,
  });
}

export function setCurrentTrack(
  stream: Pick<Stream, "sid">,
  track: Pick<Track, "unique_id">,
) {
  return apiPost<EmptyResponse>("/api/v2/control/setCurrentTrack", {
    stream_id: stream.sid,
    unique_id: track.unique_id,
  });
}
