import Link from "next/link";
import Image from "next/image";

const COL_NAV = [
  { title: "Navigation", links: [["Offres d'emploi", "/offres"], ["Fonctionnalités", "/fonctionnalites"], ["Tarifs", "/tarifs"], ["À propos", "/a-propos"], ["Contact", "/contact"]] },
  { title: "Candidats", links: [["Créer un compte", "/auth/candidat/register"], ["Charger mon CV", "/offres"], ["Mes candidatures", "/auth/candidat/login"], ["Alertes emploi", "/auth/candidat/login"]] },
  { title: "Recruteurs", links: [["Publier une offre", "/auth/recruteur/register"], ["Multi-diffusion", "/recruteur/multi-diffusion"], ["Pipeline Kanban", "/recruteur/kanban"], ["Espace recruteur", "/auth/recruteur/login"]] },
];

const Footer = () => (
  <footer style={{ background: "var(--y-bg)" }}>
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-8">
      {/* Big CTA line */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-10 pb-12" style={{ borderBottom: "1px solid var(--y-line)" }}>
        <div className="flex-1">
          <h2
            className="text-4xl md:text-5xl font-medium leading-none tracking-[-0.04em]"
            style={{ color: "var(--y-ink)" }}
          >
            Prêt à{" "}
            <em className="italic font-medium" style={{ color: "var(--y-primary-700)" }}>recruter</em>{" "}
            ou à{" "}
            <em className="italic font-medium" style={{ color: "var(--y-primary-700)" }}>postuler</em>&nbsp;?
          </h2>
          <p className="mt-4 text-base" style={{ color: "var(--y-ink-2)", maxWidth: 480 }}>
            Rejoignez 2 100+ recruteurs et 38 000 candidats en Afrique francophone.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/auth/recruteur/register"
              className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
            >
              Je recrute →
            </Link>
            <Link
              href="/offres"
              className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2"
              style={{ color: "var(--y-primary-700)", boxShadow: "inset 0 0 0 1.5px var(--y-primary)" }}
            >
              Je cherche un emploi
            </Link>
          </div>
        </div>

        {/* Newsletter card */}
        <div
          className="w-full lg:w-80 rounded-2xl p-7 relative overflow-hidden shrink-0"
          style={{ background: "var(--y-bg-pure)", boxShadow: "var(--y-shadow-md)" }}
        >
          <div className="yl-orb" style={{ width: 200, height: 200, top: -70, right: -70, background: "rgba(165,144,255,0.28)" }} />
          <p className="text-[11px] font-mono uppercase tracking-widest mb-2 relative" style={{ color: "var(--y-primary-700)" }}>Newsletter</p>
          <p className="text-lg font-semibold leading-snug relative" style={{ color: "var(--y-ink)", letterSpacing: "-0.015em" }}>
            Les meilleures offres,<br />chaque lundi matin.
          </p>
          <div
            className="mt-4 flex items-center gap-2 px-3.5 rounded-xl relative"
            style={{ height: 44, boxShadow: "inset 0 0 0 1px var(--y-line-2)", background: "var(--y-bg-pure)" }}
          >
            <input
              placeholder="email@exemple.com"
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--y-ink)" }}
            />
            <button
              className="h-8 px-3 rounded-lg text-xs font-medium text-white shrink-0"
              style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))" }}
            >
              S&apos;abonner
            </button>
          </div>
          <p className="mt-2 text-[11px] relative" style={{ color: "var(--y-ink-3)" }}>Aucun spam. Désinscription en 1 clic.</p>
        </div>
      </div>

      {/* Links grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10">
        <div>
          <Link href="/">
            <Image src="/img/icon2.png" alt="Ylsix" width={70} height={28} className="h-7 w-auto mb-3" />
          </Link>
          <p className="text-xs leading-relaxed" style={{ color: "var(--y-ink-3)" }}>
            Plateforme SaaS de recrutement<br />pour l&apos;Afrique francophone.
          </p>
          <div className="flex gap-2 mt-4">
            {["in", "𝕏"].map((icon) => (
              <a
                key={icon}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors"
                style={{ background: "var(--y-bg-pure)", boxShadow: "inset 0 0 0 1px var(--y-line-2)", color: "var(--y-ink-2)" }}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>

        {COL_NAV.map(({ title, links }) => (
          <div key={title}>
            <p className="text-[11px] font-semibold uppercase tracking-widest mb-3.5" style={{ color: "var(--y-ink)" }}>{title}</p>
            <ul className="flex flex-col gap-2">
              {links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm transition-colors hover:text-[--y-primary]" style={{ color: "var(--y-ink-2)" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div
        className="mt-10 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
        style={{ borderTop: "1px solid var(--y-line)", color: "var(--y-ink-3)" }}
      >
        <span>© 2026 Ylsix. Tous droits réservés. Fait avec ❤ à Dakar &amp; Abidjan.</span>
        <div className="flex gap-5">
          {["Mentions légales", "CGU", "Confidentialité"].map((l) => (
            <a key={l} href="#" className="hover:underline">{l}</a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
