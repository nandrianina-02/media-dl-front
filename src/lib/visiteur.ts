// Identifiant anonyme du navigateur : il sépare la file et l'historique de
// chacun sans compte. Ce n'est pas un secret d'authentification — il n'ouvre
// que l'historique de ce navigateur, qui ne contient aucun fichier.

const CLE = "mediadl_visiteur";
let memoire: string | null = null;

function nouveau(): string {
  const octets = new Uint8Array(24);
  crypto.getRandomValues(octets);
  return btoa(String.fromCharCode(...Array.from(octets)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function identifiantVisiteur(): string {
  if (memoire) return memoire;
  try {
    const existant = localStorage.getItem(CLE);
    if (existant && /^[A-Za-z0-9_-]{16,64}$/.test(existant)) return (memoire = existant);
    memoire = nouveau();
    localStorage.setItem(CLE, memoire);
  } catch {
    // Stockage bloqué (navigation privée stricte) : un identifiant par onglet.
    memoire = memoire ?? nouveau();
  }
  return memoire;
}
