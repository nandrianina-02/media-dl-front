"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowDownToLine, ListMusic, LoaderCircle, MonitorPlay, WifiOff } from "lucide-react";
import Apercu, { ApercuChargement } from "@/components/Apercu";
import ChampLien from "@/components/ChampLien";
import FileTaches from "@/components/FileTaches";
import Options, { estVideo, type Avance } from "@/components/Options";
import { Alerte, Etiquette } from "@/components/ui";
import { ErreurApi, infos as lireInfos, type Format, type Infos } from "@/lib/api";
import { useFile } from "@/lib/file";
import { lireDuree } from "@/lib/format";
import { useReglages } from "@/lib/reglages";
import { detecterSite, SITES } from "@/lib/sites";

const AVANCE_VIDE: Avance = { debut: "", fin: "", sousTitres: [], pochette: true };

export default function Accueil() {
  const { ajouter, enLigne } = useFile();
  const { reglages, charge } = useReglages();

  const [saisie, setSaisie] = useState("");
  const [modeListe, setModeListe] = useState(false);
  const [infos, setInfos] = useState<Infos | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreurInfos, setErreurInfos] = useState<string | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());

  const [format, setFormat] = useState<Format>("mp3");
  const [qualite, setQualite] = useState("192");
  const [avance, setAvance] = useState<Avance>(AVANCE_VIDE);

  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const champRef = useRef<HTMLDivElement>(null);

  // Les réglages ne sont lisibles qu'une fois dans le navigateur.
  useEffect(() => {
    if (!charge) return;
    setFormat(reglages.format);
    setQualite(estVideo(reglages.format) ? reglages.qualiteVideo : reglages.qualiteAudio);
    setAvance((a) => ({ ...a, pochette: reglages.pochette }));
  }, [charge]); // eslint-disable-line react-hooks/exhaustive-deps

  const site = detecterSite(saisie);

  // Aperçu : attendu une demi-seconde après la dernière frappe, la requête
  // précédente annulée, pour ne pas interroger le site à chaque caractère.
  useEffect(() => {
    setErreurInfos(null);
    setErreurEnvoi(null);
    if (!site) {
      setInfos(null);
      setChargement(false);
      return;
    }
    const controle = new AbortController();
    setChargement(true);
    const minuterie = setTimeout(async () => {
      try {
        const resultat = await lireInfos(saisie.trim(), modeListe, controle.signal);
        setInfos(resultat);
        setSelection(new Set(resultat.type === "liste" ? resultat.entrees.map((e) => e.index) : []));
        setAvance((a) => ({ ...a, sousTitres: [] }));
      } catch (e) {
        if (controle.signal.aborted) return;
        setInfos(null);
        setErreurInfos(e instanceof ErreurApi ? e.message : "L'aperçu n'a pas pu être chargé.");
      } finally {
        if (!controle.signal.aborted) setChargement(false);
      }
    }, 500);
    return () => {
      clearTimeout(minuterie);
      controle.abort();
    };
  }, [saisie, modeListe]); // eslint-disable-line react-hooks/exhaustive-deps

  function changerSaisie(valeur: string) {
    setSaisie(valeur);
    setModeListe(false);
  }

  function changerFormat(f: Format) {
    if (estVideo(f) !== estVideo(format)) setQualite(estVideo(f) ? reglages.qualiteVideo : reglages.qualiteAudio);
    setFormat(f);
  }

  const liste = infos?.type === "liste";
  const extrait = useMemo(() => {
    if (liste) return { debut: null, fin: null, erreur: null };
    const debut = lireDuree(avance.debut);
    const fin = lireDuree(avance.fin);
    const duree = infos?.type === "media" ? infos.duree : null;
    let erreur: string | null = null;
    if (Number.isNaN(debut) || Number.isNaN(fin)) erreur = "Format attendu : 1:30 ou 1:02:30.";
    else if (debut != null && fin != null && fin <= debut) erreur = "La fin doit suivre le début.";
    else if (duree && debut != null && debut >= duree) erreur = "Le début dépasse la durée du média.";
    return { debut, fin, erreur };
  }, [avance.debut, avance.fin, infos, liste]);

  const direct = infos?.type === "media" && infos.direct;
  const desactive =
    !site || envoi || chargement || direct || !!extrait.erreur || (liste && selection.size === 0) || enLigne === false;

  async function telecharger() {
    if (desactive) return;
    setEnvoi(true);
    setErreurEnvoi(null);
    try {
      const tous = infos?.type === "liste" && selection.size === infos.entrees.length;
      await ajouter({
        url: infos?.url ?? saisie.trim(),
        format,
        qualite,
        liste,
        titre: infos?.titre || undefined,
        debut: extrait.debut,
        fin: extrait.fin,
        sous_titres: estVideo(format) ? avance.sousTitres : [],
        pochette: avance.pochette,
        elements: liste && !tous ? Array.from(selection).sort((a, b) => a - b) : [],
      });
      // Le lien est vidé pour enchaîner : la tâche vit maintenant dans la file.
      setSaisie("");
      setModeListe(false);
      setAvance((a) => ({ ...AVANCE_VIDE, pochette: a.pochette }));
      champRef.current?.querySelector("input")?.focus();
    } catch (e) {
      setErreurEnvoi(e instanceof ErreurApi ? e.message : "Le téléchargement n'a pas pu être lancé.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-10 lg:gap-14">
      <div className="min-w-0">
        <header className="animate-rise mb-8">
          <Etiquette className="mb-3">Téléchargeur</Etiquette>
          <h1 className="text-3xl sm:text-[2.6rem] font-extrabold tracking-tight leading-[1.08]">
            Collez un lien,
            <br />
            récupérez <span className="text-accent">le fichier</span>.
          </h1>
          <p className="mt-4 text-muted2 text-[15px] max-w-xl leading-relaxed">
            Audio jusqu&apos;à 320 kb/s ou sans perte, vidéo jusqu&apos;en 4K, playlists entières dans une seule archive.
          </p>
        </header>

        <section className="animate-rise stagger-1 border border-border rounded-md bg-surface p-4 sm:p-5 space-y-5">
          <div ref={champRef}>
            <ChampLien valeur={saisie} onChange={changerSaisie} onValider={telecharger} />
          </div>

          {enLigne === false && (
            <Alerte>
              <span className="flex items-center gap-2 font-medium">
                <WifiOff size={14} /> Serveur injoignable
              </span>
              <span className="text-muted2">
                Il redémarre peut-être après une période d&apos;inactivité. Réessayez dans une minute.
              </span>
            </Alerte>
          )}

          {chargement && <ApercuChargement />}
          {!chargement && erreurInfos && <Alerte>{erreurInfos}</Alerte>}
          {!chargement && infos && (
            <>
              {infos.choix_liste && (
                <ChoixListe modeListe={false} onChange={setModeListe} />
              )}
              {modeListe && infos.type === "liste" && <ChoixListe modeListe onChange={setModeListe} />}
              <Apercu infos={infos} selection={selection} onSelection={setSelection} />
            </>
          )}

          <Options
            format={format}
            qualite={qualite}
            onFormat={changerFormat}
            onQualite={setQualite}
            hauteurs={infos?.type === "media" ? infos.hauteurs : []}
            languesDispo={infos?.type === "media" ? infos.sous_titres : []}
            liste={liste}
            avance={avance}
            onAvance={setAvance}
            erreurExtrait={extrait.erreur}
          />

          {erreurEnvoi && <Alerte>{erreurEnvoi}</Alerte>}

          <button
            onClick={telecharger}
            disabled={desactive}
            className={clsx(
              "w-full h-12 rounded-md font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-colors",
              desactive ? "bg-s3 text-muted cursor-not-allowed" : "bg-accent text-white hover:brightness-110",
            )}
          >
            {envoi ? <LoaderCircle size={17} className="animate-spin" /> : <ArrowDownToLine size={17} />}
            {liste ? `Télécharger ${selection.size} élément${selection.size > 1 ? "s" : ""}` : "Télécharger"}
          </button>
        </section>

        <p className="animate-rise stagger-2 mt-6 font-mono text-[11px] text-muted leading-relaxed">
          {SITES.map((s) => s.nom).join(" · ")}
        </p>
      </div>

      <aside className="animate-rise stagger-3 lg:sticky lg:top-24 lg:self-start">
        <FileTaches />
      </aside>
    </div>
  );
}

function ChoixListe({ modeListe, onChange }: { modeListe: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="animate-fade flex flex-col sm:flex-row sm:items-center gap-3 justify-between border border-border rounded-md px-4 py-3 bg-s2/50">
      <p className="text-[13px] text-muted2">
        {modeListe ? "Vous téléchargez la playlist entière." : "Ce lien fait partie d'une playlist."}
      </p>
      <div className="flex gap-1.5 shrink-0">
        <button
          onClick={() => onChange(false)}
          className={clsx(
            "h-8 px-3 rounded-md border text-[12px] flex items-center gap-1.5 transition-colors",
            !modeListe ? "border-accent bg-accent/10 text-accent-texte" : "border-border text-muted2 hover:text-text",
          )}
        >
          <MonitorPlay size={13} /> Cette vidéo
        </button>
        <button
          onClick={() => onChange(true)}
          className={clsx(
            "h-8 px-3 rounded-md border text-[12px] flex items-center gap-1.5 transition-colors",
            modeListe ? "border-accent bg-accent/10 text-accent-texte" : "border-border text-muted2 hover:text-text",
          )}
        >
          <ListMusic size={13} /> Toute la playlist
        </button>
      </div>
    </div>
  );
}
