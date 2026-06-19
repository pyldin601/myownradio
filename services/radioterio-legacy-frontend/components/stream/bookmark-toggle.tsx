"use client";

import { useState } from "react";
import { addBookmark, removeBookmark } from "@/lib/api/bookmarks";

export function BookmarkToggle({
  streamSid,
  initialBookmarked,
  initialCount,
}: {
  streamSid: number;
  initialBookmarked: boolean;
  initialCount: number;
}) {
  const [bookmarked, setBookmarked] = useState(Boolean(initialBookmarked));
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  async function toggle() {
    if (pending) {
      return;
    }
    setPending(true);
    const next = !bookmarked;
    setBookmarked(next);
    setCount((current) => current + (next ? 1 : -1));
    try {
      if (next) {
        await addBookmark({ sid: streamSid });
      } else {
        await removeBookmark({ sid: streamSid });
      }
    } catch {
      setBookmarked(!next);
      setCount((current) => current + (next ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <span>
      <i
        className={`icon-heart hoverable${bookmarked ? "" : "-o"}`}
        onClick={toggle}
        role="button"
        aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
      />
      <span>{count}</span>
    </span>
  );
}
