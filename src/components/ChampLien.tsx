"use client";

import { ClipboardPaste, Link2, X } from "lucide-react";
import { detecterSite } from "@/lib/sites";

interface Props {
  valeur: string;
  onChange: (v: string) => void;
  onValider: () => void;
}

export default function ChampLien({ valeur, onChange, onValider }: Props) {
  const site = detecterSite(valeur);
  const inconnu = valeur.trim().length > 8 && !site;

  async function coller() {
    try {
      onChange((await navigator.clipboard.readText()).trim());
    } catch {
      // Lecture refusée par le navigateur : le visiteur peut toujours coller au clavier.
    }
  }

  return (
    <div>
      <div className="flex items-stretch rounded-md border border-border bg-s2 focus-within:border-accent transition-colors">
        <Link2 size={16} className="text-muted self-center ml-3.5 shrink-0" />
        <input
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={valeur}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onValider()}
          placeholder="https://www.youtube.com/watch?v=…"
          aria-label="Lien du média"
          className="flex-1 min-w-0 bg-transparent px-3 py-3.5 font-mono text-[13px] text-text placeholder:text-muted outline-none"
        />
        {site && (
          <span className="animate-fade self-center mr-2 font-mono text-[11px] px-2 py-1 rounded bg-s3 text-muted2 whitespace-nowrap">
            {site.nom}
          </span>
        )}
        {valeur ? (
          <button
            type="button"
            onClick={() => onChange("")}
            title="Effacer"
            className="px-3 text-muted hover:text-text transition-colors border-l border-border"
          >
            <X size={15} />
          </button>
        ) : (
          <button
            type="button"
            onClick={coller}
            className="flex items-center gap-1.5 px-3.5 font-mono text-[12px] text-muted2 hover:text-text transition-colors border-l border-border"
          >
            <ClipboardPaste size={14} />
            Coller
          </button>
        )}
      </div>
      {inconnu && (
        <p className="animate-fade mt-2 text-[12px] text-muted2">
          Ce site n&apos;est pas pris en charge. Les sites acceptés sont listés plus bas.
        </p>
      )}
    </div>
  );
}
