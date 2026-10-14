"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { ArrowDownToLine, History, Settings2, RefreshCw } from "lucide-react";
import { useFile } from "@/lib/file";

const LIENS = [
  { href: "/", libelle: "Télécharger", icone: ArrowDownToLine },
  { href: "/historique", libelle: "Historique", icone: History },
  { href: "/reglages", libelle: "Réglages", icone: Settings2 },
];

export default function Entete() {
  const chemin = usePathname();
  const { enLigne, verifier, actives, service } = useFile();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="MediaDL, accueil">
          <span className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <ArrowDownToLine size={15} strokeWidth={2.5} className="text-white" />
          </span>
          <span className="font-extrabold text-[15px] tracking-tight">MediaDL</span>
          {service && <span className="font-mono text-[10px] text-muted hidden sm:inline">v{service.version}</span>}
        </Link>

        <nav className="flex items-center gap-1 h-full" aria-label="Navigation principale">
          {LIENS.map(({ href, libelle, icone: Icone }) => {
            const actif = href === "/" ? chemin === "/" : chemin.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={actif ? "page" : undefined}
                className={clsx(
                  "relative h-full flex items-center gap-2 px-2.5 text-[13px] transition-colors",
                  actif ? "text-text" : "text-muted2 hover:text-text",
                )}
              >
                <Icone size={15} />
                <span className="hidden sm:inline">{libelle}</span>
                {href === "/" && actives > 0 && (
                  <span className="font-mono text-[10px] leading-none px-1.5 py-1 rounded bg-accent/15 text-accent-texte">
                    {actives}
                  </span>
                )}
                {actif && <span className="absolute left-2 right-2 -bottom-px h-0.5 bg-accent" />}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={verifier}
          title="Vérifier l'état du serveur"
          className="ml-auto flex items-center gap-2 font-mono text-[11px] text-muted2 hover:text-text transition-colors"
        >
          <span
            className={clsx(
              "w-1.5 h-1.5 rounded-full",
              enLigne === null && "bg-muted pulsation",
              enLigne === true && "bg-green",
              enLigne === false && "bg-accent",
            )}
          />
          <span className="hidden md:inline">
            {enLigne === null ? "Vérification" : enLigne ? "Serveur en ligne" : "Serveur hors ligne"}
          </span>
          <RefreshCw size={11} className={clsx(enLigne === null && "animate-spin")} />
        </button>
      </div>
    </header>
  );
}
