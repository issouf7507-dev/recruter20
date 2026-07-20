"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

// Logo Google « G » (4 couleurs) — inspiré des cartes d'avis du modèle
const GoogleG = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">
    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z" />
    <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1 .7-2.4 1.1-4 1.1-3 0-5.6-2-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z" />
    <path fill="#FBBC05" d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1Z" />
    <path fill="#EA4335" d="M12 4.8c1.7 0 3.2.6 4.4 1.7l3.3-3.3A12 12 0 0 0 1.4 6.7l4 3.1C6.4 6.9 9 4.8 12 4.8Z" />
  </svg>
);

const AVATAR_COLORS = [
  "linear-gradient(135deg,#a590ff,#7c5cbf)",
  "linear-gradient(135deg,#f59e0b,#d97706)",
  "linear-gradient(135deg,#2563eb,#1d4ed8)",
  "linear-gradient(135deg,#16a34a,#15803d)",
  "linear-gradient(135deg,#db2777,#be185d)",
  "linear-gradient(135deg,#0891b2,#0e7490)",
];

const REVIEWS = [
  { name: "Sophie Martin", role: "Directrice RH", date: "22 juin 2026", text: "Ylsix a révolutionné notre processus de recrutement. Le tableau Kanban nous permet de suivre chaque candidature en temps réel — nous avons réduit notre temps de recrutement de 40 %." },
  { name: "Thomas Dubois", role: "Responsable Recrutement", date: "21 juin 2026", text: "La mise en place a été rapide et intuitive. L'interface est moderne et nos équipes l'ont adoptée immédiatement. Un vrai gain de productivité !" },
  { name: "Marie Leroy", role: "Chargée de Recrutement", date: "20 juin 2026", text: "La multi-diffusion sur 160+ jobboards nous fait gagner un temps précieux. Plus besoin de publier manuellement sur chaque plateforme." },
  { name: "Alexandre Petit", role: "Développeur Full-Stack", date: "19 juin 2026", text: "En tant que candidat, j'ai adoré la simplicité de la plateforme. Le générateur de CV est excellent et le suivi des candidatures très clair." },
  { name: "Camille Bernard", role: "Manager RH", date: "18 juin 2026", text: "La collaboration en équipe est fluide. Nous pouvons tous suivre l'avancement des recrutements et partager nos feedbacks facilement." },
  { name: "Lucas Simon", role: "Chef de Projet Digital", date: "17 juin 2026", text: "Grâce à Ylsix, j'ai trouvé mon emploi actuel en moins de deux semaines. La messagerie intégrée facilite vraiment les échanges avec les recruteurs." },
];

const initials = (name: string) => name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

export function TestimonialsSection() {
  return (
    <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>Témoignages</p>
          <h2 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]" style={{ color: "var(--y-ink)" }}>
            Ils avancent avec Ylsix
          </h2>
          {/* Note globale */}
          <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full" style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}>
            <GoogleG size={18} />
            <span className="text-sm font-semibold" style={{ color: "var(--y-ink)" }}>4,9</span>
            <span className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} fill="#f59e0b" stroke="none" />
              ))}
            </span>
            <span className="text-sm" style={{ color: "var(--y-ink-3)" }}>· 1 265 avis</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 3) * 0.08 }}
              viewport={{ once: true }}
              className="flex flex-col rounded-2xl p-6"
              style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-sm)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
                  style={{ background: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                >
                  {initials(r.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold truncate" style={{ color: "var(--y-ink)" }}>{r.name}</div>
                  <div className="text-xs truncate" style={{ color: "var(--y-ink-3)" }}>{r.role}</div>
                </div>
                <GoogleG size={20} />
              </div>

              <div className="flex items-center gap-2 mt-4">
                <span className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} fill="#f59e0b" stroke="none" />
                  ))}
                </span>
                <span className="text-xs" style={{ color: "var(--y-ink-4)" }}>{r.date}</span>
              </div>

              <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--y-ink-2)" }}>
                {r.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
