import Link from "next/link";
import Image from "next/image";

const COL_NAV = [
  {
    title: "Navigation",
    links: [
      ["Offres d'emploi", "/offres"],
      ["Fonctionnalités", "/fonctionnalites"],
      ["Ressources", "/ressources"],
      ["Tarifs", "/tarifs"],
      ["À propos", "/a-propos"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Candidats",
    links: [
      ["Créer un compte", "/auth/candidat/register"],
      ["Charger mon CV", "/offres"],
      ["Mes candidatures", "/auth/candidat/login"],
      ["Alertes emploi", "/auth/candidat/login"],
    ],
  },
  {
    title: "Recruteurs",
    links: [
      ["Publier une offre", "/auth/recruteur/register"],
      ["Multi-diffusion", "/recruteur/multi-diffusion"],
      ["Pipeline Kanban", "/recruteur/kanban"],
      ["Espace recruteur", "/auth/recruteur/login"],
    ],
  },
];

const Footer = () => (
  <footer
    className="relative overflow-hidden"
    style={{ background: "var(--y-bg-ink)" }}
  >
    {/* Guillemet géant décoratif — inspiré du modèle */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute select-none font-serif"
      style={{
        bottom: -80,
        right: 24,
        fontSize: 340,
        lineHeight: 1,
        color: "rgba(165,144,255,0.06)",
      }}
    >
      &rdquo;
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
      {/* Top : marque + newsletter */}
      <div
        className="flex flex-col lg:flex-row justify-between gap-10 pb-12"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="max-w-sm">
          <Link href="/">
            <Image
              src="/img/icon2.png"
              alt="Ylsix"
              width={90}
              height={36}
              className="h-8 w-auto"
            />
          </Link>
          <p
            className="mt-4 text-sm leading-relaxed"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Plateforme SaaS de recrutement pour l&apos;Afrique francophone — une
            seule interface pour connecter recruteurs et candidats.
          </p>
          <div className="flex gap-2 mt-5">
            {["in", "𝕏", "f"].map((icon) => (
              <a
                key={icon}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-colors hover:bg-white/10"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
                  color: "#fff",
                }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="w-full lg:w-80 shrink-0">
          <p
            className="text-[11px] font-mono uppercase tracking-widest mb-2"
            style={{ color: "var(--y-primary)" }}
          >
            Newsletter
          </p>
          <p
            className="text-lg font-semibold leading-snug"
            style={{ color: "#fff", letterSpacing: "-0.015em" }}
          >
            Les meilleures offres,
            <br />
            chaque lundi matin.
          </p>
          <div
            className="mt-4 flex items-center gap-2 px-3.5 rounded-xl"
            style={{
              height: 44,
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <input
              placeholder="email@exemple.com"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
              style={{ color: "#fff" }}
            />
            <button
              className="h-8 px-3 rounded-lg text-xs font-medium text-white shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))",
              }}
            >
              S&apos;abonner
            </button>
          </div>
          <p
            className="mt-2 text-[11px]"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Aucun spam. Désinscription en 1 clic.
          </p>
        </div>
      </div>

      {/* Colonnes de liens */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-10">
        {COL_NAV.map(({ title, links }) => (
          <div key={title}>
            <p
              className="text-[11px] font-semibold uppercase tracking-widest mb-3.5"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: "rgba(255,255,255,0.72)" }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Back to top */}
      <div className="mt-10">
        <a
          href="#"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-xs font-medium transition-colors hover:bg-white/10"
          style={{
            background: "rgba(255,255,255,0.06)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)",
            color: "#fff",
          }}
        >
          ↑ Retour en haut
        </a>
      </div>

      {/* Barre du bas */}
      <div
        className="mt-8 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.45)",
        }}
      >
        <span>© 2026 Ylsix. Tous droits réservés. Fait avec ❤ à Abidjan.</span>
        <div className="flex gap-5">
          {[
            ["Mentions légales", "/mentions-legales"],
            ["CGU", "/cgu"],
            ["Confidentialité", "/confidentialite"],
          ].map(([l, h]) => (
            <Link
              key={l}
              href={h}
              className="hover:text-white transition-colors"
            >
              {l}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
