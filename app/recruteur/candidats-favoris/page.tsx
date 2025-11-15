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
  IconHeart,
} from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId } from "@/lib/hooks/use-recruteurs";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { Star } from "lucide-react";
import { toast } from "sonner";

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
export default function CandidatsFavorisPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterOffre, setFilterOffre] = useState("all");

  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id;

  const {
    candidaturesFavorites,
    updateStatusCandidature,
    updateFavoriteCandidature,
    candidaturesRecruteur,
    isLoading,
    refetchRecruteur,
    createConversation,
  } = useCandidatures(recruteurId);

  console.log("candidaturesRecruteur", candidaturesRecruteur);
  console.log("candidaturesFavorites", candidaturesFavorites);

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
      case "disponible":
        return (
          <Badge className="bg-green-100 text-green-800">Disponible</Badge>
        );
      case "en-postule":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En postule</Badge>
        );
      case "embauche":
        return <Badge className="bg-blue-100 text-blue-800">Embauché</Badge>;
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

  const filteredCandidats = candidaturesFavorites?.filter(
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
                  <IconHeart className="h-6 w-6 text-red-500" />
                  Candidats favoris
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez vos candidats préférés et suivez leur activité
                </p>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total favoris
                        </p>
                        <p className="text-2xl font-bold">
                          {candidaturesFavorites?.length}
                        </p>
                      </div>
                      <IconHeart className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Disponibles
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            candidaturesFavorites?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "EN_ATTENTE"
                            ).length
                          }
                        </p>
                      </div>
                      <IconUser className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          En postule
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            candidaturesFavorites?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "EN_REVISION"
                            ).length
                          }
                        </p>
                      </div>
                      <IconBriefcase className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Embauchés
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          {
                            candidaturesFavorites?.filter(
                              (c: CandidatureRecruteur) =>
                                c.status === "ACCEPTE"
                            ).length
                          }
                        </p>
                      </div>
                      <IconHeart className="h-8 w-8 text-blue-500" />
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
                          placeholder="Rechercher par nom ou titre..."
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
                      {/* <Select
                        value={filterOffre}
                        onValueChange={setFilterOffre}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Offre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Toutes les compétences
                          </SelectItem>
                          {competencesUniques.map((competence) => (
                            <SelectItem key={competence} value={competence}>
                              {competence}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select> */}
                      <Button variant="outline" size="icon">
                        <IconFilter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des candidats favoris */}
              <div className="space-y-4">
                {filteredCandidats?.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucun candidat favori trouvé
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ||
                        filterStatut !== "all" ||
                        filterOffre !== "all"
                          ? "Aucun candidat ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore ajouté de candidats à vos favoris."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCandidats?.map(
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
                                      {candidature.createdAt}
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

                            {/* Lettre de motivation */}
                            {/* <div>
                              <h4 className="font-medium mb-2">
                                Lettre de motivation
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {candidature.candidat.letterm}
                              </p>
                            </div> */}

                            {/* Actions */}
                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="flex gap-2">
                                <div>
                                  <Select
                                    value={candidature.status}
                                    onValueChange={(value) =>
                                      updateStatusCandidature.mutate({
                                        id: candidature.id,
                                        status: value as
                                          | "EN_ATTENTE"
                                          | "EN_REVISION"
                                          | "ACCEPTE"
                                          | "REFUSE",
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
                                    {/* <Button variant="outline" size="sm" asChild>
                                      <a
                                        // href={candidature.candidat.portfolioUrl || ""}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <IconEye className="h-4 w-4" />
                                        Portfolio
                                      </a>
                                    </Button> */}
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
                                    <Button size="sm">
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
    </>
  );
}
