"use client";

import { SiteHeader } from "@/components/site-header";
import { ObjectifsSection } from "@/components/public/candidat-sections/ObjectifsSection";
import { useCandidat } from "@/lib/hooks/use-candidat";

export default function CandidatObjectifsPage() {
  const { candidat } = useCandidat();

  return (
    <>
      <SiteHeader title="Mes objectifs" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <ObjectifsSection candidatId={candidat?.id} />
        </div>
      </div>
    </>
  );
}
