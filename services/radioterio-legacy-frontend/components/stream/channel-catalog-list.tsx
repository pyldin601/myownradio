"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { whatsOnChannels } from "@/lib/api/schedule";
import type { ChannelNowPlaying, Stream } from "@/lib/api/types";

type ChannelCatalogListProps = {
  channels: Stream[];
  legacyApiBaseUrl: string;
};

type VisibleChannelItemProps = {
  children: React.ReactNode;
  onVisibilityChange: (sid: number, visible: boolean) => void;
  sid: number;
};

function channelHref(stream: Stream) {
  return `/streams/${encodeURIComponent(String(stream.permalink || stream.sid))}`;
}

function channelArtworkUrl(baseUrl: string, cover: string, size: number) {
  const path = `/content/streamcovers/${cover}?size=${size}`;

  return new URL(path, baseUrl).toString();
}

function nowPlayingTitle(item: ChannelNowPlaying) {
  if (item.artist) {
    return `${item.artist} - ${item.title ?? ""}`;
  }

  return item.title ?? "";
}

export function VisibleChannelItem({
  children,
  onVisibilityChange,
  sid,
}: VisibleChannelItemProps) {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      onVisibilityChange(sid, Boolean(entry?.isIntersecting));
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
      onVisibilityChange(sid, false);
    };
  }, [onVisibilityChange, sid]);

  return (
    <li data-sid={sid} ref={ref}>
      {children}
    </li>
  );
}

export function ChannelCatalogList({
  channels,
  legacyApiBaseUrl,
}: ChannelCatalogListProps) {
  const [items, setItems] = useState(channels);
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
          currentItems.map((channel) => {
            const nowPlaying = data[String(channel.sid)];

            if (!nowPlaying) {
              return { ...channel, now_playing: "" };
            }

            return {
              ...channel,
              bookmarks_count: nowPlaying.bookmarks_count,
              listeners_count: nowPlaying.listeners_count,
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

  return (
    <ul className="new-stream-catalog">
      {items.map((channel) => (
        <VisibleChannelItem
          key={channel.sid}
          onVisibilityChange={updateVisibleId}
          sid={channel.sid}
        >
          <div className="cover-section">
            <div className="cover">
              {channel.cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- Legacy catalog uses backend cover images directly.
                <img
                  alt=""
                  src={channelArtworkUrl(legacyApiBaseUrl, channel.cover, 200)}
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
                <span>{channel.listeners_count}</span>
              </span>
              <span>
                <i className="icon-heart hoverable" />
                <span>{channel.bookmarks_count}</span>
              </span>
            </div>
          </div>
        </VisibleChannelItem>
      ))}
    </ul>
  );
}
