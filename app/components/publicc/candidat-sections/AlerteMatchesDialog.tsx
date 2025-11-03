"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Briefcase, DollarSign, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

interface AlerteMatchesDialogProps {
  alerteId: string;
  alerteTitre: string;
  onClose: () => void;
}

export function AlerteMatchesDialog({
  alerteId,
  alerteTitre,
  onClose,
}: AlerteMatchesDialogProps) {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    fetchMatches();
  }, [alerteId]);

  const fetchMatches = async () => {
    try {
      const response = await fetch(`/api/alertes/${alerteId}/matches`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMatches(result.data.offers || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des résultats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Offres correspondantes</CardTitle>
              <CardDescription>{alerteTitre}</CardDescription>
            </div>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8">Chargement des résultats...</div>
          ) : matches.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-xl font-semibold mb-2">
                Aucune offre trouvée
              </p>
              <p className="text-muted-foreground">
                Aucune offre ne correspond actuellement à vos critères.
                <br />
                Nous vous notifierons dès qu&apos;une nouvelle offre sera disponible.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4">
                <Badge variant="secondary" className="text-lg px-3 py-2">
                  {matches.length} offre{matches.length > 1 ? "s" : ""} trouvée
                  {matches.length > 1 ? "s" : ""}
                </Badge>
              </div>

              {matches.map((offre) => (
                <Card
                  key={offre.id}
                  className="hover:shadow-md transition-shadow border-l-4 border-l-primary"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start gap-3">
                          {offre.recruteur?.logo && (
                            <img
                              src={offre.recruteur.logo}
                              alt={offre.recruteur.companyName || "Logo"}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg">{offre.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {offre.company ||
                                offre.recruteur?.companyName ||
                                "Entreprise"}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {offre.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{offre.location}</span>
                            </div>
                          )}
                          {offre.type && (
                            <div className="flex items-center gap-1">
                              <Briefcase className="h-4 w-4" />
                              <span>{offre.type}</span>
                            </div>
                          )}
                          {(offre.salaryMin || offre.salaryMax) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                {offre.salaryMin && `${offre.salaryMin}€`}
                                {offre.salaryMin && offre.salaryMax && " - "}
                                {offre.salaryMax && `${offre.salaryMax}€`}
                              </span>
                            </div>
                          )}
                        </div>

                        {offre.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {offre.description}
                          </p>
                        )}

                        <div className="flex gap-2 pt-2">
                          {offre.experience && (
                            <Badge variant="outline">{offre.experience}</Badge>
                          )}
                          <Badge variant="secondary">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(offre.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </Badge>
                        </div>
                      </div>

                      <Link href={`/offres/${offre.id}`} target="_blank">
                        <Button size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Voir l&apos;offre
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

