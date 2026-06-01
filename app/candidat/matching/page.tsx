"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import {
  IconSparkles, IconBriefcase, IconMapPin, IconLoader,
  IconCurrencyEuro, IconCalendar, IconTrophy,
} from "@tabler/icons-react";
import { toast } from "sonner";

const NIVEAU_CONFIG = {
  excellent: { label: "Excellent", color: "bg-green-500", bg: "bg-green-50 border-green-200 dark:bg-green-950/20", text: "text-green-700" },
  bon: { label: "Bon", color: "bg-blue-500", bg: "bg-blue-50 border-blue-200 dark:bg-blue-950/20", text: "text-blue-700" },
  moyen: { label: "Moyen", color: "bg-yellow-500", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" },
  faible: { label: "Faible", color: "bg-red-400", bg: "bg-red-50 border-red-200", text: "text-red-700" },
};

export default function CandidatMatchingPage() {
  const { candidat } = useCandidat();
  const { createCandidature, hasApplied } = useCandidatures(candidat?.id);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const handleMatch = async () => {
    if (!candidat?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/candidat-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidatId: candidat.id }),
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setRan(true);
      } else {
        toast.error("Erreur lors du matching");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const handlePostuler = async (jobOfferId: string) => {
    if (!candidat?.id) return;
    try {
      await createCandidature.mutateAsync({ jobOfferId });
      toast.success("Candidature envoyée !");
    } catch (e: any) {
      toast.error(e.message ?? "Erreur lors de la candidature");
    }
  };

  const top = results.filter((r) => r.score >= 60);
  const rest = results.filter((r) => r.score < 60);

  return (
    <>
      <SiteHeader title="Matching IA" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 py-4 md:py-6 px-4 lg:px-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <IconSparkles className="h-6 w-6 text-purple-500" />
                Offres qui correspondent à votre profil
              </h1>
              <p className="text-muted-foreground mt-1">
                L'algorithme analyse vos compétences, expériences et localisation pour trouver les meilleures correspondances.
              </p>
            </div>
            <Button onClick={handleMatch} disabled={loading} className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
              {loading ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : <IconSparkles className="h-4 w-4 mr-2" />}
              {ran ? "Relancer l'analyse" : "Lancer l'analyse"}
            </Button>
          </div>

          {!ran && !loading && (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center">
                <IconSparkles className="h-12 w-12 mx-auto text-purple-400 mb-4" />
                <h3 className="font-semibold text-lg mb-2">Découvrez vos offres idéales</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  Cliquez sur "Lancer l'analyse" pour voir quelles offres correspondent le mieux à votre profil.
                  Plus votre profil est complet, plus le matching est précis.
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-2 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {ran && !loading && (
            <>
              {top.length > 0 && (
                <div>
                  <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <IconTrophy className="h-5 w-5 text-yellow-500" />
                    Meilleures correspondances ({top.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {top.map(({ offre, score, niveau }: any) => {
                      const cfg = NIVEAU_CONFIG[niveau as keyof typeof NIVEAU_CONFIG];
                      const applied = hasApplied(offre.id);
                      return (
                        <Card key={offre.id} className={`border ${cfg.bg} transition-shadow hover:shadow-md`}>
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base leading-tight">{offre.title}</CardTitle>
                                {offre.company && <CardDescription className="mt-1">{offre.company}</CardDescription>}
                              </div>
                              <Badge className={`shrink-0 text-white ${cfg.color} border-0`}>{score}%</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Progress value={score} className="h-1.5" />
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                              {offre.location && <span className="flex items-center gap-1"><IconMapPin className="h-3 w-3" />{offre.location}</span>}
                              {offre.type && <Badge variant="outline" className="text-xs uppercase">{offre.type}</Badge>}
                              {(offre.salaryMin || offre.salaryMax) && (
                                <span className="flex items-center gap-1">
                                  <IconCurrencyEuro className="h-3 w-3" />
                                  {offre.salaryMin ?? ""}{offre.salaryMin && offre.salaryMax ? "–" : ""}{offre.salaryMax ?? ""} {offre.salaryCurrency ?? ""}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button variant="outline" size="sm" className="flex-1" asChild>
                                <a href={`/offres/${offre.id}`} target="_blank">Voir l'offre</a>
                              </Button>
                              <Button
                                size="sm"
                                className="flex-1 bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
                                disabled={applied || createCandidature.isPending}
                                onClick={() => handlePostuler(offre.id)}
                              >
                                {applied ? "Postulé" : "Postuler"}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {rest.length > 0 && (
                <div>
                  <h2 className="font-semibold text-base mb-3 text-muted-foreground">Autres offres ({rest.length})</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {rest.map(({ offre, score, niveau }: any) => {
                      const applied = hasApplied(offre.id);
                      return (
                        <Card key={offre.id} className="hover:shadow-sm transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{offre.title}</p>
                                <p className="text-xs text-muted-foreground truncate">{offre.company ?? ""}</p>
                              </div>
                              <span className="text-xs font-semibold text-muted-foreground shrink-0">{score}%</span>
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs" asChild>
                                <a href={`/offres/${offre.id}`} target="_blank">Voir</a>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 h-7 text-xs"
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
                </div>
              )}

              {results.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <p>Aucune offre active trouvée. Revenez plus tard !</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
