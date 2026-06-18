import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radioterio - Your own web radio station",
  description: "Create and listen to personal online radio stations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="image">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
