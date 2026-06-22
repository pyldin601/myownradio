import type {
  ChannelNowPlaying,
  LegacyApiEnvelope,
  LegacyId,
  NowPlaying,
  ScheduleResponse,
} from "./types";
import { apiGet } from "./client";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

export async function whatsOnChannels(channelIDs: LegacyId[]) {
  if (typeof window === "undefined") {
    return apiGet<Record<string, ChannelNowPlaying>>(
      "/api/v2/schedule/onSelectedChannels",
      { stream_ids: channelIDs },
    );
  }

  const query = new URLSearchParams({
    stream_ids: channelIDs.map(String).join(","),
  });

  const response = await fetch(`/api/v2/schedule/onSelectedChannels?${query}`, {
    credentials: "same-origin",
    headers: { Accept: "application/json" },
  });
  const envelope = (await response.json()) as LegacyApiEnvelope<
    Record<string, ChannelNowPlaying>
  >;

  if (!response.ok || envelope.code !== 1) {
    throw new Error(
      envelope.message || response.statusText || "Schedule request failed",
    );
  }

  return envelope.data;
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
