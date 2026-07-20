"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Code2, ShoppingBag, Landmark, Megaphone, Users, HardHat,
  ShieldCheck, HeartPulse, ArrowRight,
} from "lucide-react";

const SECTORS = [
  { icon: Code2, name: "Informatique & Digital", desc: "Dév, data, cybersécurité, produit", accent: "linear-gradient(135deg, #a590ff, #7c5cbf)" },
  { icon: ShoppingBag, name: "Commerce & Vente", desc: "Business dev, retail, key account", accent: "linear-gradient(135deg, #ffc480, #d97706)" },
  { icon: Landmark, name: "Finance & Comptabilité", desc: "Compta, contrôle de gestion, audit", accent: "linear-gradient(135deg, #80c8ff, #2563eb)" },
  { icon: Megaphone, name: "Marketing & Communication", desc: "Growth, social media, contenu", accent: "linear-gradient(135deg, #ff9aa2, #be185d)" },
  { icon: Users, name: "Ressources Humaines", desc: "Recrutement, paie, formation", accent: "linear-gradient(135deg, #80e0c1, #16a34a)" },
  { icon: HardHat, name: "BTP & Ingénierie", desc: "Chantier, bureau d'études, QHSE", accent: "linear-gradient(135deg, #a590ff, #7c5cbf)" },
  { icon: ShieldCheck, name: "Banque & Assurance", desc: "Conseil, risque, back-office", accent: "linear-gradient(135deg, #80c8ff, #2563eb)" },
  { icon: HeartPulse, name: "Santé & Social", desc: "Soins, pharma, action sociale", accent: "linear-gradient(135deg, #ff9aa2, #be185d)" },
];

export function SectorsSection() {
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
          <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
            Par secteur d'activité
          </p>
          <h2
            className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
            style={{ color: "var(--y-ink)" }}
          >
            Qui recrute en ce moment&nbsp;?
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)" }}>
            Explorez les offres par domaine et trouvez celles qui correspondent à votre expertise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SECTORS.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: (i % 4) * 0.07 }}
              viewport={{ once: true }}
            >
              <Link
                href="/offres"
                className="group block h-full rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
                style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line)" }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-white mb-4"
                  style={{ background: s.accent }}
                >
                  <s.icon size={20} />
                </div>
                <h3 className="text-base font-semibold tracking-tight" style={{ color: "var(--y-ink)" }}>
                  {s.name}
                </h3>
                <p className="mt-1 text-[13px]" style={{ color: "var(--y-ink-3)" }}>
                  {s.desc}
                </p>
                <span
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-transform group-hover:gap-2"
                  style={{ color: "var(--y-primary-700)" }}
                >
                  Voir les offres <ArrowRight size={14} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
