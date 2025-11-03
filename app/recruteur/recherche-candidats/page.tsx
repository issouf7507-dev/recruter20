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
  IconSearch,
  IconMapPin,
  IconBriefcase,
  IconCalendar,
  IconStar,
  IconHeart,
  IconEye,
  IconMail,
  IconPhone,
  IconFilter,
  IconX,
  IconUser,
  IconFileText,
} from "@tabler/icons-react";

// Données mockées pour les candidats disponibles
const mockCandidats = [
  {
    id: 1,
    nom: "Alexandre Moreau",
    email: "alexandre.moreau@email.com",
    telephone: "+33 6 12 34 56 78",
    avatar: "/avatars/alexandre.jpg",
    lieu: "Paris, France",
    titre: "Développeur Full Stack",
    experience: "6 ans",
    competences: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    salaireSouhaite: "55000-70000",
    disponibilite: "Immédiate",
    note: 4.8,
    cvUrl: "/cv/alexandre-moreau.pdf",
    linkedinUrl: "https://linkedin.com/in/alexandre-moreau",
    portfolioUrl: "https://alexandre-moreau.dev",
    derniereActivite: "2024-01-20",
  },
  {
    id: 2,
    nom: "Camille Rousseau",
    email: "camille.rousseau@email.com",
    telephone: "+33 6 87 65 43 21",
    avatar: "/avatars/camille.jpg",
    lieu: "Lyon, France",
    titre: "Product Manager",
    experience: "5 ans",
    competences: ["Product Management", "Agile", "Analytics", "Figma", "SQL"],
    salaireSouhaite: "60000-80000",
    disponibilite: "2 semaines",
    note: 4.9,
    cvUrl: "/cv/camille-rousseau.pdf",
    linkedinUrl: "https://linkedin.com/in/camille-rousseau",
    portfolioUrl: "https://camille-rousseau.com",
    derniereActivite: "2024-01-18",
  },
  {
    id: 3,
    nom: "Lucas Petit",
    email: "lucas.petit@email.com",
    telephone: "+33 6 98 76 54 32",
    avatar: "/avatars/lucas.jpg",
    lieu: "Marseille, France",
    titre: "DevOps Engineer",
    experience: "4 ans",
    competences: ["AWS", "Kubernetes", "Terraform", "CI/CD", "Python"],
    salaireSouhaite: "50000-65000",
    disponibilite: "1 mois",
    note: 4.7,
    cvUrl: "/cv/lucas-petit.pdf",
    linkedinUrl: "https://linkedin.com/in/lucas-petit",
    portfolioUrl: "https://lucas-petit.dev",
    derniereActivite: "2024-01-15",
  },
  {
    id: 4,
    nom: "Emma Durand",
    email: "emma.durand@email.com",
    telephone: "+33 6 11 22 33 44",
    avatar: "/avatars/emma.jpg",
    lieu: "Toulouse, France",
    titre: "Data Scientist",
    experience: "7 ans",
    competences: ["Python", "Machine Learning", "TensorFlow", "Pandas", "SQL"],
    salaireSouhaite: "65000-85000",
    disponibilite: "Immédiate",
    note: 4.9,
    cvUrl: "/cv/emma-durand.pdf",
    linkedinUrl: "https://linkedin.com/in/emma-durand",
    portfolioUrl: "https://emma-durand.ai",
    derniereActivite: "2024-01-22",
  },
  {
    id: 5,
    nom: "Nicolas Blanc",
    email: "nicolas.blanc@email.com",
    telephone: "+33 6 55 66 77 88",
    avatar: "/avatars/nicolas.jpg",
    lieu: "Nantes, France",
    titre: "UX/UI Designer",
    experience: "5 ans",
    competences: [
      "Figma",
      "Sketch",
      "Prototyping",
      "User Research",
      "Adobe XD",
    ],
    salaireSouhaite: "45000-60000",
    disponibilite: "3 semaines",
    note: 4.6,
    cvUrl: "/cv/nicolas-blanc.pdf",
    linkedinUrl: "https://linkedin.com/in/nicolas-blanc",
    portfolioUrl: "https://nicolas-blanc.design",
    derniereActivite: "2024-01-19",
  },
  {
    id: 6,
    nom: "Sarah Martin",
    email: "sarah.martin@email.com",
    telephone: "+33 6 99 88 77 66",
    avatar: "/avatars/sarah.jpg",
    lieu: "Bordeaux, France",
    titre: "Marketing Manager",
    experience: "6 ans",
    competences: [
      "Digital Marketing",
      "SEO",
      "Google Analytics",
      "Content Strategy",
    ],
    salaireSouhaite: "50000-70000",
    disponibilite: "2 mois",
    note: 4.5,
    cvUrl: "/cv/sarah-martin.pdf",
    linkedinUrl: "https://linkedin.com/in/sarah-martin",
    portfolioUrl: "https://sarah-martin.marketing",
    derniereActivite: "2024-01-17",
  },
];

export default function RechercheCandidatsPage() {
  const [candidats, setCandidats] = useState(mockCandidats);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtres, setFiltres] = useState({
    lieu: "all",
    experience: "all",
    disponibilite: "all",
    salaireMin: "",
    salaireMax: "",
    competences: [] as string[],
  });
  const [candidatsFavoris, setCandidatsFavoris] = useState<number[]>([]);

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredCandidats = candidats.filter((candidat) => {
    const matchesSearch =
      candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.competences.some((comp) =>
        comp.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesLieu =
      filtres.lieu === "all" ||
      candidat.lieu.toLowerCase().includes(filtres.lieu.toLowerCase());

    const matchesExperience =
      filtres.experience === "all" ||
      (filtres.experience === "junior" &&
        candidat.experience.includes("1-3")) ||
      (filtres.experience === "senior" &&
        candidat.experience.includes("4-6")) ||
      (filtres.experience === "expert" && candidat.experience.includes("7+"));

    const matchesDisponibilite =
      filtres.disponibilite === "all" ||
      (filtres.disponibilite === "immediate" &&
        candidat.disponibilite === "Immédiate") ||
      (filtres.disponibilite === "rapide" &&
        candidat.disponibilite.includes("semaine")) ||
      (filtres.disponibilite === "long" &&
        candidat.disponibilite.includes("mois"));

    return (
      matchesSearch && matchesLieu && matchesExperience && matchesDisponibilite
    );
  });

  const handleToggleFavorite = (id: number) => {
    setCandidatsFavoris((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleFiltreChange = (key: string, value: string) => {
    setFiltres((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFiltres = () => {
    setFiltres({
      lieu: "all",
      experience: "all",
      disponibilite: "all",
      salaireMin: "",
      salaireMax: "",
      competences: [],
    });
    setSearchTerm("");
  };

  const competencesUniques = Array.from(
    new Set(candidats.flatMap((c) => c.competences))
  );

  const lieuxUniques = Array.from(
    new Set(candidats.map((c) => c.lieu.split(",")[0]))
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
                  <IconSearch className="h-6 w-6" />
                  Recherche de candidats
                </h1>
                <p className="text-muted-foreground mt-2">
                  Découvrez et contactez les meilleurs talents pour vos offres
                </p>
              </div>

              {/* Barre de recherche principale */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Rechercher par nom, titre ou compétences..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <IconFilter className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" onClick={clearFiltres}>
                        <IconX className="h-4 w-4" />
                        Effacer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Filtres avancés */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconFilter className="h-5 w-5" />
                    Filtres avancés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lieu</label>
                      <Select
                        value={filtres.lieu}
                        onValueChange={(value) =>
                          handleFiltreChange("lieu", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les lieux" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les lieux</SelectItem>
                          {lieuxUniques.map((lieu) => (
                            <SelectItem key={lieu} value={lieu}>
                              {lieu}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expérience</label>
                      <Select
                        value={filtres.experience}
                        onValueChange={(value) =>
                          handleFiltreChange("experience", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les niveaux" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les niveaux</SelectItem>
                          <SelectItem value="junior">
                            Junior (1-3 ans)
                          </SelectItem>
                          <SelectItem value="senior">
                            Senior (4-6 ans)
                          </SelectItem>
                          <SelectItem value="expert">
                            Expert (7+ ans)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Disponibilité
                      </label>
                      <Select
                        value={filtres.disponibilite}
                        onValueChange={(value) =>
                          handleFiltreChange("disponibilite", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les disponibilités" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="immediate">Immédiate</SelectItem>
                          <SelectItem value="rapide">
                            Rapide (1-2 semaines)
                          </SelectItem>
                          <SelectItem value="long">
                            Long terme (1+ mois)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Salaire souhaité
                      </label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Min"
                          type="number"
                          value={filtres.salaireMin}
                          onChange={(e) =>
                            handleFiltreChange("salaireMin", e.target.value)
                          }
                        />
                        <Input
                          placeholder="Max"
                          type="number"
                          value={filtres.salaireMax}
                          onChange={(e) =>
                            handleFiltreChange("salaireMax", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Résultats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {filteredCandidats.length} candidat
                    {filteredCandidats.length > 1 ? "s" : ""} trouvé
                    {filteredCandidats.length > 1 ? "s" : ""}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <IconEye className="h-4 w-4" />
                      Vue grille
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconUser className="h-4 w-4" />
                      Vue liste
                    </Button>
                  </div>
                </div>

                {filteredCandidats.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconSearch className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucun candidat trouvé
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Essayez de modifier vos critères de recherche ou vos
                        filtres.
                      </p>
                      <Button variant="outline" onClick={clearFiltres}>
                        Effacer les filtres
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCandidats.map((candidat) => (
                      <Card
                        key={candidat.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={candidat.avatar} />
                                <AvatarFallback>
                                  {getInitials(candidat.nom)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <CardTitle className="text-lg">
                                  {candidat.nom}
                                </CardTitle>
                                <CardDescription className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <IconBriefcase className="h-4 w-4" />
                                    {candidat.titre}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <IconMapPin className="h-4 w-4" />
                                    {candidat.lieu}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <IconCalendar className="h-4 w-4" />
                                    {candidat.experience}
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <div className="flex items-center gap-1">
                                <IconStar className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm font-medium">
                                  {candidat.note}
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleToggleFavorite(candidat.id)
                                }
                                className={`${
                                  candidatsFavoris.includes(candidat.id)
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}
                              >
                                <IconHeart
                                  className={`h-4 w-4 ${
                                    candidatsFavoris.includes(candidat.id)
                                      ? "fill-current"
                                      : ""
                                  }`}
                                />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Compétences */}
                            <div>
                              <h4 className="font-medium mb-2 text-sm">
                                Compétences
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {candidat.competences
                                  .slice(0, 3)
                                  .map((competence, index) => (
                                    <Badge
                                      key={index}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {competence}
                                    </Badge>
                                  ))}
                                {candidat.competences.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidat.competences.length - 3}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Informations supplémentaires */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Salaire souhaité:
                                </span>
                                <span className="font-medium">
                                  {candidat.salaireSouhaite}€
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Disponibilité:
                                </span>
                                <span className="font-medium">
                                  {candidat.disponibilite}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">
                                  Dernière activité:
                                </span>
                                <span className="font-medium">
                                  {candidat.derniereActivite}
                                </span>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                asChild
                              >
                                <a
                                  href={candidat.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconFileText className="h-4 w-4" />
                                  CV
                                </a>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                              >
                                <IconEye className="h-4 w-4" />
                                Profil
                              </Button>
                              <Button size="sm" className="flex-1">
                                <IconMail className="h-4 w-4" />
                                Contacter
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
