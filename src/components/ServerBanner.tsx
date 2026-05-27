"use client";
import { AlertTriangle } from "lucide-react";

export default function ServerBanner() {
  return (
    <div className="bg-red/5 border border-red/25 rounded-2xl px-4 py-3 flex items-start gap-3 animate-fade-in">
      <AlertTriangle size={15} className="text-orange flex-shrink-0 mt-0.5" />
      <div>
        <p className="font-bold text-orange text-sm">Serveur non joignable</p>
        <p className="font-mono text-[11px] text-muted2 mt-1">
          Vérifiez que le backend FastAPI est démarré et accessible.
        </p>
      </div>
    </div>
  );
}
