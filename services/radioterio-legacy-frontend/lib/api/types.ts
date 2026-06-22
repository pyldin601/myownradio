export type LegacyId = number | string;

export type LegacyNullable<T> = T | null;

export type LegacyRecord = Record<string, unknown>;

export type LegacyApiSuccess<T> = {
  code: 1;
  data: T;
  message?: string;
};

export type LegacyApiFailure = {
  code: 0;
  data?: unknown;
  message: string;
};

export type LegacyApiEnvelope<T> = LegacyApiSuccess<T> | LegacyApiFailure;

export type LegacyList<T> = {
  items: T[];
  total?: number;
  count?: number;
  offset?: number;
  limit?: number;
};

export type Country = {
  country_id: number;
  country_name: string;
};

export type Category = {
  category_id: number;
  category_name: string;
  category_permalink: string;
  streams_count: number;
};

export type AccessOption = {
  access: number | string;
  description: string;
};

export type TrackColorGroup = {
  color_id: number;
  color_name: string;
  color_code?: string | null;
};

export type AudioFormatOption = {
  key: string;
  bitrate: string | number;
};

export type AudioFormatGroups = {
  aac: AudioFormatOption[];
  mp3: AudioFormatOption[];
};

export type AppCollection = {
  access: AccessOption[];
  categories: Category[];
  countries: Country[];
  formats: AudioFormatGroups;
  genres: string[];
  groups: TrackColorGroup[];
};

export type PlanData = {
  plan_name: string;
  streams_max?: number | null;
  time_max: number;
};

export type User = {
  uid: number;
  id?: number;
  login: string;
  email?: string;
  name?: string | null;
  info?: string | null;
  permalink?: string | null;
  country_id: number | null;
  tracks_count: number;
  streams_count: number;
  tracks_duration: number;
  plan_data: PlanData;
  plan_expires?: number | null;
};

export type Stream = {
  sid: number;
  uid: number;
  name: string;
  info?: string | null;
  permalink?: string | null;
  hashtags?: string | null;
  category?: number | string | null;
  access?: number | string | null;
  status: number;
  url?: string | null;
  cover?: string | null;
  cover_background?: string | null;
  now_playing?: string | null;
  listeners_count: number;
  playbacks: number;
  bookmarks_count: number;
  bookmarked?: boolean;
  tracks_count?: number;
  tracks_duration?: number;
};

export type Track = {
  tid: number;
  unique_id?: LegacyId;
  filename?: string;
  artist?: string | null;
  title: string;
  album?: string | null;
  track_number?: string | number | null;
  genre?: string | null;
  date?: string | number | null;
  buy?: string | null;
  duration: number;
  color?: number | string | null;
  color_id?: number | string | null;
  can_be_shared?: boolean | number;
  is_new?: boolean;
};

export type TrackMetadataPatch = {
  tid: number;
  artist?: string | null;
  title?: string | null;
  album?: string | null;
  track_number?: string | number | null;
  genre?: string | null;
  date?: string | number | null;
  color?: number | string | null;
};

export type NowPlaying = {
  tid?: number;
  unique_id?: LegacyId;
  title?: string | null;
  artist?: string | null;
  genre?: string | null;
  duration?: number;
  started_at?: number | string;
  stream_id?: number;
};

export type ScheduleItem = {
  tid?: number;
  unique_id?: LegacyId;
  title?: string | null;
  artist?: string | null;
  duration: number;
  starts_at?: number | string;
  ends_at?: number | string;
  color?: number | string | null;
};

export type ChannelNowPlaying = ScheduleItem & {
  listeners_count: number;
  bookmarks_count: number;
};

export type ScheduleTrack = {
  tid?: number;
  unique_id?: LegacyId;
  title?: string | null;
  artist?: string | null;
  duration: number;
  time_offset: number;
  caption?: string;
};

export type ScheduleResponse = {
  time: number;
  position: number;
  range: number;
  current: number;
  tracks: ScheduleTrack[];
  listeners_count?: number;
  bookmarks_count?: number;
};

export type AccountSession = {
  user: User;
  streams: Stream[];
  client_id: string;
};
