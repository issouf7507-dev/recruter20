"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  BookOpen,
  Users,
  Megaphone,
  Quote,
  ShieldCheck,
  HeartHandshake,
  Sparkles,
} from "lucide-react";

const CHIFFRES = [
  { value: "500+", label: "Entreprises clientes" },
  { value: "38K+", label: "Candidats inscrits" },
  { value: "160+", label: "Jobboards connectés" },
  { value: "10K+", label: "Recrutements réussis" },
];

const METIERS = [
  {
    icon: Building2,
    title: "ATS SaaS",
    desc: "Un logiciel de suivi des candidatures accessible aux PME comme aux grands groupes, facturé en FCFA.",
    href: "/fonctionnalites",
    cta: "Voir les fonctionnalités",
  },
  {
    icon: BookOpen,
    title: "CVthèque",
    desc: "Une base de talents panafricaine où les recruteurs cherchent activement les profils dont ils ont besoin.",
    href: "/tarifs",
    cta: "Découvrir les accès",
  },
  {
    icon: Users,
    title: "Recrutement à succès",
    desc: "Notre équipe prend en charge la recherche de A à Z. Vous ne payez qu'une fois le candidat recruté.",
    href: "/tarifs",
    cta: "Soumettre un besoin",
  },
  {
    icon: Megaphone,
    title: "Publicité RH",
    desc: "Offres sponsorisées, mise en avant employeur et newsletter pour toucher notre audience de candidats.",
    href: "/tarifs",
    cta: "Voir les formats",
  },
];

const ENGAGEMENTS = [
  {
    icon: ShieldCheck,
    title: "Des données protégées",
    desc: "Les CV et coordonnées des candidats ne sont jamais revendus. Accès contrôlé, conformité RGPD, hébergement sécurisé.",
  },
  {
    icon: HeartHandshake,
    title: "Un accès équitable",
    desc: "Un plan gratuit permanent pour les structures qui démarrent : la taille de l'entreprise ne doit pas décider de sa capacité à recruter.",
  },
  {
    icon: Sparkles,
    title: "Un produit qui évolue",
    desc: "Nos fonctionnalités sont priorisées avec des recruteurs en poste, sur le terrain, pas depuis un tableau de bord.",
  },
];

export default function AProposPage() {
  return (
    <div className="pb-24" style={{ background: "var(--y-bg)" }}>
      {/* ── Héros ── */}
      <section className="pt-28 px-6 md:px-12 lg:px-20">
        <div
          className="relative overflow-hidden max-w-7xl mx-auto rounded-[32px] px-8 md:px-12 py-16 md:py-24"
          style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
        >
          <div
            className="yl-orb"
            style={{ width: 420, height: 420, top: -160, right: -100, background: "rgba(255,255,255,0.13)" }}
          />
          <div
            className="yl-stripes absolute opacity-40"
            style={{ width: 150, height: 150, bottom: -40, left: 32, borderRadius: 24 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-3xl"
          >
            <p className="text-sm font-semibold" style={{ color: "#e0d6ff" }}>
              À propos d&apos;Ylsix
            </p>
            <h1
              className="mt-3 text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05] tracking-[-0.035em]"
              style={{ color: "#fff" }}
            >
              Rapprocher les talents africains des entreprises qui les cherchent
            </h1>
            <p
              className="mt-6 text-base md:text-lg leading-relaxed max-w-2xl"
              style={{ color: "rgba(255,255,255,0.78)" }}
            >
              Ylsix est une plateforme de recrutement panafricaine, conçue et opérée depuis
              Abidjan. Nous outillons les recruteurs d&apos;Afrique francophone et donnons aux
              candidats les moyens de se rendre visibles.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Chiffres ── */}
      <section className="mt-16 md:mt-20 px-6 md:px-12 lg:px-20">
        <div
          className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-y-8"
          style={{ borderTop: "1px solid var(--y-line)", borderBottom: "1px solid var(--y-line)" }}
        >
          {CHIFFRES.map((c, i) => (
            <motion.div
              key={c.label}
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
                {c.value}
              </div>
              <div className="mt-1.5 text-sm" style={{ color: "var(--y-ink-3)" }}>
                {c.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-16"
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Notre mission
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.1]"
              style={{ color: "var(--y-ink)" }}
            >
              Le talent est partout. Les outils pour le trouver, non.
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
              En Afrique francophone, la plupart des recrutements passent encore par des
              annonces éparpillées, des CV reçus par WhatsApp et des tableurs qu&apos;on se
              partage. Les recruteurs perdent des semaines ; les candidats, eux, ne savent
              jamais où en est leur candidature.
            </p>
            <p className="text-base md:text-lg leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
              Nous construisons l&apos;infrastructure qui manquait : une seule plateforme pour
              publier, diffuser, trier, échanger et décider — pensée pour nos réalités, du
              paiement en Mobile Money à la facturation en FCFA.
            </p>

            <div
              className="mt-2 pl-5 py-1"
              style={{ borderLeft: "3px solid var(--y-primary)" }}
            >
              <Quote size={20} className="mb-3" style={{ color: "var(--y-primary-700)" }} />
              <blockquote
                className="text-lg md:text-xl font-medium leading-relaxed"
                style={{ color: "var(--y-ink)" }}
              >
                « Une PME d&apos;Abidjan doit pouvoir recruter aussi bien qu&apos;un grand
                groupe. C&apos;est tout le sens de ce qu&apos;on construit. »
              </blockquote>
              <cite className="mt-3 block text-sm not-italic" style={{ color: "var(--y-ink-3)" }}>
                L&apos;équipe fondatrice d&apos;Ylsix
              </cite>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Nos 4 métiers ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl mb-12"
          >
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Ce que nous faisons
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--y-ink)" }}
            >
              Quatre façons de recruter avec nous
            </h2>
            <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
              Du logiciel en libre-service à la mission confiée à notre équipe : vous choisissez
              le niveau d&apos;accompagnement.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {METIERS.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
                viewport={{ once: true }}
              >
                <Link
                  href={m.href}
                  className="group flex flex-col h-full rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1"
                  style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                  >
                    <m.icon size={22} />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: "var(--y-ink-3)" }}>
                    {m.desc}
                  </p>
                  <span
                    className="mt-5 inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2"
                    style={{ color: "var(--y-primary-700)" }}
                  >
                    {m.cta} <ArrowRight size={14} />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engagements (bande sombre) ── */}
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
              Nos engagements
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "#fff" }}
            >
              Ce sur quoi nous ne transigeons pas
            </h2>
          </motion.div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            {ENGAGEMENTS.map((e, i) => (
              <motion.div
                key={e.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "rgba(255,255,255,0.08)", color: "#c9b8ff" }}
                >
                  <e.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: "#fff" }}>
                  {e.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
                  {e.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative overflow-hidden max-w-7xl mx-auto rounded-[32px] px-8 md:px-12 py-14 md:py-16 flex flex-col lg:flex-row lg:items-center justify-between gap-8"
          style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #4a3781 100%)" }}
        >
          <div
            className="yl-stripes absolute opacity-30"
            style={{ width: 150, height: 150, bottom: -40, right: 40, borderRadius: 24 }}
          />
          <div className="relative z-10 max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] leading-[1.1]"
              style={{ color: "#fff" }}
            >
              Envie d&apos;en savoir plus sur Ylsix ?
            </h2>
            <p className="mt-4 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              Parlons de vos besoins de recrutement — ou commencez directement, c&apos;est
              gratuit.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
            <Link
              href="/auth/recruteur/register"
              className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ background: "#fff", color: "var(--y-primary-700)", boxShadow: "var(--y-shadow-lg)" }}
            >
              Créer un compte <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              className="h-12 px-6 rounded-full text-sm font-medium flex items-center transition-colors"
              style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.4)" }}
            >
              Nous contacter
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
