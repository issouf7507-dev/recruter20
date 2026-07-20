"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Search, MapPin, ArrowRight, User, Briefcase } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const SUGGESTIONS = ["Développeur", "Commercial", "Data Analyst", "Comptable", "Community Manager", "Marketing"];

// Aperçu de résultats — mini job-board illustratif
const PREVIEW_OFFERS = [
  { title: "Développeur Full-stack", company: "TechCorp CI", tag: "CDI", place: "Abidjan" },
  { title: "Data Analyst", company: "NSIA Banque", tag: "CDI", place: "Abidjan" },
  { title: "Chargé de recrutement", company: "Jumia", tag: "Stage", place: "Dakar" },
];

export function HeroSection() {
  const router = useRouter();
  const [modalAction, setModalAction] = useState<"login" | "register">("login");
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const openModal = (action: "login" | "register") => {
    setModalAction(action);
    setIsOpen(true);
  };

  const handleSelect = (userType: "candidat" | "recruteur") => {
    setIsOpen(false);
    router.push(`/auth/${userType}/${modalAction}`);
  };

  const runSearch = (q?: string) => {
    const term = (q ?? query).trim();
    router.push(term ? `/offres?q=${encodeURIComponent(term)}` : "/offres");
  };

  return (
    <>
      <div className="relative pt-28 pb-16 md:pb-20 px-6 md:px-12 lg:px-20" style={{ background: "var(--y-bg)" }}>
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] items-stretch gap-8 lg:gap-0">
          {/* ── Bloc couleur (gauche) — inspiré du modèle ── */}
          <div
            className="relative overflow-hidden rounded-[32px] p-8 md:p-12 lg:pr-24 flex flex-col justify-center"
            style={{ background: "linear-gradient(155deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
          >
            {/* Orb + rayures diagonales décoratives */}
            <div className="yl-orb" style={{ width: 360, height: 360, top: -120, left: -100, background: "rgba(255,255,255,0.14)" }} />
            <div className="yl-stripes absolute opacity-70" style={{ width: 120, height: 120, bottom: 28, right: 28, borderRadius: 20, filter: "opacity(0.5)" }} />

            <div className="relative z-10">
              {/* Badge */}
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
                style={{ background: "rgba(255,255,255,0.16)", color: "#fff" }}
              >
                ✦ 160+ jobboards · multi-diffusion
              </span>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl lg:text-[3.4rem] font-semibold leading-[1.04] tracking-[-0.035em]" style={{ color: "#fff" }}>
                Trouvez le talent qu&apos;il vous faut.
                <br />
                <span style={{ color: "#e0d6ff" }}>Trouvez l&apos;emploi</span> que vous méritez.
              </h1>

              <p className="mt-5 text-base md:text-lg leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.78)" }}>
                La plateforme de recrutement pensée pour l&apos;Afrique francophone —
                une seule interface pour connecter recruteurs et candidats.
              </p>

              {/* Barre de recherche */}
              <form
                onSubmit={(e) => { e.preventDefault(); runSearch(); }}
                className="mt-7 flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-3xl sm:rounded-full max-w-xl"
                style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
              >
                <div className="flex items-center gap-2 flex-1 px-3">
                  <Search size={18} style={{ color: "var(--y-ink-3)" }} className="shrink-0" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Métier, entreprise, mot-clé…"
                    aria-label="Rechercher une offre"
                    className="w-full h-11 bg-transparent text-sm outline-none"
                    style={{ color: "var(--y-ink)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 shrink-0 text-white transition-transform hover:-translate-y-0.5"
                  style={{ background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)", boxShadow: "var(--y-shadow-violet)" }}
                >
                  Rechercher <ArrowRight size={16} />
                </button>
              </form>

              {/* Suggestions */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => runSearch(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-transform hover:-translate-y-0.5"
                    style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.9)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* CTA recruteur */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openModal("register")}
                  className="h-11 px-5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.35)" }}
                >
                  <Building2 size={16} /> Vous recrutez ? Créez un compte
                </button>
                <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Sans engagement · 14 jours d&apos;essai
                </span>
              </div>
            </div>

            {/* Label vertical — inspiré du « Early talent experts » du modèle */}
            <span
              className="hidden lg:block absolute text-[11px] font-mono uppercase tracking-[0.25em]"
              style={{ writingMode: "vertical-rl", top: "50%", right: 20, transform: "translateY(-50%) rotate(180deg)", color: "rgba(255,255,255,0.45)" }}
            >
              Experts du recrutement digital
            </span>
          </div>

          {/* ── Aperçu produit (droite) ── */}
          <div className="relative lg:-ml-12 flex items-center">
            {/* Carte principale : résultats de recherche */}
            <div
              className="w-full rounded-3xl p-5 lg:rotate-1"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)" }}
            >
              <div className="flex items-center gap-2 h-10 px-3 rounded-xl mb-4" style={{ background: "var(--y-bg-soft)" }}>
                <Search size={15} style={{ color: "var(--y-ink-3)" }} />
                <span className="text-xs" style={{ color: "var(--y-ink-3)" }}>Développeur · Abidjan</span>
              </div>

              <div className="flex flex-col gap-3">
                {PREVIEW_OFFERS.map((o) => (
                  <div key={o.title} className="flex items-center gap-3 p-3 rounded-2xl" style={{ boxShadow: "inset 0 0 0 1px var(--y-line)" }}>
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-semibold"
                      style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
                    >
                      {o.company.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate" style={{ color: "var(--y-ink)" }}>{o.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] truncate" style={{ color: "var(--y-ink-3)" }}>{o.company}</span>
                        <span className="inline-flex items-center gap-0.5 text-[11px]" style={{ color: "var(--y-ink-3)" }}>
                          <MapPin size={10} /> {o.place}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-1 rounded-full shrink-0" style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}>
                      {o.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Carte flottante : diffusion en cours */}
            <div
              className="absolute yl-float rounded-2xl p-4 w-52 hidden sm:block"
              style={{ bottom: -24, left: -20, background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-lg)", animationDelay: "-0.8s" }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--y-success)" }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--y-ink-3)" }}>Diffusion en cours</span>
              </div>
              <div className="text-sm font-medium mb-3" style={{ color: "var(--y-ink)" }}>Développeur Full-stack</div>
              <div className="flex flex-wrap gap-1">
                {["LinkedIn", "Indeed", "Jumia", "+155"].map((b, i) => (
                  <span
                    key={b}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: i === 3 ? "var(--y-primary-50)" : "var(--y-bg-soft)", color: i === 3 ? "var(--y-primary-700)" : "var(--y-ink-2)" }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal user type */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">
              {modalAction === "login" ? "Connexion" : "Créer un compte"}
            </DialogTitle>
            <DialogDescription className="text-center">
              {modalAction === "login" ? "Êtes-vous un candidat ou un recruteur ?" : "Quel type de compte souhaitez-vous créer ?"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { type: "candidat" as const, label: "Candidat", sub: "Je cherche un emploi", Icon: User },
              { type: "recruteur" as const, label: "Recruteur", sub: "Je recrute des talents", Icon: Briefcase },
            ].map(({ type, label, sub, Icon }) => (
              <button
                key={type}
                onClick={() => handleSelect(type)}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-[#a590ff] hover:bg-[#a590ff]/5 transition-all duration-200 group"
              >
                <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center group-hover:bg-[#a590ff]/20 transition-colors">
                  <Icon className="w-8 h-8 text-[#a590ff]" />
                </div>
                <span className="font-semibold text-gray-900">{label}</span>
                <span className="text-xs text-gray-500 text-center">{sub}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
