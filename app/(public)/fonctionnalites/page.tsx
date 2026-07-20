"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Calendar,
  Check,
  FileText,
  Globe,
  Layout,
  Lock,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";

import { CTASection } from "../_sections/CTASection";

/* ────────────────────────────── Données ────────────────────────────── */

const STATS = [
  { value: "160+", label: "Jobboards connectés" },
  { value: "40%", label: "De temps gagné" },
  { value: "500+", label: "Entreprises clientes" },
  { value: "10K+", label: "Recrutements réussis" },
];

const recruteurFeatures = [
  {
    icon: Layout,
    title: "Tableau Kanban interactif",
    description:
      "Visualisez et gérez vos candidatures en temps réel avec un système de glisser-déposer intuitif.",
    benefits: [
      "Glisser-déposer pour changer les statuts",
      "Vue d'ensemble instantanée",
      "Filtres par poste, date, tags",
      "Export des données en un clic",
    ],
  },
  {
    icon: Globe,
    title: "Multi-diffusion sur 160+ jobboards",
    description:
      "Publiez vos offres simultanément sur plus de 160 sites d'emploi majeurs en un seul clic.",
    benefits: [
      "Indeed, LinkedIn, Monster, Glassdoor",
      "Sites spécialisés par secteur",
      "Distribution internationale",
      "Suivi des performances par source",
    ],
  },
  {
    icon: Users,
    title: "Collaboration d'équipe",
    description:
      "Travaillez à plusieurs sur vos recrutements avec un système de permissions granulaires.",
    benefits: [
      "Gestion des rôles et permissions",
      "Commentaires et notes internes",
      "Notifications en temps réel",
      "Historique des actions",
    ],
  },
  {
    icon: BarChart3,
    title: "Statistiques détaillées",
    description:
      "Analysez les performances de vos campagnes avec des tableaux de bord personnalisables.",
    benefits: [
      "Taux de conversion par source",
      "Temps moyen de recrutement",
      "ROI des campagnes",
      "Rapports exportables",
    ],
  },
  {
    icon: FileText,
    title: "Templates d'offres",
    description:
      "Créez des offres professionnelles en quelques minutes avec des modèles personnalisables.",
    benefits: [
      "Bibliothèque de templates",
      "Éditeur visuel WYSIWYG",
      "Branding personnalisé",
      "Sauvegarde automatique",
    ],
  },
  {
    icon: Search,
    title: "CVthèque & recherche avancée",
    description:
      "Accédez à une base de candidats qualifiés avec des filtres puissants pour trouver le bon profil.",
    benefits: [
      "Filtres par compétences et localisation",
      "Recherche par mots-clés",
      "Tri par pertinence",
      "Alertes nouveaux profils",
    ],
  },
];

const candidatFeatures = [
  {
    icon: UserCheck,
    title: "Profil professionnel complet",
    description:
      "Créez un profil détaillé qui met en valeur vos compétences, expériences et formations.",
    benefits: [
      "CV structuré et optimisé",
      "Portfolio de projets",
      "Certifications et diplômes",
      "Visibilité contrôlée",
    ],
  },
  {
    icon: FileText,
    title: "Générateur de CV moderne",
    description:
      "Créez des CV professionnels avec nos modèles élégants, exportables en PDF haute qualité.",
    benefits: [
      "Plusieurs designs professionnels",
      "Export PDF haute qualité",
      "Personnalisation des couleurs",
      "Mise à jour en temps réel",
    ],
  },
  {
    icon: Target,
    title: "Recherche d'offres intelligente",
    description:
      "Trouvez les opportunités qui vous correspondent vraiment grâce aux recommandations personnalisées.",
    benefits: [
      "Recommandations selon votre profil",
      "Filtres multicritères",
      "Recherche géolocalisée",
      "Suggestions automatiques",
    ],
  },
  {
    icon: Bell,
    title: "Alertes emploi personnalisées",
    description:
      "Recevez les nouvelles offres correspondant à vos critères directement par email.",
    benefits: [
      "Alertes en temps réel",
      "Critères personnalisables",
      "Fréquence ajustable",
      "Plusieurs alertes en parallèle",
    ],
  },
  {
    icon: Calendar,
    title: "Suivi des candidatures",
    description:
      "Visualisez l'état de toutes vos candidatures sur un tableau de bord clair et gardez le contrôle.",
    benefits: [
      "Timeline des candidatures",
      "Rappels d'actions",
      "Historique complet",
      "Notes personnelles",
    ],
  },
  {
    icon: MessageSquare,
    title: "Messagerie intégrée",
    description:
      "Échangez directement avec les recruteurs et planifiez vos entretiens en toute sécurité.",
    benefits: [
      "Messagerie en temps réel",
      "Partage de documents",
      "Notifications instantanées",
      "Historique des conversations",
    ],
  },
];

const platformFeatures = [
  {
    icon: Lock,
    title: "Sécurité & confidentialité",
    description:
      "Vos données sont chiffrées et hébergées en conformité avec le RGPD.",
  },
  {
    icon: Zap,
    title: "Performance optimale",
    description:
      "Interface rapide et responsive, accessible depuis n'importe quel appareil.",
  },
  {
    icon: Settings,
    title: "API & intégrations",
    description:
      "Connectez Ylsix à vos outils existants (SIRH, ATS, CRM) via notre API REST documentée.",
  },
  {
    icon: TrendingUp,
    title: "Mises à jour continues",
    description:
      "De nouvelles fonctionnalités chaque mois, guidées par vos retours d'usage.",
  },
];

type Audience = "recruteur" | "candidat";

const AUDIENCES: { id: Audience; label: string; heading: string; sub: string }[] = [
  {
    id: "recruteur",
    label: "Pour les recruteurs",
    heading: "Recrutez plus vite, et mieux",
    sub: "Tout ce qu'il faut pour piloter vos recrutements de la publication à l'embauche.",
  },
  {
    id: "candidat",
    label: "Pour les candidats",
    heading: "Décrochez le poste qui vous ressemble",
    sub: "Tous les outils pour structurer votre recherche et vous démarquer auprès des recruteurs.",
  },
];

/* ────────────────────────── Mockups (CSS pur) ────────────────────────── */

const KANBAN = [
  { col: "Nouveaux", tone: "var(--y-ink-3)", cards: ["Awa K. · Dév Full-stack", "Moussa D. · Data"] },
  { col: "Entretien", tone: "var(--y-primary-700)", cards: ["Fatou S. · Product", "Yao B. · Commercial"] },
  { col: "Offre", tone: "var(--y-success)", cards: ["Ines T. · UX Designer"] },
];

function KanbanMock() {
  return (
    <div
      className="rounded-3xl p-4 md:p-5"
      style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
    >
      <div className="grid grid-cols-3 gap-3">
        {KANBAN.map((c) => (
          <div key={c.col} className="rounded-2xl p-3" style={{ background: "var(--y-bg-soft)" }}>
            <div className="flex items-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: c.tone }} />
              <span
                className="text-[10px] font-medium uppercase tracking-wider truncate"
                style={{ color: "var(--y-ink-3)" }}
              >
                {c.col}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {c.cards.map((card, i) => (
                <div
                  key={card}
                  className="rounded-xl p-2.5"
                  style={{
                    background: "var(--y-bg-pure)",
                    boxShadow: "var(--y-shadow-sm)",
                    transform: i === 0 && c.col === "Entretien" ? "rotate(-1.5deg)" : undefined,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-lg shrink-0 text-white text-[10px] font-semibold flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
                    >
                      {card.charAt(0)}
                    </span>
                    <span
                      className="text-[10px] leading-tight line-clamp-2"
                      style={{ color: "var(--y-ink-2)" }}
                    >
                      {card}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const BOARDS = ["LinkedIn", "Indeed", "Monster", "Glassdoor", "Jumia", "Emploi.ci", "APEC", "Welcome", "+152"];

function DiffusionMock() {
  return (
    <div
      className="rounded-3xl p-5 md:p-6"
      style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 rounded-full" style={{ background: "var(--y-success)" }} />
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: "var(--y-ink-3)" }}
        >
          Diffusion en cours
        </span>
      </div>
      <div className="text-sm font-medium mb-1" style={{ color: "var(--y-ink)" }}>
        Développeur Full-stack — CDI
      </div>
      <div className="text-xs mb-5" style={{ color: "var(--y-ink-3)" }}>
        Publié sur 160 plateformes en 1 clic
      </div>
      <div className="flex flex-wrap gap-2">
        {BOARDS.map((b, i) => (
          <span
            key={b}
            className="text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{
              background: i === BOARDS.length - 1 ? "var(--y-primary-50)" : "var(--y-bg-soft)",
              color: i === BOARDS.length - 1 ? "var(--y-primary-700)" : "var(--y-ink-2)",
            }}
          >
            {b}
          </span>
        ))}
      </div>
      <div className="mt-5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--y-bg-soft)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: "82%", background: "linear-gradient(90deg, var(--y-primary), var(--y-primary-700))" }}
        />
      </div>
    </div>
  );
}

const SOURCES = [
  { name: "LinkedIn", pct: 86 },
  { name: "Indeed", pct: 64 },
  { name: "Site carrière", pct: 47 },
  { name: "Cooptation", pct: 29 },
];

function StatsMock() {
  return (
    <div
      className="rounded-3xl p-5 md:p-6"
      style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs" style={{ color: "var(--y-ink-3)" }}>
            Candidatures ce mois
          </div>
          <div className="text-3xl font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
            1 248
          </div>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{ background: "rgba(22,163,74,0.10)", color: "var(--y-success)" }}
        >
          +24%
        </span>
      </div>
      <div className="flex flex-col gap-3.5">
        {SOURCES.map((s) => (
          <div key={s.name}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: "var(--y-ink-2)" }}>
                {s.name}
              </span>
              <span className="text-xs font-medium" style={{ color: "var(--y-ink-3)" }}>
                {s.pct}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--y-bg-soft)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${s.pct}%`,
                  background: "linear-gradient(90deg, var(--y-primary), var(--y-primary-700))",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HIGHLIGHTS = [
  {
    kicker: "Pilotage",
    title: "Un Kanban qui suit vraiment votre process",
    desc: "Chaque candidature avance d'une colonne à l'autre d'un simple glisser-déposer. Votre équipe voit l'état du pipeline en un coup d'œil, sans tableur ni relance manuelle.",
    points: [
      "Colonnes personnalisables selon votre process",
      "Notes et évaluations partagées par candidat",
      "Relances automatiques aux étapes clés",
    ],
    Mock: KanbanMock,
  },
  {
    kicker: "Visibilité",
    title: "Une offre, 160+ jobboards, un seul clic",
    desc: "Rédigez votre annonce une fois : Ylsix la diffuse simultanément sur les plateformes généralistes, spécialisées et locales, puis consolide toutes les candidatures au même endroit.",
    points: [
      "Généralistes, spécialisées et jobboards africains",
      "Candidatures centralisées, sans doublon",
      "Performance mesurée source par source",
    ],
    Mock: DiffusionMock,
  },
  {
    kicker: "Décision",
    title: "Des chiffres qui orientent vos arbitrages",
    desc: "Coût par recrutement, délai moyen, canaux les plus rentables : les tableaux de bord transforment votre activité en décisions concrètes, exportables pour vos comités.",
    points: [
      "Taux de conversion à chaque étape",
      "Délai moyen d'embauche par poste",
      "Exports CSV et rapports planifiés",
    ],
    Mock: StatsMock,
  },
];

/* ──────────────────────────────── Page ──────────────────────────────── */

export default function FonctionnalitesPage() {
  const [audience, setAudience] = useState<Audience>("recruteur");
  const active = AUDIENCES.find((a) => a.id === audience)!;
  const features = audience === "recruteur" ? recruteurFeatures : candidatFeatures;

  return (
    <div className="pb-24" style={{ background: "var(--y-bg)" }}>
      {/* ── 1. Héros ── */}
      <section className="pt-28 pb-4 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-stretch gap-8 lg:gap-0">
          <div
            className="relative overflow-hidden rounded-[32px] p-8 md:p-12 lg:pr-24 flex flex-col justify-center"
            style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
          >
            <div
              className="yl-orb"
              style={{ width: 360, height: 360, top: -120, left: -100, background: "rgba(255,255,255,0.14)" }}
            />
            <div
              className="yl-stripes absolute opacity-70"
              style={{ width: 120, height: 120, bottom: 28, right: 28, borderRadius: 20, filter: "opacity(0.5)" }}
            />

            <div className="relative z-10">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
              >
                <Sparkles size={13} /> La plateforme de recrutement Ylsix
              </span>

              <h1
                className="text-4xl md:text-5xl lg:text-[3.2rem] font-semibold leading-[1.05] tracking-[-0.035em]"
                style={{ color: "#fff" }}
              >
                Tout ce qu&apos;il faut pour recruter.
                <br />
                <span style={{ color: "#e0d6ff" }}>Et pour être recruté.</span>
              </h1>

              <p
                className="mt-5 text-base md:text-lg leading-relaxed max-w-lg"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                Multi-diffusion, suivi des candidatures, CVthèque, statistiques : une
                seule interface pour l&apos;ensemble de votre process de recrutement.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/auth/recruteur/register"
                  className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                  style={{ background: "#fff", color: "var(--y-primary-700)", boxShadow: "var(--y-shadow-lg)" }}
                >
                  Essayer gratuitement <ArrowRight size={16} />
                </Link>
                <Link
                  href="/tarifs"
                  className="h-12 px-6 rounded-full text-sm font-medium flex items-center transition-colors"
                  style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.35)" }}
                >
                  Voir les tarifs
                </Link>
              </div>

              <p className="mt-4 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                14 jours d&apos;essai · sans carte bancaire · sans engagement
              </p>
            </div>
          </div>

          <div className="relative lg:-ml-12 flex items-center">
            <div className="w-full lg:rotate-1">
              <KanbanMock />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Chiffres ── */}
      <section className="mt-16 md:mt-20 px-6 md:px-12 lg:px-20">
        <div
          className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-8"
          style={{ borderTop: "1px solid var(--y-line)", borderBottom: "1px solid var(--y-line)" }}
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              viewport={{ once: true }}
              className="py-8 px-4 text-center lg:border-l lg:first:border-l-0"
              style={{ borderColor: "var(--y-line)" }}
            >
              <div
                className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]"
                style={{ color: "var(--y-primary-700)" }}
              >
                {s.value}
              </div>
              <div className="mt-1.5 text-sm" style={{ color: "var(--y-ink-3)" }}>
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── 3. Fonctionnalités phares (blocs alternés) ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl mb-16"
          >
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Les essentiels
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--y-ink)" }}
            >
              Trois briques qui changent le quotidien
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
              Le reste de la plateforme s&apos;articule autour de ces trois usages,
              conçus avec des recruteurs en poste.
            </p>
          </motion.div>

          <div className="flex flex-col gap-20 md:gap-28">
            {HIGHLIGHTS.map((h, i) => (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                viewport={{ once: true, margin: "-80px" }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : undefined}>
                  <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
                    {h.kicker}
                  </p>
                  <h3
                    className="mt-3 text-2xl md:text-3xl font-semibold tracking-[-0.025em]"
                    style={{ color: "var(--y-ink)" }}
                  >
                    {h.title}
                  </h3>
                  <p className="mt-4 text-base leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
                    {h.desc}
                  </p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {h.points.map((p) => (
                      <li key={p} className="flex items-start gap-3">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                        >
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span className="text-sm" style={{ color: "var(--y-ink-2)" }}>
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={i % 2 === 1 ? "lg:order-1" : undefined}>
                  <h.Mock />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Toggle + grille de fonctionnalités ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-12">
            <div
              role="tablist"
              aria-label="Choisir le profil"
              className="inline-flex p-1 rounded-full"
              style={{ background: "var(--y-bg-soft)" }}
            >
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  role="tab"
                  aria-selected={audience === a.id}
                  onClick={() => setAudience(a.id)}
                  className="relative h-10 px-5 sm:px-7 rounded-full text-sm font-medium transition-colors"
                  style={{ color: audience === a.id ? "#fff" : "var(--y-ink-3)" }}
                >
                  {audience === a.id && (
                    <motion.span
                      layoutId="audience-pill"
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)",
                        boxShadow: "var(--y-shadow-violet)",
                      }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 whitespace-nowrap">{a.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-8 max-w-2xl"
              >
                <h2
                  className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
                  style={{ color: "var(--y-ink)" }}
                >
                  {active.heading}
                </h2>
                <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
                  {active.sub}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={audience}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {features.map((f) => (
                <div
                  key={f.title}
                  className="flex flex-col h-full rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                  style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                  >
                    <f.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--y-ink-3)" }}>
                    {f.description}
                  </p>
                  <ul
                    className="mt-5 pt-5 flex flex-col gap-2.5"
                    style={{ borderTop: "1px solid var(--y-line)" }}
                  >
                    {f.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2.5">
                        <Check
                          size={14}
                          strokeWidth={3}
                          className="shrink-0 mt-0.5"
                          style={{ color: "var(--y-primary-700)" }}
                        />
                        <span className="text-[13px]" style={{ color: "var(--y-ink-2)" }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── 5. Plateforme (bande sombre) ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <div
          className="relative overflow-hidden max-w-7xl mx-auto rounded-[32px] px-8 md:px-12 py-14 md:py-20"
          style={{ background: "var(--y-bg-ink)" }}
        >
          <div
            className="yl-orb"
            style={{ width: 420, height: 420, bottom: -200, right: -120, background: "rgba(165,144,255,0.22)" }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="relative z-10 max-w-2xl mb-12"
          >
            <p className="text-sm font-semibold" style={{ color: "#c9b8ff" }}>
              Sous le capot
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "#fff" }}
            >
              Une plateforme fiable et sécurisée
            </h2>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.7)" }}>
              L&apos;infrastructure sur laquelle reposent vos recrutements — et vos
              données candidats.
            </p>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {platformFeatures.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#c9b8ff" }}
                >
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-semibold tracking-tight" style={{ color: "#fff" }}>
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. CTA final ── */}
      <CTASection />
    </div>
  );
}
