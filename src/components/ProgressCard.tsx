"use client";

interface Props {
  status: string;
  progress: number;
  site: string;
  format: string;
}

const LABELS: [number, number, string][] = [
  [0,  15, "Connexion au site…"],
  [15, 50, "Téléchargement…"],
  [50, 85, "Conversion audio…"],
  [85, 100, "Finalisation…"],
];

export default function ProgressCard({ status, progress, site, format }: Props) {
  const pct = Math.min(100, Math.max(0, progress));
  const label = LABELS.find(([lo, hi]) => pct >= lo && pct < hi)?.[2] ?? "En cours…";

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-orange">{label}</span>
        <span className="font-mono text-xs text-muted2">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 bg-s3 rounded-full overflow-hidden">
        <div
          className="h-full progress-bar-fill rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="font-mono text-[10px] text-muted2">
        {site && <span className="text-muted">{site} → </span>}
        <span>{format.toUpperCase()}</span>
      </div>
    </div>
  );
}
