"use client";

import clsx from "clsx";
import { Clock, Captions, Film, ListMusic, MonitorPlay, Radio, User } from "lucide-react";
import type { Infos, InfosListe } from "@/lib/api";
import { duree } from "@/lib/format";
import { Case } from "./ui";

/* Les miniatures viennent de n'importe quel site pris en charge : next/image
   demanderait de déclarer chaque domaine, pour une image affichée une fois. */
function Miniature({ src, liste }: { src: string | null; liste?: boolean }) {
  return (
    <div className="relative w-full sm:w-44 aspect-video shrink-0 rounded overflow-hidden bg-s3">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover animate-fade" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted">
          {liste ? <ListMusic size={22} /> : <Film size={22} />}
        </div>
      )}
    </div>
  );
}

export function ApercuChargement() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 border border-border rounded-md bg-surface" aria-busy>
      <div className="w-full sm:w-44 aspect-video rounded squelette" />
      <div className="flex-1 space-y-2.5 py-1">
        <div className="h-4 w-4/5 rounded squelette" />
        <div className="h-3 w-2/5 rounded squelette" />
        <div className="h-3 w-1/4 rounded squelette mt-5" />
      </div>
    </div>
  );
}

interface Props {
  infos: Infos;
  selection: Set<number>;
  onSelection: (s: Set<number>) => void;
}

export default function Apercu({ infos, selection, onSelection }: Props) {
  return (
    <div className="animate-rise border border-border rounded-md bg-surface">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <Miniature src={infos.miniature} liste={infos.type === "liste"} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[11px] text-muted mb-1.5 flex items-center gap-1.5">
            {infos.type === "liste" ? <ListMusic size={12} /> : <MonitorPlay size={12} />}
            {infos.site}
            {infos.type === "liste" && <> · playlist</>}
          </p>
          <h2 className="font-semibold text-[15px] leading-snug line-clamp-2">{infos.titre || "Sans titre"}</h2>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-muted2">
            {infos.auteur && (
              <span className="flex items-center gap-1.5">
                <User size={12} /> {infos.auteur}
              </span>
            )}
            {infos.type === "media" && infos.duree ? (
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {duree(infos.duree)}
              </span>
            ) : null}
            {infos.type === "media" && infos.hauteurs.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Film size={12} /> jusqu&apos;en {Math.max(...infos.hauteurs)}p
              </span>
            )}
            {infos.type === "media" && infos.sous_titres.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Captions size={12} /> {infos.sous_titres.length} langue{infos.sous_titres.length > 1 ? "s" : ""}
              </span>
            )}
            {infos.type === "media" && infos.direct && (
              <span className="flex items-center gap-1.5 text-accent-texte">
                <Radio size={12} /> en direct
              </span>
            )}
            {infos.type === "liste" && (
              <span className="flex items-center gap-1.5">
                <ListMusic size={12} /> {infos.nombre} élément{infos.nombre > 1 ? "s" : ""}
              </span>
            )}
          </div>
          {infos.type === "media" && (infos.avertissement || infos.direct) && (
            <p className="mt-3 text-[12px] text-accent-texte">
              {infos.direct ? "Les directs ne peuvent pas être téléchargés." : infos.avertissement}
            </p>
          )}
        </div>
      </div>
      {infos.type === "liste" && <ListeElements infos={infos} selection={selection} onSelection={onSelection} />}
    </div>
  );
}

function ListeElements({ infos, selection, onSelection }: { infos: InfosListe; selection: Set<number> } & Pick<Props, "onSelection">) {
  const tous = infos.entrees.length > 0 && selection.size === infos.entrees.length;
  const basculer = (index: number, coche: boolean) => {
    const suivante = new Set(selection);
    if (coche) suivante.add(index);
    else suivante.delete(index);
    onSelection(suivante);
  };

  return (
    <div className="border-t border-border">
      <div className="flex items-center justify-between px-4 py-2.5 bg-s2/50">
        <Case coche={tous} onChange={(v) => onSelection(new Set(v ? infos.entrees.map((e) => e.index) : []))}>
          <span className="text-[12px] text-muted2">Tout sélectionner</span>
        </Case>
        <span className="font-mono text-[11px] text-muted">
          {selection.size} / {infos.entrees.length}
        </span>
      </div>
      <ol className="max-h-72 overflow-y-auto divide-y divide-border">
        {infos.entrees.map((e, i) => (
          <li key={e.index} className={clsx("animate-fade", i < 6 && `stagger-${i + 1}`)}>
            <Case
              coche={selection.has(e.index)}
              onChange={(v) => basculer(e.index, v)}
              className="px-4 py-2.5 hover:bg-s2/60 transition-colors"
            >
              <span className="font-mono text-[11px] text-muted w-6 text-right shrink-0">{e.index}</span>
              <span className="flex-1 min-w-0 text-[13px] truncate">{e.titre}</span>
              {e.duree ? <span className="font-mono text-[11px] text-muted shrink-0">{duree(e.duree)}</span> : null}
            </Case>
          </li>
        ))}
      </ol>
    </div>
  );
}
