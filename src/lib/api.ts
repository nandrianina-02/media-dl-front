import { identifiantVisiteur } from "./visiteur";

export const BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

/** Erreur renvoyée par le serveur, avec un message déjà rédigé pour le visiteur. */
export class ErreurApi extends Error {
  constructor(
    message: string,
    public statut: number,
  ) {
    super(message);
  }
}

async function appel<T>(chemin: string, init: RequestInit = {}): Promise<T> {
  let reponse: Response;
  try {
    reponse = await fetch(`${BASE}${chemin}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Visiteur": identifiantVisiteur(),
        ...init.headers,
      },
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    throw new ErreurApi("Le serveur ne répond pas. Vérifiez votre connexion, puis réessayez.", 0);
  }
  if (!reponse.ok) {
    let message = "Une erreur est survenue. Réessayez dans un instant.";
    try {
      const corps = await reponse.json();
      if (typeof corps.detail === "string") message = corps.detail;
      // Erreur de validation FastAPI : une liste ; la première suffit.
      else if (Array.isArray(corps.detail) && corps.detail[0]?.msg)
        message = String(corps.detail[0].msg).replace(/^Value error, /, "");
    } catch {}
    throw new ErreurApi(message, reponse.status);
  }
  return reponse.json();
}

// --- Types ---------------------------------------------------------------------

export type FormatAudio = "mp3" | "m4a" | "opus" | "ogg" | "flac" | "wav";
export type FormatVideo = "mp4" | "webm";
export type Format = FormatAudio | FormatVideo;

export interface Limites {
  duree_max: number;
  taille_max: string;
  elements_max: number;
  conservation: number;
  actifs_max: number;
}

export interface Service {
  nom: string;
  version: string;
  sites: string[];
  limites: Limites;
}

export interface InfosMedia {
  type: "media";
  titre: string;
  auteur: string;
  miniature: string | null;
  duree: number | null;
  direct: boolean;
  hauteurs: number[];
  sous_titres: string[];
  site: string;
  url: string;
  choix_liste: boolean;
  avertissement?: string;
}

export interface EntreeListe {
  index: number;
  titre: string;
  duree: number | null;
  auteur: string | null;
}

export interface InfosListe {
  type: "liste";
  titre: string;
  auteur: string;
  miniature: string | null;
  entrees: EntreeListe[];
  nombre: number;
  site: string;
  url: string;
  choix_liste: boolean;
}

export type Infos = InfosMedia | InfosListe;

export interface Demande {
  url: string;
  format: Format;
  qualite: string;
  liste: boolean;
  titre?: string;
  debut?: number | null;
  fin?: number | null;
  sous_titres?: string[];
  pochette?: boolean;
  elements?: number[];
}

export type Statut = "attente" | "telechargement" | "conversion" | "pret" | "erreur" | "annule" | "expire";

export const STATUTS_ACTIFS: Statut[] = ["attente", "telechargement", "conversion"];
export const estActive = (t: { statut: Statut }) => STATUTS_ACTIFS.includes(t.statut);

export interface Progression {
  etape: "telechargement" | "conversion";
  pourcentage: number | null;
  octets: number;
  total: number | null;
  vitesse: number | null;
  restant: number | null;
  element: number | null;
  elements: number | null;
}

export interface Tache {
  id: string;
  url: string;
  site: string;
  titre: string | null;
  format: Format;
  qualite: string;
  options: {
    debut: number | null;
    fin: number | null;
    sous_titres: string[];
    pochette: boolean;
    elements: number[];
  };
  liste: boolean;
  statut: Statut;
  erreur: string | null;
  nom: string | null;
  taille: number | null;
  cree_le: number;
  fini_le: number | null;
  expire_le: number | null;
  disponible: boolean;
  progression?: Progression;
  position?: number;
}

// --- Appels --------------------------------------------------------------------

export async function service(): Promise<Service | null> {
  try {
    return await appel<Service>("/", { signal: AbortSignal.timeout(6000) });
  } catch {
    return null;
  }
}

export const infos = (url: string, liste: boolean, signal?: AbortSignal) =>
  appel<Infos>(`/infos?url=${encodeURIComponent(url)}&liste=${liste}`, { signal });

export const creerTache = (demande: Demande) =>
  appel<Tache>("/taches", { method: "POST", body: JSON.stringify(demande) });

export const lireTache = (id: string) => appel<Tache>(`/taches/${encodeURIComponent(id)}`);

export const annulerTache = (id: string) =>
  appel<{ ok: boolean }>(`/taches/${encodeURIComponent(id)}`, { method: "DELETE" });

export const historique = () => appel<{ taches: Tache[] }>("/historique").then((r) => r.taches);

export const effacerHistorique = () => appel<{ ok: boolean }>("/historique", { method: "DELETE" });

/** Lien direct du fichier : ouvert par le navigateur, sans en-tête possible. */
export const lienFichier = (id: string) => `${BASE}/taches/${encodeURIComponent(id)}/fichier`;

/** Reconstitue la demande d'une tâche passée, pour la relancer à l'identique. */
export function demandeDe(tache: Tache): Demande {
  return {
    url: tache.url,
    format: tache.format,
    qualite: tache.qualite,
    liste: tache.liste,
    titre: tache.titre ?? undefined,
    debut: tache.options?.debut ?? null,
    fin: tache.options?.fin ?? null,
    sous_titres: tache.options?.sous_titres ?? [],
    pochette: tache.options?.pochette ?? true,
    elements: tache.options?.elements ?? [],
  };
}
