"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useOffers } from "@/lib/hooks/use-offers";
import { OffreCard } from "@/components/public/OffreCard";

export function FeaturedOffersSection() {
  const { data, isLoading } = useOffers({ page: 1, limit: 6, etat: "active" });

  const offers = (data?.items ?? [])
    .filter((o) => o.etat === "active")
    .slice(0, 6);

  return (
    <section className="mt-24 md:mt-32 px-6 md:px-12 lg:px-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--y-primary-700)" }}>
              Opportunités du moment
            </p>
            <h2
              className="mt-3 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.03em]"
              style={{ color: "var(--y-ink)" }}
            >
              Les offres qui recrutent
              <br className="hidden md:block" /> en ce moment
            </h2>
          </motion.div>

          <Link
            href="/offres"
            className="h-11 px-5 rounded-full text-sm font-medium flex items-center gap-2 shrink-0 self-start md:self-auto transition-colors"
            style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
          >
            Voir toutes les offres <ArrowRight size={15} />
          </Link>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl h-44 animate-pulse"
                style={{ background: "var(--y-bg-soft)" }}
              />
            ))}
          </div>
        ) : offers.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center"
            style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line)" }}
          >
            <p className="text-base font-medium" style={{ color: "var(--y-ink)" }}>
              De nouvelles offres arrivent très bientôt.
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--y-ink-3)" }}>
              Créez une alerte pour être prévenu dès leur publication.
            </p>
            <Link
              href="/offres"
              className="mt-5 inline-flex h-11 px-5 rounded-full text-sm font-medium items-center gap-2 text-white"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
            >
              Explorer les offres <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {offers.map((offre, index) => (
              <motion.div
                key={offre.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index % 3) * 0.08 }}
                viewport={{ once: true }}
              >
                <OffreCard offre={offre} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
