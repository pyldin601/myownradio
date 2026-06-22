import type {
  LegacyApiEnvelope,
  LegacyId,
  NowPlaying,
  ScheduleItem,
  ScheduleResponse,
} from "./types";
import { apiGet } from "./client";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export function whatsOnChannels(channelIDs: LegacyId[]) {
  return apiGet<Record<string, ScheduleItem[]>>(
    "/api/v2/schedule/onSelectedChannels",
    { stream_ids: channelIDs },
  );
}

export function nowPlaying(channel: { sid: number }) {
  return apiGet<NowPlaying>(
    `/radio-manager/api/pub/v0/streams/${channel.sid}/current-track`,
  );
}

export async function getChannelSchedule(
  streamId: LegacyId,
): Promise<ScheduleResponse> {
  const query = new URLSearchParams({ stream_id: String(streamId) });
  const url =
    typeof window === "undefined"
      ? new URL(`/api/v2/streams/getSchedule?${query}`, LEGACY_API_BASE_URL)
      : `/api/v2/streams/getSchedule?${query}`;

  const response = await fetch(url, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const envelope = (await response.json()) as LegacyApiEnvelope<ScheduleResponse>;
  if (!response.ok || envelope.code !== 1) {
    throw new Error(
      envelope.message || response.statusText || "Schedule request failed",
    );
  }
  return envelope.data;
}
