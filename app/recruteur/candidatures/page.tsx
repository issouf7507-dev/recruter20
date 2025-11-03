"use client";

import { useState } from "react";
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
  IconStar,
  IconMapPin,
  IconBriefcase,
  IconSearch,
  IconFilter,
  IconFileText,
  IconMail,
  IconPhone,
} from "@tabler/icons-react";

// Données mockées pour les candidatures
const mockCandidatures = [
  {
    id: 1,
    candidat: {
      nom: "Marie Dubois",
      email: "marie.dubois@email.com",
      telephone: "+33 6 12 34 56 78",
      avatar: "/avatars/marie.jpg",
      lieu: "Paris, France",
    },
    offre: {
      titre: "Développeur React Senior",
      entreprise: "TechCorp",
    },
    statut: "nouvelle",
    dateCandidature: "2024-01-20",
    experience: "5 ans",
    competences: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    lettreMotivation: "Je suis très intéressée par ce poste...",
    cvUrl: "/cv/marie-dubois.pdf",
    note: 0,
  },
  {
    id: 2,
    candidat: {
      nom: "Pierre Martin",
      email: "pierre.martin@email.com",
      telephone: "+33 6 87 65 43 21",
      avatar: "/avatars/pierre.jpg",
      lieu: "Lyon, France",
    },
    offre: {
      titre: "Développeur React Senior",
      entreprise: "TechCorp",
    },
    statut: "en-cours",
    dateCandidature: "2024-01-18",
    experience: "7 ans",
    competences: ["React", "Vue.js", "Python", "MongoDB"],
    lettreMotivation: "Avec mon expérience en développement...",
    cvUrl: "/cv/pierre-martin.pdf",
    note: 4,
  },
  {
    id: 3,
    candidat: {
      nom: "Sophie Laurent",
      email: "sophie.laurent@email.com",
      telephone: "+33 6 98 76 54 32",
      avatar: "/avatars/sophie.jpg",
      lieu: "Marseille, France",
    },
    offre: {
      titre: "Product Manager",
      entreprise: "StartupXYZ",
    },
    statut: "acceptee",
    dateCandidature: "2024-01-15",
    experience: "4 ans",
    competences: ["Product Management", "Agile", "Analytics", "Figma"],
    lettreMotivation: "Mon parcours en product management...",
    cvUrl: "/cv/sophie-laurent.pdf",
    note: 5,
  },
  {
    id: 4,
    candidat: {
      nom: "Thomas Bernard",
      email: "thomas.bernard@email.com",
      telephone: "+33 6 11 22 33 44",
      avatar: "/avatars/thomas.jpg",
      lieu: "Toulouse, France",
    },
    offre: {
      titre: "Designer UX/UI",
      entreprise: "CreativeStudio",
    },
    statut: "refusee",
    dateCandidature: "2024-01-12",
    experience: "3 ans",
    competences: ["UI/UX Design", "Figma", "Sketch", "Prototyping"],
    lettreMotivation: "En tant que designer passionné...",
    cvUrl: "/cv/thomas-bernard.pdf",
    note: 2,
  },
  {
    id: 5,
    candidat: {
      nom: "Julie Moreau",
      email: "julie.moreau@email.com",
      telephone: "+33 6 55 66 77 88",
      avatar: "/avatars/julie.jpg",
      lieu: "Nantes, France",
    },
    offre: {
      titre: "Data Scientist",
      entreprise: "DataCorp",
    },
    statut: "nouvelle",
    dateCandidature: "2024-01-22",
    experience: "6 ans",
    competences: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    lettreMotivation: "Mon expertise en data science...",
    cvUrl: "/cv/julie-moreau.pdf",
    note: 0,
  },
];

export default function CandidaturesRecuesPage() {
  const [candidatures, setCandidatures] = useState(mockCandidatures);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterOffre, setFilterOffre] = useState("all");

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

  const filteredCandidatures = candidatures.filter((candidature) => {
    const matchesSearch =
      candidature.candidat.nom
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      candidature.offre.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut =
      filterStatut === "all" || candidature.statut === filterStatut;
    const matchesOffre =
      filterOffre === "all" || candidature.offre.titre === filterOffre;
    return matchesSearch && matchesStatut && matchesOffre;
  });

  const handleStatutChange = (id: number, nouveauStatut: string) => {
    setCandidatures(
      candidatures.map((c) =>
        c.id === id ? { ...c, statut: nouveauStatut } : c
      )
    );
  };

  const handleNoteChange = (id: number, note: number) => {
    setCandidatures(
      candidatures.map((c) => (c.id === id ? { ...c, note } : c))
    );
  };

  const offresUniques = Array.from(
    new Set(candidatures.map((c) => c.offre.titre))
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
                          {candidatures.length}
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
                            candidatures.filter((c) => c.statut === "nouvelle")
                              .length
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
                          En cours
                        </p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {
                            candidatures.filter((c) => c.statut === "en-cours")
                              .length
                          }
                        </p>
                      </div>
                      <IconCalendar className="h-8 w-8 text-yellow-500" />
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
                            candidatures.filter((c) => c.statut === "acceptee")
                              .length
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
                          <SelectItem value="nouvelle">Nouvelles</SelectItem>
                          <SelectItem value="en-cours">En cours</SelectItem>
                          <SelectItem value="acceptee">Acceptées</SelectItem>
                          <SelectItem value="refusee">Refusées</SelectItem>
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
                {filteredCandidatures.length === 0 ? (
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
                  filteredCandidatures.map((candidature) => (
                    <Card
                      key={candidature.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={candidature.candidat.avatar} />
                              <AvatarFallback>
                                {getInitials(candidature.candidat.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {candidature.candidat.nom}
                                </CardTitle>
                                {getStatutBadge(candidature.statut)}
                              </div>
                              <CardDescription className="space-y-1">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <IconBriefcase className="h-4 w-4" />
                                    {candidature.offre.titre} -{" "}
                                    {candidature.offre.entreprise}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconMapPin className="h-4 w-4" />
                                    {candidature.candidat.lieu}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconCalendar className="h-4 w-4" />
                                    {candidature.dateCandidature}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span>
                                    Expérience: {candidature.experience}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconPhone className="h-4 w-4" />
                                    {candidature.candidat.telephone}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconMail className="h-4 w-4" />
                                    {candidature.candidat.email}
                                  </span>
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={candidature.cvUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconFileText className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm">
                              <IconEye className="h-4 w-4" />
                            </Button>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    handleNoteChange(candidature.id, star)
                                  }
                                  className={`text-sm ${
                                    star <= candidature.note
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <IconStar className="h-4 w-4 fill-current" />
                                </button>
                              ))}
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
                              {candidature.competences.map(
                                (competence, index) => (
                                  <Badge key={index} variant="secondary">
                                    {competence}
                                  </Badge>
                                )
                              )}
                            </div>
                          </div>

                          {/* Lettre de motivation */}
                          <div>
                            <h4 className="font-medium mb-2">
                              Lettre de motivation
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {candidature.lettreMotivation}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="flex gap-2">
                              <Select
                                value={candidature.statut}
                                onValueChange={(value) =>
                                  handleStatutChange(candidature.id, value)
                                }
                              >
                                <SelectTrigger className="w-[140px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nouvelle">
                                    Nouvelle
                                  </SelectItem>
                                  <SelectItem value="en-cours">
                                    En cours
                                  </SelectItem>
                                  <SelectItem value="acceptee">
                                    Acceptée
                                  </SelectItem>
                                  <SelectItem value="refusee">
                                    Refusée
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatutChange(candidature.id, "acceptee")
                                }
                                className="text-green-600 hover:text-green-700"
                              >
                                <IconCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleStatutChange(candidature.id, "refusee")
                                }
                                className="text-red-600 hover:text-red-700"
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
