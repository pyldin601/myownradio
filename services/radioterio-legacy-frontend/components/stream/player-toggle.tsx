"use client";

import { useEffect, useRef, useState } from "react";

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

export function PlayerToggle({ streamSid }: { streamSid: number }) {
  const [playing, setPlaying] = useState(false);
  const restartTimer = useRef<number | null>(null);

  useEffect(() => {
    const audio = getAudio();

    function handleEnded() {
      if (playingStreamSid !== streamSid) {
        return;
      }
      restartTimer.current = window.setTimeout(() => {
        void audio.play();
      }, 1000);
    }

    function handleError() {
      if (playingStreamSid !== streamSid) {
        return;
      }
      restartTimer.current = window.setTimeout(() => {
        audio.src = streamUrl(streamSid);
        void audio.play();
      }, 1000);
    }

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (restartTimer.current !== null) {
        window.clearTimeout(restartTimer.current);
      }
    };
  }, [streamSid]);

  async function toggle() {
    const audio = getAudio();

    try {
      if (playing && playingStreamSid === streamSid) {
        audio.pause();
        audio.removeAttribute("src");
        audio.load();
        playingStreamSid = null;
        setPlaying(false);
        return;
      }

      audio.pause();
      audio.src = streamUrl(streamSid);
      audio.load();
      playingStreamSid = streamSid;
      setPlaying(true);
      await audio.play();
    } catch {
      if (playingStreamSid === streamSid) {
        playingStreamSid = null;
      }
      setPlaying(false);
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
      </div>
    </div>
  );
}
