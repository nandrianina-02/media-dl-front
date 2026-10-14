import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Entete from "@/components/Entete";
import Pied from "@/components/Pied";
import { FournisseurFile } from "@/lib/file";
import { SCRIPT_THEME } from "@/lib/reglages";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "MediaDL — Audio et vidéo depuis un lien", template: "%s — MediaDL" },
  description:
    "Récupérez l'audio ou la vidéo d'un lien YouTube, SoundCloud, TikTok, Vimeo et autres : MP3, M4A, FLAC, MP4. Playlists, extraits, sous-titres.",
};

export const viewport: Viewport = {
  themeColor: "#080808",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-theme="sombre" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Avant le premier rendu, pour ne pas afficher le mauvais thème. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <FournisseurFile>
          <Entete />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">{children}</main>
          <Pied />
        </FournisseurFile>
      </body>
    </html>
  );
}
