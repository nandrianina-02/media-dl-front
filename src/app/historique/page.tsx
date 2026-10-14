"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  ArrowDownToLine,
  Check,
  Copy,
  ExternalLink,
  History,
  ListMusic,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { libelleQualite } from "@/components/FileTaches";
import { Alerte, Etiquette, Puce } from "@/components/ui";
import { ErreurApi, effacerHistorique, estActive, historique, type Statut, type Tache } from "@/lib/api";
import { ouvrirFichier, useFile } from "@/lib/file";
import { ilYA, octets } from "@/lib/format";

const FILTRES: { cle: string; libelle: string; statuts: Statut[] | null }[] = [
  { cle: "tous", libelle: "Tous", statuts: null },
  { cle: "prets", libelle: "Disponibles", statuts: ["pret"] },
  { cle: "erreurs", libelle: "Échecs", statuts: ["erreur", "annule"] },
];

const STATUTS: Record<Statut, { libelle: string; classe: string }> = {
  attente: { libelle: "En attente", classe: "text-muted2" },
  telechargement: { libelle: "En cours", classe: "text-accent-texte" },
  conversion: { libelle: "Conversion", classe: "text-accent-texte" },
  pret: { libelle: "Disponible", classe: "text-green" },
  erreur: { libelle: "Échec", classe: "text-accent-texte" },
  annule: { libelle: "Annulé", classe: "text-muted" },
  expire: { libelle: "Expiré", classe: "text-muted" },
};

export default function PageHistorique() {
  const { relancer } = useFile();
  const [taches, setTaches] = useState<Tache[] | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [recherche, setRecherche] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [confirmer, setConfirmer] = useState(false);
  const [relancees, setRelancees] = useState<Set<string>>(new Set());

  const charger = useCallback(async () => {
    try {
      setTaches(await historique());
      setErreur(null);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "L'historique n'a pas pu être chargé.");
    }
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const visibles = useMemo(() => {
    const statuts = FILTRES.find((f) => f.cle === filtre)?.statuts;
    const texte = recherche.trim().toLowerCase();
    return (taches ?? []).filter(
      (t) =>
        (!statuts || statuts.includes(t.statut)) &&
        (!texte || [t.titre, t.url, t.site, t.nom].some((v) => v?.toLowerCase().includes(texte))),
    );
  }, [taches, filtre, recherche]);

  async function effacer() {
    if (!confirmer) {
      setConfirmer(true);
      return;
    }
    try {
      await effacerHistorique();
      setConfirmer(false);
      await charger();
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "L'historique n'a pas pu être effacé.");
    }
  }

  async function relancerTache(t: Tache) {
    try {
      await relancer(t);
      setRelancees((s) => new Set(s).add(t.id));
      setErreur(null);
    } catch (e) {
      setErreur(e instanceof ErreurApi ? e.message : "Le téléchargement n'a pas pu être relancé.");
    }
  }

  return (
    <div className="max-w-4xl">
      <header className="animate-rise flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Etiquette className="mb-3">Historique</Etiquette>
          <h1 className="text-3xl font-extrabold tracking-tight">Vos téléchargements</h1>
          <p className="mt-2 text-[14px] text-muted2">
            Propre à ce navigateur. Seuls les titres et réglages sont gardés, 30 jours au plus.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={charger}
            className="h-9 px-3 rounded-md border border-border text-[13px] text-muted2 hover:text-text hover:border-muted flex items-center gap-2 transition-colors"
          >
            <RefreshCw size={14} /> Actualiser
          </button>
          {!!taches?.length && (
            <button
              onClick={effacer}
              onBlur={() => setConfirmer(false)}
              className={clsx(
                "h-9 px-3 rounded-md border text-[13px] flex items-center gap-2 transition-colors",
                confirmer
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted2 hover:text-text hover:border-muted",
              )}
            >
              <Trash2 size={14} /> {confirmer ? "Confirmer l'effacement" : "Tout effacer"}
            </button>
          )}
        </div>
      </header>

      {erreur && <Alerte className="mb-6">{erreur}</Alerte>}

      {taches && taches.length > 0 && (
        <div className="animate-rise stagger-1 flex flex-col sm:flex-row gap-3 mb-4">
          <label className="flex-1 flex items-center gap-2 rounded-md border border-border bg-s2 px-3 focus-within:border-accent transition-colors">
            <Search size={14} className="text-muted" />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un titre, un site"
              className="flex-1 bg-transparent py-2 text-[13px] outline-none placeholder:text-muted"
            />
          </label>
          <div className="flex gap-1.5">
            {FILTRES.map((f) => (
              <Puce key={f.cle} actif={filtre === f.cle} onClick={() => setFiltre(f.cle)} className="font-sans">
                {f.libelle}
              </Puce>
            ))}
          </div>
        </div>
      )}

      {taches === null && !erreur && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[68px] rounded-md squelette" />
          ))}
        </div>
      )}

      {taches?.length === 0 && (
        <div className="animate-rise stagger-1 border border-dashed border-border rounded-md px-6 py-14 text-center">
          <History size={22} className="mx-auto text-muted mb-3" />
          <p className="text-[14px] text-muted2">Aucun téléchargement pour l&apos;instant.</p>
        </div>
      )}

      {taches && taches.length > 0 && visibles.length === 0 && (
        <p className="py-10 text-center text-[13px] text-muted2">Aucun résultat pour ce filtre.</p>
      )}

      {visibles.length > 0 && (
        <ul className="border border-border rounded-md divide-y divide-border bg-surface">
          {visibles.map((t, i) => (
            <Ligne
              key={t.id}
              tache={t}
              rang={i}
              relancee={relancees.has(t.id)}
              onRelancer={() => relancerTache(t)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Ligne({ tache: t, rang, relancee, onRelancer }: { tache: Tache; rang: number; relancee: boolean; onRelancer: () => void }) {
  const [copie, setCopie] = useState(false);
  const statut = STATUTS[t.statut];

  async function copier() {
    try {
      await navigator.clipboard.writeText(t.url);
      setCopie(true);
      setTimeout(() => setCopie(false), 1500);
    } catch {}
  }

  return (
    <li className={clsx("animate-fade px-4 py-3.5 flex flex-col sm:flex-row sm:items-center gap-3", rang < 6 && `stagger-${rang + 1}`)}>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium truncate" title={t.titre || t.url}>
          {t.titre || t.nom || t.url}
        </p>
        <p className="mt-1 font-mono text-[11px] text-muted flex flex-wrap items-center gap-x-2 gap-y-1">
          {t.liste && <ListMusic size={11} />}
          <span>{t.site}</span>
          <span>{libelleQualite(t)}</span>
          {t.taille ? <span>{octets(t.taille)}</span> : null}
          <span>{ilYA(t.cree_le)}</span>
          <span className={statut.classe}>{statut.libelle}</span>
        </p>
        {(t.statut === "erreur" || t.statut === "pret") && t.erreur && (
          <p className="mt-1.5 text-[12px] text-muted2">{t.erreur}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {t.disponible && (
          <button
            onClick={() => ouvrirFichier(t.id)}
            className="h-8 px-3 rounded-md text-[12px] font-medium text-green border border-green/30 hover:bg-green/[0.08] flex items-center gap-1.5 transition-colors"
          >
            <ArrowDownToLine size={13} /> Enregistrer
          </button>
        )}
        {!estActive(t) && !t.disponible && (
          <button
            onClick={onRelancer}
            disabled={relancee}
            className="h-8 px-3 rounded-md text-[12px] border border-border text-muted2 hover:text-text hover:border-muted disabled:opacity-60 flex items-center gap-1.5 transition-colors"
          >
            {relancee ? <Check size={13} /> : <RotateCcw size={13} />}
            {relancee ? "Ajouté à la file" : "Relancer"}
          </button>
        )}
        <Icone titre={copie ? "Lien copié" : "Copier le lien source"} onClick={copier}>
          {copie ? <Check size={14} className="text-green" /> : <Copy size={14} />}
        </Icone>
        <a
          href={t.url}
          target="_blank"
          rel="noopener noreferrer"
          title="Ouvrir la source"
          aria-label="Ouvrir la source"
          className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-text hover:bg-s2 transition-colors"
        >
          <ExternalLink size={14} />
        </a>
      </div>
    </li>
  );
}

function Icone({ titre, onClick, children }: { titre: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={titre}
      aria-label={titre}
      className="w-8 h-8 rounded-md flex items-center justify-center text-muted hover:text-text hover:bg-s2 transition-colors"
    >
      {children}
    </button>
  );
}
