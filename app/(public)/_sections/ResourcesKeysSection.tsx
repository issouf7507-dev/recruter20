"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FileText, MessagesSquare, PenLine, Compass, ArrowRight } from "lucide-react";

const KEYS = [
  { icon: FileText, title: "Rédiger un CV percutant", desc: "Modèles, exemples et conseils pour un CV qui capte l'attention des recruteurs.", href: "/ressources#cv" },
  { icon: MessagesSquare, title: "Réussir vos entretiens", desc: "Les questions les plus fréquentes par métier et comment y répondre avec assurance.", href: "/ressources#entretien" },
  { icon: PenLine, title: "La lettre de motivation", desc: "Structurez une lettre claire et convaincante en quelques minutes.", href: "/ressources#lettre" },
  { icon: Compass, title: "Conseils carrière", desc: "Orientation, négociation salariale, reconversion : nos guides pour avancer.", href: "/ressources#carriere" },
];

export function ResourcesKeysSection() {
  return (
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
            Ressources candidats
          </p>
          <h2
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
            style={{ color: "var(--y-ink)" }}
          >
            On vous donne les clés pour décrocher le poste
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
            Des guides concrets, des modèles prêts à l'emploi et des stratégies éprouvées
            pour chaque étape de votre recherche.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {KEYS.map((k, i) => (
            <motion.div
              key={k.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
              viewport={{ once: true }}
            >
              <Link
                href={k.href}
                className="group flex flex-col h-full rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                >
                  <k.icon size={22} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                  {k.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: "var(--y-ink-3)" }}>
                  {k.desc}
                </p>
                <span
                  className="mt-5 inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:gap-2"
                  style={{ color: "var(--y-primary-700)" }}
                >
                  En savoir plus <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
