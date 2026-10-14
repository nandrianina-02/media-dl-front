// Détection côté navigateur, pour réagir dès la saisie. Le serveur refait la
// vérification (domaine exact) : ceci n'est qu'un confort d'affichage.

export interface Site {
  nom: string;
  domaines: string[];
}

export const SITES: Site[] = [
  { nom: "YouTube", domaines: ["youtube.com", "youtu.be"] },
  { nom: "TikTok", domaines: ["tiktok.com"] },
  { nom: "Instagram", domaines: ["instagram.com"] },
  { nom: "SoundCloud", domaines: ["soundcloud.com"] },
  { nom: "Facebook", domaines: ["facebook.com", "fb.watch"] },
  { nom: "Vimeo", domaines: ["vimeo.com"] },
  { nom: "Dailymotion", domaines: ["dailymotion.com", "dai.ly"] },
  { nom: "Twitch", domaines: ["twitch.tv"] },
  { nom: "X", domaines: ["twitter.com", "x.com"] },
  { nom: "Reddit", domaines: ["reddit.com", "redd.it"] },
];

export function detecterSite(saisie: string): Site | null {
  const texte = saisie.trim();
  if (!texte) return null;
  try {
    const hote = new URL(/^https?:\/\//i.test(texte) ? texte : `https://${texte}`).hostname.toLowerCase();
    return SITES.find((s) => s.domaines.some((d) => hote === d || hote.endsWith(`.${d}`))) ?? null;
  } catch {
    return null;
  }
}
