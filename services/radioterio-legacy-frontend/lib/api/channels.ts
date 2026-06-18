import { apiGet } from "./client";
import type {
  ChannelDetailResponse,
  ChannelListResponse,
  LegacyId,
  Stream,
} from "./types";

export type ChannelListParams = {
  limit?: number;
  offset?: number;
};

export function getSingleChannel(channelKey: LegacyId) {
  return apiGet<ChannelDetailResponse>("/api/v2/channels/one", {
    stream_id: channelKey,
  });
}

export function getAllChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/all", params);
}

export function getNewChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/new", params);
}

export function getCategoryChannels(
  category: LegacyId,
  params: ChannelListParams = {},
) {
  return apiGet<ChannelListResponse>("/api/v2/channels/category", {
    category_name: category,
    ...params,
  });
}

export function getMyChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/my", params);
}

export function getPopularChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/popular", params);
}

export function getSearchChannels(
  query: string,
  params: ChannelListParams = {},
) {
  return apiGet<ChannelListResponse>("/api/v2/channels/search", {
    query,
    ...params,
  });
}

export function getSuggestChannels(query: string) {
  return apiGet<Stream[]>("/api/v2/channels/suggest", { query });
}

export function getTagChannels(tag: string, params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/tag", {
    tag,
    ...params,
  });
}

export function getUserChannels(user: LegacyId, params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/user", {
    key: user,
    ...params,
  });
}

export function getBookmarkedChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/bookmarks", params);
}

export function getSimilarChannels(channel: LegacyId) {
  return apiGet<ChannelListResponse>("/api/v2/channels/similar", {
    stream_id: channel,
  });
}

export function getRecentChannels(params: ChannelListParams = {}) {
  return apiGet<ChannelListResponse>("/api/v2/channels/recent", params);
}
