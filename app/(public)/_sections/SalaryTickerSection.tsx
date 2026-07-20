"use client";

import Link from "next/link";

// Ticker défilant d'offres + salaires — inspiré du bandeau du modèle.
// À brancher plus tard sur les offres réelles ; échantillon représentatif ici.
const TICKER = [
  { title: "Développeur Full-stack", salary: "800 000 FCFA" },
  { title: "Data Analyst", salary: "650 000 FCFA" },
  { title: "Chef de projet digital", salary: "1 200 000 FCFA" },
  { title: "Comptable", salary: "450 000 FCFA" },
  { title: "Community Manager", salary: "350 000 FCFA" },
  { title: "Ingénieur DevOps", salary: "1 000 000 FCFA" },
  { title: "Chargé de recrutement", salary: "500 000 FCFA" },
  { title: "Designer UI/UX", salary: "700 000 FCFA" },
];

export function SalaryTickerSection() {
  // On duplique la liste pour une boucle sans couture (translateX -50%).
  const items = [...TICKER, ...TICKER];

  return (
    <Link
      href="/offres"
      aria-label="Voir toutes les offres"
      className="yl-marquee group relative block overflow-hidden select-none"
      style={{ background: "var(--y-bg-ink)" }}
    >
      {/* Dégradés de fondu aux extrémités */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-10" style={{ background: "linear-gradient(90deg, var(--y-bg-ink), transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-10" style={{ background: "linear-gradient(270deg, var(--y-bg-ink), transparent)" }} />

      <div className="yl-marquee-track py-3.5">
        {items.map((it, i) => (
          <span key={i} className="flex items-center gap-3 px-6 whitespace-nowrap text-sm">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "var(--y-primary)" }} />
            <span className="font-medium" style={{ color: "#fff" }}>{it.title}</span>
            <span className="font-semibold tabular-nums" style={{ color: "var(--y-primary)" }}>{it.salary}</span>
          </span>
        ))}
      </div>
    </Link>
  );
}
