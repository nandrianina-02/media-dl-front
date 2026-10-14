import clsx from "clsx";
import { AlertCircle, Check } from "lucide-react";

/** Libellé de section, dans le style monospace de MediaDL. */
export function Etiquette({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={clsx("block font-mono text-[11px] uppercase tracking-[0.08em] text-muted", className)}>
      {children}
    </span>
  );
}

export function Puce({
  actif,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { actif: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={actif}
      className={clsx(
        "h-9 px-3 rounded-md border font-mono text-[12px] transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        actif
          ? "border-accent bg-accent/10 text-accent-texte"
          : "border-border bg-s2 text-muted2 hover:text-text hover:border-muted",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Case({
  coche,
  onChange,
  children,
  className,
}: {
  coche: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={clsx("flex items-center gap-2.5 cursor-pointer select-none", className)}>
      <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <span
        aria-hidden
        className={clsx(
          "w-4 h-4 shrink-0 rounded-[3px] border flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent",
          coche ? "bg-accent border-accent" : "border-muted bg-transparent",
        )}
      >
        {coche && <Check size={11} strokeWidth={3} className="text-white" />}
      </span>
      {children}
    </label>
  );
}

/** Erreur persistante : elle reste affichée tant que la cause n'a pas changé. */
export function Alerte({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="alert"
      className={clsx(
        "animate-fade flex gap-3 items-start border border-accent/40 bg-accent/[0.06] rounded-md px-4 py-3 text-[13px] leading-relaxed",
        className,
      )}
    >
      <AlertCircle size={16} className="text-accent-texte shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
