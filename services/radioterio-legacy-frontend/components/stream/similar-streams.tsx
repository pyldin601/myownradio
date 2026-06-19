import Link from "next/link";
import { TagList } from "./tag-list";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

function channelArtworkUrl(cover: string | null | undefined, size: number) {
  const path = `/content/streamcovers/${cover}?size=${size}`;
  return new URL(path, LEGACY_API_BASE_URL).toString();
}

function channelHref(stream: { permalink?: string | null; sid: number }) {
  return `/streams/${encodeURIComponent(String(stream.permalink || stream.sid))}`;
}

export function SimilarStreams({
  streams,
}: {
  streams: { sid: number; name: string; now_playing?: string | null; cover?: string | null; hashtags?: string | null; permalink?: string | null }[];
}) {
  if (streams.length === 0) {
    return null;
  }
  return (
    <div className="similar-streams-wrapper">
      <div className="title">Similar radio stations</div>
      <ul className="similar-streams">
        {streams.map((stream) => (
          <li key={stream.sid}>
            <div className="cover">
              {stream.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Legacy cover images come from the backend CDN.
                <img alt="" src={channelArtworkUrl(stream.cover, 64)} />
              ) : null}
            </div>
            <div className="info">
              <div className="title">
                <Link href={channelHref(stream)}>{stream.name.toUpperCase()}</Link>
              </div>
              {stream.now_playing ? (
                <div className="now-playing">
                  <i className="icon-music" />
                  {stream.now_playing}
                </div>
              ) : null}
              {stream.hashtags ? <TagList tags={stream.hashtags} variant="similar" /> : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
