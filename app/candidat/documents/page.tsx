"use client";

import { SiteHeader } from "@/components/site-header";
import { DocumentsSection } from "@/components/public/candidat-sections/DocumentsSection";
import { useCandidat } from "@/lib/hooks/use-candidat";

export default function CandidatDocumentsPage() {
  const { candidat } = useCandidat();

  return (
    <>
      <SiteHeader title="Mes documents" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <DocumentsSection candidatId={candidat?.id} />
        </div>
      </div>
    </>
  );
}
