"use client";

import { IconSparkles } from "@tabler/icons-react";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import {
  useCollaborateurByUserId,
  useRecruteurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { MatchingParOffre } from "@/app/components/recruteur/MatchingParOffre";

export default function MatchingOffrePage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  const {
    candidaturesRecruteur,
    isLoadingRecruteur,
    errorRecruteur,
  } = useCandidatures(recruteurId);

  if (isSessionLoading || isLoadingRecruteur) {
    return (
      <>
        <SiteHeader />
        <div className="flex h-[50vh] flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
          </div>
        </div>
      </>
    );
  }

  if (errorRecruteur) {
    return (
      <>
        <SiteHeader />
        <div className="px-4 py-6 lg:px-6">
          <p className="text-destructive">
            Erreur lors du chargement des candidatures :{" "}
            {errorRecruteur.message}
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold">
                  <IconSparkles className="h-7 w-7 text-primary" />
                  Matching par offre
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Analyse IA des candidatures groupées par offre d&apos;emploi
                </p>
              </div>

              {candidaturesRecruteur && (
                <MatchingParOffre candidaturesRecruteur={candidaturesRecruteur} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
