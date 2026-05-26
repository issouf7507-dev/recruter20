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
  IconSchool,
  IconAward,
  IconChevronLeft,
  IconChevronRight,
  IconLoader2,
} from "@tabler/icons-react";
import Link from "next/link";
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

// ─── Données statiques ────────────────────────────────────────────────────────

const DOMAINES = [
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
  { value: "finance", label: "Finance" },
  { value: "banque", label: "Banque" },
  { value: "assurance", label: "Assurance" },
  { value: "audit", label: "Audit" },
  { value: "comptabilite", label: "Comptabilité" },
  { value: "rh", label: "Ressources Humaines" },
  { value: "recrutement", label: "Recrutement" },
  { value: "administration", label: "Administration" },
  { value: "juridique", label: "Juridique" },
  { value: "vente", label: "Vente" },
  { value: "commerce", label: "Commerce" },
  { value: "logistique", label: "Logistique" },
  { value: "transport", label: "Transport" },
  { value: "ingenierie", label: "Ingénierie" },
  { value: "genie-civil", label: "Génie Civil" },
  { value: "architecture", label: "Architecture" },
  { value: "sante", label: "Santé" },
  { value: "medecine", label: "Médecine" },
  { value: "pharmacie", label: "Pharmacie" },
  { value: "education", label: "Éducation" },
  { value: "design", label: "Design" },
  { value: "graphisme", label: "Graphisme" },
  { value: "agriculture", label: "Agriculture" },
  { value: "energie", label: "Énergie" },
  { value: "consulting", label: "Consulting" },
  { value: "immobilier", label: "Immobilier" },
  { value: "autre", label: "Autre" },
];

const NIVEAUX_ETUDE = [
  { value: "sans-diplome", label: "Sans diplôme" },
  { value: "cep", label: "CEP" },
  { value: "becp", label: "BEPC" },
  { value: "cap", label: "CAP" },
  { value: "bep", label: "BEP" },
  { value: "baccalaureat", label: "Baccalauréat" },
  { value: "bts", label: "BTS" },
  { value: "dut", label: "DUT" },
  { value: "licence", label: "Licence" },
  { value: "licence-professionnelle", label: "Licence Pro" },
  { value: "master-1", label: "Master 1" },
  { value: "master-2", label: "Master 2" },
  { value: "mba", label: "MBA" },
  { value: "doctorat", label: "Doctorat" },
  { value: "ingenieur", label: "Ingénieur" },
  { value: "grande-ecole", label: "Grande École" },
  { value: "autre", label: "Autre" },
];

const EXPERIENCE_OPTIONS = [
  { value: "all", label: "Toute expérience" },
  { value: "junior", label: "Junior (0–3 ans)" },
  { value: "senior", label: "Senior (4–7 ans)" },
  { value: "expert", label: "Expert (7+ ans)" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calculateTotalExperience(
  experiences: { dateDebut: string; dateFin?: string | null }[]
): number {
  if (!experiences?.length) return 0;
  const now = new Date();
  let totalMonths = 0;
  for (const exp of experiences) {
    const start = new Date(exp.dateDebut);
    const end = exp.dateFin ? new Date(exp.dateFin) : now;
    if (isNaN(start.getTime())) continue;
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    if (months > 0) totalMonths += months;
  }
  return Math.floor(totalMonths / 12);
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "N/A";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

function transformCandidatData(c: {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  telephone?: string | null;
  image?: string | null;
  ville?: string | null;
  pays?: string;
  domaine?: string | null;
  cv?: string | null;
  experiences?: { dateDebut: string; dateFin?: string | null; poste: string; entreprise: string }[];
  formations?: { diplome: string; etablissement: string }[];
  documents?: { fileUrl: string; fileSize: number; fileType: string; documentType: string }[];
  candidatCompetences?: { competence: string }[];
  certifications?: { nom: string }[];
  niveauEtude?: { nom: string }[];
  user?: { email?: string | null; name?: string | null; image?: string | null };
}) {
  const totalYears = calculateTotalExperience(c.experiences || []);
  const latestFormation = c.formations?.[0];
  const cvDocument = c.documents?.[0];
  return {
    id: c.id,
    candidat: {
      nom:
        `${c.prenom || ""} ${c.nom || ""}`.trim() ||
        c.user?.name ||
        "Candidat",
      email: c.user?.email || "",
      telephone: c.telephone || "",
      avatar: c.image || c.user?.image || "",
      lieu: c.ville
        ? `${c.ville}${c.pays ? `, ${c.pays}` : ""}`
        : c.pays || "—",
      domaine: c.domaine || "—",
    },
    cv: {
      titre: c.experiences?.[0]?.poste || "Candidat",
      experience:
        totalYears > 0 ? `${totalYears} an${totalYears > 1 ? "s" : ""}` : "Débutant",
      formation: latestFormation
        ? `${latestFormation.diplome} · ${latestFormation.etablissement}`
        : "—",
      competences: c.candidatCompetences?.map((x) => x.competence) || [],
      certifications: c.certifications?.map((x) => x.nom) || [],
      niveauxEtude: c.niveauEtude?.map((x) => x.nom) || [],
      taille: cvDocument ? formatFileSize(cvDocument.fileSize) : "—",
    },
    cvUrl: cvDocument?.fileUrl || c.cv || null,
  };
}

// ─── useDebounce ─────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── MultiSelect avec input texte ────────────────────────────────────────────

function MultiSelect({
  label,
  options,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
}) {
  const [inputValue, setInputValue] = useState("");
  const filtered = options.filter(
    (o) =>
      o.toLowerCase().includes(inputValue.toLowerCase()) && !value.includes(o)
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="relative">
        <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          className="pl-8 h-9 text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      {inputValue && filtered.length > 0 && (
        <div className="border rounded-md bg-popover shadow-sm max-h-36 overflow-y-auto">
          {filtered.slice(0, 8).map((opt) => (
            <button
              key={opt}
              type="button"
              className="w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors"
              onClick={() => {
                onChange([...value, opt]);
                setInputValue("");
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <Badge
              key={v}
              variant="secondary"
              className="text-xs cursor-pointer gap-1"
              onClick={() => onChange(value.filter((x) => x !== v))}
            >
              {v} <IconX className="h-2.5 w-2.5" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function RechercheCVPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 450);

  const [filtres, setFiltres] = useState({
    lieu: "all",
    experience: "all",
    competences: [] as string[],
    certifications: [] as string[],
    domaine: "all",
    niveauEtude: [] as string[],
  });
  const [cvsFavoris, setCvsFavoris] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(true);

  const { data: facetsData } = useCandidatsFacets();
  const facets = facetsData ?? { lieux: [], competences: [], certifications: [] };

  const { data, isLoading, isFetching, error } = useSearchCandidates({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearch || undefined,
    lieu: filtres.lieu !== "all" ? filtres.lieu : undefined,
    experience: filtres.experience !== "all" ? filtres.experience : undefined,
    competences: filtres.competences.length > 0 ? filtres.competences : undefined,
    certifications:
      filtres.certifications.length > 0 ? filtres.certifications : undefined,
    domaine: filtres.domaine !== "all" ? filtres.domaine : undefined,
    niveauEtude: filtres.niveauEtude.length > 0 ? filtres.niveauEtude : undefined,
  });

  const pagination = data?.pagination;

  const cvs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.map(transformCandidatData);
  }, [data]);

  // Offres pour créer une conversation
  const { data: offersData } = useOffers(
    { recruteurId: recruteurId || undefined, limit: 1 },
    { enabled: !!recruteurId }
  );
  const { createConversation } = useCandidatures(recruteurId || undefined);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filtres]);

  const activeFiltersCount = [
    filtres.lieu !== "all",
    filtres.experience !== "all",
    filtres.competences.length > 0,
    filtres.certifications.length > 0,
    filtres.domaine !== "all",
    filtres.niveauEtude.length > 0,
  ].filter(Boolean).length;

  const clearFiltres = () => {
    setFiltres({
      lieu: "all",
      experience: "all",
      competences: [],
      certifications: [],
      domaine: "all",
      niveauEtude: [],
    });
    setSearchInput("");
    setCurrentPage(1);
  };

  const handleNextPage = useCallback(() => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage, pagination]);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  const handleLastPage = useCallback(() => {
    if (pagination?.totalPages) {
      setCurrentPage(pagination.totalPages);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pagination?.totalPages]);

  const getInitials = (nom: string) =>
    nom
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  const handleDownloadCV = async (cvUrl: string, nom: string) => {
    if (!cvUrl) {
      toast.error("CV non disponible");
      return;
    }
    try {
      const res = await fetch(cvUrl);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext =
        cvUrl.split(".").pop()?.match(/pdf|docx?/i)?.[0] || "pdf";
      a.download = `CV_${nom.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("CV téléchargé");
    } catch {
      toast.error("Erreur de téléchargement");
    }
  };

  const handleContactCandidat = (candidatId: string) => {
    if (!recruteurId) {
      toast.error("Recruteur non trouvé");
      return;
    }
    const offer = offersData?.items?.[0];
    if (!offer) {
      toast.info("Créez d'abord une offre avant de contacter un candidat");
      router.push("/recruteur/offres");
      return;
    }
    createConversation.mutate({ candidatId, jobOfferId: offer.id, recruteurId });
  };

  return (
    <>
      <SiteHeader title="Recherche de CV" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-5 md:py-6 px-4 lg:px-6">

          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <IconFileText className="h-6 w-6" /> Recherche de CV
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Trouvez les meilleurs profils parmi les candidats inscrits.
            </p>
          </div>

          {/* Raccourci vers le Matching IA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3 flex items-center gap-3">
              <span className="text-primary text-lg shrink-0">🤖</span>
              <p className="text-sm flex-1">
                Voulez-vous analyser la compatibilité de ces candidats avec une offre ?
              </p>
              <Link href="/recruteur/matching-ai">
                <Button size="sm" variant="outline" className="shrink-0">
                  Matching IA →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Barre de recherche */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {isFetching && (
                    <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                  <Input
                    placeholder="Nom, compétence, poste, entreprise..."
                    className="pl-10 pr-10"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setShowFilters((s) => !s)}
                    className="relative"
                  >
                    <IconFilter className="h-4 w-4 mr-1.5" />
                    Filtres
                    {activeFiltersCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                  {(searchInput || activeFiltersCount > 0) && (
                    <Button variant="ghost" size="icon" onClick={clearFiltres} title="Effacer">
                      <IconX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtres avancés */}
          {showFilters && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconFilter className="h-4 w-4" /> Filtres avancés
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeFiltersCount} actif{activeFiltersCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                  {/* Domaine */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domaine</label>
                    <Select
                      value={filtres.domaine}
                      onValueChange={(v) => setFiltres((p) => ({ ...p, domaine: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous les domaines" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les domaines</SelectItem>
                        {DOMAINES.map((d) => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lieu */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Localisation</label>
                    <Select
                      value={filtres.lieu}
                      onValueChange={(v) => setFiltres((p) => ({ ...p, lieu: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tous les lieux" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les lieux</SelectItem>
                        {facets.lieux.map((l: string) => (
                          <SelectItem key={l} value={l}>{l}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Expérience ← était absent */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Expérience</label>
                    <Select
                      value={filtres.experience}
                      onValueChange={(v) => setFiltres((p) => ({ ...p, experience: v }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Toute expérience" />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPERIENCE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Niveau d'étude */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Niveau d&apos;étude</label>
                    <Select
                      value=""
                      onValueChange={(v) => {
                        if (!filtres.niveauEtude.includes(v)) {
                          setFiltres((p) => ({ ...p, niveauEtude: [...p.niveauEtude, v] }));
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            filtres.niveauEtude.length > 0
                              ? `${filtres.niveauEtude.length} sélectionné(s)`
                              : "Choisir un niveau"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {NIVEAUX_ETUDE.filter(
                          (n) => !filtres.niveauEtude.includes(n.value)
                        ).map((n) => (
                          <SelectItem key={n.value} value={n.value}>{n.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {filtres.niveauEtude.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {filtres.niveauEtude.map((v) => {
                          const label = NIVEAUX_ETUDE.find((n) => n.value === v)?.label || v;
                          return (
                            <Badge
                              key={v}
                              variant="secondary"
                              className="text-xs cursor-pointer gap-1"
                              onClick={() =>
                                setFiltres((p) => ({
                                  ...p,
                                  niveauEtude: p.niveauEtude.filter((x) => x !== v),
                                }))
                              }
                            >
                              {label} <IconX className="h-2.5 w-2.5" />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Compétences — recherche textuelle */}
                  <div className="sm:col-span-2">
                    <MultiSelect
                      label="Compétences"
                      options={facets.competences}
                      value={filtres.competences}
                      onChange={(v) => setFiltres((p) => ({ ...p, competences: v }))}
                      placeholder="Rechercher une compétence..."
                    />
                  </div>

                  {/* Certifications */}
                  <div className="sm:col-span-2">
                    <MultiSelect
                      label="Certifications"
                      options={facets.certifications}
                      value={filtres.certifications}
                      onChange={(v) => setFiltres((p) => ({ ...p, certifications: v }))}
                      placeholder="Rechercher une certification..."
                    />
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFiltres}
                      className="text-muted-foreground"
                    >
                      <IconX className="h-3.5 w-3.5 mr-1" /> Réinitialiser tous les filtres
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Barre résultats + items par page */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold">
                {isLoading ? (
                  "Chargement..."
                ) : error ? (
                  "Erreur"
                ) : (
                  <>
                    <span className="text-primary font-bold">{pagination?.total ?? 0}</span>
                    {" "}candidat{(pagination?.total ?? 0) > 1 ? "s" : ""} trouvé
                    {(pagination?.total ?? 0) > 1 ? "s" : ""}
                    {pagination && pagination.totalPages > 1 && (
                      <span className="text-muted-foreground font-normal text-sm ml-1.5">
                        · page {currentPage}/{pagination.totalPages}
                      </span>
                    )}
                  </>
                )}
              </h2>
              {isFetching && !isLoading && (
                <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Afficher</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => {
                  setItemsPerPage(parseInt(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <span className="hidden sm:inline">par page</span>
            </div>
          </div>

          {/* États */}
          {isLoading ? (
            // Skeletons
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-muted shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-2/5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      {[80, 100, 70].map((w, j) => (
                        <div key={j} className="h-5 bg-muted rounded-full" style={{ width: w }} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-8 text-center">
                <IconFileText className="h-12 w-12 text-destructive mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Erreur de chargement</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Une erreur est survenue lors de la récupération des candidats.
                </p>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Réessayer
                </Button>
              </CardContent>
            </Card>
          ) : cvs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <IconFileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Aucun candidat trouvé</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeFiltersCount > 0 || debouncedSearch
                    ? "Essayez d'élargir vos critères de recherche."
                    : "Aucun candidat n'est encore inscrit sur la plateforme."}
                </p>
                {(activeFiltersCount > 0 || debouncedSearch) && (
                  <Button variant="outline" onClick={clearFiltres}>
                    Effacer les filtres
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-3">
                {cvs.map((cv) => (
                  <Card key={cv.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 min-w-0">
                          <Avatar className="h-14 w-14 shrink-0">
                            <AvatarImage src={cv.candidat.avatar} />
                            <AvatarFallback className="text-sm font-semibold">
                              {getInitials(cv.candidat.nom)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <CardTitle className="text-lg leading-snug">
                                {cv.candidat.nom}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs shrink-0">
                                <IconCalendar className="h-3 w-3 mr-1" />
                                {cv.cv.experience}
                              </Badge>
                            </div>
                            <CardDescription>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                                {cv.candidat.lieu !== "—" && (
                                  <span className="flex items-center gap-1">
                                    <IconMapPin className="h-3.5 w-3.5 shrink-0" />
                                    {cv.candidat.lieu}
                                  </span>
                                )}
                                {cv.candidat.domaine !== "—" && (
                                  <span className="flex items-center gap-1">
                                    <IconBriefcase className="h-3.5 w-3.5 shrink-0" />
                                    {cv.candidat.domaine}
                                  </span>
                                )}
                                {cv.cv.niveauxEtude.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <IconSchool className="h-3.5 w-3.5 shrink-0" />
                                    {cv.cv.niveauxEtude.join(", ")}
                                  </span>
                                )}
                                {cv.cv.certifications.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <IconAward className="h-3.5 w-3.5 shrink-0" />
                                    {cv.cv.certifications.length} certification
                                    {cv.cv.certifications.length > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCvsFavoris((prev) =>
                              prev.includes(cv.id)
                                ? prev.filter((x) => x !== cv.id)
                                : [...prev, cv.id]
                            );
                          }}
                          className={
                            cvsFavoris.includes(cv.id)
                              ? "text-yellow-500"
                              : "text-muted-foreground"
                          }
                        >
                          <IconStar
                            className={`h-4 w-4 ${cvsFavoris.includes(cv.id) ? "fill-current" : ""}`}
                          />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0 space-y-3">
                      {/* Compétences */}
                      {cv.cv.competences.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                            Compétences
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.cv.competences.slice(0, 12).map((c: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                            {cv.cv.competences.length > 12 && (
                              <Badge variant="outline" className="text-xs">
                                +{cv.cv.competences.length - 12}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Certifications */}
                      {cv.cv.certifications.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                            Certifications
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {cv.cv.certifications.map((c: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <IconAward className="h-3 w-3 mr-1" />
                                {c}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {cv.cvUrl ? (
                          <>
                            <Button variant="outline" size="sm" asChild>
                              <a href={cv.cvUrl} target="_blank" rel="noopener noreferrer">
                                <IconEye className="h-4 w-4 mr-1" /> Voir CV
                              </a>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCV(cv.cvUrl!, cv.candidat.nom)}
                            >
                              <IconDownload className="h-4 w-4 mr-1" /> Télécharger
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            <IconFileText className="h-4 w-4 mr-1" /> Pas de CV
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleContactCandidat(cv.id)}
                          disabled={createConversation.isPending}
                        >
                          <IconMail className="h-4 w-4 mr-1" />
                          {createConversation.isPending ? "En cours..." : "Contacter"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentPage(1);
                      window.scrollTo({ top: 0 });
                    }}
                    disabled={currentPage === 1}
                    title="Première page"
                  >
                    <IconChevronLeft className="h-4 w-4" />
                    <IconChevronLeft className="h-4 w-4 -ml-2.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-1.5 text-sm font-medium bg-primary text-primary-foreground rounded min-w-[80px] text-center">
                    {currentPage} / {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLastPage}
                    disabled={currentPage === pagination.totalPages}
                    title="Dernière page"
                  >
                    <IconChevronRight className="h-4 w-4" />
                    <IconChevronRight className="h-4 w-4 -ml-2.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
