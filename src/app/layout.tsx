import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediaDL — Téléchargeur Multi-Sites",
  description:
    "Téléchargez des vidéos YouTube, TikTok, Instagram, SoundCloud et plus en MP3/MP4 gratuitement.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg">{children}</body>
    </html>
  );
}
