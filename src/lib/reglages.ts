"use client";

import { useCallback, useEffect, useState } from "react";
import type { Format } from "./api";

export type Theme = "sombre" | "clair" | "systeme";

export interface Reglages {
  format: Format;
  qualiteAudio: string;
  qualiteVideo: string;
  pochette: boolean;
  /** Ouvre le fichier dès qu'il est prêt, sans clic supplémentaire. */
  ouvrirAuto: boolean;
  theme: Theme;
}

export const REGLAGES_DEFAUT: Reglages = {
  format: "mp3",
  qualiteAudio: "192",
  qualiteVideo: "720",
  pochette: true,
  ouvrirAuto: false,
  theme: "sombre",
};

const CLE = "mediadl_reglages";
const EVENEMENT = "mediadl:reglages";

export function lireReglages(): Reglages {
  try {
    const brut = localStorage.getItem(CLE);
    if (brut) return { ...REGLAGES_DEFAUT, ...JSON.parse(brut) };
  } catch {}
  return REGLAGES_DEFAUT;
}

export function appliquerTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

/** Réglages partagés entre composants et onglets. */
export function useReglages() {
  const [reglages, setReglages] = useState<Reglages>(REGLAGES_DEFAUT);
  const [charge, setCharge] = useState(false);

  useEffect(() => {
    setReglages(lireReglages());
    setCharge(true);
    const relire = () => setReglages(lireReglages());
    window.addEventListener(EVENEMENT, relire);
    window.addEventListener("storage", relire);
    return () => {
      window.removeEventListener(EVENEMENT, relire);
      window.removeEventListener("storage", relire);
    };
  }, []);

  const modifier = useCallback((changement: Partial<Reglages>) => {
    const suivant = { ...lireReglages(), ...changement };
    try {
      localStorage.setItem(CLE, JSON.stringify(suivant));
    } catch {}
    if (changement.theme) appliquerTheme(changement.theme);
    setReglages(suivant);
    window.dispatchEvent(new Event(EVENEMENT));
  }, []);

  return { reglages, modifier, charge };
}

/** Script exécuté avant l'affichage : évite un flash du mauvais thème. */
export const SCRIPT_THEME = `try{var r=JSON.parse(localStorage.getItem("${CLE}")||"{}");document.documentElement.dataset.theme=r.theme||"sombre"}catch(e){document.documentElement.dataset.theme="sombre"}`;
