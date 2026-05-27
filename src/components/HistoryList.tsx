"use client";
import { Clock, Trash2 } from "lucide-react";
import type { HistoryItem } from "@/app/page";

interface Props {
  items: HistoryItem[];
  onClear: () => void;
  onReuse: (url: string) => void;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "à l'instant";
  if (s < 3600) return `il y a ${Math.floor(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.floor(s / 3600)} h`;
  return `il y a ${Math.floor(s / 86400)} j`;
}

export default function HistoryList({ items, onClear, onReuse }: Props) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={13} className="text-muted" />
          <span className="font-mono text-[11px] text-muted tracking-wider">// RÉCENTS</span>
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-muted hover:text-red font-mono text-[11px] transition-colors"
          >
            <Trash2 size={11} />
            Effacer
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="font-mono text-[11px] text-muted text-center py-3">
          Aucun téléchargement
        </p>
      ) : (
        <div className="space-y-1">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => onReuse(item.url)}
              className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-s2 transition-colors group text-left"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate group-hover:text-text text-text/80">
                  {item.title}
                </p>
                <p className="font-mono text-[10px] text-muted2 mt-0.5">
                  {timeAgo(item.ts)}
                </p>
              </div>
              <span className="flex-shrink-0 bg-s3 rounded px-1.5 py-0.5 font-mono text-[10px] text-muted2">
                {item.site} {item.format.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
