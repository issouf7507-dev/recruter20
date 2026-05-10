"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "10K+", label: "Recrutements réussis" },
  { value: "500+", label: "Entreprises clientes" },
  { value: "40%", label: "Gain de temps moyen" },
  { value: "160+", label: "Jobboards connectés" },
];

export function StatsSection() {
  return (
    <div className="mt-[320px] sm:mt-[280px] md:mt-56 lg:mt-52">
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ylsix en chiffres</h2>
            <p className="text-gray-600 text-base md:text-lg">Des résultats concrets pour nos utilisateurs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h3 className="text-6xl font-bold text-[#a590ff] mb-2">{stat.value}</h3>
                <p className="text-gray-600 text-lg">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
