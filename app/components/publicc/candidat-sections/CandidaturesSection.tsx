"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  MapPin,
  Calendar,
  Building2,
} from "lucide-react";
import { useCandidatures } from "@/lib/hooks/use-candidatures";

interface CandidaturesSectionProps {
  candidatId?: string;
}

interface Candidature {
  id: string;
  jobOffer: {
    id: string;
    title: string;
    company?: string;
    location?: string;
    type?: string;
  };
  createdAt: string;
  status: string;
  message?: string;
}

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  "En attente": { bg: "bg-yellow-100", text: "text-yellow-800" },
  "En cours": { bg: "bg-blue-100", text: "text-blue-800" },
  Entretien: { bg: "bg-purple-100", text: "text-purple-800" },
  Accepté: { bg: "bg-green-100", text: "text-green-800" },
  Refusé: { bg: "bg-red-100", text: "text-red-800" },
};

export function CandidaturesSection({ candidatId }: CandidaturesSectionProps) {
  const { candidatures = [], isLoading } = useCandidatures(candidatId);

  const getStatutLabel = (status: string): string => {
    const mapping: Record<string, string> = {
      EN_ATTENTE: "En attente",
      EN_REVISION: "En révision",
      ACCEPTE: "Accepté",
      REFUSE: "Refusé",
    };
    return mapping[status] || status;
  };

  const candidaturesEnAttente =
    candidatures?.filter((c: Candidature) => c.status === "EN_ATTENTE") || [];
  const candidaturesAcceptees =
    candidatures?.filter((c: Candidature) => c.status === "ACCEPTE") || [];
  const candidaturesRefusees =
    candidatures?.filter((c: Candidature) => c.status === "REFUSE") || [];

  if (isLoading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  const CandidatureCard = ({ candidature }: { candidature: Candidature }) => {
    const statut = getStatutLabel(candidature.status);
    const colors = STATUT_COLORS[statut] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
    };

    return (
      <Card className="shadow-none">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-lg text-[#a590ff]">
                  {candidature.jobOffer.title}
                </h4>
                {candidature.jobOffer.company && (
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{candidature.jobOffer.company}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                {candidature.jobOffer.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{candidature.jobOffer.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Candidature le{" "}
                    {new Date(candidature.createdAt).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              {/* {candidature.message && (
                <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3 mt-2">
                  {candidature.message}
                </p>
              )} */}

              <div className="flex gap-2 pt-2">
                <Badge className={`${colors.bg} ${colors.text} border-0`}>
                  {statut}
                </Badge>
                {candidature.jobOffer.type && (
                  <Badge variant="outline">{candidature.jobOffer.type}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#a590ff]">
            Mes Candidatures
          </h3>
          <p className="text-muted-foreground">
            Suivez l&apos;état de vos candidatures
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {candidatures?.length || 0} candidature
          {(candidatures?.length || 0) > 1 ? "s" : ""}
        </Badge>
      </div>

      <Tabs defaultValue="toutes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="toutes">
            Toutes ({candidatures?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="en-attente">
            En attente ({candidaturesEnAttente.length})
          </TabsTrigger>
          <TabsTrigger value="acceptees">
            Acceptées ({candidaturesAcceptees.length})
          </TabsTrigger>
          <TabsTrigger value="refusees">
            Refusées ({candidaturesRefusees.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="toutes" className="space-y-4 mt-4">
          {!candidatures || candidatures.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Vous n&apos;avez pas encore postulé à des offres
                </p>
                <Button className="mt-4" variant="outline">
                  Parcourir les offres
                </Button>
              </CardContent>
            </Card>
          ) : (
            candidatures?.map((candidature: Candidature) => (
              <CandidatureCard key={candidature.id} candidature={candidature} />
            )) || []
          )}
        </TabsContent>

        <TabsContent value="en-attente" className="space-y-4 mt-4">
          {candidaturesEnAttente.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune candidature en attente
                </p>
              </CardContent>
            </Card>
          ) : (
            candidaturesEnAttente.map((candidature: Candidature) => (
              <CandidatureCard key={candidature.id} candidature={candidature} />
            ))
          )}
        </TabsContent>

        <TabsContent value="acceptees" className="space-y-4 mt-4">
          {candidaturesAcceptees.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune candidature acceptée
                </p>
              </CardContent>
            </Card>
          ) : (
            candidaturesAcceptees.map((candidature: Candidature) => (
              <CandidatureCard key={candidature.id} candidature={candidature} />
            ))
          )}
        </TabsContent>

        <TabsContent value="refusees" className="space-y-4 mt-4">
          {candidaturesRefusees.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucune candidature refusée
                </p>
              </CardContent>
            </Card>
          ) : (
            candidaturesRefusees.map((candidature: Candidature) => (
              <CandidatureCard key={candidature.id} candidature={candidature} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
