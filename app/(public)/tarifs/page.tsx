"use client";
import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import Link from "next/link";
import { PLAN_LIST } from "@/lib/plans";
import { CVTHEQUE_PLAN_LIST, CONTACT_PACKS } from "@/lib/cvtheque-plans";
import { PaymentButton } from "@/components/shared/PaymentButton";
import type { PlanId } from "@/lib/plans";
import type { CVthequePlanId } from "@/lib/cvtheque-plans";

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = "ats" | "cvtheque" | "recrutement" | "publicite";

// ── Données statiques ─────────────────────────────────────────────────────────
const TABS: { id: Tab; label: string; icon: typeof Building2; desc: string }[] = [
  { id: "ats", label: "ATS SaaS", icon: Building2, desc: "Gérez vos recrutements" },
  { id: "cvtheque", label: "CVthèque", icon: BookOpen, desc: "Accédez aux talents" },
  { id: "recrutement", label: "Recrutement à succès", icon: Users, desc: "Cabinet digital" },
  { id: "publicite", label: "Publicité RH", icon: Megaphone, desc: "Visibilité maximale" },
];

const RECRUTEMENT_NIVEAUX = [
  {
    niveau: "Niveau 1",
    titre: "Employés",
    exemples: ["Commercial", "Assistant", "Caissier"],
    prix: 150000,
    color: "from-blue-50 to-blue-100",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  {
    niveau: "Niveau 2",
    titre: "Cadres intermédiaires",
    exemples: ["RH", "Comptable", "Chef de projet"],
    prix: 400000,
    color: "from-purple-50 to-purple-100",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    popular: true,
  },
  {
    niveau: "Niveau 3",
    titre: "Cadres supérieurs",
    exemples: ["DAF", "DRH", "Directeur commercial"],
    prix: 1000000,
    color: "from-amber-50 to-amber-100",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    niveau: "Executive Search",
    titre: "Dirigeants",
    exemples: ["DG", "CEO", "Country Manager"],
    prix: 3000000,
    prixLabel: "3 000 000 FCFA+",
    color: "from-gray-800 to-gray-900",
    textColor: "text-white",
    border: "border-gray-700",
    badge: "bg-white/20 text-white",
    dark: true,
  },
];

const PUBLICITE_PRODUITS = [
  {
    icon: Star,
    titre: "Offre sponsorisée",
    description: "Mise en avant de votre offre d'emploi pendant 30 jours",
    prix: 10000,
    unite: "/ offre",
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
  },
  {
    icon: Building2,
    titre: "Bannière homepage",
    description: "Votre bannière affichée sur la page d'accueil YLSIX",
    prix: 50000,
    unite: "/ mois",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Star,
    titre: "Entreprise à la une",
    description: "Votre entreprise mise en avant en page d'accueil",
    prix: 25000,
    unite: "/ semaine",
    color: "bg-purple-50 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    icon: Mail,
    titre: "Newsletter RH",
    description: "Votre message envoyé à toute notre base de candidats",
    prix: 50000,
    unite: "/ envoi",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
  },
  {
    icon: BookOpen,
    titre: "Article sponsorisé",
    description: "Un article de fond sur votre entreprise ou secteur",
    prix: 75000,
    unite: "/ article",
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-600",
  },
];

// ── Composants ────────────────────────────────────────────────────────────────

function CVthequePaymentButton({ planId, children, className }: { planId: CVthequePlanId; children: React.ReactNode; className?: string }) {
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
    <button onClick={handleClick} disabled={loading} className={className}>
      {loading ? "Redirection..." : children}
    </button>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function TarifsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("ats");

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Hero */}
      <div
        className="bg-cover bg-center bg-no-repeat py-12 md:py-24"
        style={{ backgroundImage: "url('/img/banniereweb_1.png')" }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Nos tarifs</h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              4 sources de revenus pour une plateforme RH africaine complète
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-20 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-[#a590ff] text-white shadow"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">

        {/* ── Pilier 1 : ATS SaaS ── */}
        {activeTab === "ats" && (
          <motion.div key="ats" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">ATS SaaS</h2>
              <p className="text-gray-600">Gérez vos offres, candidatures et recrutements en équipe</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {PLAN_LIST.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                    plan.popular ? "border-[#a590ff] scale-105 shadow-xl" : "border-gray-200 hover:border-[#a590ff] shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-6 py-1.5 rounded-full text-sm font-bold">
                      Plus populaire
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className="text-4xl font-bold">Gratuit</span>
                    ) : (
                      <>
                        <span className="text-3xl font-bold">{plan.price.toLocaleString("fr-FR")} FCFA</span>
                        <span className="text-gray-500 text-sm"> / {plan.period}</span>
                      </>
                    )}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#a590ff] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.id === "decouverte" ? (
                    <Link href="/auth/recruteur/register">
                      <button className="w-full py-2.5 rounded-full font-semibold bg-gray-100 hover:bg-gray-200 transition-colors">
                        Commencer gratuitement
                      </button>
                    </Link>
                  ) : (
                    <PaymentButton
                      planId={plan.id as Exclude<PlanId, "decouverte">}
                      className={`w-full py-2.5 rounded-full font-semibold transition-all ${
                        plan.popular
                          ? "bg-[#a590ff] text-white hover:bg-[#9580ef]"
                          : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      }`}
                    >
                      S'abonner au plan {plan.name}
                    </PaymentButton>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Pilier 2 : CVthèque Premium ── */}
        {activeTab === "cvtheque" && (
          <motion.div key="cvtheque" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">CVthèque Premium</h2>
              <p className="text-gray-600">Accédez à la base de talents panafricaine YLSIX</p>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {CVTHEQUE_PLAN_LIST.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl p-8 border-2 transition-all ${
                    plan.popular ? "border-[#a590ff] scale-105 shadow-xl" : "border-gray-200 hover:border-[#a590ff] shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-6 py-1.5 rounded-full text-sm font-bold">
                      Plus populaire
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mb-5">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold">{plan.price.toLocaleString("fr-FR")} FCFA</span>
                    <span className="text-gray-500 text-sm"> / {plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-4 h-4 text-[#a590ff] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <CVthequePaymentButton
                    planId={plan.id as CVthequePlanId}
                    className={`w-full py-2.5 rounded-full font-semibold transition-all ${
                      plan.popular
                        ? "bg-[#a590ff] text-white hover:bg-[#9580ef]"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    S'abonner — {plan.name}
                  </CVthequePaymentButton>
                </motion.div>
              ))}
            </div>

            {/* Services additionnels — déblocage contacts */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Services additionnels</h3>
                <p className="text-gray-600">Débloquez les coordonnées des candidats à la carte</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CONTACT_PACKS.map((pack) => (
                  <div key={pack.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-[#a590ff] transition-colors">
                    <p className="font-bold text-gray-900 mb-1">{pack.label}</p>
                    <p className="text-sm text-gray-500 mb-4">{pack.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">{pack.price.toLocaleString("fr-FR")}</span>
                      <span className="text-gray-500 text-sm">FCFA</span>
                      {pack.quantity > 1 && (
                        <span className="ml-2 text-xs text-[#a590ff] font-semibold">
                          ({Math.round(pack.price / pack.quantity)} FCFA/contact)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Pilier 3 : Recrutement à succès ── */}
        {activeTab === "recrutement" && (
          <motion.div key="recrutement" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Recrutement à succès</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                YLSIX agit comme cabinet de recrutement digital. Vous ne payez que si le recrutement est réussi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {RECRUTEMENT_NIVEAUX.map((n, index) => (
                <motion.div
                  key={n.niveau}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative rounded-2xl p-8 border-2 bg-gradient-to-br ${n.color} ${n.border} ${n.dark ? "text-white" : ""} ${n.popular ? "ring-2 ring-[#a590ff] shadow-xl" : "shadow-md"}`}
                >
                  {n.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-6 py-1.5 rounded-full text-sm font-bold">
                      Le plus demandé
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${n.badge}`}>{n.niveau}</span>
                      <h3 className={`text-xl font-bold mt-2 ${n.dark ? "text-white" : "text-gray-900"}`}>{n.titre}</h3>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-6">
                    {n.exemples.map((e) => (
                      <li key={e} className={`flex items-center gap-2 text-sm ${n.dark ? "text-gray-300" : "text-gray-700"}`}>
                        <Check className={`w-4 h-4 shrink-0 ${n.dark ? "text-gray-400" : "text-[#a590ff]"}`} />
                        {e}
                      </li>
                    ))}
                  </ul>
                  <div className="mb-6">
                    <span className={`text-3xl font-bold ${n.dark ? "text-white" : "text-gray-900"}`}>
                      {n.prixLabel ?? `${n.prix.toLocaleString("fr-FR")} FCFA`}
                    </span>
                  </div>
                  <Link href="/contact">
                    <button className={`w-full py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                      n.dark
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : n.popular
                        ? "bg-[#a590ff] text-white hover:bg-[#9580ef]"
                        : "bg-white border border-gray-300 text-gray-800 hover:bg-gray-50"
                    }`}>
                      Soumettre un besoin
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Bloc explicatif */}
            <div className="mt-12 max-w-3xl mx-auto bg-[#a590ff]/10 border border-[#a590ff]/30 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comment ça fonctionne ?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div>
                  <div className="w-10 h-10 bg-[#a590ff] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">1</div>
                  <p className="font-semibold mb-1">Soumettez votre besoin</p>
                  <p>Décrivez le poste, le profil recherché et vos exigences.</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#a590ff] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">2</div>
                  <p className="font-semibold mb-1">YLSIX recherche</p>
                  <p>Notre équipe identifie et sélectionne les meilleurs profils.</p>
                </div>
                <div>
                  <div className="w-10 h-10 bg-[#a590ff] text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">3</div>
                  <p className="font-semibold mb-1">Paiement à la réussite</p>
                  <p>Vous ne payez qu'après la signature du contrat du candidat.</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Pilier 4 : Publicité RH ── */}
        {activeTab === "publicite" && (
          <motion.div key="publicite" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Publicité RH</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Boostez votre visibilité auprès de milliers de candidats et professionnels RH africains
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {PUBLICITE_PRODUITS.map((prod, index) => (
                <motion.div
                  key={prod.titre}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl p-6 border-2 ${prod.color} hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <prod.icon className={`w-5 h-5 ${prod.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-gray-900">{prod.titre}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-5">{prod.description}</p>
                  <div className="flex items-baseline gap-1 mb-5">
                    <span className="text-2xl font-bold text-gray-900">{prod.prix.toLocaleString("fr-FR")}</span>
                    <span className="text-gray-500 text-sm">FCFA {prod.unite}</span>
                  </div>
                  <Link href="/contact">
                    <button className="w-full py-2 rounded-full font-semibold bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-1">
                      Commander
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* CTA contact */}
            <div className="mt-12 max-w-2xl mx-auto text-center">
              <div className="bg-gray-900 rounded-2xl p-8 text-white">
                <Megaphone className="w-10 h-10 mx-auto mb-4 text-[#a590ff]" />
                <h3 className="text-xl font-bold mb-3">Besoin d'un devis personnalisé ?</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Pack annuel, campagne multi-produits, tarifs préférentiels pour les partenaires — contactez notre équipe commerciale.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/contact">
                    <button className="flex items-center gap-2 bg-[#a590ff] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#9580ef] transition-colors">
                      <Mail className="w-4 h-4" />
                      Nous contacter
                    </button>
                  </Link>
                  <a href="tel:+22600000000">
                    <button className="flex items-center gap-2 bg-white/10 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-white/20 transition-colors">
                      <Phone className="w-4 h-4" />
                      Appeler
                    </button>
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* FAQ commune */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "Puis-je changer de plan à tout moment ?", r: "Oui, les changements sont immédiats. Le prochain cycle de facturation reflète le nouveau plan." },
              { q: "Quels modes de paiement acceptez-vous ?", r: "Nous acceptons Mobile Money (Orange Money, Wave, MTN MoMo), cartes bancaires et virements via notre partenaire GeniusPay." },
              { q: "Puis-je annuler mon abonnement ?", r: "Oui, depuis votre espace recruteur, sans engagement ni pénalité. L'accès reste actif jusqu'à la fin de la période payée." },
              { q: "Les tarifs sont-ils en FCFA ?", r: "Oui, tous nos tarifs sont exprimés en Francs CFA (XOF) pour rester accessibles à tous nos clients africains." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.r}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA final */}
        <div className="mt-16 bg-[#a590ff] rounded-2xl p-12 text-center text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Prêt à recruter autrement ?</h2>
          <p className="opacity-90 mb-8 max-w-xl mx-auto">
            Rejoignez les entreprises africaines qui font confiance à YLSIX pour leurs recrutements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/recruteur/register">
              <button className="bg-white text-[#a590ff] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Commencer gratuitement
              </button>
            </Link>
            <Link href="/contact">
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#a590ff] transition-colors">
                Nous contacter
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
