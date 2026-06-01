"use client";

import { SiteHeader } from "@/components/site-header";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { useAlertes } from "@/lib/hooks/use-alertes";
import { ProfilCompletion } from "@/components/candidat/ProfilCompletion";
import {
  IconUser, IconBriefcase, IconFileText, IconMessage,
  IconBell, IconTarget, IconFolder, IconArrowRight,
  IconSparkles, IconCalendar,
} from "@tabler/icons-react";

// ─── Palette ───────────────────────────────────────────────────────────
const C = {
  // Structure
  pageBg:      "#F7F8FA",
  cardBg:      "#fff",
  border:      "rgba(17,24,39,0.09)",
  borderSub:   "rgba(17,24,39,0.06)",
  hoverBg:     "#F5F5F7",

  // Typographie
  ink:         "#0B0E14",
  ink2:        "#6B7280",
  ink3:        "#9CA3AF",
  ink4:        "#D1D5DB",

  // Violet (brand)
  violet:      "#7C5CFC",
  violetBg:    "rgba(124,92,252,0.09)",
  violetBgMd:  "rgba(124,92,252,0.16)",
  violetBorder:"rgba(124,92,252,0.20)",

  // Sémantique
  green:       "#059669",
  greenBg:     "rgba(5,150,105,0.10)",
  amber:       "#B45309",
  amberBg:     "rgba(180,83,9,0.10)",
  red:         "#DC2626",
  redBg:       "rgba(220,38,38,0.10)",
  blue:        "#2563EB",
  blueBg:      "rgba(37,99,235,0.10)",

  // Divers
  active:      "#10B981",
  font:        '"Inter Tight", system-ui, sans-serif',
} as const;

// ─── Statuts candidatures ──────────────────────────────────────────────
const STATUT: Record<string, { label: string; bg: string; color: string }> = {
  EN_ATTENTE:  { label: "En attente",  bg: C.amberBg, color: C.amber },
  EN_REVISION: { label: "En révision", bg: C.blueBg,  color: C.blue  },
  ACCEPTE:     { label: "Accepté",     bg: C.greenBg, color: C.green },
  REFUSE:      { label: "Refusé",      bg: C.redBg,   color: C.red   },
};

// ─── Navigation rapide ─────────────────────────────────────────────────
const QUICK_NAV = [
  { title: "Mon profil",           url: "/candidat/profil",      icon: IconUser,      desc: "Infos personnelles & compétences" },
  { title: "Matching IA",          url: "/candidat/matching",    icon: IconSparkles,  desc: "Offres recommandées pour vous"   },
  { title: "Parcourir les offres", url: "/candidat/offres",      icon: IconBriefcase, desc: "Rechercher et postuler"          },
  { title: "Messages",             url: "/candidat/messages",    icon: IconMessage,   desc: "Vos conversations"               },
  { title: "Documents",            url: "/candidat/documents",   icon: IconFolder,    desc: "CV, lettres de motivation"       },
  { title: "Alertes emploi",       url: "/candidat/alertes",     icon: IconBell,      desc: "Recevoir de nouvelles opportunités" },
  { title: "Entretiens & Notes",   url: "/candidat/entretiens",  icon: IconCalendar,  desc: "Suivi de vos entretiens"         },
  { title: "Objectifs",            url: "/candidat/objectifs",   icon: IconTarget,    desc: "Suivi de carrière"               },
];

// ─── StatCard ──────────────────────────────────────────────────────────
function StatCard({ value, label, sub, accent }: { value: string | number; label: string; sub?: string; accent?: string }) {
  return (
    <div style={{ background: C.cardBg, border: `1px solid ${C.border}`, borderRadius: 12, padding: "18px 20px", fontFamily: C.font }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.ink3, marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.024em", color: accent ?? C.ink, lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 12, color: C.ink3, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────
export default function CandidatDashboardPage() {
  const { candidat } = useCandidat();
  const { candidatures = [] } = useCandidatures(candidat?.id);
  const { data: alertes = [] } = useAlertes(candidat?.id);

  const total      = (candidatures as any[]).length;
  const enAttente  = (candidatures as any[]).filter((c) => c.status === "EN_ATTENTE").length;
  const acceptees  = (candidatures as any[]).filter((c) => c.status === "ACCEPTE").length;
  const alertesAct = (alertes as any[]).filter((a) => a.active).length;
  const dernières  = (candidatures as any[]).slice(0, 5);
  const mois       = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <>
      <SiteHeader title="Tableau de bord" />

      {/* Wrapper fixe — pas de scroll global */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.pageBg, fontFamily: C.font }}>

        {/* ── Section fixe ── */}
        <div style={{ flexShrink: 0, padding: "24px 24px 16px" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto" }}>

            {/* Greeting */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: C.ink3, marginBottom: 7 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.active, display: "inline-block" }} />
                Espace candidat · {mois}
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.022em", color: C.ink, margin: "0 0 4px" }}>
                Bonjour{candidat?.prenom ? `, ${candidat.prenom}` : ""} 👋
              </h1>
              <p style={{ fontSize: 13.5, color: C.ink2, margin: 0 }}>Voici un aperçu de votre activité.</p>
            </div>

            {/* Stats */}
            <div className="cand-stat-grid" style={{ marginBottom: 16 }}>
              <StatCard value={total}      label="Candidatures"    sub="au total" />
              <StatCard value={enAttente}  label="En attente"      sub="réponse attendue"  accent={C.amber}  />
              <StatCard value={acceptees}  label="Acceptées"       sub="félicitations !"   accent={C.green}  />
              <StatCard value={alertesAct} label="Alertes actives" sub="nouvelles offres"  accent={C.violet} />
            </div>

            <ProfilCompletion candidat={candidat} />
          </div>
        </div>

        {/* ── Section scrollable — deux colonnes indépendantes ── */}
        <div style={{ flex: 1, minHeight: 0, padding: "16px 24px 20px" }}>
          <div className="cand-main-grid" style={{ maxWidth: 1080, margin: "0 auto" }}>

            {/* Colonne gauche : candidatures */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: C.ink }}>
                  Dernières candidatures
                </span>
                <a href="/candidat/candidatures" style={{ fontSize: 12.5, color: C.violet, textDecoration: "none", fontWeight: 500, display: "flex", alignItems: "center", gap: 3 }}>
                  Voir tout <IconArrowRight style={{ width: 13, height: 13 }} />
                </a>
              </div>

              <div style={{ flex: 1, overflowY: "auto", borderRadius: 12, background: C.cardBg, border: `1px solid ${C.border}` }}>
                {dernières.length === 0 ? (
                  <div style={{ padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: C.violetBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
                      <IconFileText style={{ width: 20, height: 20, color: C.violet }} />
                    </div>
                    <p style={{ fontSize: 13.5, color: C.ink2, margin: "0 0 14px" }}>Aucune candidature pour l'instant</p>
                    <a href="/offres" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 500, color: C.violet, textDecoration: "none", background: C.violetBg, border: `1px solid ${C.violetBorder}`, borderRadius: 8, padding: "7px 14px" }}>
                      <IconBriefcase style={{ width: 13, height: 13 }} /> Voir les offres
                    </a>
                  </div>
                ) : (
                  dernières.map((c: any, i: number) => {
                    const s = STATUT[c.status] ?? { label: c.status, bg: C.borderSub, color: C.ink };
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderBottom: i < dernières.length - 1 ? `1px solid ${C.borderSub}` : "none" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: C.violetBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <IconFileText style={{ width: 16, height: 16, color: C.violet }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 500, color: C.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.jobOffer?.title ?? "—"}
                          </div>
                          <div style={{ fontSize: 12, color: C.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {c.jobOffer?.company ?? ""}
                          </div>
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 500, background: s.bg, color: s.color, borderRadius: 6, padding: "3px 9px", whiteSpace: "nowrap", flexShrink: 0 }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Colonne droite : navigation rapide */}
            <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "-0.01em", color: C.ink, marginBottom: 10, flexShrink: 0 }}>
                Navigation rapide
              </div>

              <div style={{ flex: 1, overflowY: "auto", borderRadius: 12, background: C.cardBg, border: `1px solid ${C.border}` }}>
                {QUICK_NAV.map((item, i) => (
                  <a
                    key={item.url}
                    href={item.url}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: i < QUICK_NAV.length - 1 ? `1px solid ${C.borderSub}` : "none", textDecoration: "none", background: "transparent", transition: "background 120ms" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = C.hoverBg; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: C.violetBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: 13, height: 13, color: C.violet }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>{item.title}</div>
                      <div style={{ fontSize: 11.5, color: C.ink3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.desc}</div>
                    </div>
                    <IconArrowRight style={{ width: 13, height: 13, color: C.ink4, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
