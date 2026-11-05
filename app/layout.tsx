import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contact Hub — Unified contact research",
  description: "Search, merge, enrich, and export business contacts across trusted providers with transparent credit controls.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
