"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ping, startDownload, pollStatus, fileUrl, fetchYouTubeMeta, type Job, fetchMediaInfo } from "@/lib/api";
import { detectSite, extractYouTubeId, SUPPORTED_SITES } from "@/lib/sites";
import Header from "@/components/Header";
import ServerBanner from "@/components/ServerBanner";
import MediaCard from "@/components/MediaCard";
import DownloadForm from "@/components/DownloadForm";
import ProgressCard from "@/components/ProgressCard";
import SuccessCard from "@/components/SuccessCard";
import HistoryList from "@/components/HistoryList";
import SiteChips from "@/components/SiteChips";
import Toast from "@/components/Toast";
import Footer from "@/components/Footer";

export interface HistoryItem {
  title: string;
  url: string;
  site: string;
  format: string;
  quality: string;
  ts: number;
}

export interface MediaInfo {
  title: string;
  author: string;
  thumbnail?: string;
  site?: string;
  siteColor?: string;
  loading?: boolean;
  duration?: number;
}

export default function Home() {
  // Server
  const [online, setOnline] = useState<boolean | null>(null);

  // URL / media
  const [url, setUrl] = useState("");
  const [media, setMedia] = useState<MediaInfo | null>(null);

  // Download options
  const [format, setFormat] = useState("mp3");
  const [quality, setQuality] = useState("128");

  // Job
  const [job, setJob] = useState<Job | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Toast
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const toastTimer = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  // Ping server
  const checkServer = useCallback(async () => {
    const ok = await ping();
    setOnline(ok);
  }, []);

  useEffect(() => {
    checkServer();
    const iv = setInterval(checkServer, 8000);
    return () => clearInterval(iv);
  }, [checkServer]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mediadl_history");
      if (raw) setHistory(JSON.parse(raw));
    } catch {}
  }, []);

  const saveHistory = useCallback((item: HistoryItem) => {
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 12);
      localStorage.setItem("mediadl_history", JSON.stringify(next));
      return next;
    });
  }, []);

  // Detect media from URL
  const loadMedia = useCallback(async (inputUrl: string) => {
    const site = detectSite(inputUrl);
    if (!site) { setMedia(null); return; }

    // Affiche un état de chargement immédiatement
    setMedia({
      title: "Chargement…",
      author: inputUrl.slice(0, 50),
      site: site.name,
      siteColor: site.color,
      loading: true,
    });

    // Appel backend pour tous les sites
    const info = await fetchMediaInfo(inputUrl);
    if (info) {
      setMedia({
        title:     info.title,
        author:    info.author,
        thumbnail: info.thumbnail,
        duration:  info.duration,
        site:      info.site || site.name,
        siteColor: site.color,
      });
    } else {
      setMedia({
        title:     `Lien ${site.name} détecté`,
        author:    inputUrl.slice(0, 50),
        site:      site.name,
        siteColor: site.color,
      });
    }
  }, []);

  const handleUrlChange = useCallback(
    (val: string) => {
      setUrl(val);
      if (val.length > 12) loadMedia(val);
      else setMedia(null);
    },
    [loadMedia]
  );

  // Download
  const handleDownload = useCallback(async () => {
    if (!url.trim() || !detectSite(url)) {
      showToast("⚠ Lien non supporté", "err");
      return;
    }
    if (!online) {
      showToast("⚠ Serveur non joignable", "err");
      return;
    }

    // Reset job state
    setJob({ id: "", url, format, quality, site: "", status: "queued", progress: 0 });
    setCurrentJobId(null);
    if (pollingRef.current) clearInterval(pollingRef.current);

    try {
      const res = await startDownload({ url, format, quality });
      if (!res.ok || !res.job_id) throw new Error(res.error || "Erreur serveur");
      setCurrentJobId(res.job_id);

      pollingRef.current = setInterval(async () => {
        try {
          const j = await pollStatus(res.job_id);
          setJob(j);
          if (j.status === "done") {
            clearInterval(pollingRef.current!);
            saveHistory({
              title: media?.title || url,
              url,
              site: j.site,
              format,
              quality,
              ts: Date.now(),
            });
            showToast("✓ Fichier prêt !", "ok");
          }
          if (j.status === "error") {
            clearInterval(pollingRef.current!);
            showToast("⚠ " + (j.error || "Erreur"), "err");
            setJob(null);
          }
        } catch {
          clearInterval(pollingRef.current!);
          showToast("⚠ Connexion perdue", "err");
          setJob(null);
        }
      }, 1200);
    } catch (e: any) {
      showToast("⚠ " + e.message, "err");
      setJob(null);
    }
  }, [url, format, quality, online, media, saveHistory, showToast]);

  const handleDownloadFile = useCallback(() => {
    if (!currentJobId) return;
    window.open(fileUrl(currentJobId), "_blank");
  }, [currentJobId]);

  const handleReset = useCallback(() => {
    setJob(null);
    setCurrentJobId(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  const isDownloading = job && job.status !== "done" && job.status !== "error";

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Header online={online} onRefreshPing={checkServer} />

      <main className="flex-1 flex flex-col items-center px-4 py-10 sm:py-16">
        {/* Hero */}
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3">
            Téléchargez{" "}
            <span className="text-red">n'importe quel média</span>
          </h1>
          <p className="text-muted2 text-sm sm:text-base max-w-xl mx-auto">
            YouTube, TikTok, Instagram, SoundCloud et 7+ sites — MP3, MP4, WAV en quelques secondes.
          </p>
        </div>

        <SiteChips sites={SUPPORTED_SITES.map((s) => s.name)} />

        <div className="w-full max-w-2xl space-y-4 animate-fade-in">
          {online === false && <ServerBanner />}

          {/* Media preview */}
          {media && (
            <MediaCard
              title={media.title}
              author={media.author}
              thumbnail={media.thumbnail}
              site={media.site}
              siteColor={media.siteColor}
              duration={media.duration}
            />
          )}

          <DownloadForm
            url={url}
            format={format}
            quality={quality}
            onUrlChange={handleUrlChange}
            onFormatChange={setFormat}
            onQualityChange={setQuality}
            onDownload={handleDownload}
            loading={!!isDownloading}
            disabled={!online}
          />

          {isDownloading && (
            <ProgressCard
              status={job!.status}
              progress={job!.progress}
              site={job!.site}
              format={format}
            />
          )}

          {job?.status === "done" && (
            <SuccessCard
              filename={job.filename || "fichier prêt"}
              onDownload={handleDownloadFile}
              onReset={handleReset}
            />
          )}

          <HistoryList
            items={history}
            onClear={() => {
              setHistory([]);
              localStorage.removeItem("mediadl_history");
              showToast("Historique effacé", "ok");
            }}
            onReuse={(u) => {
              setUrl(u);
              loadMedia(u);
            }}
          />
        </div>
      </main>

      <Footer />
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
