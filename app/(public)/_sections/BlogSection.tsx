"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

// Placeholders — à brancher sur un vrai CMS / une collection d'articles
const UNSPLASH = "?auto=format&fit=crop&w=900&q=70";
const ARTICLES = [
  {
    tag: "Recherche d'emploi",
    title: "Décrocher un stage ou une alternance : le guide complet",
    excerpt: "Les étapes clés, le calendrier idéal et les erreurs à éviter pour maximiser vos chances.",
    span: "lg:col-span-2",
    img: `https://images.unsplash.com/photo-1523240795612-9a054b0db644${UNSPLASH}`,
  },
  {
    tag: "Conseils carrière",
    title: "5 erreurs à éviter lors de votre premier emploi",
    excerpt: "Ce que personne ne vous dit avant de signer votre premier contrat.",
    span: "",
    img: `https://images.unsplash.com/photo-1600880292203-757bb62b4baf${UNSPLASH}`,
  },
  {
    tag: "Soft skills",
    title: "Les compétences humaines qui font la différence",
    excerpt: "Communication, adaptabilité, esprit d'équipe : comment les valoriser.",
    span: "",
    img: `https://images.unsplash.com/photo-1519389950473-47ba0277781c${UNSPLASH}`,
  },
  {
    tag: "Entretien",
    title: "Rebondir après un refus de candidature",
    excerpt: "Transformer un « non » en tremplin pour votre prochaine opportunité.",
    span: "lg:col-span-2",
    img: `https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e${UNSPLASH}`,
  },
];

export function BlogSection() {
  return (
    <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Blog & ressources
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--y-ink)" }}
            >
              Conseils, tendances & guides
            </h2>
          </motion.div>

          <Link
            href="/ressources"
            className="h-11 px-5 rounded-full text-sm font-medium flex items-center gap-2 shrink-0 self-start md:self-auto"
            style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
          >
            Tous les articles <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {ARTICLES.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              viewport={{ once: true }}
              className={a.span}
            >
              <Link
                href="/ressources"
                className="group flex flex-col h-full rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
                style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
              >
                {/* Visuel */}
                <div className="h-44 relative overflow-hidden" style={{ background: "var(--y-primary-100)" }}>
                  <img
                    src={a.img}
                    alt={a.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span
                    className="absolute top-3 left-3 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: "var(--y-bg-pure)", color: "var(--y-primary-700)" }}
                  >
                    {a.tag}
                  </span>
                </div>

                <div className="flex flex-col flex-1 p-5">
                  <h3 className="text-lg font-semibold tracking-tight leading-snug" style={{ color: "var(--y-ink)" }}>
                    {a.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed flex-1" style={{ color: "var(--y-ink-3)" }}>
                    {a.excerpt}
                  </p>
                  <span
                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:gap-2"
                    style={{ color: "var(--y-primary-700)" }}
                  >
                    Lire l'article <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
