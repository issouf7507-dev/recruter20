"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section
      className="mt-24 md:mt-32 relative overflow-hidden px-6 md:px-12 lg:px-20 py-16 md:py-20"
      style={{ background: "linear-gradient(135deg, #7c5cbf 0%, #5f47a0 55%, #4a3781 100%)" }}
    >
      {/* Orbs + rayures décoratives */}
      <div className="yl-orb" style={{ width: 420, height: 420, top: -160, left: -120, background: "rgba(255,255,255,0.12)" }} />
      <div className="yl-stripes absolute opacity-40" style={{ width: 160, height: 160, bottom: -40, right: 40, borderRadius: 24 }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-semibold" style={{ color: "#e0d6ff" }}>Prêt à démarrer ?</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]" style={{ color: "#fff" }}>
            Créez votre compte gratuit et découvrez vos correspondances
          </h2>
          <p className="mt-4 text-base md:text-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Rejoignez 2 100+ recruteurs et 38 000 candidats en Afrique francophone.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <Link
            href="/auth/candidat/register"
            className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
            style={{ background: "#fff", color: "var(--y-primary-700)", boxShadow: "var(--y-shadow-lg)" }}
          >
            Créer un compte <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/candidat/login"
            className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
            style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.4)" }}
          >
            Se connecter
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
