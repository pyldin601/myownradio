import Link from "next/link";
import type { LegacyApiEnvelope, Stream } from "@/lib/api/types";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

type SearchPageProps = {
  params: Promise<{
    query: string;
  }>;
};

function channelHref(stream: Stream) {
  return `/streams/${encodeURIComponent(String(stream.permalink || stream.sid))}`;
}

function channelArtworkUrl(cover: string, size: number) {
  const path = `/content/streamcovers/${cover}?size=${size}`;

  return new URL(path, LEGACY_API_BASE_URL).toString();
}

async function getSearchResults(query: string) {
  const url = new URL("/api/v2/channels/search", LEGACY_API_BASE_URL);
  url.searchParams.set("query", query);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });
  const envelope = (await response.json()) as LegacyApiEnvelope<{
    channels: {
      items: Stream[];
    };
  }>;

  if (!response.ok || envelope.code !== 1) {
    return [];
  }

  return envelope.data.channels.items;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { query: encodedQuery } = await params;
  const query = decodeURIComponent(encodedQuery);
  const channels = await getSearchResults(query);
  const count = channels.length;
  const heading =
    count === 1 ? (
      <>
        <b>1</b> radio station found for request <b>{query}</b>
      </>
    ) : (
      <>
        <b>{count}</b> radio stations found for request <b>{query}</b>
      </>
    );

  return (
    <div className="fixed-width">
      <div id="page-contents">
        <div className="page-sub-title">{heading}</div>
        <div className="new-stream-catalog-badge">
          <ul className="new-stream-catalog">
            {channels.map((channel) => (
              <li key={channel.sid}>
                <div className="cover-section">
                  <div className="cover">
                    {channel.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Legacy catalog uses backend cover images directly.
                      <img
                        alt=""
                        src={channelArtworkUrl(channel.cover, 200)}
                      />
                    ) : null}
                  </div>
                </div>
                <div className="info-section">
                  <div className="now-playing" mor-tooltip={channel.now_playing || ""}>
                    <i className="icon-music" />
                    {channel.now_playing}
                  </div>
                  <div className="stream-name">
                    <Link href={channelHref(channel)}>{channel.name}</Link>
                  </div>
                  <div className="stats">
                    <span>
                      <i className="icon-hearing" />
                      <span>{channel.playbacks}</span>
                    </span>
                    <span>
                      <i className="icon-heart hoverable" />
                      <span>{channel.bookmarks_count}</span>
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {channels.length === 0 ? (
            <div className="no-streams">No streams found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
