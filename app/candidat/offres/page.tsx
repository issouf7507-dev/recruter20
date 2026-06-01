"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useOffers } from "@/lib/hooks/use-offers";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import {
  IconSearch, IconMapPin, IconBriefcase, IconCurrencyEuro,
  IconCalendar, IconLoader, IconChevronLeft, IconChevronRight,
} from "@tabler/icons-react";
import { toast } from "sonner";

export default function CandidatOffresPage() {
  const { candidat } = useCandidat();
  const { createCandidature, hasApplied } = useCandidatures(candidat?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useOffers({
    page: currentPage,
    limit: 12,
    etat: "active",
    search: submittedSearch || undefined,
  });

  const offres = data?.items ?? [];
  const pagination = data?.pagination;

  const handlePostuler = async (jobOfferId: string) => {
    if (!candidat?.id) { toast.error("Connectez-vous pour postuler"); return; }
    try {
      await createCandidature.mutateAsync({ jobOfferId });
      toast.success("Candidature envoyée !");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la candidature");
    }
  };

  return (
    <>
      <SiteHeader title="Parcourir les offres" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:py-6 px-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <IconBriefcase className="h-6 w-6" />
              Parcourir les offres
            </h1>
            <p className="text-muted-foreground mt-1">Trouvez et postulez directement depuis votre espace.</p>
          </div>

          {/* Recherche */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un poste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSubmittedSearch(searchQuery); setCurrentPage(1); } }}
                className="pl-9"
              />
            </div>
            <Button onClick={() => { setSubmittedSearch(searchQuery); setCurrentPage(1); }} className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
              Rechercher
            </Button>
          </div>

          {/* Résultats */}
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <IconLoader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : offres.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground">Aucune offre trouvée</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {offres.map((offre: any) => {
                const applied = hasApplied(offre.id);
                return (
                  <Card key={offre.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-3">
                        {offre.logo ? (
                          <img src={offre.logo} alt={offre.company ?? ""} className="w-10 h-10 rounded-lg object-cover border shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            <IconBriefcase className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm leading-tight">{offre.title}</CardTitle>
                          {offre.company && <CardDescription className="text-xs mt-0.5">{offre.company}</CardDescription>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-3">
                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {offre.location && <span className="flex items-center gap-1"><IconMapPin className="h-3 w-3" />{offre.location}</span>}
                        {offre.type && <Badge variant="outline" className="text-xs uppercase">{offre.type}</Badge>}
                        {(offre.salaryMin || offre.salaryMax) && (
                          <span className="flex items-center gap-1">
                            <IconCurrencyEuro className="h-3 w-3" />
                            {[offre.salaryMin, offre.salaryMax].filter(Boolean).join(" – ")} {offre.salaryCurrency ?? ""}
                          </span>
                        )}
                      </div>
                      {offre.duedate && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <IconCalendar className="h-3 w-3" />
                          Clôture : {new Date(offre.duedate).toLocaleDateString("fr-FR")}
                        </p>
                      )}
                      <div className="flex gap-2 mt-auto pt-2">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-xs" asChild>
                          <a href={`/offres/${offre.id}`} target="_blank">Voir</a>
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1 h-8 text-xs bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
                          disabled={applied || createCandidature.isPending}
                          onClick={() => handlePostuler(offre.id)}
                        >
                          {applied ? "Postulé ✓" : "Postuler"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">Page {currentPage} / {pagination.totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === pagination.totalPages}>
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
