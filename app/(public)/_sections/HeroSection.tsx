"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Search, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { User, Briefcase } from "lucide-react";

const StatChip = ({ value, label, accent }: { value: string; label: string; accent: string }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
    style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-md)" }}
  >
    <span className="w-2 h-8 rounded-full shrink-0" style={{ background: accent }} />
    <div>
      <div className="text-xl font-semibold tabular-nums tracking-tight" style={{ color: "var(--y-ink)" }}>{value}</div>
      <div className="text-[11px] mt-0.5" style={{ color: "var(--y-ink-3)" }}>{label}</div>
    </div>
  </div>
);

export function HeroSection() {
  const router = useRouter();
  const [modalAction, setModalAction] = useState<"login" | "register">("login");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = (action: "login" | "register") => {
    setModalAction(action);
    setIsOpen(true);
  };

  const handleSelect = (userType: "candidat" | "recruteur") => {
    setIsOpen(false);
    router.push(`/auth/${userType}/${modalAction}`);
  };

  return (
    <>
      <div
        className="relative min-h-screen overflow-hidden pt-28 pb-12 px-6 md:px-12 lg:px-20"
        style={{ background: "var(--y-bg)" }}
      >
        {/* Orbs décoratifs */}
        <div className="yl-orb" style={{ width: 500, height: 500, top: -140, right: -140, background: "rgba(165,144,255,0.32)" }} />
        <div className="yl-orb" style={{ width: 340, height: 340, bottom: -100, left: -80, background: "rgba(165,144,255,0.18)", animationDelay: "-2s" }} />

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12 items-start">
          {/* Left */}
          <div>
            {/* Badge */}
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
              style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
            >
              ✦ 160+ jobboards · multi-diffusion
            </span>

            {/* Titre dual-persona */}
            <h1
              className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.02] tracking-[-0.035em] mt-2 mb-0"
              style={{ color: "var(--y-ink)" }}
            >
              Trouvez le talent
              <br />qu&apos;il vous faut.
              <br />
              <span style={{ color: "var(--y-primary-700)" }}>Trouvez l&apos;emploi</span>
              <br />
              que vous méritez.
            </h1>

            <p className="mt-6 text-base md:text-lg leading-relaxed max-w-xl" style={{ color: "var(--y-ink-2)" }}>
              La plateforme de recrutement pensée pour l&apos;Afrique francophone.
              Une seule interface, deux missions&nbsp;: connecter recruteurs et candidats.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => openModal("register")}
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
              >
                <Building2 size={16} /> Je recrute
              </button>
              <Link
                href="/offres"
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
              >
                <Search size={16} /> Je cherche un emploi
              </Link>
              <span className="text-xs" style={{ color: "var(--y-ink-3)" }}>
                Sans engagement · 14 jours d&apos;essai
              </span>
            </div>

            {/* Stats */}
            <div className="mt-12 flex flex-wrap gap-3">
              <StatChip value="1 248" label="offres actives" accent="var(--y-primary)" />
              <div className="yl-float">
                <StatChip value="38k" label="candidats inscrits" accent="oklch(0.78 0.10 250)" />
              </div>
              <div className="yl-float" style={{ animationDelay: "-1.6s" }}>
                <StatChip value="160+" label="jobboards diffusés" accent="oklch(0.86 0.08 50)" />
              </div>
            </div>
          </div>

          {/* Right — imagery + floating card */}
          <div className="relative hidden lg:block" style={{ minHeight: 520 }}>
            {/* Image placeholders */}
            <div
              className="absolute top-0 right-0 w-80 h-96 rounded-3xl rotate-2"
              style={{
                background: "var(--y-bg-soft)",
                backgroundImage: "repeating-linear-gradient(135deg, rgba(165,144,255,0.08) 0, rgba(165,144,255,0.08) 1px, transparent 1px, transparent 9px)",
              }}
            />
            <div
              className="absolute bottom-6 left-0 w-56 h-64 rounded-3xl -rotate-3"
              style={{
                background: "var(--y-primary-100)",
                backgroundImage: "repeating-linear-gradient(135deg, rgba(124,92,191,0.12) 0, rgba(124,92,191,0.12) 1px, transparent 1px, transparent 9px)",
              }}
            />

            {/* Floating diffusion card */}
            <div
              className="absolute yl-float rounded-2xl p-4 w-56"
              style={{
                top: 220, left: -24,
                background: "var(--y-bg-pure)",
                boxShadow: "var(--y-shadow-lg)",
                animationDelay: "-0.8s",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ background: "var(--y-success)" }} />
                <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: "var(--y-ink-3)" }}>Diffusion en cours</span>
              </div>
              <div className="text-sm font-medium mb-3" style={{ color: "var(--y-ink)" }}>Développeur Full-stack</div>
              <div className="flex flex-wrap gap-1">
                {["LinkedIn", "Indeed", "Jumia", "Novojob", "+155"].map((b, i) => (
                  <span
                    key={b}
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: i === 4 ? "var(--y-primary-50)" : "var(--y-bg-soft)",
                      color: i === 4 ? "var(--y-primary-700)" : "var(--y-ink-2)",
                    }}
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
