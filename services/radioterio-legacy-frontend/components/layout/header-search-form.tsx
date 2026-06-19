"use client";

import Link from "next/link";
import {
  FormEvent,
  KeyboardEvent,
  MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const rootRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [focused, setFocused] = useState(false);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const trimmedFilter = filter.trim();
  const showHint = focused && filter.length > 0;
  const resultCount = 1 + streams.length;

  useEffect(() => {
    function handleDocumentMouseDown(event: globalThis.MouseEvent) {
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
      .then((nextStreams) => {
        setStreams(nextStreams);
        setSelectedIndex(0);
      })
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

    window.location.assign(`/search/${encodeURIComponent(trimmedFilter)}`);
    setFilter("");
    setStreams([]);
    setSelectedIndex(0);
    setFocused(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    goSearch();
  }

  function handleStreamClick() {
    setFilter("");
    setStreams([]);
    setSelectedIndex(0);
    setFocused(false);
  }

  function handleFilterChange(value: string) {
    setFilter(value);

    if (value.length === 0) {
      setStreams([]);
    }

    setSelectedIndex(0);
  }

  function goSelected() {
    if (selectedIndex === 0) {
      goSearch();
      return;
    }

    const stream = streams[selectedIndex - 1];

    if (!stream) {
      return;
    }

    window.location.assign(channelHref(stream));
    setFilter("");
    setStreams([]);
    setSelectedIndex(0);
    setFocused(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && trimmedFilter.length > 0) {
      event.preventDefault();
      event.stopPropagation();

      if (showHint) {
        goSelected();
      } else {
        goSearch();
      }

      return;
    }

    if (!showHint) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((index) => Math.min(index + 1, resultCount - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      setSelectedIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Escape") {
      setFocused(false);
    }
  }

  function handleItemMouseOver(
    event: ReactMouseEvent<HTMLLIElement>,
    index: number,
  ) {
    if (event.currentTarget.contains(event.target as Node)) {
      setSelectedIndex(index);
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
          onKeyDown={handleKeyDown}
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
            <li
              className={`head ${selectedIndex === 0 ? "selected" : ""}`}
              onClick={goSearch}
              onMouseOver={(event) => handleItemMouseOver(event, 0)}
            >
              <Link href={`/search/${encodeURIComponent(trimmedFilter)}`}>
                Search for &quot;{filter}&quot;
              </Link>
            </li>
            {streams.map((stream, index) => (
              <li
                key={stream.sid}
                className={selectedIndex === index + 1 ? "selected" : ""}
                onClick={handleStreamClick}
                onMouseOver={(event) => handleItemMouseOver(event, index + 1)}
              >
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
