"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Briefcase, Wallet, BarChart2, Globe, Clock, Bookmark, ArrowRight } from "lucide-react";

const GRADIENTS = [
  "linear-gradient(135deg, #a590ff 0%, #7c5cbf 100%)",
  "linear-gradient(135deg, #ffc480 0%, #d97706 100%)",
  "linear-gradient(135deg, #80c8ff 0%, #2563eb 100%)",
  "linear-gradient(135deg, #80e0c1 0%, #16a34a 100%)",
  "linear-gradient(135deg, #ff9aa2 0%, #be185d 100%)",
];

const initials = (s: string) =>
  s.split(/\s|-|·/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export interface Offre {
  id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  type?: string | null;
  etat?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  anneesexperience?: string | null;
  createdAt?: string | Date;
  views?: number | null;
  gradIdx?: number;
  isNew?: boolean;
  logo?: string | null;
}

interface Props {
  offre: Offre;
  index?: number;
}

export function OffreCard({ offre, index = 0 }: Props) {
  const [hovered, setHovered] = useState(false);
  const grad = GRADIENTS[index % GRADIENTS.length];

  const isNew = offre.isNew ?? (
    offre.createdAt
      ? Date.now() - new Date(offre.createdAt).getTime() < 48 * 60 * 60 * 1000
      : false
  );

  const salaryStr = offre.salaryMin && offre.salaryMax
    ? `${(offre.salaryMin / 1000).toFixed(0)}k – ${(offre.salaryMax / 1000).toFixed(0)}k ${offre.salaryCurrency ?? "XOF"}`
    : offre.salaryMin
      ? `${(offre.salaryMin / 1000).toFixed(0)}k ${offre.salaryCurrency ?? "XOF"}`
      : null;

  const postedStr = offre.createdAt
    ? (() => {
      const diff = Math.floor((Date.now() - new Date(offre.createdAt).getTime()) / 3600000);
      if (diff < 24) return `il y a ${diff}h`;
      const days = Math.floor(diff / 24);
      if (days < 7) return `il y a ${days}j`;
      return `il y a ${Math.floor(days / 7)} sem`;
    })()
    : null;

  return (
    <Link href={`/offres/${offre.id}`}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-2xl p-5 transition-all duration-200 cursor-pointer"
        style={{
          background: "var(--y-bg-pure)",
          boxShadow: hovered
            ? "0 12px 28px -12px rgba(124,92,191,0.30), 0 4px 10px -4px rgba(20,18,32,0.06), inset 0 0 0 1.5px var(--y-primary)"
            : "inset 0 0 0 1px var(--y-line)",
          transform: hovered ? "translateY(-2px)" : "none",
        }}
      >
        {/* Header */}
        <div className="flex gap-3.5 items-start">
          {/* Avatar */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-sm shrink-0"
          // style={{ background: grad }}
          >
            {offre.logo ? (<div>
              <img
                src={offre.logo}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>) : (<div><img
              src='/img/empty-offre.png'
              className="w-full h-full object-cover rounded-xl"
            /></div>)}
            {/* {initials(offre.company ?? "?")} */}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium" style={{ color: "var(--y-ink-2)" }}>
                {offre.company}
              </span>
              {offre.location && (
                <>
                  <span className="w-1 h-1 rounded-full" style={{ background: "var(--y-ink-4)" }} />
                  <span className="text-[13px] flex items-center gap-1" style={{ color: "var(--y-ink-3)" }}>
                    <MapPin size={11} /> {offre.location}
                  </span>
                </>
              )}
              {isNew && (
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: "var(--y-primary-50)", color: "var(--y-primary-700)" }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--y-primary)" }} />
                  Nouveau
                </span>
              )}
            </div>
            <h3 className="mt-1.5 text-[17px] font-semibold tracking-tight" style={{ color: "var(--y-ink)", letterSpacing: "-0.015em" }}>
              {offre.title}
            </h3>
          </div>

          {/* Bookmark */}
          <button
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{
              background: hovered ? "var(--y-primary-50)" : "var(--y-bg)",
              color: hovered ? "var(--y-primary-700)" : "var(--y-ink-3)",
            }}
            onClick={(e) => e.preventDefault()}
          >
            <Bookmark size={14} />
          </button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {(
            [
              offre.type ? { icon: Briefcase, label: offre.type } : null,
              salaryStr ? { icon: Wallet, label: salaryStr } : null,
              offre.anneesexperience ? { icon: BarChart2, label: offre.anneesexperience } : null,
            ] as ({ icon: React.ElementType; label: string } | null)[]
          )
            .filter((t): t is { icon: React.ElementType; label: string } => t !== null)
            .map((tag, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "transparent", color: "var(--y-ink-2)", boxShadow: "inset 0 0 0 1px var(--y-line-2)" }}
              >
                <tag.icon size={11} /> {tag.label}
              </span>
            ))}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between mt-4 pt-3.5"
          style={{ borderTop: "1px dashed var(--y-line-2)" }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--y-ink-3)" }}>
            {postedStr && <><Clock size={11} /> {postedStr}</>}
          </div>
          <span
            className="text-sm font-medium flex items-center gap-1"
            style={{ color: "var(--y-primary-700)" }}
          >
            Voir l&apos;offre <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}
