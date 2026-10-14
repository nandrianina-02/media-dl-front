"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronDown, Music2, Scissors, Captions, Image as ImageIcon, Video } from "lucide-react";
import type { Format } from "@/lib/api";
import { nomLangue } from "@/lib/format";
import { Case, Etiquette, Puce } from "./ui";

export const FORMATS_AUDIO: Format[] = ["mp3", "m4a", "opus", "ogg", "flac", "wav"];
export const FORMATS_VIDEO: Format[] = ["mp4", "webm"];
export const QUALITES_AUDIO = ["64", "128", "192", "256", "320"];
export const QUALITES_VIDEO = ["360", "480", "720", "1080", "1440", "2160", "best"];
export const SANS_PERTE: Format[] = ["flac", "wav"];
// Conteneurs qui portent correctement une pochette intégrée.
export const AVEC_POCHETTE: Format[] = ["mp3", "m4a", "flac", "opus"];

export const estVideo = (f: Format) => FORMATS_VIDEO.includes(f);

export interface Avance {
  debut: string;
  fin: string;
  sousTitres: string[];
  pochette: boolean;
}

interface Props {
  format: Format;
  qualite: string;
  onFormat: (f: Format) => void;
  onQualite: (q: string) => void;
  hauteurs: number[];
  languesDispo: string[];
  liste: boolean;
  avance: Avance;
  onAvance: (a: Avance) => void;
  erreurExtrait: string | null;
  audioSeul?: boolean;
}

export default function Options({
  format,
  qualite,
  onFormat,
  onQualite,
  hauteurs,
  languesDispo,
  liste,
  avance,
  onAvance,
  erreurExtrait,
  audioSeul = false,
}: Props) {
  const [ouvert, setOuvert] = useState(false);
  const video = estVideo(format);
  // On ne propose que les définitions que la source fournit réellement.
  const plafond = hauteurs.length ? Math.max(...hauteurs) : null;
  const qualitesVideo = QUALITES_VIDEO.filter((q) => q === "best" || !plafond || Number(q) <= plafond);
  const langues = [...languesDispo].sort((a, b) => rang(a) - rang(b) || a.localeCompare(b));
  const reglagesActifs =
    (!liste && (avance.debut || avance.fin) ? 1 : 0) + (video && avance.sousTitres.length ? 1 : 0) + (!video && !avance.pochette ? 1 : 0);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-[auto_1fr] gap-x-6 gap-y-5">
        <div>
          <Etiquette className="mb-2 flex items-center gap-1.5">
            <Music2 size={12} /> Audio
          </Etiquette>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS_AUDIO.map((f) => (
              <Puce key={f} actif={format === f} onClick={() => onFormat(f)}>
                {f.toUpperCase()}
              </Puce>
            ))}
          </div>
        </div>
        <div>
          <Etiquette className="mb-2 flex items-center gap-1.5">
            <Video size={12} /> Vidéo
          </Etiquette>
          <div className="flex flex-wrap gap-1.5">
            {FORMATS_VIDEO.map((f) => (
              <Puce key={f} actif={format === f} disabled={audioSeul} onClick={() => onFormat(f)}>
                {f.toUpperCase()}
              </Puce>
            ))}
          </div>
          {audioSeul && <p className="mt-2 text-[12px] text-muted">Pas de vidéo pour cette source.</p>}
        </div>
      </div>

      <div>
        <Etiquette className="mb-2">{video ? "Définition maximale" : "Débit"}</Etiquette>
        {SANS_PERTE.includes(format) ? (
          <p className="h-9 flex items-center text-[13px] text-muted2">Sans perte : la qualité de la source est conservée.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {(video ? qualitesVideo : QUALITES_AUDIO).map((q) => (
              <Puce key={q} actif={qualite === q} onClick={() => onQualite(q)}>
                {q === "best" ? "Meilleure" : video ? `${q}p` : `${q} kb/s`}
              </Puce>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-4">
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          aria-expanded={ouvert}
          className="flex items-center gap-2 text-[13px] text-muted2 hover:text-text transition-colors"
        >
          <ChevronDown size={15} className={clsx("transition-transform duration-200", ouvert && "rotate-180")} />
          Options avancées
          {reglagesActifs > 0 && (
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent-texte">{reglagesActifs}</span>
          )}
        </button>

        {ouvert && (
          <div className="animate-fade mt-4 grid gap-5">
            <div>
              <Etiquette className="mb-2 flex items-center gap-1.5">
                <Scissors size={12} /> Extrait
              </Etiquette>
              {liste ? (
                <p className="text-[12px] text-muted2">L&apos;extrait ne s&apos;applique pas à une playlist.</p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <ChampTemps libelle="Début" valeur={avance.debut} onChange={(debut) => onAvance({ ...avance, debut })} />
                    <span className="text-muted">—</span>
                    <ChampTemps libelle="Fin" valeur={avance.fin} onChange={(fin) => onAvance({ ...avance, fin })} />
                  </div>
                  <p className={clsx("mt-2 text-[12px]", erreurExtrait ? "text-accent-texte" : "text-muted")}>
                    {erreurExtrait ?? "Laissez vide pour garder le média entier. Format : 1:30 ou 1:02:30."}
                  </p>
                </>
              )}
            </div>

            {video && (
              <div>
                <Etiquette className="mb-2 flex items-center gap-1.5">
                  <Captions size={12} /> Sous-titres intégrés
                </Etiquette>
                {langues.length === 0 ? (
                  <p className="text-[12px] text-muted2">Aucun sous-titre fourni par la source.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {langues.map((l) => {
                        const choisi = avance.sousTitres.includes(l);
                        return (
                          <Puce
                            key={l}
                            actif={choisi}
                            disabled={!choisi && avance.sousTitres.length >= 5}
                            onClick={() =>
                              onAvance({
                                ...avance,
                                sousTitres: choisi ? avance.sousTitres.filter((x) => x !== l) : [...avance.sousTitres, l],
                              })
                            }
                            className="font-sans"
                          >
                            {nomLangue(l)}
                            {nomLangue(l) !== l && <span className="ml-1.5 font-mono text-[10px] opacity-60">{l}</span>}
                          </Puce>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[12px] text-muted">Jusqu&apos;à cinq langues.</p>
                  </>
                )}
              </div>
            )}

            {!video && (
              <div>
                <Etiquette className="mb-2 flex items-center gap-1.5">
                  <ImageIcon size={12} /> Métadonnées
                </Etiquette>
                <Case coche={avance.pochette} onChange={(pochette) => onAvance({ ...avance, pochette })}>
                  <span className="text-[13px]">
                    Intégrer la pochette
                    {!AVEC_POCHETTE.includes(format) && (
                      <span className="text-muted"> — non disponible en {format.toUpperCase()}</span>
                    )}
                  </span>
                </Case>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function rang(langue: string) {
  const base = langue.split("-")[0];
  return base === "fr" ? 0 : base === "en" ? 1 : 2;
}

function ChampTemps({ libelle, valeur, onChange }: { libelle: string; valeur: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center rounded-md border border-border bg-s2 focus-within:border-accent transition-colors">
      <span className="pl-3 text-[12px] text-muted">{libelle}</span>
      <input
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0:00"
        inputMode="numeric"
        className="w-20 bg-transparent px-2.5 py-2 font-mono text-[13px] outline-none placeholder:text-muted"
      />
    </label>
  );
}
