"use client";
import { ClipboardPaste, Download } from "lucide-react";
import clsx from "clsx";
import { useEffect } from "react";

const FORMATS = ["mp3", "mp4", "wav", "ogg", "m4a"];

// Qualité selon le format
const QUALITY_OPTIONS: Record<string, { label: string; value: string }[]> = {
  mp3: [
    { label: "64k",  value: "64"  },
    { label: "128k", value: "128" },
    { label: "192k", value: "192" },
    { label: "320k", value: "320" },
  ],
  wav: [
    { label: "64k",  value: "64"  },
    { label: "128k", value: "128" },
    { label: "192k", value: "192" },
    { label: "320k", value: "320" },
  ],
  ogg: [
    { label: "64k",  value: "64"  },
    { label: "128k", value: "128" },
    { label: "192k", value: "192" },
    { label: "320k", value: "320" },
  ],
  m4a: [
    { label: "64k",  value: "64"  },
    { label: "128k", value: "128" },
    { label: "192k", value: "192" },
    { label: "320k", value: "320" },
  ],
  mp4: [
    { label: "360p", value: "360" },
    { label: "720p", value: "720" },
    { label: "1080p", value: "1080" },
    { label: "Best",  value: "best" },
  ],
};

const DEFAULT_QUALITY: Record<string, string> = {
  mp3: "128",
  wav: "128",
  ogg: "128",
  m4a: "128",
  mp4: "720",
};

interface Props {
  url: string;
  format: string;
  quality: string;
  onUrlChange: (v: string) => void;
  onFormatChange: (v: string) => void;
  onQualityChange: (v: string) => void;
  onDownload: () => void;
  loading: boolean;
  disabled?: boolean;
}

export default function DownloadForm({
  url, format, quality,
  onUrlChange, onFormatChange, onQualityChange,
  onDownload, loading, disabled,
}: Props) {

  const options = QUALITY_OPTIONS[format] ?? QUALITY_OPTIONS.mp3;
  const isVideo = format === "mp4";

  // Quand le format change, reset la qualité par défaut du nouveau format
  useEffect(() => {
    onQualityChange(DEFAULT_QUALITY[format] ?? "128");
  }, [format]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePaste = async () => {
    try {
      const t = await navigator.clipboard.readText();
      onUrlChange(t);
    } catch {}
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-4">
      {/* URL row */}
      <div>
        <label className="block font-mono text-[11px] text-muted mb-2 tracking-wider">
          // LIEN
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://youtube.com/…  tiktok.com/…  instagram.com/…"
            className="flex-1 bg-s2 border border-border rounded-xl px-4 py-2.5 text-sm font-mono text-text placeholder-muted outline-none focus:border-red transition-colors"
          />
          <button
            onClick={handlePaste}
            title="Coller depuis le presse-papiers"
            className="flex items-center gap-1.5 bg-s2 border border-border rounded-xl px-3 text-muted2 text-xs font-mono hover:text-text hover:border-muted transition-all whitespace-nowrap"
          >
            <ClipboardPaste size={13} />
            Coller
          </button>
        </div>
      </div>

      {/* Format + Quality */}
      <div className="grid grid-cols-2 gap-4">
        {/* FORMAT */}
        <div>
          <label className="block font-mono text-[11px] text-muted mb-2 tracking-wider">
            // FORMAT
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {FORMATS.map((f) => (
              <button
                key={f}
                onClick={() => onFormatChange(f)}
                className={clsx(
                  "flex-1 min-w-[40px] py-2 rounded-lg font-mono text-[11px] border transition-all",
                  format === f
                    ? "bg-red/10 border-red/50 text-orange"
                    : "bg-s2 border-border text-muted2 hover:text-text"
                )}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* QUALITÉ — options dynamiques selon le format */}
        <div>
          <label className="block font-mono text-[11px] text-muted mb-2 tracking-wider">
            // {isVideo ? "RÉSOLUTION" : "QUALITÉ"}
          </label>
          <div className="flex gap-1.5 flex-wrap">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onQualityChange(opt.value)}
                className={clsx(
                  "flex-1 min-w-[40px] py-2 rounded-lg font-mono text-[11px] border transition-all",
                  quality === opt.value
                    ? "bg-green/10 border-green/40 text-green"
                    : "bg-s2 border-border text-muted2 hover:text-text"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={onDownload}
        disabled={loading || disabled || !url.trim()}
        className={clsx(
          "w-full py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all relative overflow-hidden",
          loading || disabled || !url.trim()
            ? "bg-s3 text-muted cursor-not-allowed"
            : "bg-red text-white hover:-translate-y-0.5 glow-red hover:brightness-110"
        )}
      >
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0" />
        <Download size={17} />
        {loading ? "Téléchargement…" : "Télécharger"}
      </button>
    </div>
  );
}