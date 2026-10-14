"use client";

import clsx from "clsx";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { FORMATS_AUDIO, FORMATS_VIDEO, QUALITES_AUDIO, QUALITES_VIDEO } from "@/components/Options";
import { Case, Etiquette, Puce } from "@/components/ui";
import type { Format } from "@/lib/api";
import { useReglages, type Theme } from "@/lib/reglages";

const THEMES: { cle: Theme; libelle: string; icone: typeof Moon }[] = [
  { cle: "sombre", libelle: "Sombre", icone: Moon },
  { cle: "clair", libelle: "Clair", icone: Sun },
  { cle: "systeme", libelle: "Comme le système", icone: Monitor },
];

export default function PageReglages() {
  const { reglages, modifier, charge } = useReglages();

  return (
    <div className="max-w-3xl">
      <header className="animate-rise mb-10">
        <Etiquette className="mb-3">Réglages</Etiquette>
        <h1 className="text-3xl font-extrabold tracking-tight">Préférences</h1>
        <p className="mt-2 text-[14px] text-muted2">
          Enregistrées dans ce navigateur et appliquées immédiatement.
        </p>
      </header>

      <div className={clsx("divide-y divide-border border-y border-border", !charge && "opacity-0")}>
        <Rangee titre="Format par défaut" aide="Proposé à chaque nouveau lien." rang={1}>
          <div className="flex flex-wrap gap-1.5">
            {[...FORMATS_AUDIO, ...FORMATS_VIDEO].map((f) => (
              <Puce key={f} actif={reglages.format === f} onClick={() => modifier({ format: f as Format })}>
                {f.toUpperCase()}
              </Puce>
            ))}
          </div>
        </Rangee>

        <Rangee titre="Débit audio" aide="Pour MP3, M4A, OPUS et OGG." rang={2}>
          <div className="flex flex-wrap gap-1.5">
            {QUALITES_AUDIO.map((q) => (
              <Puce key={q} actif={reglages.qualiteAudio === q} onClick={() => modifier({ qualiteAudio: q })}>
                {q} kb/s
              </Puce>
            ))}
          </div>
        </Rangee>

        <Rangee titre="Définition vidéo" aide="Plafond : une source plus basse est gardée telle quelle." rang={3}>
          <div className="flex flex-wrap gap-1.5">
            {QUALITES_VIDEO.map((q) => (
              <Puce key={q} actif={reglages.qualiteVideo === q} onClick={() => modifier({ qualiteVideo: q })}>
                {q === "best" ? "Meilleure" : `${q}p`}
              </Puce>
            ))}
          </div>
        </Rangee>

        <Rangee titre="Fichiers" rang={4}>
          <div className="space-y-3">
            <Case coche={reglages.pochette} onChange={(pochette) => modifier({ pochette })}>
              <span className="text-[14px]">Intégrer la pochette et les métadonnées aux fichiers audio</span>
            </Case>
            <Case coche={reglages.ouvrirAuto} onChange={(ouvrirAuto) => modifier({ ouvrirAuto })}>
              <span className="text-[14px]">Enregistrer automatiquement le fichier dès qu&apos;il est prêt</span>
            </Case>
          </div>
        </Rangee>

        <Rangee titre="Thème" rang={5}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {THEMES.map(({ cle, libelle, icone: Icone }) => {
              const actif = reglages.theme === cle;
              return (
                <button
                  key={cle}
                  onClick={() => modifier({ theme: cle })}
                  aria-pressed={actif}
                  className={clsx(
                    "h-11 px-3.5 rounded-md border flex items-center gap-2.5 text-[13px] transition-colors",
                    actif ? "border-accent bg-accent/10 text-text" : "border-border bg-s2 text-muted2 hover:text-text",
                  )}
                >
                  <Icone size={15} className={actif ? "text-accent-texte" : ""} />
                  {libelle}
                  {actif && <Check size={14} className="ml-auto text-accent-texte" />}
                </button>
              );
            })}
          </div>
        </Rangee>
      </div>
    </div>
  );
}

function Rangee({ titre, aide, rang, children }: { titre: string; aide?: string; rang: number; children: React.ReactNode }) {
  return (
    <section className={clsx("animate-rise py-6 grid sm:grid-cols-[200px_1fr] gap-3 sm:gap-8", `stagger-${rang}`)}>
      <div>
        <h2 className="text-[14px] font-semibold">{titre}</h2>
        {aide && <p className="mt-1 text-[12px] text-muted leading-relaxed">{aide}</p>}
      </div>
      <div>{children}</div>
    </section>
  );
}
