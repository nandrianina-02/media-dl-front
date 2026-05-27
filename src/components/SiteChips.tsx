interface Props {
  sites: string[];
}

export default function SiteChips({ sites }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {sites.map((s) => (
        <span
          key={s}
          className="font-mono text-[10px] px-2.5 py-1 bg-s2 border border-border rounded-full text-muted2"
        >
          {s}
        </span>
      ))}
    </div>
  );
}
