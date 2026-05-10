"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PaymentButton } from "@/components/shared/PaymentButton";

export function PricingSection() {
  return (
    <div className="mt-16 md:mt-20">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-lg md:text-xl font-bold text-[#a590ff] mb-2">Tarifs</h3>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Des plans adaptés à vos besoins</h2>
            <p className="text-gray-600 text-base md:text-lg">Commencez gratuitement, évoluez quand vous êtes prêt</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-gray-600 mb-6">Pour découvrir la plateforme</p>
              <div className="mb-6"><span className="text-5xl font-bold">Gratuit</span></div>
              <ul className="space-y-4 mb-8">
                {["1 offre d'emploi active", "Tableau Kanban basique", "Accès à la base candidats", "Support par email"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PaymentButton planId="pro">Essayer 14 jours gratuits</PaymentButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="rounded-2xl p-8 shadow-2xl transform scale-105 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#a590ff] text-white px-4 py-1 rounded-full text-sm font-bold">
                Populaire
              </div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="mb-6">Pour les recruteurs actifs</p>
              <div className="mb-6">
                <span className="text-5xl font-bold">XXX XOF</span>
                <span>/mois</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Offres illimitées", "Multi-diffusion sur 160+ jobboards", "Tableau Kanban avancé", "Statistiques détaillées", "Support prioritaire 24/7"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <PaymentButton planId="pro">Essayer 14 jours gratuits</PaymentButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-bold mb-2">Entreprise</h3>
              <p className="text-gray-600 mb-6">Pour les grandes équipes</p>
              <div className="mb-6"><span className="text-5xl font-bold">Sur mesure</span></div>
              <ul className="space-y-4 mb-8">
                {["Tout du plan Pro", "Utilisateurs illimités", "API & Intégrations personnalisées", "Account Manager dédié", "Formation sur site"].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[#a590ff] mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/Contact">
                <button className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                  Nous contacter
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
