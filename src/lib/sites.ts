export interface SiteInfo {
  name: string;
  color: string;
  pattern: RegExp;
}

export const SUPPORTED_SITES: SiteInfo[] = [
  { name: "YouTube",     color: "#ff3c00", pattern: /youtube\.com|youtu\.be/ },
  { name: "TikTok",      color: "#69C9D0", pattern: /tiktok\.com/ },
  { name: "Instagram",   color: "#e1306c", pattern: /instagram\.com/ },
  { name: "SoundCloud",  color: "#ff5500", pattern: /soundcloud\.com/ },
  { name: "Facebook",    color: "#1877f2", pattern: /facebook\.com|fb\.watch/ },
  { name: "Vimeo",       color: "#1ab7ea", pattern: /vimeo\.com/ },
  { name: "Dailymotion", color: "#0066DC", pattern: /dailymotion\.com/ },
  { name: "Twitch",      color: "#9147ff", pattern: /twitch\.tv/ },
  { name: "Twitter/X",   color: "#1da1f2", pattern: /twitter\.com|x\.com/ },
  { name: "Reddit",      color: "#ff4500", pattern: /reddit\.com/ },
];

export function detectSite(url: string): SiteInfo | null {
  return SUPPORTED_SITES.find((s) => s.pattern.test(url)) ?? null;
}

export function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}
