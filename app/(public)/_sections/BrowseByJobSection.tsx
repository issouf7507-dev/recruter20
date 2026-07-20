"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const JOBS = [
  "Développeur", "Commercial", "Comptable", "Chef de projet",
  "Community Manager", "Assistant RH", "Data Analyst", "Designer UI/UX",
  "Technicien réseau", "Chargé de clientèle", "Logisticien", "Ingénieur",
];

export function BrowseByJobSection() {
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
              Par métier
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--y-ink)" }}
            >
              Explorez les offres par métier
            </h2>
          </motion.div>

          <Link
            href="/offres"
            className="h-11 px-5 rounded-full text-sm font-medium flex items-center gap-2 shrink-0 self-start md:self-auto"
            style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
          >
            Tous les métiers <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {JOBS.map((job, i) => (
            <motion.div
              key={job}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: (i % 6) * 0.05 }}
              viewport={{ once: true }}
            >
              <Link
                href="/offres"
                className="group flex items-center justify-between h-16 px-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line)" }}
              >
                <span className="text-sm font-medium" style={{ color: "var(--y-ink)" }}>{job}</span>
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                  style={{ color: "var(--y-primary-700)" }}
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
