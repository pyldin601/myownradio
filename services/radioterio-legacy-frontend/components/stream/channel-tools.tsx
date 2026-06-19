"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type AudioFormat = {
  key: string;
  bitrate: string | number;
};

type AudioFormatGroups = {
  aac: AudioFormat[];
  mp3: AudioFormat[];
};

const STORAGE_KEY = "mor.defaults.format";
const STORAGE_EVENT = "mor.defaults.format:changed";

function readDefaultFormat(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeDefaultFormat(value: string) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
    window.dispatchEvent(
      new CustomEvent<string>(STORAGE_EVENT, { detail: value }),
    );
  } catch {
    // Ignore storage failures (private mode, quota).
  }
}

function useDefaultFormat() {
  // Initial value is null to keep SSR markup stable; the stored value is
  // hydrated on first user interaction via the storage event.
  const [format, setFormat] = useState<string | null>(null);

  useEffect(() => {
    function handleEvent(event: Event) {
      const detail = (event as CustomEvent<string>).detail;
      setFormat(detail);
    }

    window.addEventListener(STORAGE_EVENT, handleEvent);
    return () => window.removeEventListener(STORAGE_EVENT, handleEvent);
  }, []);

  return [format, setFormat] as const;
}

export function ChannelTools({
  isOwner,
  streamSid,
  channelKey,
  formats,
}: {
  isOwner: boolean;
  streamSid: number;
  channelKey: string;
  formats: AudioFormatGroups;
  currentFormat: string | null;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeFormat, setActiveFormat] = useDefaultFormat();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Read the stored value once after the settings badge is first opened.
  useEffect(() => {
    if (!settingsOpen || activeFormat) {
      return;
    }
    const stored = readDefaultFormat();
    if (stored) {
      setActiveFormat(stored);
    }
  }, [settingsOpen, activeFormat, setActiveFormat]);

  useEffect(() => {
    if (!settingsOpen) {
      return;
    }
    function handleClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [settingsOpen]);

  const pickFormat = (key: string) => {
    setActiveFormat(key);
    writeDefaultFormat(key);
    setSettingsOpen(false);
  };

  return (
    <div className="tools" ref={containerRef}>
      <ul className="icons">
        {isOwner ? (
          <>
            <li>
              <Link href={`/profile/edit-stream/${streamSid}`} aria-label="Edit station information">
                <i className="icon-mode-edit" />
              </Link>
            </li>
            <li>
              <Link href={`/profile/streams/${streamSid}`} aria-label="Edit station tracklist">
                <i className="icon-toc" />
              </Link>
            </li>
            <li className="vertical-separator" />
          </>
        ) : null}
        <li>
          <i
            className={`icon-settings${settingsOpen ? " shown" : ""}`}
            onClick={() => setSettingsOpen((value) => !value)}
            aria-label="Settings"
            role="button"
          />
          {settingsOpen ? (
            <div className="settings-badge">
              <h3>Audio Format</h3>
              <h4 className="format">aac+</h4>
              <ul className="formats">
                {formats.aac.map((format) => (
                  <li
                    key={format.key}
                    className={activeFormat === format.key ? "current" : undefined}
                    onClick={() => pickFormat(format.key)}
                  >
                    {format.bitrate}
                  </li>
                ))}
              </ul>
              <div style={{ height: "4px" }} />
              <h4 className="format">mp3</h4>
              <ul className="formats">
                {formats.mp3.map((format) => (
                  <li
                    key={format.key}
                    className={activeFormat === format.key ? "current" : undefined}
                    onClick={() => pickFormat(format.key)}
                  >
                    {format.bitrate}
                  </li>
                ))}
              </ul>
              <div style={{ height: "4px" }} />
              <h4 className="format">m3u</h4>
              <ul className="formats">
                <li>
                  <a href={`/content/m3u/${channelKey}.m3u`}>Open in external player</a>
                </li>
              </ul>
            </div>
          ) : null}
        </li>
      </ul>
    </div>
  );
}
