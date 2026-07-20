import { HeroSection } from "./_sections/HeroSection";
import { SalaryTickerSection } from "./_sections/SalaryTickerSection";
import { FeaturedOffersSection } from "./_sections/FeaturedOffersSection";
import { ExpertsSection } from "./_sections/ExpertsSection";
import { SectorsSection } from "./_sections/SectorsSection";
import { BrowseByJobSection } from "./_sections/BrowseByJobSection";
import { ResourcesKeysSection } from "./_sections/ResourcesKeysSection";
import { TestimonialsSection } from "./_sections/TestimonialsSection";
import { BlogSection } from "./_sections/BlogSection";
import { CTASection } from "./_sections/CTASection";

export default function LandingPage() {
  return (
    <div style={{ background: "var(--y-bg)" }}>
      {/* 1 — Accroche dual-persona candidat / recruteur */}
      <HeroSection />
      {/* 1b — Bandeau défilant offres + salaires (ticker) */}
      <SalaryTickerSection />
      {/* 2 — Offres réelles du moment */}
      <FeaturedOffersSection />
      {/* 3 — Positionnement « experts du recrutement » + CTA */}
      <ExpertsSection />
      {/* 4 — Qui recrute : navigation par secteur */}
      <SectorsSection />
      {/* 5 — Navigation par métier */}
      <BrowseByJobSection />
      {/* 6 — Ressources candidats (les clés pour décrocher le poste) */}
      <ResourcesKeysSection />
      {/* 7 — Preuve sociale */}
      <TestimonialsSection />
      {/* 8 — Blog & ressources */}
      <BlogSection />
      {/* 9 — Appel à l'action final */}
      <CTASection />
    </div>
  );
}
