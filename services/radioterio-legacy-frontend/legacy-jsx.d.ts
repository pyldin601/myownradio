/* eslint-disable @typescript-eslint/no-unused-vars */
import type { HTMLAttributes } from "react";

declare module "react" {
  interface HTMLAttributes<T> {
    "active-tab"?: string;
    "analytics-category"?: string;
    "analytics-event"?: string;
    "analytics-label"?: string;
    "analytics-on"?: string;
    autoscroll?: string;
    "mobx-autorun"?: string;
    "mor-tooltip"?: string;
    "ng-app"?: string;
    "ng-controller"?: string;
    "ng-hide"?: string;
    "ng-show"?: string;
    "ng-switch-when"?: string;
    "ng-view"?: string;
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      translate: HTMLAttributes<HTMLElement>;
    }
  }
}
