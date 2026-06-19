import type { ReactElement } from "react";

export function nl2br(text: string | null | undefined): ReactElement[] | null {
  if (!text) {
    return null;
  }

  return text.split("\n").map((line, index) => (
    <span key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </span>
  ));
}
