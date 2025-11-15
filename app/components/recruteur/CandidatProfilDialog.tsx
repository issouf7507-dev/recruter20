"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Globe,
  Heart,
  Award,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface CandidatProfilDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidatId: string;
}

export function CandidatProfilDialog({
  open,
  onOpenChange,
  candidatId,
}: CandidatProfilDialogProps) {
  const [candidat, setCandidat] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profil");

  useEffect(() => {
    if (open && candidatId) {
      fetchCandidatDetails();
    }
  }, [open, candidatId]);

  const fetchCandidatDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/candidats/${candidatId}`);
      const result = await response.json();
      if (result.success) {
        setCandidat(result.data);
      } else {
        toast.error("Erreur lors du chargement du profil");
      }
    } catch (error) {
      console.error("Error fetching candidat:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (nom?: string, prenom?: string) => {
    return `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase();
  };

  const formatDate = (date: string | Date | null) => {
    if (!date) return "Présent";
    return new Date(date).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement du profil...</p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!candidat) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:w-3/4 lg:w-2/3 xl:w-1/2 overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b ">
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
              <AvatarImage src={candidat.image || ""} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                {getInitials(candidat.nom, candidat.prenom)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-2xl mb-2">
                {candidat.prenom} {candidat.nom}
              </SheetTitle>
              <SheetDescription className="space-y-1">
                {candidat.statut && (
                  <div className="flex items-center gap-2 text-sm">
                    <Award className="h-4 w-4" />
                    <span>{candidat.statut}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{candidat.user?.email}</span>
                </div>
                {candidat.telephone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{candidat.telephone}</span>
                  </div>
                )}
                {(candidat.ville || candidat.pays) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {candidat.ville}
                      {candidat.ville && candidat.pays && ", "}
                      {candidat.pays}
                    </span>
                  </div>
                )}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 mt-6"
        >
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger
                value="profil"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="experiences"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Briefcase className="h-4 w-4 mr-2" />
                Expériences
              </TabsTrigger>
              <TabsTrigger
                value="formations"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <GraduationCap className="h-4 w-4 mr-2" />
                Formations
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-6 pb-6">
            {/* Onglet Profil */}
            <TabsContent value="profil" className="space-y-6 mt-0">
              {/* Biographie */}
              {candidat.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />À propos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {candidat.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Compétences */}
              {candidat.candidatCompetences?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Compétences
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {candidat.candidatCompetences.map((comp: any) => (
                        <Badge
                          key={comp.id}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {comp.competence}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Informations personnelles */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {candidat.dateNaissance && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Date de naissance
                      </span>
                      <span className="text-sm font-medium">
                        {new Date(candidat.dateNaissance).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    </div>
                  )}
                  {candidat.nationalite && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        Nationalité
                      </span>
                      <span className="text-sm font-medium">
                        {candidat.nationalite}
                      </span>
                    </div>
                  )}
                  {candidat.situationFamiliale && (
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-sm text-muted-foreground flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Situation familiale
                      </span>
                      <span className="text-sm font-medium">
                        {candidat.situationFamiliale}
                      </span>
                    </div>
                  )}
                  {candidat.permisConduire && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">
                        Permis de conduire
                      </span>
                      <span className="text-sm font-medium">
                        {candidat.permisConduire}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Liens */}
              {(candidat.linkedinUrl || candidat.portfolioUrl) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Liens professionnels</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {candidat.linkedinUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        asChild
                      >
                        <a
                          href={candidat.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            LinkedIn
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {candidat.portfolioUrl && (
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                        asChild
                      >
                        <a
                          href={candidat.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Portfolio
                          </span>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Expériences */}
            <TabsContent value="experiences" className="space-y-4 mt-0">
              {candidat.experiences?.length > 0 ? (
                candidat.experiences.map((exp: any) => (
                  <Card key={exp.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{exp.poste}</CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {exp.entreprise}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(exp.dateDebut)} -{" "}
                            {formatDate(exp.dateFin)}
                          </div>
                          {exp.lieu && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4" />
                              {exp.lieu}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    {exp.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {exp.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune expérience professionnelle renseignée
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Formations */}
            <TabsContent value="formations" className="space-y-4 mt-0">
              {candidat.formations?.length > 0 ? (
                candidat.formations.map((form: any) => (
                  <Card key={form.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{form.diplome}</CardTitle>
                      <CardDescription>
                        <div className="space-y-1">
                          <div className="font-semibold text-foreground">
                            {form.etablissement}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(form.dateDebut)} -{" "}
                            {formatDate(form.dateFin)}
                          </div>
                          {form.lieu && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4" />
                              {form.lieu}
                            </div>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    {form.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {form.description}
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Aucune formation renseignée
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Onglet Documents */}
            <TabsContent value="documents" className="space-y-4 mt-0">
              {/* CV Principal */}
              {candidat.cv && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      CV Principal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      asChild
                    >
                      <a
                        href={candidat.cv}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Télécharger le CV
                        </span>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Lettre de motivation */}
              {candidat.letterm && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lettre de motivation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      asChild
                    >
                      <a
                        href={candidat.letterm}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Télécharger la lettre
                        </span>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Autres documents */}
              {candidat.documents?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Autres documents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {candidat.documents.map((doc: any) => (
                      <Button
                        key={doc.id}
                        variant="outline"
                        className="w-full justify-between"
                        asChild
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {doc.nom || "Document"}
                          </span>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              )}

              {!candidat.cv &&
                !candidat.letterm &&
                !candidat.documents?.length && (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucun document disponible
                      </p>
                    </CardContent>
                  </Card>
                )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
