import { createElement } from "react";

export function Translate({ children }: { children: React.ReactNode }) {
  return createElement("translate", { className: "ng-isolate-scope" }, children);
}
