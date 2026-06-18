import { apiGet } from "./client";
import type { LegacyId, NowPlaying, ScheduleItem, Stream } from "./types";

export function whatsOnChannels(channelIDs: LegacyId[]) {
  return apiGet<Record<string, ScheduleItem[]>>(
    "/api/v2/schedule/onSelectedChannels",
    { stream_ids: channelIDs },
  );
}

export function nowPlaying(channel: Pick<Stream, "sid">) {
  return apiGet<NowPlaying>(
    `/radio-manager/api/pub/v0/streams/${channel.sid}/current-track`,
  );
}
