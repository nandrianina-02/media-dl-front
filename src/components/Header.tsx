"use client";
import { Music, RefreshCw } from "lucide-react";
import clsx from "clsx";

interface Props {
  online: boolean | null;
  onRefreshPing: () => void;
}

export default function Header({ online, onRefreshPing }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        {/* Logo */}
        <div className="w-8 h-8 rounded-lg bg-red flex items-center justify-center flex-shrink-0 glow-red">
          <Music size={16} className="text-white" />
        </div>
        <span className="font-extrabold text-sm tracking-tight">MediaDL</span>
        <span className="font-mono text-[10px] text-muted2 hidden sm:block">v4.0</span>

        <div className="ml-auto flex items-center gap-2">
          {/* Server status pill */}
          <button
            onClick={onRefreshPing}
            className="flex items-center gap-1.5 bg-s2 border border-border rounded-full px-3 py-1.5 font-mono text-[11px] text-muted2 hover:text-text hover:border-muted transition-all"
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full transition-all",
                online === null && "bg-muted pulse-dot",
                online === true  && "bg-green" ,
                online === false && "bg-red"
              )}
            />
            <span>
              {online === null ? "Vérification…" : online ? "Serveur en ligne" : "Hors ligne"}
            </span>
            <RefreshCw size={10} className={clsx(online === null && "animate-spin")} />
          </button>
        </div>
      </div>
    </header>
  );
}
