import Link from "next/link";
import { BookmarkToggle } from "@/components/stream/bookmark-toggle";
import { ChannelTools } from "@/components/stream/channel-tools";
import { PlayerToggle } from "@/components/stream/player-toggle";
import { SimilarStreams } from "@/components/stream/similar-streams";
import { TagList } from "@/components/stream/tag-list";
import { TimelineWidget } from "@/components/stream/timeline-widget";
import { apiGet } from "@/lib/api/client";
import { getChannelSchedule } from "@/lib/api/schedule";
import type {
  AccountSession,
  AudioFormatGroups,
  ChannelDetailResponse,
  ChannelListResponse,
  ScheduleResponse,
  Stream,
} from "@/lib/api/types";
import { nl2br } from "@/lib/utils/nl2br";
import { formatNumber } from "@/lib/utils/legacy-format";

const DEFAULT_FORMATS: AudioFormatGroups = { aac: [], mp3: [] };

type RouteParams = {
  id: string;
};

type StreamPageProps = {
  params: Promise<RouteParams>;
};

function channelArtworkUrl(cover: string, size: number) {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";
  const path = `/content/streamcovers/${cover}?size=${size}`;
  return new URL(path, base).toString();
}

function userProfileLink(user: { permalink?: string | null; uid: number }) {
  return `/user/${user.permalink || user.uid}`;
}

function userProfileName(user: { name?: string | null; login: string }) {
  return user.name || user.login;
}

function trackCaption(track: {
  artist?: string | null;
  title?: string | null;
  caption?: string;
}) {
  if (track.caption) {
    return track.caption;
  }
  if (track.artist) {
    return `${track.artist} - ${track.title ?? ""}`;
  }
  return track.title ?? "";
}

function parseStreamId(id: string): number | string {
  if (/^\d+$/.test(id)) {
    return Number(id);
  }
  return id;
}

async function loadStream(id: number | string) {
  return apiGet<ChannelDetailResponse>("/api/v2/channels/one", {
    stream_id: id,
  });
}

async function loadSimilar(id: number | string): Promise<Stream[]> {
  try {
    const data = await apiGet<ChannelListResponse>("/api/v2/channels/similar", {
      stream_id: id,
    });
    return data.channels.items;
  } catch {
    return [];
  }
}

async function loadSchedule(
  channel: { sid: number },
): Promise<ScheduleResponse | null> {
  try {
    return await getChannelSchedule(channel.sid);
  } catch {
    return null;
  }
}

async function loadAccount(): Promise<AccountSession | null> {
  try {
    return await apiGet<AccountSession>("/api/v2/self");
  } catch {
    return null;
  }
}

export default async function StreamPage({ params }: StreamPageProps) {
  const { id } = await params;
  const streamId = parseStreamId(decodeURIComponent(id));

  const [detail, account] = await Promise.all([
    loadStream(streamId),
    loadAccount(),
  ]);

  if (!detail || !detail.channel || !detail.owner) {
    return (
      <div className="fixed-width">
        <div id="page-contents">
          <div className="page-sub-title">Stream not found.</div>
        </div>
      </div>
    );
  }

  const channel = detail.channel;
  const owner = detail.owner;
  const isOwner = Boolean(
    account?.user && owner && account.user.uid === owner.uid,
  );
  const channelKey = String(channel.permalink || channel.sid);
  const [similarItems, schedule] = await Promise.all([
    loadSimilar(streamId),
    loadSchedule({ sid: channel.sid }),
  ]);
  const formats: AudioFormatGroups = DEFAULT_FORMATS;
  const currentTrack = schedule?.tracks[schedule.current];
  const initialTrackTitle = currentTrack ? trackCaption(currentTrack) : "";

  return (
    <>
      <div
        className="stream-info"
        style={
          channel.cover_background
            ? { backgroundColor: channel.cover_background }
            : undefined
        }
      >
        {channel.cover ? (
          <div className="bg-gradient">
            <div
              className="bg-image"
              style={{
                backgroundImage: `url(${channelArtworkUrl(channel.cover, 800)})`,
              }}
            />
          </div>
        ) : null}
        <div className="fixed-width">
          <div id="controls">
            <div className="cover dark">
              {channel.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Legacy cover images come from the backend CDN.
                <img alt="" src={channelArtworkUrl(channel.cover, 192)} />
              ) : null}
            </div>
            <div className="about">
              <ChannelTools
                isOwner={isOwner}
                streamSid={channel.sid}
                channelKey={channelKey}
                formats={formats}
                currentFormat={null}
              />
              <div className="name">{channel.name.toUpperCase()}</div>
              <div className="owner">
                <i className="icon-user right-padded" />
                <Link href={userProfileLink(owner)}>
                  {userProfileName(owner)}
                </Link>
              </div>
              <div className="stats">
                <span title={`Played ${formatNumber(channel.playbacks)} times`}>
                  <i className="icon-hearing" />
                  <span>{formatNumber(channel.playbacks)}</span>
                </span>
                <span title={`Bookmarked ${formatNumber(channel.bookmarks_count)} times`}>
                  <BookmarkToggle
                    streamSid={channel.sid}
                    initialBookmarked={Boolean(channel.bookmarked)}
                    initialCount={channel.bookmarks_count}
                  />
                </span>
              </div>
              <PlayerToggle
                initialTrackTitle={initialTrackTitle}
                streamSid={channel.sid}
              />
            </div>
          </div>
        </div>
      </div>
      {channel.cover_background ? (
        <style>{`.timeline-track { background-color: ${channel.cover_background} !important; }`}</style>
      ) : null}
      <div className="fixed-width">
        <div className="container-padding">
          {schedule ? (
            <TimelineWidget
              initialSchedule={schedule}
              streamSid={channel.sid}
            />
          ) : null}
          <div className="hashtag-wrapper clearFix">
            <TagList tags={channel.hashtags} />
          </div>
          {channel.info ? (
            <div className="info">{nl2br(channel.info)}</div>
          ) : null}
        </div>
      </div>
      <div className="fixed-width">
        <SimilarStreams streams={similarItems} />
      </div>
    </>
  );
}
