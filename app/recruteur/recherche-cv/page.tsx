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
  IconFileText,
  IconSearch,
  IconMapPin,
  IconBriefcase,
  IconCalendar,
  IconStar,
  IconDownload,
  IconEye,
  IconFilter,
  IconX,
  IconUser,
  IconMail,
  IconPhone,
  IconSchool,
  IconAward,
} from "@tabler/icons-react";

// Données mockées pour les CV disponibles
const mockCVs = [
  {
    id: 1,
    candidat: {
      nom: "Antoine Lefebvre",
      email: "antoine.lefebvre@email.com",
      telephone: "+33 6 12 34 56 78",
      avatar: "/avatars/antoine.jpg",
      lieu: "Paris, France",
    },
    cv: {
      titre: "Développeur Full Stack Senior",
      experience: "8 ans",
      formation: "Master Informatique - École Polytechnique",
      competences: [
        "React",
        "Node.js",
        "TypeScript",
        "PostgreSQL",
        "Docker",
        "AWS",
        "GraphQL",
      ],
      langues: [
        "Français (Natif)",
        "Anglais (Courant)",
        "Espagnol (Intermédiaire)",
      ],
      certifications: ["AWS Certified Developer", "Google Cloud Professional"],
      derniereMiseAJour: "2024-01-20",
      taille: "2.3 MB",
      format: "PDF",
    },
    cvUrl: "/cv/antoine-lefebvre.pdf",
    note: 4.9,
    motsCles: ["développement", "fullstack", "react", "nodejs", "typescript"],
  },
  {
    id: 2,
    candidat: {
      nom: "Claire Dubois",
      email: "claire.dubois@email.com",
      telephone: "+33 6 87 65 43 21",
      avatar: "/avatars/claire.jpg",
      lieu: "Lyon, France",
    },
    cv: {
      titre: "Product Manager & UX Designer",
      experience: "6 ans",
      formation: "MBA Marketing Digital - HEC Paris",
      competences: [
        "Product Management",
        "UX Design",
        "Figma",
        "Analytics",
        "Agile",
        "SQL",
        "A/B Testing",
      ],
      langues: ["Français (Natif)", "Anglais (Courant)"],
      certifications: [
        "Certified Scrum Product Owner",
        "Google Analytics Certified",
      ],
      derniereMiseAJour: "2024-01-18",
      taille: "1.8 MB",
      format: "PDF",
    },
    cvUrl: "/cv/claire-dubois.pdf",
    note: 4.8,
    motsCles: ["product", "management", "ux", "design", "analytics"],
  },
  {
    id: 3,
    candidat: {
      nom: "Maxime Rousseau",
      email: "maxime.rousseau@email.com",
      telephone: "+33 6 98 76 54 32",
      avatar: "/avatars/maxime.jpg",
      lieu: "Marseille, France",
    },
    cv: {
      titre: "DevOps Engineer & Cloud Architect",
      experience: "7 ans",
      formation: "Master Systèmes et Réseaux - INSA Lyon",
      competences: [
        "Kubernetes",
        "Docker",
        "Terraform",
        "AWS",
        "CI/CD",
        "Python",
        "Monitoring",
      ],
      langues: ["Français (Natif)", "Anglais (Courant)"],
      certifications: ["AWS Solutions Architect", "Kubernetes Administrator"],
      derniereMiseAJour: "2024-01-15",
      taille: "2.1 MB",
      format: "PDF",
    },
    cvUrl: "/cv/maxime-rousseau.pdf",
    note: 4.7,
    motsCles: ["devops", "cloud", "kubernetes", "aws", "terraform"],
  },
  {
    id: 4,
    candidat: {
      nom: "Laura Moreau",
      email: "laura.moreau@email.com",
      telephone: "+33 6 11 22 33 44",
      avatar: "/avatars/laura.jpg",
      lieu: "Toulouse, France",
    },
    cv: {
      titre: "Data Scientist & ML Engineer",
      experience: "5 ans",
      formation: "PhD Intelligence Artificielle - Université de Toulouse",
      competences: [
        "Python",
        "Machine Learning",
        "TensorFlow",
        "PyTorch",
        "Pandas",
        "SQL",
        "Statistics",
      ],
      langues: [
        "Français (Natif)",
        "Anglais (Courant)",
        "Allemand (Intermédiaire)",
      ],
      certifications: [
        "TensorFlow Developer Certificate",
        "AWS Machine Learning Specialty",
      ],
      derniereMiseAJour: "2024-01-22",
      taille: "2.5 MB",
      format: "PDF",
    },
    cvUrl: "/cv/laura-moreau.pdf",
    note: 4.9,
    motsCles: ["data", "science", "machine", "learning", "python"],
  },
  {
    id: 5,
    candidat: {
      nom: "Julien Petit",
      email: "julien.petit@email.com",
      telephone: "+33 6 55 66 77 88",
      avatar: "/avatars/julien.jpg",
      lieu: "Nantes, France",
    },
    cv: {
      titre: "Cybersecurity Specialist",
      experience: "6 ans",
      formation: "Master Cybersécurité - École Supérieure d'Informatique",
      competences: [
        "Penetration Testing",
        "Security Auditing",
        "SIEM",
        "Firewall",
        "Incident Response",
        "Python",
        "Linux",
      ],
      langues: ["Français (Natif)", "Anglais (Courant)"],
      certifications: ["CISSP", "CEH", "OSCP"],
      derniereMiseAJour: "2024-01-19",
      taille: "1.9 MB",
      format: "PDF",
    },
    cvUrl: "/cv/julien-petit.pdf",
    note: 4.6,
    motsCles: ["cybersecurity", "security", "penetration", "audit", "incident"],
  },
  {
    id: 6,
    candidat: {
      nom: "Sophie Bernard",
      email: "sophie.bernard@email.com",
      telephone: "+33 6 99 88 77 66",
      avatar: "/avatars/sophie.jpg",
      lieu: "Bordeaux, France",
    },
    cv: {
      titre: "Digital Marketing Manager",
      experience: "8 ans",
      formation: "Master Marketing Digital - ESCP Business School",
      competences: [
        "SEO/SEM",
        "Google Analytics",
        "Social Media",
        "Content Marketing",
        "Email Marketing",
        "Marketing Automation",
        "Data Analysis",
      ],
      langues: [
        "Français (Natif)",
        "Anglais (Courant)",
        "Italien (Intermédiaire)",
      ],
      certifications: ["Google Ads Certified", "HubSpot Content Marketing"],
      derniereMiseAJour: "2024-01-17",
      taille: "2.0 MB",
      format: "PDF",
    },
    cvUrl: "/cv/sophie-bernard.pdf",
    note: 4.5,
    motsCles: ["marketing", "digital", "seo", "analytics", "content"],
  },
];

export default function RechercheCVPage() {
  const [cvs, setCvs] = useState(mockCVs);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtres, setFiltres] = useState({
    lieu: "all",
    experience: "all",
    formation: "all",
    competences: [] as string[],
    certifications: "all",
    format: "all",
  });
  const [cvsFavoris, setCvsFavoris] = useState<number[]>([]);

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const filteredCVs = cvs.filter((cv) => {
    const matchesSearch =
      cv.candidat.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.cv.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cv.cv.competences.some((comp) =>
        comp.toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      cv.motsCles.some((mot) =>
        mot.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesLieu =
      filtres.lieu === "all" ||
      cv.candidat.lieu.toLowerCase().includes(filtres.lieu.toLowerCase());

    const matchesExperience =
      filtres.experience === "all" ||
      (filtres.experience === "junior" && cv.cv.experience.includes("1-3")) ||
      (filtres.experience === "senior" && cv.cv.experience.includes("4-6")) ||
      (filtres.experience === "expert" && cv.cv.experience.includes("7+"));

    const matchesFormation =
      filtres.formation === "all" ||
      cv.cv.formation.toLowerCase().includes(filtres.formation.toLowerCase());

    const matchesCertifications =
      filtres.certifications === "all" ||
      cv.cv.certifications.some((cert) =>
        cert.toLowerCase().includes(filtres.certifications.toLowerCase())
      );

    const matchesFormat =
      filtres.format === "all" || cv.cv.format === filtres.format;

    return (
      matchesSearch &&
      matchesLieu &&
      matchesExperience &&
      matchesFormation &&
      matchesCertifications &&
      matchesFormat
    );
  });

  const handleToggleFavorite = (id: number) => {
    setCvsFavoris((prev) =>
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
      formation: "all",
      competences: [],
      certifications: "all",
      format: "all",
    });
    setSearchTerm("");
  };

  const competencesUniques = Array.from(
    new Set(cvs.flatMap((cv) => cv.cv.competences))
  );

  const lieuxUniques = Array.from(
    new Set(cvs.map((cv) => cv.candidat.lieu.split(",")[0]))
  );

  const formationsUniques = Array.from(
    new Set(cvs.map((cv) => cv.cv.formation.split(" - ")[1] || cv.cv.formation))
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
                  <IconFileText className="h-6 w-6" />
                  Recherche de CV
                </h1>
                <p className="text-muted-foreground mt-2">
                  Recherchez et analysez les CV des candidats selon vos critères
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
                          placeholder="Rechercher par nom, titre, compétences ou mots-clés..."
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      <label className="text-sm font-medium">Formation</label>
                      <Select
                        value={filtres.formation}
                        onValueChange={(value) =>
                          handleFiltreChange("formation", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les formations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Toutes les formations
                          </SelectItem>
                          {formationsUniques.map((formation) => (
                            <SelectItem key={formation} value={formation}>
                              {formation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Certifications
                      </label>
                      <Select
                        value={filtres.certifications}
                        onValueChange={(value) =>
                          handleFiltreChange("certifications", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les certifications" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Toutes</SelectItem>
                          <SelectItem value="aws">AWS</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="microsoft">Microsoft</SelectItem>
                          <SelectItem value="cisco">Cisco</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Format</label>
                      <Select
                        value={filtres.format}
                        onValueChange={(value) =>
                          handleFiltreChange("format", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les formats" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les formats</SelectItem>
                          <SelectItem value="PDF">PDF</SelectItem>
                          <SelectItem value="DOC">DOC</SelectItem>
                          <SelectItem value="DOCX">DOCX</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Compétences</label>
                      <Select
                        value="all"
                        onValueChange={(value) => {
                          if (value !== "all") {
                            const newCompetences = filtres.competences.includes(
                              value
                            )
                              ? filtres.competences.filter((c) => c !== value)
                              : [...filtres.competences, value];
                            setFiltres((prev) => ({
                              ...prev,
                              competences: newCompetences,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ajouter une compétence" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Ajouter une compétence
                          </SelectItem>
                          {competencesUniques.map((competence) => (
                            <SelectItem key={competence} value={competence}>
                              {competence}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filtres.competences.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {filtres.competences.map((competence) => (
                            <Badge
                              key={competence}
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => {
                                setFiltres((prev) => ({
                                  ...prev,
                                  competences: prev.competences.filter(
                                    (c) => c !== competence
                                  ),
                                }));
                              }}
                            >
                              {competence} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Résultats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {filteredCVs.length} CV trouvé
                    {filteredCVs.length > 1 ? "s" : ""}
                  </h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <IconEye className="h-4 w-4" />
                      Vue grille
                    </Button>
                    <Button variant="outline" size="sm">
                      <IconFileText className="h-4 w-4" />
                      Vue liste
                    </Button>
                  </div>
                </div>

                {filteredCVs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucun CV trouvé
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
                  <div className="space-y-4">
                    {filteredCVs.map((cv) => (
                      <Card
                        key={cv.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage src={cv.candidat.avatar} />
                                <AvatarFallback>
                                  {getInitials(cv.candidat.nom)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-xl">
                                    {cv.candidat.nom}
                                  </CardTitle>
                                  <div className="flex items-center gap-1">
                                    <IconStar className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-medium">
                                      {cv.note}
                                    </span>
                                  </div>
                                </div>
                                <CardDescription className="space-y-2">
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                      <IconBriefcase className="h-4 w-4" />
                                      {cv.cv.titre}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconMapPin className="h-4 w-4" />
                                      {cv.candidat.lieu}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconCalendar className="h-4 w-4" />
                                      {cv.cv.experience}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <span className="flex items-center gap-1">
                                      <IconSchool className="h-4 w-4" />
                                      {cv.cv.formation}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <IconAward className="h-4 w-4" />
                                      {cv.cv.certifications.length}{" "}
                                      certification
                                      {cv.cv.certifications.length > 1
                                        ? "s"
                                        : ""}
                                    </span>
                                    <span className="text-muted-foreground">
                                      Mis à jour: {cv.cv.derniereMiseAJour}
                                    </span>
                                  </div>
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFavorite(cv.id)}
                                className={`${
                                  cvsFavoris.includes(cv.id)
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }`}
                              >
                                <IconStar
                                  className={`h-4 w-4 ${
                                    cvsFavoris.includes(cv.id)
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
                              <h4 className="font-medium mb-2">Compétences</h4>
                              <div className="flex flex-wrap gap-2">
                                {cv.cv.competences.map((competence, index) => (
                                  <Badge key={index} variant="secondary">
                                    {competence}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Langues */}
                            <div>
                              <h4 className="font-medium mb-2">Langues</h4>
                              <div className="flex flex-wrap gap-2">
                                {cv.cv.langues.map((langue, index) => (
                                  <Badge key={index} variant="outline">
                                    {langue}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            {/* Informations du CV */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Taille:
                                </span>
                                <span className="ml-2 font-medium">
                                  {cv.cv.taille}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Format:
                                </span>
                                <span className="ml-2 font-medium">
                                  {cv.cv.format}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">
                                  Contact:
                                </span>
                                <div className="flex gap-2 mt-1">
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={`mailto:${cv.candidat.email}`}>
                                      <IconMail className="h-4 w-4" />
                                    </a>
                                  </Button>
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={`tel:${cv.candidat.telephone}`}>
                                      <IconPhone className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t">
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={cv.cvUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <IconEye className="h-4 w-4" />
                                  Voir CV
                                </a>
                              </Button>
                              <Button variant="outline" size="sm">
                                <IconDownload className="h-4 w-4" />
                                Télécharger
                              </Button>
                              <Button size="sm">
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
