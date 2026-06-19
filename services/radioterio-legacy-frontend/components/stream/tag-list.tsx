import Link from "next/link";

type TagListProps = {
  tags: string | null | undefined;
  variant?: "hero" | "similar";
};

export function TagList({ tags, variant = "hero" }: TagListProps) {
  if (!tags) {
    return null;
  }
  const items = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
  if (items.length === 0) {
    return null;
  }
  // Legacy markup: the hero variant uses `<div class="taglist-wrapper left">`
  // (single-stream.html line 119) and the similar-streams variant uses a bare
  // `<div class="taglist-wrapper">` (line 143). Match that exactly so global
  // `.taglist-wrapper` styles apply without over-specifying layout.
  const wrapperClass = variant === "hero" ? "taglist-wrapper left" : "taglist-wrapper";
  return (
    <div className={wrapperClass}>
      <ul className="taglist">
        {items.map((tag) => (
          <li key={tag}>
            <Link href={`/tag/${encodeURIComponent(tag)}`}>{tag}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
