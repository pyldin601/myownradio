"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { getSuggestChannels } from "@/lib/api/channels";
import { apiBaseUrl } from "@/lib/api/client";
import type { Stream } from "@/lib/api/types";

function channelHref(stream: Stream) {
  return `/streams/${encodeURIComponent(String(stream.permalink || stream.sid))}`;
}

function channelArtworkUrl(cover: string) {
  const path = `/content/streamcovers/${cover}?size=24`;

  if (apiBaseUrl.length === 0) {
    return path;
  }

  return new URL(path, apiBaseUrl).toString();
}

export function HeaderSearchForm() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [focused, setFocused] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const trimmedFilter = filter.trim();
  const showHint = focused && filter.length > 0;

  useEffect(() => {
    function handleDocumentMouseDown(event: MouseEvent) {
      setFocused(
        !!rootRef.current && rootRef.current.contains(event.target as Node),
      );
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    };
  }, []);

  useEffect(() => {
    if (filter.length === 0) {
      return;
    }

    const controller = new AbortController();

    getSuggestChannels(filter, controller.signal)
      .then(setStreams)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStreams([]);
      });

    return () => {
      controller.abort();
    };
  }, [filter]);

  function goSearch() {
    if (trimmedFilter.length === 0) {
      return;
    }

    router.push(`/search/${encodeURIComponent(trimmedFilter)}`);
    setFilter("");
    setStreams([]);
    setFocused(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goSearch();
  }

  function handleStreamClick() {
    setFilter("");
    setStreams([]);
    setFocused(false);
  }

  function handleFilterChange(value: string) {
    setFilter(value);

    if (value.length === 0) {
      setStreams([]);
    }
  }

  return (
    <div
      id="search"
      ng-controller="SearchFormController"
      className="ng-scope"
      ref={rootRef}
    >
      <form
        name="search"
        action="/search/"
        noValidate
        className={focused ? "focused" : "ng-pristine ng-valid"}
        onSubmit={handleSubmit}
      >
        <input
          className={`transparent ng-pristine ng-untouched ng-valid ${
            filter.length > 0 ? "ng-not-empty" : "ng-empty"
          }`}
          type="text"
          placeholder="Search station by name or genre..."
          name="filter"
          autoComplete="off"
          value={filter}
          onChange={(event) => handleFilterChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onKeyUp={() => setFocused(true)}
          analytics-on="change"
          analytics-event="Search"
          analytics-category="Streams"
          analytics-label={filter}
        />
        <input mor-tooltip="Search" type="submit" value="" />
      </form>
      {showHint ? (
        <div className="search-hint">
          <ul className="items">
            <li className="head" onClick={goSearch}>
              <Link href={`/search/${encodeURIComponent(trimmedFilter)}`}>
                Search for &quot;{filter}&quot;
              </Link>
            </li>
            {streams.map((stream) => (
              <li key={stream.sid} onClick={handleStreamClick}>
                <Link href={channelHref(stream)}>
                  <div className="cover dark">
                    {stream.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- Legacy search hints use plain images from backend stream covers.
                      <img
                        alt=""
                        src={channelArtworkUrl(stream.cover)}
                        width={24}
                        height={24}
                      />
                    ) : null}
                  </div>
                  {stream.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
