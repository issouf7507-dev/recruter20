"use client";

import { SiteHeader } from "@/components/site-header";
import { AlertesSection } from "@/components/public/candidat-sections/AlertesSection";
import { useCandidat } from "@/lib/hooks/use-candidat";

export default function CandidatAlertesPage() {
  const { candidat } = useCandidat();

  return (
    <>
      <SiteHeader title="Alertes emploi" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <AlertesSection candidatId={candidat?.id} />
        </div>
      </div>
    </>
  );
}
