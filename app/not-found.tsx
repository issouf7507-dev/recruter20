import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col" style={{ background: "var(--y-bg)" }}>
      <div className="yl-orb" style={{ width: 420, height: 420, top: -100, right: -100, background: "rgba(165,144,255,0.30)" }} />

      {/* Mini header */}
      <header className="relative z-10 flex items-center px-8 h-16 border-b" style={{ borderColor: "var(--y-line)" }}>
        <Link href="/">
          <Image src="/img/icon2.png" alt="Ylsix" width={70} height={28} className="h-7 w-auto" />
        </Link>
      </header>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pb-20">
        {/* 404 giant number */}
        <div
          className="font-mono font-medium leading-none"
          style={{
            fontSize: "clamp(120px, 22vw, 220px)",
            letterSpacing: "-0.06em",
            background: "linear-gradient(135deg, var(--y-primary) 0%, var(--y-primary-700) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </div>

        <p
          className="text-[11px] font-mono uppercase tracking-widest mt-1"
          style={{ color: "var(--y-primary-700)" }}
        >
          Page introuvable
        </p>

        <h1
          className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight max-w-lg"
          style={{ color: "var(--y-ink)", letterSpacing: "-0.03em" }}
        >
          Cette offre s&apos;est volatilisée.{" "}
          <em className="italic font-medium" style={{ color: "var(--y-primary-700)" }}>
            Le bon poste
          </em>{" "}
          est sûrement ailleurs.
        </h1>

        <p className="mt-3 text-base max-w-md" style={{ color: "var(--y-ink-2)" }}>
          La page que vous cherchez n&apos;existe pas ou a été supprimée.
          Voici quelques pistes pour rebondir.
        </p>

        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link
            href="/offres"
            className="h-12 px-6 rounded-full text-sm font-medium flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, var(--y-primary), var(--y-primary-700))", color: "#fff", boxShadow: "var(--y-shadow-violet)" }}
          >
            🔍 Voir les 1 248 offres
          </Link>
          <Link
            href="/"
            className="h-12 px-6 rounded-full text-sm font-medium"
            style={{ background: "transparent", color: "var(--y-ink)", boxShadow: "inset 0 0 0 1px var(--y-line-2)" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
