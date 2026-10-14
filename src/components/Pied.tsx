import Link from "next/link";

export default function Pied() {
  return (
    <footer className="border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-3 sm:items-center justify-between font-mono text-[11px] text-muted">
        <p>MediaDL — yt-dlp, ffmpeg et FastAPI</p>
        <nav className="flex gap-5">
          <Link href="/mentions" className="hover:text-text transition-colors">
            Conditions et droits d&apos;auteur
          </Link>
          <Link href="/reglages" className="hover:text-text transition-colors">
            Réglages
          </Link>
        </nav>
      </div>
    </footer>
  );
}
