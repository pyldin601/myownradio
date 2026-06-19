import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://radioter.io"),
  title: "Radioterio - Your own web radio station",
  description: "Create your own free web radio station in a minutes",
  keywords: [
    "music",
    "radio",
    "create",
    "radio station",
    "web radio",
    "listen",
    "free",
    "own",
  ],
  openGraph: {
    title: "Radioterio - Your own web radio station",
    description: "Create your own free web radio station in a minutes",
    images: ["/legacy/images/logos/mor-logo-big.png"],
  },
  icons: {
    icon: "/legacy/images/logos/site-icon-32.png",
  },
  other: {
    "google-site-verification": "l7PQWFkBsr1lzH2jzY80K_acxDtksCG8QzJE1aG58i8",
    blitz: "mu-d8917424-45532ba5-15616ea5-f171dee5",
  },
};

export const viewport: Viewport = {
  width: "1024",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html ng-app="application" ng-controller="MainController" className="ng-scope">
      <body
        className="image"
        mobx-autorun=""
        analytics-on="click"
        analytics-event="Click"
        analytics-category="Application"
      >
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
