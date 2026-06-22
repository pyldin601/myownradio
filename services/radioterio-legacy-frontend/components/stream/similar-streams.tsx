"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { whatsOnChannels } from "@/lib/api/schedule";
import type { ChannelNowPlaying } from "@/lib/api/types";
import { VisibleChannelItem } from "./channel-catalog-list";
import { TagList } from "./tag-list";

const LEGACY_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://radioter.io";

type SimilarStream = {
  sid: number;
  name: string;
  now_playing?: string | null;
  cover?: string | null;
  hashtags?: string | null;
  permalink?: string | null;
};

function channelArtworkUrl(cover: string | null | undefined, size: number) {
  const path = `/content/streamcovers/${cover}?size=${size}`;
  return new URL(path, LEGACY_API_BASE_URL).toString();
}

function channelHref(stream: { permalink?: string | null; sid: number }) {
  return `/streams/${encodeURIComponent(String(stream.permalink || stream.sid))}`;
}

function nowPlayingTitle(item: ChannelNowPlaying) {
  if (item.artist) {
    return `${item.artist} - ${item.title ?? ""}`;
  }

  return item.title ?? "";
}

export function SimilarStreams({ streams }: { streams: SimilarStream[] }) {
  const [items, setItems] = useState(streams);
  const visibleIds = useRef(new Set<number>());

  const updateVisibleId = useCallback((sid: number, visible: boolean) => {
    if (visible) {
      visibleIds.current.add(sid);
    } else {
      visibleIds.current.delete(sid);
    }
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    let cancelled = false;
    let timer: number | undefined;

    const refresh = async () => {
      const ids = [...visibleIds.current];

      if (ids.length === 0) {
        timer = window.setTimeout(refresh, 10000);
        return;
      }

      try {
        const data = await whatsOnChannels(ids);

        if (cancelled) {
          return;
        }

        setItems((currentItems) =>
          currentItems.map((stream) => {
            const nowPlaying = data[String(stream.sid)];

            if (!nowPlaying) {
              return { ...stream, now_playing: "" };
            }

            return {
              ...stream,
              now_playing: nowPlayingTitle(nowPlaying),
            };
          }),
        );
      } catch {
        // Match legacy behavior: keep retrying quietly.
      } finally {
        if (!cancelled) {
          timer = window.setTimeout(refresh, 10000);
        }
      }
    };

    timer = window.setTimeout(refresh, 0);

    return () => {
      cancelled = true;
      if (typeof timer !== "undefined") {
        window.clearTimeout(timer);
      }
    };
  }, [items.length]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="similar-streams-wrapper">
      <div className="title">Similar radio stations</div>
      <ul className="similar-streams">
        {items.map((stream) => (
          <VisibleChannelItem
            key={stream.sid}
            onVisibilityChange={updateVisibleId}
            sid={stream.sid}
          >
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
          </VisibleChannelItem>
        ))}
      </ul>
    </div>
  );
}
