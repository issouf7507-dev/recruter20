"use client";
import Link from "next/link";
import Image from "next/image";

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const CONFIG = {
  candidat: {
    headline: (
      <>
        Trouvez l&apos;emploi qui vous{" "}
        <em style={{ fontStyle: "normal", color: "#A78BFA", fontWeight: 600 }}>correspond vraiment.</em>
      </>
    ),
    pitch: "Ylsix met en relation les meilleurs candidats avec les entreprises qui recrutent à travers l'Afrique francophone.",
    features: [
      "Des centaines d'offres en Côte d'Ivoire, Sénégal, Cameroun…",
      "Suivi de vos candidatures en temps réel",
      "CV analysé et matching automatique",
    ],
    stats: [
      { value: "12 k+", label: "Candidats" },
      { value: "850+", label: "Offres actives" },
      { value: "220+", label: "Entreprises" },
    ],
    testimonial: {
      quote: "« J'ai trouvé mon poste en 2 semaines grâce à Ylsix. Le suivi des candidatures est vraiment pratique. »",
      author: "Coulibaly Mariame",
      role: "Développeuse Front-end · Dakar",
      initials: "CM",
    },
  },
  recruteur: {
    headline: (
      <>
        Recrutez les meilleurs talents{" "}
        <em style={{ fontStyle: "normal", color: "#A78BFA", fontWeight: 600 }}>sur tout le continent.</em>
      </>
    ),
    pitch: "Ylsix vous donne accès à un vivier de candidats qualifiés en Afrique francophone. Publiez, gérez, recrutez.",
    features: [
      "Publication d'offres en quelques minutes",
      "Kanban de suivi des candidatures",
      "Matching intelligent candidat ↔ poste",
    ],
    stats: [
      { value: "220+", label: "Entreprises" },
      { value: "850+", label: "Offres publiées" },
      { value: "12 k+", label: "Candidats" },
    ],
    testimonial: {
      quote: "« Ylsix nous a permis de recruter 8 profils qualifiés en moins de 3 semaines. Le kanban des candidatures est excellent. »",
      author: "Konaté Bintou",
      role: "DRH · TechAfrik Abidjan",
      initials: "KB",
    },
  },
};

export default function AuthSidePanel({ userType }: { userType: "candidat" | "recruteur" }) {
  const c = CONFIG[userType];

  return (
    <aside
      className="auth-visual"
      style={{
        background: "#0D0B14",
        color: "#ECEEF2",
        padding: "32px 40px 40px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* gradient blobs */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background:
          "radial-gradient(ellipse 600px 400px at 70% 20%, rgba(124,92,252,0.25), transparent 60%), radial-gradient(ellipse 500px 500px at 15% 85%, rgba(109,62,171,0.20), transparent 60%)",
      }} />

      {/* brand + back */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/">
          <Image
            src="/img/icon2.png"
            alt="Ylsix"
            width={90}
            height={36}
            style={{ height: 36, width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </Link>
        <Link
          href="/"
          style={{ fontSize: 12.5, color: "rgba(236,238,242,0.45)", textDecoration: "none", display: "flex", alignItems: "center", gap: 5 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
          </svg>
          Accueil
        </Link>
      </div>

      {/* pitch */}
      <div style={{ marginTop: 72, position: "relative", zIndex: 2, maxWidth: 480 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          fontSize: 11, color: "rgba(236,238,242,0.55)",
          letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", display: "inline-block" }} />
          Recrutement · Afrique francophone
        </div>

        <h1 style={{ fontSize: 34, lineHeight: 1.14, letterSpacing: "-0.024em", fontWeight: 600, margin: "0 0 16px" }}>
          {c.headline}
        </h1>
        <p style={{ fontSize: 14.5, color: "rgba(236,238,242,0.58)", lineHeight: 1.6, margin: "0 0 28px" }}>
          {c.pitch}
        </p>

        {/* stats + features card */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, padding: "16px 18px",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
            {c.stats.map(({ value, label }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>{value}</div>
                <div style={{ fontSize: 11, color: "rgba(236,238,242,0.45)", marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {c.features.map((txt) => (
              <div key={txt} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "rgba(236,238,242,0.62)" }}>
                <span style={{ color: "#10B981", display: "flex", flexShrink: 0, marginTop: 1 }}><IconCheck /></span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* testimonial */}
      <div style={{ marginTop: "auto", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.07)", position: "relative", zIndex: 2 }}>
        <blockquote style={{ fontSize: 14, lineHeight: 1.6, color: "#ECEEF2", margin: "0 0 14px", maxWidth: 460 }}>
          {c.testimonial.quote}
        </blockquote>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: "linear-gradient(135deg, #7C5CFC, #A78BFA)",
            color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 600,
          }}>
            {c.testimonial.initials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{c.testimonial.author}</div>
            <div style={{ fontSize: 12, color: "rgba(236,238,242,0.50)" }}>{c.testimonial.role}</div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) { .auth-visual { display: none !important; } }
        @keyframes auth-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </aside>
  );
}
