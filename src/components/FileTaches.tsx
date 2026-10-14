"use client";

import { useState } from "react";
import clsx from "clsx";
import { ArrowDownToLine, Ban, CircleCheck, CircleX, Clock3, Inbox, ListMusic, RotateCcw, X } from "lucide-react";
import { ErreurApi, estActive, type Tache } from "@/lib/api";
import { useFile, ouvrirFichier } from "@/lib/file";
import { dansMinutes, debit, octets, restant } from "@/lib/format";
import { Etiquette } from "./ui";

export function libelleQualite(t: Pick<Tache, "format" | "qualite">) {
  if (t.format === "flac" || t.format === "wav") return t.format.toUpperCase();
  if (t.format === "mp4" || t.format === "webm")
    return `${t.format.toUpperCase()} ${t.qualite === "best" ? "meilleure" : `${t.qualite}p`}`;
  return `${t.format.toUpperCase()} ${t.qualite} kb/s`;
}

export default function FileTaches() {
  const { taches, service } = useFile();
  const conservation = service ? Math.round(service.limites.conservation / 60) : null;

  return (
    <section aria-label="File de téléchargements">
      <div className="flex items-baseline justify-between mb-3">
        <Etiquette>File</Etiquette>
        {service && (
          <span className="font-mono text-[11px] text-muted">
            {taches.filter(estActive).length} / {service.limites.actifs_max} en cours
          </span>
        )}
      </div>

      {taches.length === 0 ? (
        <div className="border border-dashed border-border rounded-md px-5 py-8 text-center">
          <Inbox size={20} className="mx-auto text-muted mb-3" />
          <p className="text-[13px] text-muted2">Les téléchargements lancés apparaissent ici.</p>
          <p className="text-[12px] text-muted mt-1">Vous pouvez en ajouter plusieurs à la suite.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {taches.map((t) => (
            <LigneTache key={t.id} tache={t} />
          ))}
        </ul>
      )}

      {conservation && (
        <p className="mt-4 text-[12px] text-muted leading-relaxed">
          Les fichiers restent disponibles {conservation} minutes, puis sont supprimés du serveur.
        </p>
      )}
    </section>
  );
}

function LigneTache({ tache: t }: { tache: Tache }) {
  const { annuler, relancer, retirer } = useFile();
  const [erreurRelance, setErreurRelance] = useState<string | null>(null);
  const p = t.progression;
  const actif = estActive(t);
  const pourcentage = t.statut === "telechargement" ? p?.pourcentage ?? null : null;

  let detail: React.ReactNode;
  if (t.statut === "attente") detail = t.position ? `En attente — position ${t.position}` : "En attente";
  else if (t.statut === "telechargement")
    detail = [
      pourcentage != null ? `${Math.floor(pourcentage)} %` : "Téléchargement",
      debit(p?.vitesse),
      p?.restant != null ? `${restant(p.restant)} restantes` : "",
      p?.element && p.elements ? `élément ${p.element}/${p.elements}` : "",
    ]
      .filter(Boolean)
      .join(" · ");
  else if (t.statut === "conversion")
    detail = p?.element && p.elements ? `Conversion — élément ${p.element}/${p.elements}` : "Conversion";
  else if (t.statut === "pret") detail = [octets(t.taille), dansMinutes(t.expire_le)].filter(Boolean).join(" · ");
  else if (t.statut === "annule") detail = "Annulé";
  else if (t.statut === "expire") detail = "Fichier expiré";

  return (
    <li className="animate-rise border border-border rounded-md bg-surface overflow-hidden">
      <div className="flex gap-3 px-3.5 pt-3 pb-2.5">
        <Icone tache={t} />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium truncate" title={t.titre || t.url}>
            {t.titre || t.nom || t.url}
          </p>
          <p className="font-mono text-[11px] text-muted mt-0.5 flex items-center gap-1.5">
            {t.liste && <ListMusic size={11} />}
            {t.site} · {libelleQualite(t)}
          </p>
          {detail && <p className="text-[12px] text-muted2 mt-1.5 tabular-nums">{detail}</p>}
          {t.statut === "erreur" && t.erreur && <p className="text-[12px] text-accent-texte mt-1.5 leading-relaxed">{t.erreur}</p>}
          {/* Liste livrée en partie : le fichier est prêt, mais incomplet. */}
          {t.statut === "pret" && t.erreur && <p className="text-[12px] text-muted mt-1 leading-relaxed">{t.erreur}</p>}
          {erreurRelance && <p className="animate-fade text-[12px] text-accent-texte mt-1.5 leading-relaxed">{erreurRelance}</p>}
        </div>
        <div className="flex items-start gap-1 -mr-1">
          {actif ? (
            <Bouton titre="Annuler" onClick={() => annuler(t.id)}>
              <X size={15} />
            </Bouton>
          ) : (
            <Bouton titre="Retirer de la file" onClick={() => retirer(t.id)}>
              <X size={15} />
            </Bouton>
          )}
        </div>
      </div>

      {actif && (
        <div className="h-[3px] bg-s3 relative overflow-hidden">
          {pourcentage != null ? (
            <div className="h-full bg-accent transition-[width] duration-300 ease-out" style={{ width: `${pourcentage}%` }} />
          ) : (
            <div className={clsx("absolute inset-0", t.statut !== "attente" ? "barre-indeterminee" : "")} />
          )}
        </div>
      )}

      {t.statut === "pret" && t.disponible && (
        <button
          onClick={() => ouvrirFichier(t.id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-border text-[13px] font-medium text-green hover:bg-green/[0.06] transition-colors"
        >
          <ArrowDownToLine size={15} />
          Enregistrer {t.nom && <span className="font-mono text-[11px] text-muted2 truncate max-w-[55%]">{t.nom}</span>}
        </button>
      )}
      {(t.statut === "erreur" || t.statut === "annule" || t.statut === "expire") && (
        <button
          onClick={() =>
            relancer(t).then(
              () => retirer(t.id),
              (e) => setErreurRelance(e instanceof ErreurApi ? e.message : "Le téléchargement n'a pas pu être relancé."),
            )
          }
          className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-border text-[13px] text-muted2 hover:text-text hover:bg-s2 transition-colors"
        >
          <RotateCcw size={14} />
          Relancer
        </button>
      )}
    </li>
  );
}

function Icone({ tache }: { tache: Tache }) {
  const classe = "shrink-0 mt-0.5";
  switch (tache.statut) {
    case "pret":
      return <CircleCheck size={16} className={clsx(classe, "text-green")} />;
    case "erreur":
      return <CircleX size={16} className={clsx(classe, "text-accent-texte")} />;
    case "annule":
    case "expire":
      return <Ban size={16} className={clsx(classe, "text-muted")} />;
    case "attente":
      return <Clock3 size={16} className={clsx(classe, "text-muted2")} />;
    default:
      return <ArrowDownToLine size={16} className={clsx(classe, "text-accent-texte pulsation")} />;
  }
}

function Bouton({ titre, onClick, children }: { titre: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={titre}
      aria-label={titre}
      className="w-7 h-7 rounded flex items-center justify-center text-muted hover:text-text hover:bg-s2 transition-colors"
    >
      {children}
    </button>
  );
}
