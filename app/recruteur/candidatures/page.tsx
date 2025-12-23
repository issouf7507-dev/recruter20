"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteHeader } from "@/components/site-header";
import {
  IconUser,
  IconCalendar,
  IconEye,
  IconCheck,
  IconX,
  IconMapPin,
  IconBriefcase,
  IconSearch,
  IconFilter,
  IconFileText,
  IconMail,
  IconPhone,
  IconClock,
  IconMessage,
  IconLoader,
} from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import {
  useCollaborateurByUserId,
  useRecruteurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { toast } from "sonner";
import { LoaderCircle, Star } from "lucide-react";
import { ApplicationStatus } from "@/lib/api/candidatures";
import { CandidatProfilDialog } from "@/app/components/recruteur/CandidatProfilDialog";

interface CandidatureRecruteur {
  id: string;
  candidatId: string;
  jobOfferId: string;
  status: "EN_ATTENTE" | "ACCEPTE" | "REFUSE" | string; // selon ton enum
  rating: number | null;
  message: string | null;
  cv: string | null;
  favorite: boolean;
  duedate: string | null; // ou Date si tu convertis tes dates
  createdAt: string; // ou Date
  updatedAt: string; // ou Date
  deletedAt: string | null;

  jobOffer: {
    id: string;
    title: string;
    description: string;
    company: string;
    location: string;
    type: string;
    etat: "active" | "inactive" | string;
    experience: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string | null;
    salaryPeriod: string | null;
    benefits: string | null;
    requirements: string | null;
    responsibilities: string | null;
    duedate: string | null; // ou Date
    skills: string | null;
    favorite: boolean;
    templateId: string | null;
    views: number;
    recruteurId: string;
    createdAt: string; // ou Date
    updatedAt: string; // ou Date
    deletedAt: string | null;
  };

  candidat: {
    id: string;
    userId: string;
    nom: string;
    prenom: string;
    telephone: string | null;
    cv: string | null;
    letterm: string | null;
    bio: string | null;
    adresse: string | null;
    ville: string | null;
    statut: string | null;
    pays: string | null;
    dateNaissance: string | null; // ou Date
    nationalite: string | null;
    situationFamiliale: string | null;
    permisConduire: string | null;
    image: string | null;
    user: {
      email: string;
    };
    candidatCompetences: {
      id: string;
      candidatId: string;
      competence: string;
      createdAt: string;
    }[];
  };
}

export default function CandidaturesRecuesPage() {
  // const [candidatures, setCandidatures] = useState(mockCandidatures);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterOffre, setFilterOffre] = useState("all");
  const [selectedCandidatId, setSelectedCandidatId] = useState<string | null>(
    null
  );
  const [isProfilDialogOpen, setIsProfilDialogOpen] = useState(false);

  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  // console.log("recruteurId", recruteurId);

  const {
    candidaturesRecruteur,
    isLoadingRecruteur,
    errorRecruteur,
    refetchRecruteur,
    updateStatusCandidature,
    updateFavoriteCandidature,
    createConversation,
  } = useCandidatures(recruteurId);

  const handleContactCandidat = (candidatId: string, jobOfferId: string) => {
    if (!recruteurId) {
      toast.error("Erreur: Recruteur non trouvé");
      return;
    }

    createConversation.mutate({
      candidatId,
      jobOfferId,
      recruteurId: recruteurId,
    });
  };

  const getStatutBadge = (statut: string) => {
    switch (statut) {
      case "nouvelle":
        return <Badge className="bg-blue-100 text-blue-800">Nouvelle</Badge>;
      case "en-cours":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En cours</Badge>
        );
      case "acceptee":
        return <Badge className="bg-green-100 text-green-800">Acceptée</Badge>;
      case "refusee":
        return <Badge className="bg-red-100 text-red-800">Refusée</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredCandidatures = candidaturesRecruteur?.filter(
    (candidature: CandidatureRecruteur) => {
      const matchesSearch =
        candidature.candidat.nom
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        candidature.candidat.prenom
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        candidature.jobOffer.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatut =
        filterStatut === "all" || candidature.status === filterStatut;
      // const matchesOffre =
      //   filterOffre === "all" || candidature.jobOffer.title === filterOffre;
      return matchesSearch && matchesStatut;
    }
  );

  const offresUniques = Array.from(
    new Set(
      candidaturesRecruteur?.map((c: CandidatureRecruteur) => c.jobOffer.title)
    )
  ) as string[];

  if (isLoadingRecruteur) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (errorRecruteur)
    return (
      <div>
        Erreur lors du chargement des candidatures: {errorRecruteur.message}
      </div>
    );

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconUser className="h-6 w-6" />
                  Candidatures reçues
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez et suivez les candidatures pour vos offres d'emploi
                </p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total candidatures
                        </p>
                        <p className="text-2xl font-bold">
                          {candidaturesRecruteur?.length}
                        </p>
                      </div>
                      <IconUser className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Nouvelles
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            candidaturesRecruteur?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "EN_ATTENTE"
                            ).length
                          }
                        </p>
                      </div>
                      <IconMail className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          En revision
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            candidaturesRecruteur?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "EN_REVISION"
                            ).length
                          }
                        </p>
                      </div>
                      <IconClock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Acceptées
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            candidaturesRecruteur?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "ACCEPTE"
                            ).length
                          }
                        </p>
                      </div>
                      <IconCheck className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtres et recherche */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher par candidat ou offre..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={filterStatut}
                        onValueChange={setFilterStatut}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                          <SelectItem value="EN_REVISION">
                            En revision
                          </SelectItem>
                          <SelectItem value="ACCEPTE">Accepté</SelectItem>
                          <SelectItem value="REFUSE">Refusé</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={filterOffre}
                        onValueChange={setFilterOffre}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Offre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes les offres</SelectItem>
                          {offresUniques.map((offre) => (
                            <SelectItem key={offre} value={offre}>
                              {offre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <IconFilter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des candidatures */}
              <div className="space-y-4">
                {filteredCandidatures?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconUser className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucune candidature trouvée
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ||
                        filterStatut !== "all" ||
                        filterOffre !== "all"
                          ? "Aucune candidature ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore reçu de candidatures."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCandidatures?.map(
                    (candidature: CandidatureRecruteur) => (
                      <Card
                        key={candidature.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage
                                  src={candidature.candidat.image || ""}
                                />
                                <AvatarFallback>
                                  {getInitials(candidature.candidat.nom)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg">
                                    {candidature.candidat.nom}{" "}
                                    {candidature.candidat.prenom}
                                  </CardTitle>
                                  {getStatutBadge(candidature.status)}
                                </div>
                                <CardDescription className="space-y-1">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                      <IconBriefcase className="h-4 w-4" />
                                      {candidature.jobOffer.title} -{" "}
                                      {candidature.jobOffer.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconMapPin className="h-4 w-4" />
                                      {candidature.jobOffer.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconCalendar className="h-4 w-4" />
                                      {new Date(
                                        candidature.createdAt
                                      ).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    {/* <span>
                                      Expérience:{" "}
                                      {candidature.jobOffer.experience}
                                    </span> */}
                                    <span className="flex items-center gap-1">
                                      <IconPhone className="h-4 w-4" />
                                      {candidature.candidat.telephone}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconMail className="h-4 w-4" />
                                      {candidature.candidat.user.email}
                                    </span>
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <div>
                                {/* <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                 */}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Compétences */}
                            <div>
                              <h4 className="font-medium mb-2">Compétences</h4>
                              <div className="flex flex-wrap gap-2">
                                {candidature.candidat.candidatCompetences?.map(
                                  (
                                    competence: {
                                      id: string;
                                      candidatId: string;
                                      competence: string;
                                      createdAt: string;
                                    },
                                    index: number
                                  ) => (
                                    <Badge key={index} variant="secondary">
                                      {competence.competence}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="flex gap-2">
                                <div>
                                  <Select
                                    value={candidature.status}
                                    onValueChange={(value) =>
                                      updateStatusCandidature.mutate({
                                        id: candidature.id,
                                        status: value as ApplicationStatus,
                                      })
                                    }
                                  >
                                    <SelectTrigger className="w-[140px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="EN_ATTENTE">
                                        En attente
                                      </SelectItem>
                                      <SelectItem value="EN_REVISION">
                                        En revision
                                      </SelectItem>
                                      <SelectItem value="ACCEPTE">
                                        Accepté
                                      </SelectItem>
                                      <SelectItem value="REFUSE">
                                        Refusé
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="flex justify-between items-center ">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        window.open(
                                          candidature.candidat.cv || "",
                                          "_blank"
                                        );
                                      }}
                                    >
                                      <IconFileText className="h-4 w-4" />
                                      Voir CV
                                    </Button>

                                    <Button variant="outline" size="sm" asChild>
                                      <a
                                        // href={candidature.candidat.linkedinUrl || ""}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <IconUser className="h-4 w-4" />
                                        LinkedIn
                                      </a>
                                    </Button>
                                  </div>
                                  <div className="flex gap-2 ml-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleContactCandidat(
                                          candidature.candidatId,
                                          candidature.jobOfferId
                                        )
                                      }
                                      disabled={createConversation.isPending}
                                    >
                                      <IconMessage className="h-4 w-4" />
                                      {createConversation.isPending
                                        ? "Chargement..."
                                        : "Contacter"}
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        updateFavoriteCandidature.mutate({
                                          id: candidature.id,
                                          favorite: !candidature.favorite,
                                        })
                                      }
                                      className="border bg-transparent shadow-none"
                                      disabled={
                                        updateFavoriteCandidature.isPending
                                      }
                                    >
                                      {candidature.favorite ? (
                                        <>
                                          {" "}
                                          Retirer des favoris{" "}
                                          <Star className=" text-yellow-500 fill-yellow-500" />
                                        </>
                                      ) : (
                                        <>
                                          {" "}
                                          Ajouter aux favoris
                                          <Star className="" />
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCandidatId(
                                          candidature.candidatId
                                        );
                                        setIsProfilDialogOpen(true);
                                      }}
                                    >
                                      <IconEye className="h-4 w-4" />
                                      Voir profil
                                    </Button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                {candidature.status === "ACCEPTE" ? (
                                  <Button variant="outline" size="sm" disabled>
                                    Candidature acceptée
                                    <IconCheck className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateStatusCandidature.mutate({
                                        id: candidature.id,
                                        status: "ACCEPTE",
                                      });
                                      refetchRecruteur();
                                      if (updateStatusCandidature.isSuccess) {
                                        toast.success("Candidature acceptée");
                                      }
                                    }}
                                    className="text-green-600 hover:text-green-700"
                                  >
                                    Accepter la candidature
                                    <IconCheck className="h-4 w-4" />
                                  </Button>
                                )}

                                {candidature.status !== "ACCEPTE" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      updateStatusCandidature.mutate({
                                        id: candidature.id,
                                        status: "EN_REVISION",
                                      });
                                      refetchRecruteur();
                                      if (updateStatusCandidature.isSuccess) {
                                        toast.success(
                                          "Candidature en revision"
                                        );
                                      }
                                    }}
                                  >
                                    En revision
                                    <IconClock className="h-4 w-4" />
                                  </Button>
                                )}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    updateStatusCandidature.mutate({
                                      id: candidature.id,
                                      status: "REFUSE",
                                    });
                                    refetchRecruteur();
                                    if (updateStatusCandidature.isSuccess) {
                                      toast.success("Candidature refusée");
                                    }
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Refuser la candidature
                                  <IconX className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog pour afficher le profil du candidat */}
      {selectedCandidatId && (
        <CandidatProfilDialog
          open={isProfilDialogOpen}
          onOpenChange={setIsProfilDialogOpen}
          candidatId={selectedCandidatId}
        />
      )}
    </>
  );
}
