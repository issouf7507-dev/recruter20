"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Building2, Sparkles } from "lucide-react";

const POINTS = [
  { value: "10 ans", label: "d'expertise recrutement" },
  { value: "38 000+", label: "candidats accompagnés" },
  { value: "2 100+", label: "recruteurs partenaires" },
];

export function ExpertsSection() {
  return (
    <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
      <div
        className="max-w-7xl mx-auto rounded-[32px] overflow-hidden relative"
        style={{ background: "var(--y-bg-ink)" }}
      >
        {/* Orb décoratif */}
        <div
          className="yl-orb"
          style={{ width: 420, height: 420, top: -160, right: -120, background: "rgba(165,144,255,0.28)" }}
        />

        <div className="relative z-10 px-8 md:px-14 py-14 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full mb-6"
              style={{ background: "rgba(165,144,255,0.16)", color: "#cbbcff" }}
            >
              <Sparkles size={13} /> Les experts du recrutement digital
            </span>

            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em] leading-[1.05]"
              style={{ color: "#fff" }}
            >
              La bonne rencontre entre les talents et les entreprises
            </h2>

            <p className="mt-6 text-base md:text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
              Ylsix met la technologie et le matching intelligent au service du recrutement en
              Afrique francophone. Candidats et recruteurs se rencontrent plus vite, plus juste,
              sur une seule plateforme pensée pour le terrain.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/offres"
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
              >
                <Upload size={16} /> Déposer mon CV
              </Link>
              <Link
                href="/auth/recruteur/register"
                className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2 transition-colors"
                style={{ color: "#fff", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.25)" }}
              >
                <Building2 size={16} /> Je recrute
              </Link>
            </div>
          </motion.div>

          {/* Stats row */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10" style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}>
            {POINTS.map((p, i) => (
              <motion.div
                key={p.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#fff" }}>
                  {p.value}
                </div>
                <div className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {p.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
