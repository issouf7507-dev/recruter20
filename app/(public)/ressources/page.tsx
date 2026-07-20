import Link from "next/link";
import {
  FileText,
  MessagesSquare,
  PenLine,
  Compass,
  ArrowRight,
  BookOpen,
  Clock,
  Sparkles,
  Bell,
  Briefcase,
} from "lucide-react";

import { GuideNav } from "./_components/GuideNav";

export const metadata = {
  title: "Ressources & conseils — Ylsix",
  description:
    "Guides concrets pour votre CV, vos entretiens, votre lettre de motivation et votre carrière.",
};

const SECTIONS = [
  {
    id: "cv",
    icon: FileText,
    kicker: "Le CV",
    title: "Rédiger un CV percutant",
    accent: "#a590ff",
    accentSoft: "var(--y-primary-50)",
    intro:
      "Un recruteur passe en moyenne moins de 30 secondes sur un CV. L'objectif : lui donner envie d'aller plus loin dès le premier coup d'œil.",
    retenir:
      "Un CV n'est pas une biographie : c'est un argumentaire de vente adapté à une offre précise.",
    tips: [
      "Placez vos expériences les plus récentes et pertinentes en haut.",
      "Quantifiez vos résultats : « +40 % de ventes », « 12 recrutements gérés ».",
      "Adaptez le CV à chaque offre en reprenant les mots-clés de l'annonce.",
      "Une seule page pour moins de 10 ans d'expérience, deux au maximum.",
      "Relisez-vous : une faute d'orthographe suffit à écarter une candidature.",
    ],
  },
  {
    id: "entretien",
    icon: MessagesSquare,
    kicker: "L'entretien",
    title: "Réussir vos entretiens",
    accent: "#d97706",
    accentSoft: "rgba(217,119,6,0.10)",
    intro:
      "L'entretien se prépare autant qu'il se vit. Anticiper les questions clés vous permet de répondre avec assurance et sincérité.",
    retenir:
      "Chaque réponse doit s'appuyer sur un exemple vécu : les faits convainquent, pas les adjectifs.",
    tips: [
      "Renseignez-vous sur l'entreprise, ses valeurs et son actualité récente.",
      "Préparez la question « Parlez-moi de vous » en 90 secondes maximum.",
      "Utilisez la méthode STAR (Situation, Tâche, Action, Résultat) pour vos exemples.",
      "Ayez 2 à 3 questions à poser au recruteur : cela montre votre intérêt.",
      "Terminez en résumant pourquoi vous êtes le bon profil pour le poste.",
    ],
  },
  {
    id: "lettre",
    icon: PenLine,
    kicker: "La lettre",
    title: "La lettre de motivation",
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.10)",
    intro:
      "Une bonne lettre ne répète pas le CV : elle raconte pourquoi vous et pourquoi cette entreprise. Structurée, elle se lit en une minute.",
    retenir:
      "Si votre lettre peut être envoyée telle quelle à une autre entreprise, elle est à réécrire.",
    tips: [
      "Vous (l'entreprise), Moi (votre valeur), Nous (le projet commun) : la structure gagnante.",
      "Personnalisez l'accroche : montrez que vous connaissez l'entreprise.",
      "Reliez chaque compétence à un besoin concret exprimé dans l'offre.",
      "Restez sous 250 mots : concision rime avec impact.",
      "Terminez par un appel clair à un entretien.",
    ],
  },
  {
    id: "carriere",
    icon: Compass,
    kicker: "La carrière",
    title: "Conseils carrière",
    accent: "#16a34a",
    accentSoft: "rgba(22,163,74,0.10)",
    intro:
      "Orientation, négociation salariale ou reconversion : les grandes décisions se préparent. Voici nos repères pour avancer sereinement.",
    retenir:
      "Une carrière se pilote : sans objectif à 3 ans, ce sont les opportunités qui décident à votre place.",
    tips: [
      "Fixez-vous un objectif à 3 ans et identifiez les compétences à acquérir.",
      "Négociez votre salaire en vous appuyant sur les grilles du marché.",
      "Entretenez votre réseau : la majorité des postes ne sont jamais publiés.",
      "Formez-vous en continu : une compétence rare fait la différence.",
      "Créez une alerte emploi pour ne manquer aucune opportunité pertinente.",
    ],
  },
];

const TOTAL_TIPS = SECTIONS.reduce((n, s) => n + s.tips.length, 0);

const META = [
  { icon: BookOpen, label: `${SECTIONS.length} guides` },
  { icon: Sparkles, label: `${TOTAL_TIPS} conseils concrets` },
  { icon: Clock, label: "~12 min de lecture" },
];

const BRIDGES = [
  {
    icon: FileText,
    title: "Générez votre CV",
    desc: "Créez votre profil Ylsix et exportez un CV structuré en PDF, prêt à envoyer.",
    cta: "Créer mon profil",
    href: "/auth/candidat/register",
  },
  {
    icon: Bell,
    title: "Créez une alerte emploi",
    desc: "Recevez par email les nouvelles offres qui correspondent à vos critères.",
    cta: "Configurer une alerte",
    href: "/offres",
  },
  {
    icon: Briefcase,
    title: "Un doute sur votre projet ?",
    desc: "Nos conseillers répondent à vos questions sur votre orientation ou votre recherche.",
    cta: "Parler à un expert",
    href: "/contact",
  },
];

export default function RessourcesPage() {
  return (
    <div className="pb-24" style={{ background: "var(--y-bg)" }}>
      {/* ── Héros ── */}
      <div className="relative overflow-hidden pt-32 pb-14 px-6 md:px-12 lg:px-20">
        <div
          className="yl-orb"
          style={{ width: 460, height: 460, top: -180, right: -120, background: "rgba(165,144,255,0.28)" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
            Ressources candidats
          </p>
          <h1
            className="mt-3 text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em]"
            style={{ color: "var(--y-ink)" }}
          >
            On vous donne les clés pour décrocher le poste
          </h1>
          <p className="mt-5 text-base md:text-lg" style={{ color: "var(--y-ink-2)" }}>
            Des guides concrets et des stratégies éprouvées pour chaque étape de votre
            recherche.
          </p>

          <div className="mt-7 flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
            {META.map((m) => (
              <span
                key={m.label}
                className="inline-flex items-center gap-2 text-sm"
                style={{ color: "var(--y-ink-3)" }}
              >
                <m.icon size={15} style={{ color: "var(--y-primary-700)" }} />
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Sommaire sticky + guides ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 lg:gap-12 items-start">
        <GuideNav
          items={SECTIONS.map((s) => ({ id: s.id, title: s.title, accent: s.accent }))}
        />

        <div className="flex flex-col gap-6 min-w-0">
          {SECTIONS.map((s) => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-28 rounded-3xl p-7 md:p-10"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: s.accentSoft, color: s.accent }}
                >
                  <s.icon size={22} />
                </div>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: s.accent }}
                  >
                    {s.kicker}
                  </p>
                  <h2
                    className="mt-1 text-2xl md:text-3xl font-semibold tracking-[-0.02em]"
                    style={{ color: "var(--y-ink)" }}
                  >
                    {s.title}
                  </h2>
                </div>
              </div>

              <p className="mt-5 text-base leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
                {s.intro}
              </p>

              {/* À retenir */}
              <p
                className="mt-5 pl-4 py-1 text-[15px] font-medium leading-relaxed"
                style={{ borderLeft: `3px solid ${s.accent}`, color: "var(--y-ink)" }}
              >
                {s.retenir}
              </p>

              {/* Conseils numérotés */}
              <ol className="mt-7 flex flex-col">
                {s.tips.map((tip, i) => (
                  <li
                    key={tip}
                    className="flex items-start gap-4 py-4"
                    style={{ borderTop: i === 0 ? "none" : "1px solid var(--y-line)" }}
                  >
                    <span
                      className="text-xs font-mono font-semibold shrink-0 mt-0.5 tabular-nums"
                      style={{ color: s.accent }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15px] leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
                      {tip}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>

      {/* ── Passerelles produit ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-20">
        <h2
          className="text-2xl md:text-3xl font-semibold tracking-[-0.025em] text-center"
          style={{ color: "var(--y-ink)" }}
        >
          Mettez ces conseils en pratique
        </h2>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          {BRIDGES.map((b) => (
            <Link
              key={b.title}
              href={b.href}
              className="group flex flex-col h-full rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
              >
                <b.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: "var(--y-ink-3)" }}>
                {b.desc}
              </p>
              <span
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                style={{ color: "var(--y-primary-700)" }}
              >
                {b.cta} <ArrowRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── CTA bas de page ── */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 mt-12">
        <div
          className="relative overflow-hidden rounded-3xl p-8 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #4a3781 100%)" }}
        >
          <div
            className="yl-stripes absolute opacity-30"
            style={{ width: 140, height: 140, bottom: -40, right: 24, borderRadius: 24 }}
          />
          <div className="relative z-10">
            <h2
              className="text-2xl md:text-3xl font-semibold tracking-[-0.02em]"
              style={{ color: "#fff" }}
            >
              Prêt à passer à l&apos;action ?
            </h2>
            <p className="mt-2 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
              Mettez ces conseils en pratique : explorez les offres du moment.
            </p>
          </div>
          <Link
            href="/offres"
            className="relative z-10 h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 shrink-0 transition-transform hover:-translate-y-0.5"
            style={{ background: "#fff", color: "var(--y-primary-700)", boxShadow: "var(--y-shadow-lg)" }}
          >
            Voir les offres <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
