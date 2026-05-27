"use client";
import { CheckCircle, Download, RotateCcw } from "lucide-react";

interface Props {
  filename: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function SuccessCard({ filename, onDownload, onReset }: Props) {
  return (
    <div className="bg-green/5 border border-green/25 rounded-2xl p-4 flex items-center gap-4 animate-fade-in glow-green">
      <div className="w-10 h-10 rounded-xl bg-green/15 flex items-center justify-center flex-shrink-0">
        <CheckCircle size={20} className="text-green" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-green text-sm">Prêt !</p>
        <p className="font-mono text-[11px] text-muted2 truncate mt-0.5">{filename}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 bg-green/15 border border-green/30 rounded-lg px-3 py-2 text-green font-mono text-xs hover:bg-green/25 transition-all"
        >
          <Download size={12} />
          Télécharger
        </button>
        <button
          onClick={onReset}
          title="Nouveau téléchargement"
          className="flex items-center bg-s2 border border-border rounded-lg px-2.5 py-2 text-muted2 hover:text-text transition-all"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
