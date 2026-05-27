const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY ||
  "526dcdb0e21f7a515ebcf12a89d865d5bf5af0b16cd9f8400639de0ff0951d87";

function headers(extra: Record<string, string> = {}): HeadersInit {
  return { "Content-Type": "application/json", "X-API-Key": API_KEY, ...extra };
}

export async function ping(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/ping`, {
      signal: AbortSignal.timeout(4000),
      headers: headers(),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export interface DownloadRequest {
  url: string;
  format: string;
  quality: string;
}

export interface DownloadResponse {
  ok: boolean;
  job_id: string;
  site: string;
  error?: string;
}

export async function startDownload(req: DownloadRequest): Promise<DownloadResponse> {
  const r = await fetch(`${BASE}/download`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(req),
  });
  return r.json();
}

export interface Job {
  id: string;
  url: string;
  format: string;
  quality: string;
  site: string;
  status: "queued" | "downloading" | "done" | "error";
  progress: number;
  filename?: string;
  error?: string;
}

export async function pollStatus(jobId: string): Promise<Job> {
  const r = await fetch(`${BASE}/status?id=${jobId}`, { headers: headers() });
  if (!r.ok) throw new Error("Job not found");
  return r.json();
}

export function fileUrl(jobId: string): string {
  return `${BASE}/file?id=${jobId}&key=${API_KEY}`;
}

export interface YouTubeMeta {
  title: string;
  author_name: string;
  thumbnail_url?: string;
}

export async function fetchYouTubeMeta(videoId: string): Promise<YouTubeMeta | null> {
  try {
    const r = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (r.ok) return r.json();
    return null;
  } catch {
    return null;
  }
}

export interface MediaInfo {
  title: string;
  author: string;
  thumbnail: string;
  duration?: number;
  site: string;
}

export async function fetchMediaInfo(url: string): Promise<MediaInfo | null> {
  try {
    const r = await fetch(
      `${BASE}/info?url=${encodeURIComponent(url)}`,
      { headers: headers(), signal: AbortSignal.timeout(16000) }
    );
    if (!r.ok) return null;
    return r.json();
  } catch {
    return null;
  }
}