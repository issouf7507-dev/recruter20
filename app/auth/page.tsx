"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

// ─── SVG icons ────────────────────────────────────────────────────────
const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBriefcase = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrowSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);

// ─── Selection card ────────────────────────────────────────────────────
function TypeCard({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        width: "100%",
        background: "#fff",
        border: "1.5px solid rgba(17,24,39,0.12)",
        borderRadius: 10,
        padding: "16px 18px",
        cursor: "pointer",
        textAlign: "left",
        transition: "border-color 140ms, box-shadow 140ms",
        fontFamily: '"Inter Tight", system-ui, sans-serif',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#7C5CFC";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 3px rgba(124,92,252,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(17,24,39,0.12)";
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 10, flexShrink: 0,
        background: "rgba(124,92,252,0.10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#7C5CFC",
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: "#0B0E14", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 13, color: "#6B7280" }}>{sub}</div>
      </div>
      <span style={{ color: "#9CA3AF", display: "flex", flexShrink: 0 }}>
        <IconArrowSmall />
      </span>
    </button>
  );
}

// ─── Main content ──────────────────────────────────────────────────────
function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const action = (searchParams.get("action") ?? "login") as "login" | "register";
  const isLogin = action === "login";

  const handleSelect = (type: "candidat" | "recruteur") => {
    router.push(`/auth/${type}/${isLogin ? "login" : "register"}`);
  };

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      minHeight: "100vh",
      width: "100%",
      fontFamily: '"Inter Tight", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      WebkitFontSmoothing: "antialiased",
      letterSpacing: "-0.005em",
    }}>
      {/* ─── Visual side ─────────────────────────────────────────────────── */}
      <aside className="auth-visual" style={{
        background: "#0D0B14",
        color: "#ECEEF2",
        padding: "32px 40px 40px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* gradient blobs */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse 600px 400px at 70% 20%, rgba(124,92,252,0.25), transparent 60%), radial-gradient(ellipse 500px 500px at 15% 85%, rgba(109,62,171,0.20), transparent 60%)",
        }} />

        {/* brand */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <Link href="/">
            <Image src="/img/icon2.png" alt="Ylsix" width={90} height={36} style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }} />
          </Link>
        </div>

        {/* pitch */}
        <div style={{ marginTop: 80, position: "relative", zIndex: 2, maxWidth: 480 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            fontSize: 11, color: "rgba(236,238,242,0.6)",
            letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
            Recrutement · Afrique francophone
          </div>

          <h1 style={{
            fontSize: 36, lineHeight: 1.12, letterSpacing: "-0.024em",
            fontWeight: 600, margin: "0 0 18px",
          }}>
            Trouvez les meilleurs talents{" "}
            <em style={{ fontStyle: "normal", color: "#A78BFA", fontWeight: 600 }}>
              sur tout le continent.
            </em>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(236,238,242,0.60)", lineHeight: 1.6, margin: "0 0 32px" }}>
            Ylsix connecte recruteurs et candidats qualifiés à travers l'Afrique francophone. Publiez vos offres, gérez vos candidatures, et recrutez efficacement.
          </p>

          {/* stats card */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 12, padding: "18px 20px",
            backdropFilter: "blur(10px)",
          }}>
            <div style={{ fontSize: 11.5, color: "rgba(236,238,242,0.50)", marginBottom: 14, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Ylsix en chiffres
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { value: "12 k+", label: "Candidats" },
                { value: "850+", label: "Offres actives" },
                { value: "220+", label: "Entreprises" },
              ].map(({ value, label }) => (
                <div key={label} style={{
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: 8, padding: "10px 12px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{value}</div>
                  <div style={{ fontSize: 11, color: "rgba(236,238,242,0.50)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 7 }}>
              {[
                "Offres publiées en Côte d'Ivoire, Sénégal, Cameroun…",
                "Suivi des candidatures en temps réel",
                "Matching intelligent candidat ↔ poste",
              ].map((txt) => (
                <div key={txt} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "rgba(236,238,242,0.65)" }}>
                  <span style={{ color: "#10B981", display: "flex", flexShrink: 0, marginTop: 1 }}><IconCheck /></span>
                  {txt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* testimonial */}
        <div style={{
          marginTop: "auto", paddingTop: 24,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          position: "relative", zIndex: 2,
        }}>
          <blockquote style={{ fontSize: 14, lineHeight: 1.6, color: "#ECEEF2", margin: "0 0 14px", maxWidth: 460 }}>
            « Ylsix nous a permis de recruter 8 profils qualifiés en moins de 3 semaines. Le suivi kanban des candidatures est excellent. »
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "linear-gradient(135deg, #7C5CFC, #A78BFA)",
              color: "#fff", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 12, fontWeight: 600,
            }}>KB</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Konaté Bintou</div>
              <div style={{ fontSize: 12, color: "rgba(236,238,242,0.50)" }}>DRH · TechAfrik Abidjan</div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 860px) {
            .auth-visual { display: none !important; }
            .auth-grid { grid-template-columns: 1fr !important; }
          }
          @keyframes fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </aside>

      {/* ─── Selection side ───────────────────────────────────────────────── */}
      <main style={{
        display: "flex", flexDirection: "column",
        padding: "24px 32px 32px",
        background: "#FAFAFA",
      }}>
        {/* top bar */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#6B7280", fontSize: 13 }}>
            {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
          </span>
          <Link
            href={`/auth?action=${isLogin ? "register" : "login"}`}
            style={{
              color: "#7C5CFC", fontWeight: 500, padding: "5px 12px",
              border: "1px solid rgba(124,92,252,0.25)",
              background: "rgba(124,92,252,0.07)",
              borderRadius: 7, fontSize: 13,
              fontFamily: '"Inter Tight", system-ui, sans-serif',
              textDecoration: "none",
            }}
          >
            {isLogin ? "Créer un compte" : "Se connecter"}
          </Link>
        </div>

        {/* center content */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0" }}>
          <div style={{ width: "100%", maxWidth: 380, animation: "fade-up 220ms ease" }}>

            {/* heading */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em", margin: "0 0 8px", color: "#0B0E14" }}>
                {isLogin ? "Bon retour 👋" : "Créer un compte"}
              </h2>
              <p style={{ fontSize: 14.5, color: "#6B7280", margin: 0, lineHeight: 1.55 }}>
                {isLogin
                  ? "Choisissez votre espace pour vous connecter."
                  : "Quel type de compte souhaitez-vous créer ?"}
              </p>
            </div>

            {/* cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TypeCard
                icon={<IconUser />}
                label="Candidat"
                sub="Je cherche un emploi"
                onClick={() => handleSelect("candidat")}
              />
              <TypeCard
                icon={<IconBriefcase />}
                label="Recruteur"
                sub="Je recrute des talents"
                onClick={() => handleSelect("recruteur")}
              />
            </div>

            {/* trust badges */}
            <div style={{
              marginTop: 32, paddingTop: 24,
              borderTop: "1px solid rgba(17,24,39,0.08)",
              display: "flex", flexDirection: "column", gap: 7,
            }}>
              {[
                "Gratuit pour les candidats",
                "Données hébergées en Afrique · conformité RGPD CEDEAO",
              ].map((txt) => (
                <div key={txt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CA3AF" }}>
                  <span style={{ color: "#10B981", display: "flex" }}><IconCheck /></span>
                  {txt}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* footer */}
        <footer style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9CA3AF", paddingTop: 16 }}>
          <span>© 2026 Ylsix · Abidjan, Côte d'Ivoire</span>
          <div style={{ display: "flex", gap: 14 }}>
            {["Aide", "Confidentialité", "Conditions"].map((l) => (
              <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{ color: "#9CA3AF", textDecoration: "none" }}>{l}</a>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthContent />
    </Suspense>
  );
}
