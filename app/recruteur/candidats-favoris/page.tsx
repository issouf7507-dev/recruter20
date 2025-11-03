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
  IconHeart,
  IconCalendar,
  IconEye,
  IconMail,
  IconPhone,
  IconMapPin,
  IconBriefcase,
  IconSearch,
  IconFilter,
  IconFileText,
  IconStar,
  IconUser,
  IconTrash,
  IconMessage,
} from "@tabler/icons-react";

// Données mockées pour les candidats favoris
const mockCandidatsFavoris = [
  {
    id: 1,
    candidat: {
      nom: "Marie Dubois",
      email: "marie.dubois@email.com",
      telephone: "+33 6 12 34 56 78",
      avatar: "/avatars/marie.jpg",
      lieu: "Paris, France",
      titre: "Développeuse React Senior",
      experience: "5 ans",
    },
    competences: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    derniereActivite: "2024-01-20",
    statut: "disponible",
    note: 5,
    offresAppliquees: ["Développeur React Senior", "Full Stack Developer"],
    cvUrl: "/cv/marie-dubois.pdf",
    portfolioUrl: "https://marie-dubois.dev",
    linkedinUrl: "https://linkedin.com/in/marie-dubois",
  },
  {
    id: 2,
    candidat: {
      nom: "Pierre Martin",
      email: "pierre.martin@email.com",
      telephone: "+33 6 87 65 43 21",
      avatar: "/avatars/pierre.jpg",
      lieu: "Lyon, France",
      titre: "Product Manager",
      experience: "7 ans",
    },
    competences: ["Product Management", "Agile", "Analytics", "Figma", "SQL"],
    derniereActivite: "2024-01-18",
    statut: "en-postule",
    note: 4,
    offresAppliquees: ["Product Manager", "Senior PM"],
    cvUrl: "/cv/pierre-martin.pdf",
    portfolioUrl: "https://pierre-martin.com",
    linkedinUrl: "https://linkedin.com/in/pierre-martin",
  },
  {
    id: 3,
    candidat: {
      nom: "Sophie Laurent",
      email: "sophie.laurent@email.com",
      telephone: "+33 6 98 76 54 32",
      avatar: "/avatars/sophie.jpg",
      lieu: "Marseille, France",
      titre: "Designer UX/UI",
      experience: "4 ans",
    },
    competences: [
      "UI/UX Design",
      "Figma",
      "Sketch",
      "Prototyping",
      "User Research",
    ],
    derniereActivite: "2024-01-15",
    statut: "disponible",
    note: 5,
    offresAppliquees: ["Designer UX/UI", "Senior Designer"],
    cvUrl: "/cv/sophie-laurent.pdf",
    portfolioUrl: "https://sophie-laurent.design",
    linkedinUrl: "https://linkedin.com/in/sophie-laurent",
  },
  {
    id: 4,
    candidat: {
      nom: "Thomas Bernard",
      email: "thomas.bernard@email.com",
      telephone: "+33 6 11 22 33 44",
      avatar: "/avatars/thomas.jpg",
      lieu: "Toulouse, France",
      titre: "Data Scientist",
      experience: "6 ans",
    },
    competences: ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
    derniereActivite: "2024-01-12",
    statut: "en-postule",
    note: 4,
    offresAppliquees: ["Data Scientist", "ML Engineer"],
    cvUrl: "/cv/thomas-bernard.pdf",
    portfolioUrl: "https://thomas-bernard.ai",
    linkedinUrl: "https://linkedin.com/in/thomas-bernard",
  },
  {
    id: 5,
    candidat: {
      nom: "Julie Moreau",
      email: "julie.moreau@email.com",
      telephone: "+33 6 55 66 77 88",
      avatar: "/avatars/julie.jpg",
      lieu: "Nantes, France",
      titre: "DevOps Engineer",
      experience: "5 ans",
    },
    competences: ["AWS", "Docker", "Kubernetes", "Terraform", "CI/CD"],
    derniereActivite: "2024-01-22",
    statut: "disponible",
    note: 5,
    offresAppliquees: ["DevOps Engineer", "Cloud Engineer"],
    cvUrl: "/cv/julie-moreau.pdf",
    portfolioUrl: "https://julie-moreau.dev",
    linkedinUrl: "https://linkedin.com/in/julie-moreau",
  },
];

export default function CandidatsFavorisPage() {
  const [candidatsFavoris, setCandidatsFavoris] =
    useState(mockCandidatsFavoris);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [filterCompetence, setFilterCompetence] = useState("all");

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

  const filteredCandidats = candidatsFavoris.filter((candidat) => {
    const matchesSearch =
      candidat.candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.candidat.titre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatut =
      filterStatut === "all" || candidat.statut === filterStatut;
    const matchesCompetence =
      filterCompetence === "all" ||
      candidat.competences.some((comp) =>
        comp.toLowerCase().includes(filterCompetence.toLowerCase())
      );
    return matchesSearch && matchesStatut && matchesCompetence;
  });

  const handleRemoveFavorite = (id: number) => {
    if (
      confirm("Êtes-vous sûr de vouloir retirer ce candidat de vos favoris ?")
    ) {
      setCandidatsFavoris(candidatsFavoris.filter((c) => c.id !== id));
    }
  };

  const handleNoteChange = (id: number, note: number) => {
    setCandidatsFavoris(
      candidatsFavoris.map((c) => (c.id === id ? { ...c, note } : c))
    );
  };

  const competencesUniques = Array.from(
    new Set(candidatsFavoris.flatMap((c) => c.competences))
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
                          {candidatsFavoris.length}
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
                            candidatsFavoris.filter(
                              (c) => c.statut === "disponible"
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
                            candidatsFavoris.filter(
                              (c) => c.statut === "en-postule"
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
                            candidatsFavoris.filter(
                              (c) => c.statut === "embauche"
                            ).length
                          }
                        </p>
                      </div>
                      <IconStar className="h-8 w-8 text-blue-500" />
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
                          <SelectItem value="disponible">
                            Disponibles
                          </SelectItem>
                          <SelectItem value="en-postule">En postule</SelectItem>
                          <SelectItem value="embauche">Embauchés</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select
                        value={filterCompetence}
                        onValueChange={setFilterCompetence}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Compétence" />
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
                      </Select>
                      <Button variant="outline" size="icon">
                        <IconFilter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des candidats favoris */}
              <div className="space-y-4">
                {filteredCandidats.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconHeart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucun candidat favori trouvé
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm ||
                        filterStatut !== "all" ||
                        filterCompetence !== "all"
                          ? "Aucun candidat ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore ajouté de candidats à vos favoris."}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredCandidats.map((candidat) => (
                    <Card
                      key={candidat.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={candidat.candidat.avatar} />
                              <AvatarFallback>
                                {getInitials(candidat.candidat.nom)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-xl">
                                  {candidat.candidat.nom}
                                </CardTitle>
                                {getStatutBadge(candidat.statut)}
                              </div>
                              <CardDescription className="space-y-2">
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <IconBriefcase className="h-4 w-4" />
                                    {candidat.candidat.titre}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconMapPin className="h-4 w-4" />
                                    {candidat.candidat.lieu}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconCalendar className="h-4 w-4" />
                                    {candidat.candidat.experience}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <IconMail className="h-4 w-4" />
                                    {candidat.candidat.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <IconPhone className="h-4 w-4" />
                                    {candidat.candidat.telephone}
                                  </span>
                                  <span className="text-muted-foreground">
                                    Dernière activité:{" "}
                                    {candidat.derniereActivite}
                                  </span>
                                </div>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() =>
                                    handleNoteChange(candidat.id, star)
                                  }
                                  className={`text-sm ${
                                    star <= candidat.note
                                      ? "text-yellow-500"
                                      : "text-gray-300"
                                  }`}
                                >
                                  <IconStar className="h-4 w-4 fill-current" />
                                </button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveFavorite(candidat.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Compétences */}
                          <div>
                            <h4 className="font-medium mb-2">Compétences</h4>
                            <div className="flex flex-wrap gap-2">
                              {candidat.competences.map((competence, index) => (
                                <Badge key={index} variant="secondary">
                                  {competence}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Offres appliquées */}
                          <div>
                            <h4 className="font-medium mb-2">
                              Offres appliquées
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {candidat.offresAppliquees.map((offre, index) => (
                                <Badge key={index} variant="outline">
                                  {offre}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-between items-center pt-4 border-t">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={candidat.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconFileText className="h-4 w-4" />
                                  Voir CV
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={candidat.portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconEye className="h-4 w-4" />
                                  Portfolio
                                </a>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={candidat.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconUser className="h-4 w-4" />
                                  LinkedIn
                                </a>
                              </Button>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <IconMessage className="h-4 w-4" />
                                Contacter
                              </Button>
                              <Button size="sm">
                                <IconEye className="h-4 w-4" />
                                Voir profil
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
