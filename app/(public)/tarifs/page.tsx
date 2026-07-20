"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Building2,
  Users,
  BookOpen,
  Megaphone,
  Star,
  Mail,
  Phone,
  ChevronRight,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import { PLAN_LIST } from "@/lib/plans";
import { CVTHEQUE_PLAN_LIST, CONTACT_PACKS } from "@/lib/cvtheque-plans";
import { PaymentButton } from "@/components/shared/PaymentButton";
import type { PlanId } from "@/lib/plans";
import type { CVthequePlanId } from "@/lib/cvtheque-plans";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "ats" | "cvtheque" | "recrutement" | "publicite";

// ── Données statiques ─────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: typeof Building2; title: string; desc: string }[] = [
  {
    id: "ats",
    label: "ATS SaaS",
    icon: Building2,
    title: "ATS SaaS",
    desc: "Gérez vos offres, vos candidatures et vos recrutements en équipe.",
  },
  {
    id: "cvtheque",
    label: "CVthèque",
    icon: BookOpen,
    title: "CVthèque Premium",
    desc: "Accédez à la base de talents panafricaine Ylsix et contactez les profils directement.",
  },
  {
    id: "recrutement",
    label: "Recrutement à succès",
    icon: Users,
    title: "Recrutement à succès",
    desc: "Ylsix agit comme cabinet de recrutement digital. Vous ne payez que si le recrutement aboutit.",
  },
  {
    id: "publicite",
    label: "Publicité RH",
    icon: Megaphone,
    title: "Publicité RH",
    desc: "Gagnez en visibilité auprès de milliers de candidats et de professionnels RH africains.",
  },
];

const RECRUTEMENT_NIVEAUX = [
  {
    niveau: "Niveau 1",
    titre: "Employés",
    exemples: ["Commercial", "Assistant", "Caissier"],
    prix: 150000,
    accent: "#2563eb",
    accentSoft: "rgba(37,99,235,0.10)",
  },
  {
    niveau: "Niveau 2",
    titre: "Cadres intermédiaires",
    exemples: ["RH", "Comptable", "Chef de projet"],
    prix: 400000,
    accent: "#7c5cbf",
    accentSoft: "var(--y-primary-50)",
    popular: true,
  },
  {
    niveau: "Niveau 3",
    titre: "Cadres supérieurs",
    exemples: ["DAF", "DRH", "Directeur commercial"],
    prix: 1000000,
    accent: "#d97706",
    accentSoft: "rgba(217,119,6,0.10)",
  },
  {
    niveau: "Executive Search",
    titre: "Dirigeants",
    exemples: ["DG", "CEO", "Country Manager"],
    prix: 3000000,
    prixLabel: "3 000 000 FCFA+",
    accent: "#c9b8ff",
    accentSoft: "rgba(255,255,255,0.10)",
    dark: true,
  },
];

const ETAPES = [
  { n: 1, titre: "Soumettez votre besoin", desc: "Décrivez le poste, le profil recherché et vos exigences." },
  { n: 2, titre: "Ylsix recherche", desc: "Notre équipe identifie et sélectionne les meilleurs profils." },
  { n: 3, titre: "Paiement à la réussite", desc: "Vous ne payez qu'après la signature du contrat du candidat." },
];

const PUBLICITE_PRODUITS = [
  {
    icon: Star,
    titre: "Offre sponsorisée",
    description: "Mise en avant de votre offre d'emploi pendant 30 jours",
    prix: 10000,
    unite: "/ offre",
  },
  {
    icon: Building2,
    titre: "Bannière homepage",
    description: "Votre bannière affichée sur la page d'accueil Ylsix",
    prix: 50000,
    unite: "/ mois",
  },
  {
    icon: Star,
    titre: "Entreprise à la une",
    description: "Votre entreprise mise en avant en page d'accueil",
    prix: 25000,
    unite: "/ semaine",
  },
  {
    icon: Mail,
    titre: "Newsletter RH",
    description: "Votre message envoyé à toute notre base de candidats",
    prix: 50000,
    unite: "/ envoi",
  },
  {
    icon: BookOpen,
    titre: "Article sponsorisé",
    description: "Un article de fond sur votre entreprise ou votre secteur",
    prix: 75000,
    unite: "/ article",
  },
];

const FAQS = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    r: "Oui, les changements sont immédiats. Le prochain cycle de facturation reflète le nouveau plan.",
  },
  {
    q: "Quels modes de paiement acceptez-vous ?",
    r: "Mobile Money (Orange Money, Wave, MTN MoMo), cartes bancaires et virements via notre partenaire GeniusPay.",
  },
  {
    q: "Puis-je annuler mon abonnement ?",
    r: "Oui, depuis votre espace recruteur, sans engagement ni pénalité. L'accès reste actif jusqu'à la fin de la période payée.",
  },
  {
    q: "Les tarifs sont-ils en FCFA ?",
    r: "Oui, tous nos tarifs sont exprimés en Francs CFA (XOF) pour rester accessibles à l'ensemble de nos clients africains.",
  },
];

// ── Styles partagés ───────────────────────────────────────────────────────────

const cardBase = {
  background: "var(--y-bg-pure)",
  boxShadow: "inset 0 0 0 1px var(--y-line), var(--y-shadow-sm)",
};

const cardPopular = {
  background: "var(--y-bg-pure)",
  boxShadow: "inset 0 0 0 1.5px var(--y-primary), var(--y-shadow-violet)",
};

const btnPrimary =
  "w-full h-11 rounded-full text-sm font-medium text-white flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-60";
const btnSecondary =
  "w-full h-11 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors";

const btnPrimaryStyle = {
  background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)",
  boxShadow: "var(--y-shadow-violet)",
};
const btnSecondaryStyle = {
  background: "var(--y-bg-soft)",
  color: "var(--y-ink)",
};

// ── Composants ────────────────────────────────────────────────────────────────

function CVthequePaymentButton({
  planId,
  children,
  className,
  style,
}: {
  planId: CVthequePlanId;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payment/cvtheque/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();
      if (!data.success || !data.checkout_url) {
        alert(data.error || "Erreur lors de l'initialisation du paiement");
        return;
      }
      if (data.reference) sessionStorage.setItem("geniuspay_ref", data.reference);
      window.location.href = data.checkout_url;
    } catch {
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading} className={className} style={style}>
      {loading ? "Redirection..." : children}
    </button>
  );
}

function SectionHeading({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <h2
        className="text-3xl md:text-4xl font-semibold tracking-[-0.03em]"
        style={{ color: "var(--y-ink)" }}
      >
        {title}
      </h2>
      <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
        {desc}
      </p>
    </div>
  );
}

function PopularBadge({ label }: { label: string }) {
  return (
    <span
      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-medium text-white whitespace-nowrap"
      style={{ background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)" }}
    >
      {label}
    </span>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function TarifsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ats");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="pb-24" style={{ background: "var(--y-bg)" }}>
      {/* ── Héros ── */}
      <section className="pt-28 px-6 md:px-12 lg:px-20">
        <div
          className="relative overflow-hidden max-w-7xl mx-auto rounded-[32px] px-8 md:px-12 py-14 md:py-20 text-center"
          style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
        >
          <div
            className="yl-orb"
            style={{ width: 400, height: 400, top: -160, right: -100, background: "rgba(255,255,255,0.14)" }}
          />
          <div
            className="yl-stripes absolute opacity-40"
            style={{ width: 140, height: 140, bottom: -40, left: 32, borderRadius: 24 }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 max-w-2xl mx-auto"
          >
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
            >
              ✦ Tarifs en FCFA · paiement Mobile Money
            </span>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[-0.035em]"
              style={{ color: "#fff" }}
            >
              Nos tarifs
            </h1>
            <p className="mt-5 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.78)" }}>
              Quatre façons de recruter avec Ylsix — du logiciel en libre-service à la mission
              confiée à notre équipe.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Onglets ── */}
      <div className="sticky top-[88px] z-30 mt-8 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto flex justify-center">
          <div
            role="tablist"
            aria-label="Type d'offre"
            className="inline-flex gap-1 p-1 rounded-full max-w-full overflow-x-auto"
            style={{
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(18px) saturate(140%)",
              WebkitBackdropFilter: "blur(18px) saturate(140%)",
              boxShadow: "var(--y-shadow-md)",
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative h-10 px-4 sm:px-5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0"
                style={{ color: activeTab === tab.id ? "#fff" : "var(--y-ink-3)" }}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="tarifs-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)",
                    }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <tab.icon size={15} />
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Contenu des onglets ── */}
      <section className="mt-16 md:mt-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <SectionHeading title={active.title} desc={active.desc} />

              {/* ── Pilier 1 : ATS SaaS ── */}
              {activeTab === "ats" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
                  {PLAN_LIST.map((plan) => (
                    <div
                      key={plan.id}
                      className="relative flex flex-col h-full rounded-2xl p-7"
                      style={plan.popular ? cardPopular : cardBase}
                    >
                      {plan.popular && <PopularBadge label="Plus populaire" />}

                      <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                        {plan.name}
                      </h3>
                      <p className="mt-1.5 text-sm" style={{ color: "var(--y-ink-3)" }}>
                        {plan.description}
                      </p>

                      <div className="mt-6 mb-6">
                        {plan.price === 0 ? (
                          <span
                            className="text-3xl font-semibold tracking-[-0.03em]"
                            style={{ color: "var(--y-ink)" }}
                          >
                            Gratuit
                          </span>
                        ) : (
                          <>
                            <span
                              className="text-3xl font-semibold tracking-[-0.03em]"
                              style={{ color: "var(--y-ink)" }}
                            >
                              {plan.price.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-sm ml-1.5" style={{ color: "var(--y-ink-3)" }}>
                              FCFA / {plan.period}
                            </span>
                          </>
                        )}
                      </div>

                      <ul
                        className="flex flex-col gap-3 mb-8 flex-1 pt-6"
                        style={{ borderTop: "1px solid var(--y-line)" }}
                      >
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5">
                            <Check
                              size={14}
                              strokeWidth={3}
                              className="shrink-0 mt-0.5"
                              style={{ color: "var(--y-primary-700)" }}
                            />
                            <span className="text-[13px]" style={{ color: "var(--y-ink-2)" }}>
                              {f}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {plan.id === "decouverte" ? (
                        <Link
                          href="/auth/recruteur/register"
                          className={btnSecondary}
                          style={btnSecondaryStyle}
                        >
                          Commencer gratuitement
                        </Link>
                      ) : (
                        <PaymentButton
                          planId={plan.id as Exclude<PlanId, "decouverte">}
                          className={plan.popular ? btnPrimary : btnSecondary}
                          style={plan.popular ? btnPrimaryStyle : btnSecondaryStyle}
                        >
                          S&apos;abonner
                        </PaymentButton>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Pilier 2 : CVthèque Premium ── */}
              {activeTab === "cvtheque" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto items-start">
                    {CVTHEQUE_PLAN_LIST.map((plan) => (
                      <div
                        key={plan.id}
                        className="relative flex flex-col h-full rounded-2xl p-7"
                        style={plan.popular ? cardPopular : cardBase}
                      >
                        {plan.popular && <PopularBadge label="Plus populaire" />}

                        <h3 className="text-xl font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                          {plan.name}
                        </h3>
                        <p className="mt-1.5 text-sm" style={{ color: "var(--y-ink-3)" }}>
                          {plan.description}
                        </p>

                        <div className="mt-6 mb-6">
                          <span
                            className="text-3xl font-semibold tracking-[-0.03em]"
                            style={{ color: "var(--y-ink)" }}
                          >
                            {plan.price.toLocaleString("fr-FR")}
                          </span>
                          <span className="text-sm ml-1.5" style={{ color: "var(--y-ink-3)" }}>
                            FCFA / {plan.period}
                          </span>
                        </div>

                        <ul
                          className="flex flex-col gap-3 mb-8 flex-1 pt-6"
                          style={{ borderTop: "1px solid var(--y-line)" }}
                        >
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-2.5">
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="shrink-0 mt-0.5"
                                style={{ color: "var(--y-primary-700)" }}
                              />
                              <span className="text-[13px]" style={{ color: "var(--y-ink-2)" }}>
                                {f}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <CVthequePaymentButton
                          planId={plan.id as CVthequePlanId}
                          className={plan.popular ? btnPrimary : btnSecondary}
                          style={plan.popular ? btnPrimaryStyle : btnSecondaryStyle}
                        >
                          S&apos;abonner — {plan.name}
                        </CVthequePaymentButton>
                      </div>
                    ))}
                  </div>

                  {/* Services additionnels — déblocage contacts */}
                  <div className="mt-20 max-w-5xl mx-auto">
                    <div className="text-center mb-8">
                      <h3
                        className="text-2xl font-semibold tracking-[-0.025em]"
                        style={{ color: "var(--y-ink)" }}
                      >
                        Services additionnels
                      </h3>
                      <p className="mt-3 text-base" style={{ color: "var(--y-ink-2)" }}>
                        Débloquez les coordonnées des candidats à la carte.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {CONTACT_PACKS.map((pack) => (
                        <div key={pack.id} className="rounded-2xl p-6" style={cardBase}>
                          <p className="text-base font-semibold" style={{ color: "var(--y-ink)" }}>
                            {pack.label}
                          </p>
                          <p className="mt-1.5 text-sm" style={{ color: "var(--y-ink-3)" }}>
                            {pack.description}
                          </p>
                          <div className="mt-5 flex items-baseline gap-1.5 flex-wrap">
                            <span
                              className="text-2xl font-semibold tracking-[-0.03em]"
                              style={{ color: "var(--y-ink)" }}
                            >
                              {pack.price.toLocaleString("fr-FR")}
                            </span>
                            <span className="text-sm" style={{ color: "var(--y-ink-3)" }}>
                              FCFA
                            </span>
                            {pack.quantity > 1 && (
                              <span
                                className="text-xs font-medium px-2 py-0.5 rounded-full"
                                style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                              >
                                {Math.round(pack.price / pack.quantity)} FCFA/contact
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Pilier 3 : Recrutement à succès ── */}
              {activeTab === "recrutement" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto items-start">
                    {RECRUTEMENT_NIVEAUX.map((n) => (
                      <div
                        key={n.niveau}
                        className="relative flex flex-col h-full rounded-2xl p-7"
                        style={
                          n.dark
                            ? { background: "var(--y-bg-ink)" }
                            : n.popular
                            ? cardPopular
                            : cardBase
                        }
                      >
                        {n.popular && <PopularBadge label="Le plus demandé" />}

                        <span
                          className="self-start text-xs font-medium px-2.5 py-1 rounded-full"
                          style={{ background: n.accentSoft, color: n.accent }}
                        >
                          {n.niveau}
                        </span>
                        <h3
                          className="mt-3 text-xl font-semibold tracking-tight"
                          style={{ color: n.dark ? "#fff" : "var(--y-ink)" }}
                        >
                          {n.titre}
                        </h3>

                        <ul className="mt-5 flex flex-col gap-2.5 flex-1">
                          {n.exemples.map((e) => (
                            <li key={e} className="flex items-center gap-2.5">
                              <Check
                                size={14}
                                strokeWidth={3}
                                className="shrink-0"
                                style={{ color: n.accent }}
                              />
                              <span
                                className="text-sm"
                                style={{ color: n.dark ? "rgba(255,255,255,0.7)" : "var(--y-ink-2)" }}
                              >
                                {e}
                              </span>
                            </li>
                          ))}
                        </ul>

                        <div className="mt-6 mb-6">
                          <span
                            className="text-2xl font-semibold tracking-[-0.03em]"
                            style={{ color: n.dark ? "#fff" : "var(--y-ink)" }}
                          >
                            {n.prixLabel ?? `${n.prix.toLocaleString("fr-FR")} FCFA`}
                          </span>
                        </div>

                        <Link
                          href="/contact"
                          className={n.popular ? btnPrimary : btnSecondary}
                          style={
                            n.dark
                              ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                              : n.popular
                              ? btnPrimaryStyle
                              : btnSecondaryStyle
                          }
                        >
                          Soumettre un besoin
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Comment ça fonctionne */}
                  <div className="mt-16 max-w-4xl mx-auto rounded-3xl p-8 md:p-10" style={cardBase}>
                    <h3
                      className="text-xl font-semibold tracking-tight text-center mb-10"
                      style={{ color: "var(--y-ink)" }}
                    >
                      Comment ça fonctionne ?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {ETAPES.map((e) => (
                        <div key={e.n}>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold mb-4"
                            style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                          >
                            {e.n}
                          </div>
                          <p className="text-base font-semibold" style={{ color: "var(--y-ink)" }}>
                            {e.titre}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--y-ink-3)" }}>
                            {e.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── Pilier 4 : Publicité RH ── */}
              {activeTab === "publicite" && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                    {PUBLICITE_PRODUITS.map((prod) => (
                      <div key={prod.titre} className="flex flex-col rounded-2xl p-6" style={cardBase}>
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                          style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                        >
                          <prod.icon size={22} />
                        </div>
                        <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                          {prod.titre}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: "var(--y-ink-3)" }}>
                          {prod.description}
                        </p>
                        <div className="mt-5 mb-5 flex items-baseline gap-1.5">
                          <span
                            className="text-2xl font-semibold tracking-[-0.03em]"
                            style={{ color: "var(--y-ink)" }}
                          >
                            {prod.prix.toLocaleString("fr-FR")}
                          </span>
                          <span className="text-sm" style={{ color: "var(--y-ink-3)" }}>
                            FCFA {prod.unite}
                          </span>
                        </div>
                        <Link href="/contact" className={btnSecondary} style={btnSecondaryStyle}>
                          Commander <ChevronRight size={16} />
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Devis personnalisé */}
                  <div
                    className="relative overflow-hidden mt-16 max-w-3xl mx-auto rounded-3xl p-8 md:p-10 text-center"
                    style={{ background: "var(--y-bg-ink)" }}
                  >
                    <div
                      className="yl-orb"
                      style={{ width: 320, height: 320, bottom: -160, right: -80, background: "rgba(165,144,255,0.22)" }}
                    />
                    <div className="relative z-10">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: "rgba(255,255,255,0.08)", color: "#c9b8ff" }}
                      >
                        <Megaphone size={22} />
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: "#fff" }}>
                        Besoin d&apos;un devis personnalisé ?
                      </h3>
                      <p
                        className="mt-3 text-sm md:text-base max-w-xl mx-auto"
                        style={{ color: "rgba(255,255,255,0.65)" }}
                      >
                        Pack annuel, campagne multi-produits, tarifs préférentiels partenaires —
                        parlons-en avec notre équipe commerciale.
                      </p>
                      <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                          href="/contact"
                          className="h-11 px-6 rounded-full text-sm font-medium text-white flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5"
                          style={btnPrimaryStyle}
                        >
                          <Mail size={16} /> Nous contacter
                        </Link>
                        <a
                          href="tel:+2250544659490"
                          className="h-11 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          style={{ background: "rgba(255,255,255,0.10)", color: "#fff" }}
                        >
                          <Phone size={16} /> +225 05 44 65 94 90
                        </a>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ── FAQ commune ── */}
      <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-[-0.03em] text-center mb-10"
            style={{ color: "var(--y-ink)" }}
          >
            Questions fréquentes
          </h2>

          <div className="flex flex-col gap-2">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-2xl overflow-hidden">
                <summary
                  className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 text-sm font-medium rounded-2xl"
                  style={{ background: "var(--y-bg-pure)", color: "var(--y-ink)", boxShadow: "var(--y-shadow-sm)" }}
                >
                  {faq.q}
                  <ChevronDown
                    size={16}
                    className="shrink-0 transition-transform group-open:rotate-180"
                    style={{ color: "var(--y-primary-700)" }}
                  />
                </summary>
                <p className="px-5 pt-4 pb-2 text-sm leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
                  {faq.r}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
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
              Prêt à recruter autrement ?
            </h2>
            <p className="mt-4 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              Commencez gratuitement avec le plan Découverte — sans carte bancaire.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap gap-3 shrink-0">
            <Link
              href="/auth/recruteur/register"
              className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
              style={{ background: "#fff", color: "var(--y-primary-700)", boxShadow: "var(--y-shadow-lg)" }}
            >
              Commencer gratuitement <ArrowRight size={16} />
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
