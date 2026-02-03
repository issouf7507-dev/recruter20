"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
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
  IconMail,
  IconPhone,
  IconSchool,
  IconAward,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import {
  useSearchCandidates,
  useCandidatsFacets,
} from "@/lib/hooks/use-candidats";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { useOffers } from "@/lib/hooks/use-offers";
import { toast } from "sonner";

// Listes prédéfinies (importées depuis ProfilSection)
const DOMAINES_PREDEFINIS = [
  { value: "informatique", label: "Informatique" },
  { value: "developpement-logiciel", label: "Développement Logiciel" },
  { value: "developpement-web", label: "Développement Web" },
  { value: "developpement-mobile", label: "Développement Mobile" },
  { value: "cybersecurite", label: "Cybersécurité" },
  { value: "intelligence-artificielle", label: "Intelligence Artificielle" },
  { value: "data-science", label: "Data Science" },
  { value: "big-data", label: "Big Data" },
  { value: "cloud-computing", label: "Cloud Computing" },
  { value: "devops", label: "DevOps" },
  { value: "reseau-telecom", label: "Réseau & Télécommunications" },
  { value: "marketing", label: "Marketing" },
  { value: "marketing-digital", label: "Marketing Digital" },
  { value: "communication", label: "Communication" },
  { value: "publicite", label: "Publicité" },
  { value: "relations-publiques", label: "Relations Publiques" },
  { value: "finance", label: "Finance" },
  { value: "banque", label: "Banque" },
  { value: "assurance", label: "Assurance" },
  { value: "audit", label: "Audit" },
  { value: "gestion-patrimoine", label: "Gestion de Patrimoine" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "controle-gestion", label: "Contrôle de Gestion" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "recrutement", label: "Recrutement" },
  { value: "formation", label: "Formation" },
  { value: "administration", label: "Administration" },
  { value: "administration-publique", label: "Administration Publique" },
  { value: "juridique", label: "Juridique" },
  { value: "droit", label: "Droit" },
  { value: "notariat", label: "Notariat" },
  { value: "vente", label: "Vente" },
  { value: "commerce", label: "Commerce" },
  { value: "e-commerce", label: "E-commerce" },
  { value: "distribution", label: "Distribution" },
  { value: "production", label: "Production" },
  { value: "industrie", label: "Industrie" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "automobile", label: "Automobile" },
  { value: "aerospatial", label: "Aérospatial" },
  { value: "logistique", label: "Logistique" },
  { value: "transport", label: "Transport" },
  { value: "supply-chain", label: "Supply Chain" },
  { value: "technique", label: "Technique" },
  { value: "ingenierie", label: "Ingénierie" },
  { value: "genie-civil", label: "Génie Civil" },
  { value: "genie-mecanique", label: "Génie Mécanique" },
  { value: "genie-electrique", label: "Génie Électrique" },
  { value: "genie-industriel", label: "Génie Industriel" },
  { value: "architecture", label: "Architecture" },
  { value: "construction", label: "Construction" },
  { value: "bâtiment", label: "Bâtiment" },
  { value: "sante", label: "Santé" },
  { value: "medecine", label: "Médecine" },
  { value: "pharmacie", label: "Pharmacie" },
  { value: "soins-infirmiers", label: "Soins Infirmiers" },
  { value: "paramedical", label: "Paramédical" },
  { value: "biotechnologie", label: "Biotechnologie" },
  { value: "education", label: "Éducation" },
  { value: "enseignement", label: "Enseignement" },
  { value: "recherche", label: "Recherche" },
  { value: "hotellerie-restauration", label: "Hôtellerie & Restauration" },
  { value: "tourisme", label: "Tourisme" },
  { value: "evenementiel", label: "Événementiel" },
  { value: "culture", label: "Culture" },
  { value: "art", label: "Art" },
  { value: "design", label: "Design" },
  { value: "graphisme", label: "Graphisme" },
  { value: "audiovisuel", label: "Audiovisuel" },
  { value: "multimedia", label: "Multimédia" },
  { value: "journalisme", label: "Journalisme" },
  { value: "edition", label: "Édition" },
  { value: "agriculture", label: "Agriculture" },
  { value: "agroalimentaire", label: "Agroalimentaire" },
  { value: "environnement", label: "Environnement" },
  { value: "developpement-durable", label: "Développement Durable" },
  { value: "energie", label: "Énergie" },
  { value: "petrole-gaz", label: "Pétrole & Gaz" },
  { value: "renouvelable", label: "Énergies Renouvelables" },
  { value: "immobilier", label: "Immobilier" },
  { value: "consulting", label: "Consulting" },
  { value: "conseil", label: "Conseil" },
  { value: "qualite", label: "Qualité" },
  { value: "maintenance", label: "Maintenance" },
  { value: "securite", label: "Sécurité" },
  { value: "sport", label: "Sport" },
  { value: "fitness", label: "Fitness" },
  { value: "mode", label: "Mode" },
  { value: "luxe", label: "Luxe" },
  { value: "cosmetique", label: "Cosmétique" },
  { value: "beaute", label: "Beauté" },
  { value: "social", label: "Social" },
  { value: "humanitaire", label: "Humanitaire" },
  { value: "associatif", label: "Associatif" },
  { value: "non-lucratif", label: "Non Lucratif" },
  { value: "autre", label: "Autre" },
];

const NIVEAUX_ETUDE_PREDEFINIS = [
  { value: "sans-diplome", label: "Sans diplôme" },
  { value: "cep", label: "CEP (Certificat d'Études Primaires)" },
  { value: "becp", label: "BEPC (Brevet d'Études du Premier Cycle)" },
  { value: "cap", label: "CAP (Certificat d'Aptitude Professionnelle)" },
  { value: "bep", label: "BEP (Brevet d'Études Professionnelles)" },
  { value: "baccalaureat", label: "Baccalauréat Général" },
  { value: "baccalaureat-technologique", label: "Baccalauréat Technologique" },
  { value: "baccalaureat-professionnel", label: "Baccalauréat Professionnel" },
  { value: "bts", label: "BTS (Brevet de Technicien Supérieur)" },
  { value: "dut", label: "DUT (Diplôme Universitaire de Technologie)" },
  {
    value: "deust",
    label:
      "DEUST (Diplôme d'Études Universitaires Scientifiques et Techniques)",
  },
  { value: "licence", label: "Licence" },
  { value: "licence-professionnelle", label: "Licence Professionnelle" },
  { value: "master-1", label: "Master 1 (Maîtrise)" },
  { value: "master-2", label: "Master 2" },
  { value: "master-professionnel", label: "Master Professionnel" },
  { value: "master-recherche", label: "Master de Recherche" },
  { value: "mba", label: "MBA (Master of Business Administration)" },
  { value: "doctorat", label: "Doctorat" },
  { value: "ingenieur", label: "Ingénieur" },
  { value: "grande-ecole", label: "Grande École" },
  { value: "autre", label: "Autre" },
];

// Helper function to calculate total years of experience
function calculateTotalExperience(experiences: any[]): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;
  const now = new Date();

  for (const exp of experiences) {
    const start = new Date(exp.dateDebut);
    const end = exp.dateFin ? new Date(exp.dateFin) : now;

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());

    totalMonths += months;
  }

  return Math.floor(totalMonths / 12);
}

// Helper function to format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Transform API data to page format
function transformCandidatData(candidat: any) {
  const totalYears = calculateTotalExperience(candidat.experiences || []);
  const latestExperience = candidat.experiences?.[0];
  const latestFormation = candidat.formations?.[0];
  const cvDocument = candidat.documents?.[0];

  return {
    id: candidat.id,
    candidat: {
      nom:
        `${candidat.prenom || ""} ${candidat.nom || ""}`.trim() ||
        candidat.user?.name ||
        "Candidat",
      email: candidat.user?.email || "",
      telephone: candidat.telephone || "",
      avatar: candidat.image || candidat.user?.image || "",
      lieu: candidat.ville
        ? `${candidat.ville}${candidat.pays ? `, ${candidat.pays}` : ""}`
        : candidat.pays || "Non spécifié",
      domaine: candidat.domaine || "Non spécifié",
    },
    cv: {
      titre: latestExperience?.poste || "Candidat",
      experience: totalYears > 0 ? `${totalYears} ans` : "Débutant",
      formation: latestFormation
        ? `${latestFormation.diplome} - ${latestFormation.etablissement}`
        : "Non spécifié",
      competences:
        candidat.candidatCompetences?.map((c: any) => c.competence) || [],
      langues: ["Français (Natif)"], // TODO: Add languages to schema if needed
      certifications: candidat.certifications?.map((c: any) => c.nom) || [],
      niveauxEtude: candidat.niveauEtude?.map((n: any) => n.nom) || [],
      // derniereMiseAJour: cvDocument
      //   ? new Date(cvDocument.updatedAt)
      //   : new Date(candidat.updatedAt).toISOString().split("T")[0],
      taille: cvDocument ? formatFileSize(cvDocument.fileSize) : "N/A",
      format: cvDocument?.fileType || "PDF",
    },
    cvUrl: cvDocument?.fileUrl || candidat.cv || "#",
    note: 4.5, // TODO: Calculate rating if available
    motsCles: [
      ...(candidat.candidatCompetences?.map((c: any) =>
        c.competence.toLowerCase()
      ) || []),
      ...(latestExperience?.poste?.toLowerCase().split(" ") || []),
    ],
  };
}

export default function RechercheCVPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  const [searchTerm, setSearchTerm] = useState("");
  const [filtres, setFiltres] = useState({
    lieu: "all",
    experience: "all",
    competences: [] as string[],
    certifications: [] as string[],
    domaine: "all",
    niveauEtude: [] as string[],
    format: "all",
  });
  const [cvsFavoris, setCvsFavoris] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Facets = distinct values from ALL candidates (for filter dropdowns)
  const { data: facetsData } = useCandidatsFacets();
  const facets = facetsData ?? {
    lieux: [],
    competences: [],
    certifications: [],
  };

  // Use the search hook (searches across ALL data server-side)
  const { data, isLoading, error } = useSearchCandidates({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm || undefined,
    lieu: filtres.lieu !== "all" ? filtres.lieu : undefined,
    experience: filtres.experience !== "all" ? filtres.experience : undefined,
    competences:
      filtres.competences.length > 0 ? filtres.competences : undefined,
    certifications:
      filtres.certifications.length > 0 ? filtres.certifications : undefined,
    domaine: filtres.domaine !== "all" ? filtres.domaine : undefined,
    niveauEtude:
      filtres.niveauEtude.length > 0 ? filtres.niveauEtude : undefined,
    format: filtres.format !== "all" ? filtres.format : undefined,
  });

  // Get offers for the recruiter (to use for creating conversations)
  const { data: offersData } = useOffers(
    {
      recruteurId: recruteurId || undefined,
      limit: 1,
    },
    {
      enabled: !!recruteurId,
    }
  );

  // Get conversation creation hook
  const { createConversation } = useCandidatures(recruteurId || undefined);

  // Get pagination info
  const pagination = data?.pagination;

  // Transform API data to page format
  const cvs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(transformCandidatData);
  }, [data]);

  // Réinitialiser la page à 1 quand les filtres changent
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    filtres.lieu,
    filtres.experience,
    filtres.competences,
    filtres.certifications,
    filtres.domaine,
    filtres.niveauEtude,
    filtres.format,
  ]);

  // Handlers de pagination
  const handleNextPage = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, pagination]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleFirstPage = useCallback(() => {
    setCurrentPage(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleLastPage = useCallback(() => {
    if (pagination?.totalPages) {
      setCurrentPage(pagination.totalPages);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination?.totalPages]);

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleToggleFavorite = (id: string) => {
    setCvsFavoris((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const handleDownloadCV = async (cvUrl: string, candidatName: string) => {
    if (!cvUrl || cvUrl === "#") {
      toast.error("Le CV n'est pas disponible pour téléchargement");
      return;
    }

    try {
      // Fetch the file
      const response = await fetch(cvUrl);
      if (!response.ok) {
        throw new Error("Erreur lors du téléchargement du CV");
      }

      // Get the blob
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Get file extension from URL or default to pdf
      const urlExtension = cvUrl.split(".").pop()?.toLowerCase();
      const extension =
        urlExtension && ["pdf", "doc", "docx"].includes(urlExtension)
          ? urlExtension
          : "pdf";

      // Set filename
      const sanitizedName = candidatName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      link.download = `CV_${sanitizedName}.${extension}`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CV téléchargé avec succès");
    } catch (error) {
      console.error("Error downloading CV:", error);
      toast.error("Erreur lors du téléchargement du CV");
    }
  };

  const handleContactCandidat = (candidatId: string) => {
    if (!recruteurId) {
      toast.error("Erreur: Recruteur non trouvé");
      return;
    }

    // Get first available offer or redirect to messaging
    const firstOffer = offersData?.items?.[0];

    if (!firstOffer) {
      // No offers available, redirect to messaging page
      toast.info(
        "Veuillez créer une offre d'emploi avant de contacter un candidat"
      );
      router.push("/recruteur/offres");
      return;
    }

    // Create conversation with the first available offer
    createConversation.mutate({
      candidatId,
      jobOfferId: firstOffer.id,
      recruteurId: recruteurId,
    });
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
      competences: [],
      certifications: [],
      domaine: "all",
      niveauEtude: [],
      format: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Use facets from API (all candidates) for filter options
  const competencesUniques = facets.competences;
  const lieuxUniques = facets.lieux;
  const certificationsUniques = facets.certifications;

  return (
    <>
      <SiteHeader title="Recherche de cv" />
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
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {/* Domaine */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Domaine</label>
                      <Select
                        value={filtres.domaine}
                        onValueChange={(value) =>
                          handleFiltreChange("domaine", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tous les domaines" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les domaines</SelectItem>
                          {DOMAINES_PREDEFINIS.map((domaine) => (
                            <SelectItem
                              key={domaine.value}
                              value={domaine.value}
                            >
                              {domaine.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lieu */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lieu</label>
                      <Select
                        value={filtres.lieu}
                        onValueChange={(value) =>
                          handleFiltreChange("lieu", value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Tous les lieux" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les lieux</SelectItem>
                          {lieuxUniques.map((lieu: string) => (
                            <SelectItem key={lieu} value={lieu}>
                              {lieu}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Compétences */}
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
                        <SelectTrigger className="w-full">
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

                    {/* Certifications */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Certifications
                      </label>
                      <Select
                        value="all"
                        onValueChange={(value) => {
                          if (value !== "all") {
                            const newCertifications =
                              filtres.certifications.includes(value)
                                ? filtres.certifications.filter(
                                    (c) => c !== value
                                  )
                                : [...filtres.certifications, value];
                            setFiltres((prev) => ({
                              ...prev,
                              certifications: newCertifications,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ajouter une certification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Ajouter une certification
                          </SelectItem>
                          {certificationsUniques.map((certification: string) => (
                            <SelectItem
                              key={certification}
                              value={certification}
                            >
                              {certification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filtres.certifications.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {filtres.certifications.map((certification) => (
                            <Badge
                              key={certification}
                              variant="secondary"
                              className="text-xs cursor-pointer"
                              onClick={() => {
                                setFiltres((prev) => ({
                                  ...prev,
                                  certifications: prev.certifications.filter(
                                    (c) => c !== certification
                                  ),
                                }));
                              }}
                            >
                              {certification} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Niveau d'étude */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Niveau d'étude
                      </label>
                      <Select
                        value="all"
                        onValueChange={(value) => {
                          if (value !== "all") {
                            const newNiveauxEtude =
                              filtres.niveauEtude.includes(value)
                                ? filtres.niveauEtude.filter((n) => n !== value)
                                : [...filtres.niveauEtude, value];
                            setFiltres((prev) => ({
                              ...prev,
                              niveauEtude: newNiveauxEtude,
                            }));
                          }
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ajouter un niveau d'étude" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Ajouter un niveau d'étude
                          </SelectItem>
                          {NIVEAUX_ETUDE_PREDEFINIS.map((niveau) => (
                            <SelectItem key={niveau.value} value={niveau.value}>
                              {niveau.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {filtres.niveauEtude.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {filtres.niveauEtude.map((niveau) => {
                            const niveauLabel =
                              NIVEAUX_ETUDE_PREDEFINIS.find(
                                (n) => n.value === niveau
                              )?.label || niveau;
                            return (
                              <Badge
                                key={niveau}
                                variant="secondary"
                                className="text-xs cursor-pointer"
                                onClick={() => {
                                  setFiltres((prev) => ({
                                    ...prev,
                                    niveauEtude: prev.niveauEtude.filter(
                                      (n) => n !== niveau
                                    ),
                                  }));
                                }}
                              >
                                {niveauLabel} ×
                              </Badge>
                            );
                          })}
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
                    {isLoading ? (
                      "Chargement..."
                    ) : error ? (
                      "Erreur lors du chargement"
                    ) : (
                      <>
                        {cvs.length} CV trouvé
                        {cvs.length > 1 ? "s" : ""}
                      </>
                    )}
                  </h2>
                </div>

                {isLoading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">
                        Chargement des CV...
                      </p>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconFileText className="h-12 w-12 text-destructive mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Erreur de chargement
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Une erreur est survenue lors du chargement des CV.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.location.reload()}
                      >
                        Réessayer
                      </Button>
                    </CardContent>
                  </Card>
                ) : cvs.length === 0 ? (
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
                  <>
                    <div className="space-y-4">
                      {cvs.map((cv) => (
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
                                  </div>
                                  <CardDescription className="space-y-2">
                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                      <span className="flex items-center gap-1">
                                        <IconMapPin className="h-4 w-4" />
                                        {cv.candidat.lieu}
                                      </span>

                                      <span className="flex items-center gap-1">
                                        <IconBriefcase className="h-4 w-4" />
                                        {cv.candidat.domaine}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm flex-wrap">
                                      {/* <span className="flex items-center gap-1">
                                        <IconSchool className="h-4 w-4" />
                                        {cv.cv.formation}
                                      </span> */}
                                      {cv.cv.niveauxEtude.length > 0 && (
                                        <span className="flex items-center gap-1 uppercase">
                                          <IconSchool className="h-4 w-4" />
                                          {cv.cv.niveauxEtude.join(", ")}
                                        </span>
                                      )}
                                      {cv.cv.certifications.length > 0 && (
                                        <span className="flex items-center gap-1">
                                          <IconAward className="h-4 w-4" />
                                          {cv.cv.certifications.length}{" "}
                                          certification
                                          {cv.cv.certifications.length > 1
                                            ? "s"
                                            : ""}
                                        </span>
                                      )}
                                      {/* <span className="text-muted-foreground">
                                        Mis à jour: {cv.cv.derniereMiseAJour}
                                      </span> */}
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
                                <h4 className="font-medium mb-2">
                                  Compétences
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {cv.cv.competences.map(
                                    (competence: string, index: number) => (
                                      <Badge key={index} variant="secondary">
                                        {competence}
                                      </Badge>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Niveaux d'étude */}
                              {cv.cv.niveauxEtude.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Niveaux d'étude
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {cv.cv.niveauxEtude.map(
                                      (niveau: string, index: number) => (
                                        <Badge key={index} variant="outline">
                                          <IconSchool className="h-3 w-3 mr-1" />
                                          {niveau}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Certifications */}
                              {cv.cv.certifications.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">
                                    Certifications
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {cv.cv.certifications.map(
                                      (
                                        certification: string,
                                        index: number
                                      ) => (
                                        <Badge key={index} variant="outline">
                                          <IconAward className="h-3 w-3 mr-1" />
                                          {certification}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

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
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDownloadCV(cv.cvUrl, cv.candidat.nom)
                                  }
                                  disabled={!cv.cvUrl || cv.cvUrl === "#"}
                                >
                                  <IconDownload className="h-4 w-4" />
                                  Télécharger
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleContactCandidat(cv.id)}
                                  disabled={createConversation.isPending}
                                >
                                  <IconMail className="h-4 w-4" />
                                  {createConversation.isPending
                                    ? "En cours..."
                                    : "Contacter"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <Card className="mt-6">
                        <CardContent className="p-4">
                          {/* Mobile pagination */}
                          <div className="flex sm:hidden flex-col gap-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">
                                {cvs.length} résultat
                                {cvs.length > 1 ? "s" : ""} sur{" "}
                                {pagination.total}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Par page
                                </span>
                                <Select
                                  value={itemsPerPage.toString()}
                                  onValueChange={(value) => {
                                    setItemsPerPage(parseInt(value));
                                    setCurrentPage(1);
                                  }}
                                >
                                  <SelectTrigger className="w-[60px] h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="flex-1"
                              >
                                <IconChevronLeft className="h-4 w-4 mr-1" />
                                Préc.
                              </Button>
                              <span className="px-3 py-1 text-sm font-medium bg-primary text-primary-foreground rounded">
                                {pagination.page}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={
                                  currentPage === pagination.totalPages ||
                                  !pagination.totalPages
                                }
                                className="flex-1"
                              >
                                Suiv.
                                <IconChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>

                          {/* Desktop pagination */}
                          <div className="hidden sm:flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                Afficher
                              </span>
                              <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                  setItemsPerPage(parseInt(value));
                                  setCurrentPage(1);
                                }}
                              >
                                <SelectTrigger className="w-[70px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="10">10</SelectItem>
                                  <SelectItem value="20">20</SelectItem>
                                  <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                              </Select>
                              <span className="text-sm text-muted-foreground">
                                par page
                              </span>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap justify-center">
                              <span className="text-sm text-muted-foreground">
                                Page {pagination.page} sur{" "}
                                {pagination.totalPages} ({pagination.total}{" "}
                                résultat{pagination.total > 1 ? "s" : ""})
                              </span>
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleFirstPage}
                                  disabled={currentPage === 1}
                                  className="hidden md:flex"
                                >
                                  <IconChevronLeft className="h-4 w-4 mr-1" />
                                  Première
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handlePreviousPage}
                                  disabled={currentPage === 1}
                                >
                                  <IconChevronLeft className="h-4 w-4" />
                                </Button>

                                <span className="px-3 sm:px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded">
                                  {pagination.page}
                                </span>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleNextPage}
                                  disabled={
                                    currentPage === pagination.totalPages ||
                                    !pagination.totalPages
                                  }
                                >
                                  <IconChevronRight className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleLastPage}
                                  disabled={
                                    currentPage === pagination.totalPages ||
                                    !pagination.totalPages
                                  }
                                  className="hidden md:flex"
                                >
                                  Dernière
                                  <IconChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
