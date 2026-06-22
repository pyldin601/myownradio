"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getChannelSchedule } from "@/lib/api/schedule";
import type { ScheduleResponse, ScheduleTrack } from "@/lib/api/types";

// `Defaults::TIMELINE_WIDTH` in the PHP backend is 3_600_000 ms (1 hour total,
// ±30 minutes from the current playhead). `TIMELINE_RESOLUTION` in the
// AngularJS frontend is 1_800_000 ms (30 minutes). The legacy AngularJS code
// uses `TIMELINE_RESOLUTION` for both the layout (`rate = width / resolution`)
// and the canvas grid (`n` iterates `-cut` to `resolution`). Keep both
// constants here so the client renders identically.
const TIMELINE_RESOLUTION = 1_800_000;
const HALF_RESOLUTION = TIMELINE_RESOLUTION >> 1;

type TimelineWidgetProps = {
  initialSchedule: ScheduleResponse;
  streamSid: number;
};

function trackCaption(track: ScheduleTrack) {
  if (track.artist) {
    return `${track.artist} - ${track.title ?? ""}`;
  }
  return track.title ?? "";
}

function classifyTrack(
  track: ScheduleTrack,
  position: number,
): "outside" | "first" | "last" | "firstLast" | "full" | "inside" {
  const leftRange = position - HALF_RESOLUTION;
  const rightRange = position + HALF_RESOLUTION;
  const start = track.time_offset;
  const end = track.time_offset + track.duration;

  if (end < leftRange || start > rightRange) {
    return "outside";
  }
  if (start < leftRange && end > rightRange) {
    return "full";
  }
  if (start <= leftRange && end > leftRange && end <= rightRange) {
    return "first";
  }
  if (start >= leftRange && end <= rightRange) {
    return "inside";
  }
  if (start >= leftRange && start < rightRange && end > rightRange) {
    return "last";
  }
  if (start <= leftRange && end > rightRange) {
    return "firstLast";
  }
  return "outside";
}

function trackLayout(
  track: ScheduleTrack,
  position: number,
  containerWidth: number,
  rate: number,
  isFirst: boolean,
): { width: number; marginLeft?: number; hidden?: boolean } {
  const leftRange = position - HALF_RESOLUTION;
  const rightRange = position + HALF_RESOLUTION;
  const marginSize = HALF_RESOLUTION - position;
  const kind = classifyTrack(track, position);

  if (kind === "outside") {
    return { width: 0, hidden: true };
  }
  if (kind === "full") {
    return { width: containerWidth };
  }
  if (kind === "first") {
    const width = Math.max(0, track.duration - (leftRange - track.time_offset));
    return { width: width * rate };
  }
  if (kind === "last") {
    const end = track.time_offset + track.duration;
    const width = Math.min(track.duration - (end - rightRange), track.duration);
    return { width: width * rate };
  }
  if (kind === "inside") {
    if (isFirst) {
      return {
        width: track.duration * rate,
        marginLeft: Math.max(0, marginSize * rate),
      };
    }
    return { width: track.duration * rate };
  }
  // `firstLast` mirrors the legacy `first && last` branch.
  const width = Math.min(containerWidth / rate, track.duration);
  return {
    width: width * rate,
    marginLeft: Math.max(0, marginSize * rate),
  };
}

function drawGrid(
  canvas: HTMLCanvasElement,
  schedule: ScheduleResponse,
  cssWidth: number,
  cssHeight: number,
) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(cssWidth * dpr);
  canvas.height = Math.floor(cssHeight * dpr);
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  const resolution = cssWidth / TIMELINE_RESOLUTION;
  const leftEdgeTime = schedule.time - HALF_RESOLUTION;
  const cut = leftEdgeTime % 60_000;

  context.font = "10px sans-serif";
  // Legacy drawGrid used `context.translate(0.5, 0.5)` to align strokes to
  // device pixels; under DPR scaling that offsets by 0.5 CSS px. Keep the
  // 0.5 px translate to match the legacy tick geometry exactly.
  context.translate(0.5, 0.5);
  context.clearRect(0, 0, cssWidth, cssHeight);
  context.globalAlpha = 1;
  context.strokeStyle = "#000000";
  context.beginPath();

  for (let n = -cut; n < TIMELINE_RESOLUTION; n += 30_000) {
    const thisDate = new Date(leftEdgeTime + n);
    const fix = parseInt(String(n * resolution), 10);
    context.moveTo(fix, 0);

    if (thisDate.getMinutes() % 5 === 0 && thisDate.getSeconds() === 0) {
      context.lineTo(fix, 6);
      const time = thisDate
        .toTimeString()
        .replace(/.*(\d{2}:\d{2}):\d{2}.*/, "$1");
      context.fillText(time, fix - 12, 16);
    } else if (thisDate.getSeconds() === 0) {
      context.lineTo(fix, 4);
    } else {
      context.lineTo(fix, 2);
    }
  }
  context.stroke();

  // Red playhead triangle at the canvas midpoint, mirroring legacy code.
  context.globalAlpha = 0.5;
  context.fillStyle = "#FF0000";
  context.beginPath();
  context.moveTo(cssWidth / 2, 0);
  context.lineTo(cssWidth / 2 + 5, 10);
  context.lineTo(cssWidth / 2 - 5, 10);
  context.lineTo(cssWidth / 2, 0);
  context.fill();
}

export function TimelineWidget({
  initialSchedule,
  streamSid,
}: TimelineWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // Hydrate with the SSR container width when available so the first client
  // render can already size the canvas. The legacy AngularJS code recomputed
  // `rate` after `$scope.init()` measured the container on a $watch tick; the
  // ResizeObserver below keeps that behavior for any subsequent resizes.
  const [containerWidth, setContainerWidth] = useState(0);
  const [schedule, setSchedule] = useState(initialSchedule);

  useEffect(() => {
    let timeoutId: number | undefined;
    let cancelled = false;

    const update = async () => {
      try {
        const nextSchedule = await getChannelSchedule(streamSid);

        if (cancelled) {
          return;
        }

        setSchedule(nextSchedule);

        const currentTrack = nextSchedule.tracks[nextSchedule.current];
        const trackEnd = currentTrack
          ? currentTrack.duration + currentTrack.time_offset - nextSchedule.position
          : 0;
        timeoutId = window.setTimeout(
          update,
          Math.max(1000, Math.min(5000, trackEnd)),
        );
      } catch {
        if (!cancelled) {
          timeoutId = window.setTimeout(update, 5000);
        }
      }
    };

    update();

    return () => {
      cancelled = true;
      if (typeof timeoutId !== "undefined") {
        window.clearTimeout(timeoutId);
      }
    };
  }, [streamSid]);

  // Measure the container on mount and on resize so we can compute
  // `rate = width / resolution` and size the track divs + canvas grid.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }
    const update = () => {
      setContainerWidth(element.clientWidth);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const rate = useMemo(
    () => (containerWidth > 0 ? containerWidth / TIMELINE_RESOLUTION : 0),
    [containerWidth],
  );

  // Redraw the grid whenever the container width, schedule, or playhead
  // position changes. The legacy code also redrew on window resize via
  // `init()`; the ResizeObserver above replaces that hook.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || containerWidth === 0) {
      return;
    }
    drawGrid(canvas, schedule, containerWidth, 24);
  }, [containerWidth, schedule]);

  const tracks = schedule.tracks;
  const currentIndex = schedule.current;

  return (
    <div className="timeline">
      <div className="timeline-container" ref={containerRef}>
        <div className="timeline-wrap">
          {tracks.map((track, index) => {
            const layout = trackLayout(
              track,
              schedule.position,
              containerWidth,
              rate,
              index === 0,
            );
            if (layout.hidden) {
              return null;
            }
            const style: React.CSSProperties = {
              width: `${layout.width}px`,
            };
            if (typeof layout.marginLeft === "number") {
              style.marginLeft = `${layout.marginLeft}px`;
            }
            const isCurrent = currentIndex === index;
            return (
              <div
                key={`${track.unique_id ?? track.tid ?? index}`}
                className={`timeline-track${isCurrent ? " current" : ""}`}
                style={style}
                title={trackCaption(track)}
              >
                <div className="track-title">{trackCaption(track)}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="canvas-wrap">
        <canvas ref={canvasRef} id="grid" />
      </div>
    </div>
  );
}
