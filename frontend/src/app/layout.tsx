import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tech News Aggregator",
  description: "最新の技術記事を集約 - Dev.toの記事をリアルタイムで取得",
  keywords: ["tech", "news", "development", "programming", "dev.to"],
  authors: [{ name: "Tech News Aggregator" }],
  openGraph: {
    title: "Tech News Aggregator",
    description: "最新の技術記事を集約",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech News Aggregator",
    description: "最新の技術記事を集約",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
