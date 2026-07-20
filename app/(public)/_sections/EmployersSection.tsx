"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Users2, LineChart } from "lucide-react";

// Placeholders — à remplacer par les vrais logos clients
const LOGOS = ["Orange", "MTN", "Ecobank", "Jumia", "Sonatel", "NSIA", "Wave", "Moov"];

const PERKS = [
  { icon: Zap, label: "Multi-diffusion sur 160+ jobboards" },
  { icon: Users2, label: "Pipeline collaboratif en temps réel" },
  { icon: LineChart, label: "Statistiques de recrutement détaillées" },
];

export function EmployersSection() {
  return (
    <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — pitch */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Espace recruteurs
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]"
              style={{ color: "var(--y-ink)" }}
            >
              La confiance des entreprises qui recrutent
            </h2>
            <p className="mt-5 text-base md:text-lg leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
              Des startups aux grands groupes, les équipes RH s'appuient sur Ylsix pour attirer,
              trier et embaucher les meilleurs profils — plus vite et sans se disperser.
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {PERKS.map((p) => (
                <li key={p.label} className="flex items-center gap-3">
                  <span
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                  >
                    <p.icon size={17} />
                  </span>
                  <span className="text-[15px]" style={{ color: "var(--y-ink)" }}>{p.label}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/recruteur/register"
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", boxShadow: "var(--y-shadow-violet)" }}
              >
                Découvrir l'offre recruteur <ArrowRight size={15} />
              </Link>
              <Link
                href="/tarifs"
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
              >
                Voir les tarifs
              </Link>
            </div>
          </motion.div>

          {/* Right — logos grid (placeholders) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="rounded-3xl p-8 md:p-10"
            style={{ background: "var(--y-bg-soft)" }}
          >
            <p className="text-[11px] font-mono uppercase tracking-widest mb-6" style={{ color: "var(--y-ink-3)" }}>
              Ils recrutent avec Ylsix
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {LOGOS.map((name) => (
                <div
                  key={name}
                  className="h-16 rounded-xl flex items-center justify-center text-sm font-semibold tracking-tight"
                  style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)", color: "var(--y-ink-4)" }}
                >
                  {name}
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs" style={{ color: "var(--y-ink-4)" }}>
              * Logos illustratifs — à remplacer par vos références clients.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
