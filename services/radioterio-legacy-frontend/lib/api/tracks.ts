import { apiGet, apiPost } from "./client";
import type {
  EmptyResponse,
  LegacyId,
  Stream,
  Track,
  TrackListResponse,
  TrackMetadataPatch,
  UploadTrackResponse,
} from "./types";

export type TrackLibraryParams = {
  filter?: string;
  limit?: number;
  offset?: number;
  order?: number;
  row?: number;
  unused?: boolean;
};

export function library(offset?: number, limit?: number) {
  return apiGet<TrackListResponse>("/api/v3/tracks/library", {
    offset,
    limit,
  });
}

export function channel(
  stream: Pick<Stream, "sid">,
  offset?: number,
  limit?: number,
) {
  return apiGet<TrackListResponse>("/api/v3/tracks/channel", {
    stream_id: stream.sid,
    offset,
    limit,
  });
}

export function getAllTracks(params: TrackLibraryParams = {}) {
  return apiGet<Track[]>("/radio-manager/api/v0/tracks/", params);
}

export function getByStreamID(
  streamID: LegacyId,
  offset?: number,
  filter?: string,
  colorID: LegacyId | "" = "",
) {
  return apiGet<Track[]>(`/radio-manager/api/v0/streams/${streamID}/tracks/`, {
    color_id: colorID,
    offset,
    filter,
  });
}

export function getTrackDetails(trackID: LegacyId) {
  return apiGet<Track>("/api/v2/tracks/getTrackDetails", {
    track_id: trackID,
  });
}

export function updateTrackInfo(track: TrackMetadataPatch) {
  return apiPost<EmptyResponse>("/api/v2/track/edit", {
    track_id: track.tid,
    artist: track.artist,
    title: track.title,
    album: track.album,
    track_number: track.track_number,
    genre: track.genre,
    date: track.date,
    color_id: track.color,
  });
}

export function updateColor(tracks: LegacyId[], colorID: LegacyId) {
  return apiPost<EmptyResponse>("/api/v2/track/changeColor", {
    track_id: tracks,
    color_id: colorID,
  });
}

export function deleteTracks(trackIDs: LegacyId[]) {
  return apiPost<EmptyResponse>("/api/v2/track/delete", {
    track_id: trackIDs,
  });
}

export function copyTrack(
  trackID: LegacyId,
  destinationStream: LegacyId,
  upNext: boolean,
) {
  return apiPost<EmptyResponse>("/api/v2/track/copy", {
    track_id: trackID,
    stream_id: destinationStream,
    up_next: upNext,
  });
}

export function upload(data: FormData) {
  return apiPost<UploadTrackResponse>("/api/v2/track/upload", data);
}
