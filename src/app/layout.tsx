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

const BASE_URL = "https://dailysudoku.online";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Daily Sudoku Challenge | Free Online Sudoku Game",
    template: "%s | Daily Sudoku Challenge",
  },
  description:
    "A new Sudoku puzzle every day with four difficulty levels. Real-time scoring, streaks, and a global leaderboard. Play for free — one puzzle per day.",
  keywords: [
    "sudoku",
    "sudoku online",
    "daily sudoku",
    "sudoku puzzle",
    "sudoku game",
    "free sudoku",
    "number puzzle",
    "logic puzzle",
    "brain game",
    "sudoku daily",
    "sudoku leaderboard",
  ],
  applicationName: "Daily Sudoku Challenge",
  authors: [{ name: "Daily Sudoku" }],
  creator: "Daily Sudoku",
  publisher: "Daily Sudoku",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Daily Sudoku Challenge",
    title: "Daily Sudoku Challenge | Free Online Sudoku Game",
    description:
      "A new Sudoku puzzle every day with four difficulty levels. Real-time scoring, streaks, and a global leaderboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Sudoku Challenge | Free Online Sudoku Game",
    description:
      "A new Sudoku puzzle every day with four difficulty levels. Real-time scoring, streaks, and a global leaderboard.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Daily Sudoku Challenge",
    url: BASE_URL,
    description:
      "A new Sudoku puzzle every day with four difficulty levels. Real-time scoring, streaks, and a global leaderboard.",
    applicationCategory: "GameApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Daily Sudoku puzzles with auto-rotating difficulty",
      "Real-time scoring with streaks",
      "Global daily leaderboard",
      "Pencil notes mode",
      "One attempt per day per player",
    ],
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7473050725327911"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col items-center bg-[#f8f9fa]">
        {children}
      </body>
    </html>
  );
}
