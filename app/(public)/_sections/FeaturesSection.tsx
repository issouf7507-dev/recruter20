"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserIcon, BriefcaseIcon, ShieldCheckIcon } from "lucide-react";

const features = [
  { icon: UserIcon, title: "Tableau Kanban", desc: "Suivez vos candidatures en temps réel avec un système intuitif de drag & drop." },
  { icon: BriefcaseIcon, title: "Multi-diffusion", desc: "Publiez sur 160+ jobboards en un seul clic et maximisez votre visibilité." },
  { icon: ShieldCheckIcon, title: "Collaboration", desc: "Travaillez en équipe avec un système de permissions et de partage avancé." },
  { icon: UserIcon, title: "Statistiques", desc: "Analysez vos performances et optimisez vos campagnes de recrutement." },
];

export function FeaturesSection() {
  return (
    <div className="mt-16 md:mt-32">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true }}
        >
          <h3 className="text-lg md:text-xl font-bold text-[#a590ff]">Fonctionnalités Avancées</h3>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mt-4">
            Recrutez plus vite, <br /> recrutez mieux
          </h1>
          <p className="mt-6 md:mt-10 text-gray-500 text-sm md:text-base">
            Ylsix vous offre tous les outils nécessaires pour optimiser votre processus de recrutement de A à Z. Du
            sourcing à l'embauche, gérez l'ensemble de vos recrutements sur une seule plateforme intuitive et
            performante. Gagnez du temps et de l'efficacité.
          </p>
          <Link href="/offres">
            <button className="mt-6 md:mt-10 btn2 liquid w-full md:w-auto">Trouver un emploi</button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
              viewport={{ once: true }}
              className="bg-[#a590ff] text-white h-52 rounded-lg px-10 py-4"
            >
              <f.icon className="w-12 h-12 opacity-50" />
              <h1 className="text-2xl font-bold mb-4">{f.title}</h1>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
