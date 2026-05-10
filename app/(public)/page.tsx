import { HeroSection } from "./_sections/HeroSection";
import { StatsSection } from "./_sections/StatsSection";
import { FeaturesSection } from "./_sections/FeaturesSection";
import { MissionSection } from "./_sections/MissionSection";
import { TestimonialsSection } from "./_sections/TestimonialsSection";
import { PricingSection } from "./_sections/PricingSection";
import { FAQSection } from "./_sections/FAQSection";
import { CTASection } from "./_sections/CTASection";

export default function LandingPage() {
  return (
    <div className="container mx-auto px-4 pt-24 pb-10">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <MissionSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
}
