"use client";
import Image from "next/image";
import { Film } from "lucide-react";

interface Props {
  title: string;
  author: string;
  thumbnail?: string;
  site?: string;
  siteColor?: string;
  duration?: number;
}

function formatDuration(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function MediaCard({ title, author, thumbnail, site, siteColor, duration }: Props) {
  return (
    <div className="bg-surface border border-red/30 rounded-2xl p-4 flex gap-4 items-center animate-fade-in">
      {/* Thumbnail */}
      <div className="w-20 h-14 rounded-xl bg-s3 flex-shrink-0 overflow-hidden flex items-center justify-center">
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={title}
            width={80}
            height={56}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <Film size={22} className="text-muted opacity-40" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate">{title}</p>
        <p className="font-mono text-[11px] text-muted2 truncate mt-0.5">{author}</p>
        {site && (
          <span
            className="inline-block mt-1.5 text-[10px] font-mono text-white rounded px-2 py-0.5"
            style={{ background: siteColor || "#555" }}
          >
            {site}
          </span>
        )}

        {duration && (
          <span className="font-mono text-[10px] text-muted2 mt-1 block">
            ⏱ {formatDuration(duration)}
          </span>
        )}
      </div>
    </div>
  );
}
