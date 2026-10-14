const nombre = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export function octets(n: number | null | undefined): string {
  if (n == null || n < 0) return "";
  const unites = ["o", "Ko", "Mo", "Go"];
  let i = 0;
  while (n >= 1024 && i < unites.length - 1) {
    n /= 1024;
    i++;
  }
  return `${nombre.format(n)} ${unites[i]}`;
}

export const debit = (n: number | null | undefined) => (n ? `${octets(n)}/s` : "");

/** 3:25, ou 1:02:03 au-delà d'une heure. */
export function duree(secondes: number | null | undefined): string {
  if (secondes == null || !isFinite(secondes)) return "";
  const s = Math.max(0, Math.round(secondes));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${r}` : `${m}:${r}`;
}

/** Lit « 1:05 », « 1:02:03 » ou « 65 » ; null si la saisie est vide ou invalide. */
export function lireDuree(texte: string): number | null {
  const t = texte.trim();
  if (!t) return null;
  if (!/^\d+(:\d{1,2}){0,2}$/.test(t)) return NaN;
  return t.split(":").reduce((total, partie) => total * 60 + Number(partie), 0);
}

export function restant(secondes: number | null | undefined): string {
  if (secondes == null) return "";
  if (secondes < 60) return `${Math.round(secondes)} s`;
  return `${duree(secondes)}`;
}

export function ilYA(horodatage: number): string {
  const ecart = Date.now() / 1000 - horodatage;
  if (ecart < 60) return "à l'instant";
  if (ecart < 3600) return `il y a ${Math.floor(ecart / 60)} min`;
  if (ecart < 86400) return `il y a ${Math.floor(ecart / 3600)} h`;
  return new Date(horodatage * 1000).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function dansMinutes(horodatage: number | null): string {
  if (!horodatage) return "";
  const minutes = Math.ceil((horodatage - Date.now() / 1000) / 60);
  if (minutes <= 0) return "expire bientôt";
  return minutes < 60 ? `encore ${minutes} min` : `encore ${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export const LANGUES: Record<string, string> = {
  fr: "Français", en: "Anglais", es: "Espagnol", de: "Allemand", it: "Italien", pt: "Portugais",
  ar: "Arabe", ja: "Japonais", ko: "Coréen", zh: "Chinois", ru: "Russe", nl: "Néerlandais",
  mg: "Malgache", hi: "Hindi", tr: "Turc", pl: "Polonais",
};

export const nomLangue = (code: string) => LANGUES[code.split("-")[0]] ?? code;
