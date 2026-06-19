"use client";

import { useState } from "react";
import { startStream, stopStream } from "@/lib/api/stream-control";

export function PlayerToggle({ streamSid }: { streamSid: number }) {
  // Player state is owned by the global store in a later iteration.
  // For now, expose a passive button that toggles a local visual state
  // and triggers the legacy control endpoint.
  const [playing, setPlaying] = useState(false);

  async function toggle() {
    const next = !playing;
    setPlaying(next);
    try {
      if (next) {
        await startStream({ sid: streamSid });
      } else {
        await stopStream({ sid: streamSid });
      }
    } catch {
      setPlaying(!next);
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
