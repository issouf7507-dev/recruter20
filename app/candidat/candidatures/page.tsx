"use client";

import { SiteHeader } from "@/components/site-header";
import { CandidaturesSection } from "@/components/public/candidat-sections/CandidaturesSection";
import { useCandidat } from "@/lib/hooks/use-candidat";

export default function CandidatCandidaturesPage() {
  const { candidat } = useCandidat();

  return (
    <>
      <SiteHeader title="Mes candidatures" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <CandidaturesSection candidatId={candidat?.id} />
        </div>
      </div>
    </>
  );
}
