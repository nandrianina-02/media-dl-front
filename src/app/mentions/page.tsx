import type { Metadata } from "next";
import { Copyright, Database, Gauge, Scale } from "lucide-react";
import { Etiquette } from "@/components/ui";

export const metadata: Metadata = { title: "Conditions et droits d'auteur" };

const SECTIONS = [
  {
    icone: Copyright,
    titre: "Droits d'auteur",
    texte: [
      "MediaDL est un outil technique. Vous êtes seul responsable de ce que vous téléchargez et de l'usage que vous en faites.",
      "Ne téléchargez que des contenus dont vous détenez les droits, qui sont sous licence libre, ou que la loi de votre pays vous autorise à copier pour un usage privé. La plupart des plateformes interdisent le téléchargement dans leurs conditions d'utilisation.",
      "Les ayants droit qui constatent un usage abusif peuvent écrire à l'exploitant du service : les fichiers ne sont pas conservés, mais l'accès peut être restreint.",
    ],
  },
  {
    icone: Database,
    titre: "Données conservées",
    texte: [
      "Aucun compte n'est demandé. Votre navigateur reçoit un identifiant aléatoire qui sépare votre file et votre historique de ceux des autres visiteurs.",
      "Le serveur garde, pour chaque téléchargement, le lien, le titre, le format et l'état, pendant 30 jours au plus. Les fichiers produits sont supprimés après un court délai. Vos réglages restent dans votre navigateur.",
      "L'adresse IP sert uniquement à limiter le nombre de demandes ; elle n'est pas enregistrée dans l'historique.",
    ],
  },
  {
    icone: Gauge,
    titre: "Limites du service",
    texte: [
      "Pour que le service reste disponible pour tous, le nombre de téléchargements simultanés, la durée des médias, la taille des fichiers et le nombre d'éléments par playlist sont limités. Les directs ne sont pas pris en charge.",
      "Les contenus privés, soumis à une limite d'âge, ou réservés à certains pays ne peuvent pas être récupérés.",
    ],
  },
  {
    icone: Scale,
    titre: "Garantie",
    texte: [
      "Le service est fourni tel quel, sans garantie de disponibilité. Les sites sources changent régulièrement leur fonctionnement : un lien peut cesser de fonctionner du jour au lendemain.",
    ],
  },
];

export default function Mentions() {
  return (
    <article className="max-w-3xl">
      <header className="animate-rise mb-10">
        <Etiquette className="mb-3">Informations</Etiquette>
        <h1 className="text-3xl font-extrabold tracking-tight">Conditions et droits d&apos;auteur</h1>
      </header>
      <div className="divide-y divide-border border-y border-border">
        {SECTIONS.map(({ icone: Icone, titre, texte }, i) => (
          <section key={titre} className={`animate-rise stagger-${i + 1} py-7 grid sm:grid-cols-[200px_1fr] gap-3 sm:gap-8`}>
            <h2 className="text-[14px] font-semibold flex items-center gap-2">
              <Icone size={15} className="text-accent-texte" /> {titre}
            </h2>
            <div className="space-y-3 text-[14px] text-muted2 leading-relaxed">
              {texte.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
