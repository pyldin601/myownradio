"use client";

import { useEffect, useRef, useState } from "react";
import { getChannelSchedule } from "@/lib/api/schedule";

const DEFAULT_FORMAT = "mp3_128k";
const STORAGE_KEY = "mor.defaults.format";

let sharedAudio: HTMLAudioElement | null = null;
let playingStreamSid: number | null = null;

function readDefaultFormat() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_FORMAT;
  } catch {
    return DEFAULT_FORMAT;
  }
}

function streamUrl(streamSid: number) {
  const query = new URLSearchParams({
    f: readDefaultFormat(),
    s: String(streamSid),
  });
  return `/flow?${query}`;
}

function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.style.display = "none";
    sharedAudio.preload = "none";
    document.body.appendChild(sharedAudio);
  }
  return sharedAudio;
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

export function PlayerToggle({
  initialTrackTitle = "",
  streamSid,
}: {
  initialTrackTitle?: string;
  streamSid: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [trackTitle, setTrackTitle] = useState(initialTrackTitle);
  const restartTimer = useRef<number | null>(null);
  const titleTimer = useRef<number | null>(null);

  useEffect(() => {
    const audio = getAudio();

    function handleEnded() {
      if (playingStreamSid !== streamSid) {
        return;
      }
      setBuffering(true);
      restartTimer.current = window.setTimeout(() => {
        void audio.play();
      }, 1000);
    }

    function handleError() {
      if (playingStreamSid !== streamSid) {
        return;
      }
      setBuffering(true);
      restartTimer.current = window.setTimeout(() => {
        audio.src = streamUrl(streamSid);
        audio.load();
        void audio.play();
      }, 1000);
    }

    function handleBuffering() {
      if (playingStreamSid === streamSid) {
        setBuffering(true);
      }
    }

    function handlePlaying() {
      if (playingStreamSid === streamSid) {
        setBuffering(false);
      }
    }

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleBuffering);
    audio.addEventListener("stalled", handleBuffering);
    audio.addEventListener("waiting", handleBuffering);
    audio.addEventListener("canplay", handlePlaying);
    audio.addEventListener("playing", handlePlaying);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleBuffering);
      audio.removeEventListener("stalled", handleBuffering);
      audio.removeEventListener("waiting", handleBuffering);
      audio.removeEventListener("canplay", handlePlaying);
      audio.removeEventListener("playing", handlePlaying);
      if (restartTimer.current !== null) {
        window.clearTimeout(restartTimer.current);
      }
      if (titleTimer.current !== null) {
        window.clearTimeout(titleTimer.current);
      }
    };
  }, [streamSid]);

  useEffect(() => {
    if (!playing || playingStreamSid !== streamSid) {
      return;
    }

    let cancelled = false;

    const updateTitle = async () => {
      try {
        const schedule = await getChannelSchedule(streamSid);

        if (cancelled) {
          return;
        }

        const currentTrack = schedule.tracks[schedule.current];
        if (currentTrack) {
          setTrackTitle(trackCaption(currentTrack));
        }

        const trackEnd = currentTrack
          ? currentTrack.duration + currentTrack.time_offset - schedule.position
          : 0;
        titleTimer.current = window.setTimeout(
          updateTitle,
          Math.max(1000, Math.min(5000, trackEnd)),
        );
      } catch {
        if (!cancelled) {
          titleTimer.current = window.setTimeout(updateTitle, 5000);
        }
      }
    };

    updateTitle();

    return () => {
      cancelled = true;
      if (titleTimer.current !== null) {
        window.clearTimeout(titleTimer.current);
      }
    };
  }, [playing, streamSid]);

  async function toggle() {
    const audio = getAudio();

    try {
      if (playing && playingStreamSid === streamSid) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        playingStreamSid = null;
        setPlaying(false);
        setBuffering(false);
        return;
      }

      audio.pause();
      audio.src = streamUrl(streamSid);
      audio.load();
      playingStreamSid = streamSid;
      setPlaying(true);
      setBuffering(true);
      await audio.play();
    } catch {
      if (playingStreamSid === streamSid) {
        playingStreamSid = null;
      }
      setPlaying(false);
      setBuffering(false);
    }
  }

  return (
    <div className="now-playing-frame">
      <div className="player">
        <div
          mor-tooltip={playing ? "Stop" : "Play"}
          className="toggle"
          onClick={toggle}
          role="button"
          aria-label={playing ? "Stop" : "Play"}
        >
          <i className={playing ? "icon-stop" : "icon-play-arrow"} />
        </div>
        {playing ? (
          <div>
            <div className="key overflow-hidden">
              <div className="left">
                {buffering ? "BUFFERING..." : "NOW PLAYING"}
              </div>
            </div>
            <div className="value">{trackTitle.toUpperCase()}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
