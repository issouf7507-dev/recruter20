"use client";

import { SiteHeader } from "@/components/site-header";
import { MessagesSection } from "@/components/public/candidat-sections/MessagesSection";
import { useCandidat } from "@/lib/hooks/use-candidat";

export default function CandidatMessagesPage() {
  const { candidat } = useCandidat();

  return (
    <>
      <SiteHeader title="Messages" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
          <MessagesSection candidatId={candidat?.id} />
        </div>
      </div>
    </>
  );
}
