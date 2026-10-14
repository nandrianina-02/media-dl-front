"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  annulerTache,
  creerTache,
  demandeDe,
  estActive,
  historique,
  lienFichier,
  lireTache,
  service,
  type Demande,
  type Service,
  type Tache,
} from "./api";
import { lireReglages } from "./reglages";

interface File {
  taches: Tache[];
  actives: number;
  service: Service | null;
  enLigne: boolean | null;
  verifier: () => Promise<void>;
  ajouter: (demande: Demande) => Promise<Tache>;
  annuler: (id: string) => Promise<void>;
  relancer: (tache: Tache) => Promise<Tache>;
  retirer: (id: string) => void;
}

const Contexte = createContext<File | null>(null);

export function ouvrirFichier(id: string) {
  // Le serveur répond en pièce jointe : le navigateur enregistre le fichier
  // sans quitter la page.
  const lien = document.createElement("a");
  lien.href = lienFichier(id);
  lien.rel = "noopener";
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
}

export function FournisseurFile({ children }: { children: React.ReactNode }) {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [infosService, setService] = useState<Service | null>(null);
  const [enLigne, setEnLigne] = useState<boolean | null>(null);
  const tachesRef = useRef(taches);
  tachesRef.current = taches;

  const verifier = useCallback(async () => {
    const s = await service();
    setService((avant) => s ?? avant);
    setEnLigne(!!s);
  }, []);

  useEffect(() => {
    verifier();
    const minuterie = setInterval(verifier, 30_000);
    return () => clearInterval(minuterie);
  }, [verifier]);

  // Au chargement : on reprend les téléchargements en cours et les fichiers
  // encore disponibles, pour qu'un rechargement de page ne perde rien.
  useEffect(() => {
    historique()
      .then((liste) => setTaches(liste.filter((t) => estActive(t) || t.disponible).slice(0, 12)))
      .catch(() => {});
  }, []);

  const maj = useCallback((tache: Tache) => {
    setTaches((avant) => avant.map((t) => (t.id === tache.id ? tache : t)));
  }, []);

  const actives = taches.filter(estActive).length;

  // Suivi : une requête par tâche active et par seconde, seulement s'il y en a.
  useEffect(() => {
    if (!actives) return;
    let annule = false;
    const minuterie = setInterval(async () => {
      const suivies = tachesRef.current.filter(estActive);
      const etats = await Promise.all(suivies.map((t) => lireTache(t.id).catch(() => null)));
      if (annule) return;
      etats.forEach((etat, i) => {
        if (!etat) return;
        if (etat.statut === "pret" && suivies[i].statut !== "pret" && lireReglages().ouvrirAuto) ouvrirFichier(etat.id);
        maj(etat);
      });
    }, 1000);
    return () => {
      annule = true;
      clearInterval(minuterie);
    };
  }, [actives, maj]);

  const ajouter = useCallback(async (demande: Demande) => {
    const tache = await creerTache(demande);
    setTaches((avant) => [tache, ...avant.filter((t) => t.id !== tache.id)]);
    return tache;
  }, []);

  const annuler = useCallback(
    async (id: string) => {
      await annulerTache(id).catch(() => {});
      const etat = await lireTache(id).catch(() => null);
      if (etat) maj(etat);
    },
    [maj],
  );

  const relancer = useCallback((tache: Tache) => ajouter(demandeDe(tache)), [ajouter]);

  const retirer = useCallback((id: string) => {
    setTaches((avant) => avant.filter((t) => t.id !== id));
  }, []);

  const valeur = useMemo(
    () => ({ taches, actives, service: infosService, enLigne, verifier, ajouter, annuler, relancer, retirer }),
    [taches, actives, infosService, enLigne, verifier, ajouter, annuler, relancer, retirer],
  );
  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useFile(): File {
  const file = useContext(Contexte);
  if (!file) throw new Error("useFile hors de FournisseurFile");
  return file;
}
