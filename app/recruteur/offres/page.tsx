"use client";

import { useState, useEffect } from "react";

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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SiteHeader } from "@/components/site-header";
import dynamic from "next/dynamic";
const RichTextEditorWrapper = dynamic(
  () => import("@/components/rich-text-editor-wrapper").then((m) => m.RichTextEditorWrapper),
  { ssr: false, loading: () => <div className="h-40 bg-gray-100 rounded animate-pulse" /> }
);
import { useSession } from "@/lib/auth-client";
import { useOffreQuota } from "@/lib/hooks/use-offre-quota";
import { PlanSelectionModal } from "@/components/shared/PlanSelectionModal";
import {
  useOffers,
  useDeleteOffer,
  useBulkDeleteOffers,
  useUpdateOffer,
  useUpdateOfferStatus,
} from "@/lib/hooks/use-offers";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCollaborateurByUserId,
  useRecruteurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useEdgeStore } from "@/lib/edgestore";
import type { JobOffer } from "@/lib/api/offres/types";
import { toast } from "sonner";
import {
  IconBriefcase,
  IconCalendar,
  IconEye,
  IconEdit,
  IconTrash,
  IconMapPin,
  IconUsers,
  IconSearch,
  IconFilter,
  IconLoader,
  IconChevronLeft,
  IconChevronRight,
  IconPhoto,
  IconX,
  IconMail,
  IconPhone,
  IconFileText,
  IconClock,
  IconCheck,
  IconArchive,
  IconPlayerPlay,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Type for application with candidat info
interface ApplicationWithCandidat {
  id: string;
  candidatId: string;
  jobOfferId: string;
  status: "EN_ATTENTE" | "EN_REVISION" | "ACCEPTE" | "REFUSE";
  rating?: number | null;
  message?: string | null;
  cv?: string | null;
  favorite?: boolean | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  candidat: {
    id: string;
    userId: string;
    nom?: string | null;
    prenom?: string | null;
    telephone?: string | null;
    cv?: string | null;
    image?: string | null;
    ville?: string | null;
    user?: {
      email?: string;
      name?: string;
    };
  };
}

// Extended JobOffer type with applications
interface JobOfferWithApplications extends JobOffer {
  applications?: ApplicationWithCandidat[];
}

export default function MesOffresPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const { edgestore } = useEdgeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
  const [viewingOfferId, setViewingOfferId] = useState<string | null>(null);
  const [editTypeContrat, setEditTypeContrat] = useState("cdi");
  const [editDescription, setEditDescription] = useState("");
  const [editDuedate, setEditDuedate] = useState<Date | undefined>(undefined);
  const [editLogo, setEditLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [publishConfirmId, setPublishConfirmId] = useState<string | null>(null);
  const [draftConfirmId, setDraftConfirmId] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

  // Debounce : attend 350ms après la dernière frappe avant de lancer la requête
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch recruteur from session
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);

  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  const { data, isLoading, error } = useOffers(
    {
      page: currentPage,
      limit: itemsPerPage,
      recruteurId: recruteurId || undefined,
      search: debouncedSearch || undefined,
      etat: filterStatut !== "all" ? filterStatut : undefined,
    },
    {
      enabled: !!recruteurId,
    }
  );

  const deleteOffer = useDeleteOffer();
  const bulkDeleteOffers = useBulkDeleteOffers();
  const updateOffer = useUpdateOffer();
  const updateOfferStatus = useUpdateOfferStatus();

  const offres = data?.items || [];
  const pagination = data?.pagination;
  const { used: quotaUsed, max: quotaMax, isAtLimit: quotaAtLimit } = useOffreQuota();
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const totalAll = data?.totalAll || [];

  // console.log(
  //   "totalAll",
  //   totalAll.reduce((sum, o) => sum + (o.applications?.length || 0), 0)
  // );
  // console.log("pagination", data);
  // const totalApplications =

  // Reset to page 1 when filter or debounced search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatut, debouncedSearch]);

  // Réinitialise la sélection quand la liste affichée change
  useEffect(() => {
    setSelectedIds(new Set());
  }, [currentPage, filterStatut, debouncedSearch]);

  // Vérifie si une offre est expirée en fonction de la date limite
  const isOfferExpired = (duedate?: Date | string | null) => {
    if (!duedate) return false;
    const dueDateObj = new Date(duedate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  };

  const getStatutBadge = (statut: string, duedate?: Date | string | null) => {
    // Si la date limite est dépassée, afficher "Expirée" même si le statut est "active"
    if (isOfferExpired(duedate) && statut === "active") {
      return <Badge className="bg-red-100 text-red-800">Expirée</Badge>;
    }

    switch (statut) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "expiree":
        return <Badge className="bg-red-100 text-red-800">Expirée</Badge>;
      case "brouillon":
        return <Badge className="bg-gray-100 text-gray-800">Brouillon</Badge>;
      default:
        return <Badge variant="secondary">{statut}</Badge>;
    }
  };

  // Note: Avec pagination côté serveur, le filtrage côté client ne s'applique qu'aux
  // résultats actuels. Pour un filtrage complet, il faudrait envoyer les filtres au serveur.
  // Pour l'instant, on affiche simplement les offres paginées.
  const displayedOffres = offres;

  const handleDeleteOffre = (id: string) => {
    setDeleteConfirmId(id);
  };

  const toggleSelectOffre = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(displayedOffres.map((o) => o.id)) : new Set());
  };

  const confirmBulkDelete = async () => {
    try {
      await bulkDeleteOffers.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error bulk deleting offers:", error);
    } finally {
      setBulkDeleteConfirm(false);
    }
  };

  const confirmDeleteOffre = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteOffer.mutateAsync(deleteConfirmId);
    } catch (error) {
      console.error("Error deleting offer:", error);
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Publier une offre (brouillon → active)
  const handlePublishOffre = (id: string) => {
    const offre = offres.find((o) => o.id === id);
    if (!offre) return;
    if (!offre.title || !offre.company || !offre.location) {
      toast.error(
        "Impossible de publier : le titre, l'entreprise et le lieu sont obligatoires"
      );
      return;
    }
    setPublishConfirmId(id);
  };

  const confirmPublishOffre = async () => {
    if (!publishConfirmId) return;
    try {
      await updateOfferStatus.mutateAsync({ id: publishConfirmId, etat: "active" });
    } catch (error) {
      console.error("Error publishing offer:", error);
    } finally {
      setPublishConfirmId(null);
    }
  };

  // Mettre en brouillon (active → brouillon)
  const handleDraftOffre = (id: string) => {
    setDraftConfirmId(id);
  };

  const confirmDraftOffre = async () => {
    if (!draftConfirmId) return;
    try {
      await updateOfferStatus.mutateAsync({ id: draftConfirmId, etat: "brouillon" });
    } catch (error) {
      console.error("Error drafting offer:", error);
    } finally {
      setDraftConfirmId(null);
    }
  };

  const handleEditOffre = (id: string) => {
    setEditingOfferId(id);
    const offre = offres.find((o) => o.id === id);
    if (offre) {
      setEditTypeContrat(offre.type || "cdi");
      setEditDescription(offre.description || "");
      setEditLogo(offre.logo || "");
      setEditDuedate(offre.duedate ? new Date(offre.duedate) : undefined);
    }
  };

  const handleCloseEditModal = () => {
    setEditingOfferId(null);
    setEditLogo("");
    setUploadingLogo(false);
    setUploadProgress(0);
  };

  const handleEditLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (JPG, PNG, GIF, etc.)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("L'image est trop volumineuse (max 5MB)");
      return;
    }

    setUploadingLogo(true);
    setUploadProgress(0);

    try {
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          setUploadProgress(progress);
        },
      });

      setEditLogo(res.url);
      toast.success("Logo uploadé avec succès");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveEditLogo = async () => {
    if (!editLogo) return;

    try {
      await edgestore.publicFiles.delete({
        url: editLogo,
      });
    } catch (error) {
      console.error("Error deleting logo from EdgeStore:", error);
    }

    setEditLogo("");
  };

  const handleSubmitEdit = async (
    e: React.FormEvent,
    id: string,
    offre: JobOffer
  ) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await updateOffer.mutateAsync({
        id,
        data: {
          titre: (formData.get("titre") as string) || offre.title,
          entreprise: (formData.get("entreprise") as string) || offre.company,
          typeContrat: (formData.get("typeContrat") as string) || offre.type,
          lieu: (formData.get("lieu") as string) || offre.location,
          salaireMin: formData.get("salaireMin") as string,
          salaireMax: formData.get("salaireMax") as string,
          description: editDescription || offre.description,
          duedate: editDuedate ? new Date(editDuedate) : undefined,
          logo: editLogo || undefined,
        },
      });
      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating offer:", error);
    }
  };

  const editingOffer = offres.find((o) => o.id === editingOfferId);
  const viewingOffer = offres.find((o) => o.id === viewingOfferId) as
    | JobOfferWithApplications
    | undefined;

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "EN_ATTENTE":
        return <Badge className="bg-blue-100 text-blue-800">En attente</Badge>;
      case "EN_REVISION":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En révision</Badge>
        );
      case "ACCEPTE":
        return <Badge className="bg-green-100 text-green-800">Accepté</Badge>;
      case "REFUSE":
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (nom?: string | null, prenom?: string | null) => {
    const n = nom?.charAt(0) || "";
    const p = prenom?.charAt(0) || "";
    return (n + p).toUpperCase() || "?";
  };

  const handleViewOffre = (id: string) => {
    setViewingOfferId(id);
  };

  const handleCloseViewModal = () => {
    setViewingOfferId(null);
  };

  if (isSessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          {/* <IconLoader className="h-12 w-12 animate-spin mx-auto mb-4" />
           */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SiteHeader title="Mes offres d'emploi" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconBriefcase className="h-6 w-6" />
                  Mes offres d'emploi
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gérez et suivez vos offres d'emploi publiées
                </p>
              </div>

              {/* Bandeau quota offres (plans limités) */}
              {quotaMax !== null && (
                <div className={`mb-5 flex items-center justify-between rounded-xl px-4 py-3 text-sm border ${
                  quotaAtLimit
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-amber-50 border-amber-200 text-amber-800"
                }`}>
                  <span>
                    <span className="font-bold">{quotaUsed}/{quotaMax}</span> offres actives utilisées
                    {quotaAtLimit && " — quota atteint"}
                  </span>
                  {quotaAtLimit && (
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className="ml-4 px-4 py-1.5 bg-[#a590ff] text-white rounded-full text-xs font-semibold hover:bg-[#9580ef] transition-colors whitespace-nowrap"
                    >
                      Passer à un plan supérieur
                    </button>
                  )}
                </div>
              )}

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total offres
                        </p>
                        <p className="text-2xl font-bold">
                          {pagination?.total}
                        </p>
                      </div>
                      <IconBriefcase className="h-8 w-8 " />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Actives</p>
                        <p className="text-2xl font-bold text-green-600">
                          {
                            totalAll.filter(
                              (o) =>
                                o.etat === "active" &&
                                !isOfferExpired(o.duedate)
                            ).length
                          }
                        </p>
                      </div>
                      <IconCheck className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setFilterStatut("brouillon")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Brouillons
                        </p>
                        <p className="text-2xl font-bold text-gray-600">
                          {
                            totalAll.filter((o) => o.etat === "brouillon")
                              .length
                          }
                        </p>
                      </div>
                      <IconArchive className="h-8 w-8 text-gray-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Expirées
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {
                            totalAll.filter(
                              (o) =>
                                isOfferExpired(o.duedate) ||
                                o.etat === "expiree"
                            ).length
                          }
                        </p>
                      </div>
                      <IconClock className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Candidatures
                        </p>
                        <p className="text-2xl font-bold ">
                          {totalAll.reduce(
                            (sum, o) => sum + (o.applications?.length || 0),
                            0
                          )}
                        </p>
                      </div>
                      <IconUsers className="h-8 w-8 " />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Vues totales
                        </p>
                        <p className="text-2xl font-bold ">
                          {offres.reduce(
                            (sum, o: any) => sum + (o.views || 0),
                            0
                          )}
                        </p>
                      </div>
                      <IconEye className="h-8 w-8 " />
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
                          placeholder="Rechercher par titre ou entreprise..."
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
                          <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tous les statuts</SelectItem>
                          <SelectItem value="active">Actives</SelectItem>
                          <SelectItem value="brouillon">Brouillons</SelectItem>
                          <SelectItem value="expiree">Expirées</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon">
                        <IconFilter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Barre d'actions groupées */}
              {!isLoading && !error && displayedOffres.length > 0 && (
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={
                        selectedIds.size > 0 &&
                        displayedOffres.every((o) => selectedIds.has(o.id))
                      }
                      onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedIds.size > 0
                        ? `${selectedIds.size} offre(s) sélectionnée(s)`
                        : "Tout sélectionner"}
                    </span>
                  </div>
                  {selectedIds.size > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setBulkDeleteConfirm(true)}
                      disabled={bulkDeleteOffers.isPending}
                    >
                      {bulkDeleteOffers.isPending ? (
                        <IconLoader className="h-4 w-4 mr-1.5 animate-spin" />
                      ) : (
                        <IconTrash className="h-4 w-4 mr-1.5" />
                      )}
                      Supprimer la sélection ({selectedIds.size})
                    </Button>
                  )}
                </div>
              )}

              {/* Liste des offres */}
              <div className="space-y-4">
                {isLoading ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconLoader className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-semibold mb-2">
                        Chargement des offres...
                      </h3>
                    </CardContent>
                  </Card>
                ) : error ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconBriefcase className="h-12 w-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2 text-red-600">
                        Erreur lors du chargement
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Impossible de charger les offres d'emploi.
                      </p>
                    </CardContent>
                  </Card>
                ) : displayedOffres.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <IconBriefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        Aucune offre trouvée
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {searchTerm || filterStatut !== "all"
                          ? "Aucune offre ne correspond à vos critères de recherche."
                          : "Vous n'avez pas encore créé d'offres d'emploi."}
                      </p>
                      <Button asChild>
                        <a href="/recruteur/offres/creer">
                          Créer ma première offre
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  displayedOffres.map((offre) => (
                    <Card
                      key={offre.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleViewOffre(offre.id)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Sélection */}
                            <Checkbox
                              className="mt-1 shrink-0"
                              checked={selectedIds.has(offre.id)}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(checked) =>
                                toggleSelectOffre(offre.id, !!checked)
                              }
                            />
                            {/* Logo de l'entreprise */}
                            {offre.logo ? (
                              <div className="shrink-0">
                                <div className="w-14 h-14 rounded-lg overflow-hidden border bg-muted">
                                  <img
                                    src={offre.logo}
                                    alt={`Logo ${
                                      offre.company || "entreprise"
                                    }`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="shrink-0">
                                <div className="w-14 h-14 rounded-lg border bg-muted flex items-center justify-center">
                                  <IconBriefcase className="h-6 w-6 text-muted-foreground" />
                                </div>
                              </div>
                            )}

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg">
                                  {offre.title}
                                </CardTitle>
                                {getStatutBadge(
                                  offre.etat || "active",
                                  offre.duedate
                                )}
                              </div>
                              <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                                {offre.company && (
                                  <span className="flex items-center gap-1">
                                    <IconBriefcase className="h-4 w-4" />
                                    {offre.company}
                                  </span>
                                )}
                                {offre.location && (
                                  <span className="flex items-center gap-1">
                                    <IconMapPin className="h-4 w-4" />
                                    {offre.location}
                                  </span>
                                )}
                                {(offre.salaryMin || offre.salaryMax) && (
                                  <span className="flex items-center gap-1">
                                    {offre.salaryMin
                                      ? `${offre.salaryMin}`
                                      : ""}
                                    {offre.salaryMin && offre.salaryMax
                                      ? " - "
                                      : ""}
                                    {offre.salaryMax
                                      ? `${offre.salaryMax} ${offre.salaryCurrency}`
                                      : ""}
                                  </span>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            {/* Bouton Publier (pour les brouillons) */}
                            {offre.etat === "brouillon" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePublishOffre(offre.id);
                                }}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                disabled={updateOfferStatus.isPending}
                                title="Publier l'offre"
                              >
                                {updateOfferStatus.isPending ? (
                                  <IconLoader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <IconPlayerPlay className="h-4 w-4" />
                                )}
                              </Button>
                            )}

                            {/* Bouton Mettre en brouillon (pour les offres actives) */}
                            {offre.etat === "active" &&
                              !isOfferExpired(offre.duedate) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDraftOffre(offre.id);
                                  }}
                                  className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                  disabled={updateOfferStatus.isPending}
                                  title="Mettre en brouillon"
                                >
                                  {updateOfferStatus.isPending ? (
                                    <IconLoader className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <IconArchive className="h-4 w-4" />
                                  )}
                                </Button>
                              )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditOffre(offre.id);
                              }}
                              title="Modifier"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteOffre(offre.id);
                              }}
                              className="text-red-600 hover:text-red-700"
                              disabled={deleteOffer.isPending}
                              title="Supprimer"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Type de contrat
                            </p>
                            <p className="font-semibold uppercase">
                              {offre.type || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Candidatures
                            </p>
                            <p className="font-medium ">
                              {offre.applications?.length || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Vues</p>
                            <p className="font-medium ">
                              {(offre as any).views || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Date limite</p>
                            <p
                              className={`font-medium flex items-center gap-1 ${
                                isOfferExpired(offre.duedate)
                                  ? "text-red-600"
                                  : ""
                              }`}
                            >
                              <IconCalendar
                                className={`h-4 w-4 ${
                                  isOfferExpired(offre.duedate)
                                    ? "text-red-500"
                                    : ""
                                }`}
                              />
                              {offre.duedate
                                ? new Date(offre.duedate).toLocaleDateString(
                                    "fr-FR"
                                  )
                                : "Non définie"}
                              {isOfferExpired(offre.duedate) && (
                                <span className="text-xs text-red-500 ml-1">
                                  (expirée)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <Card className="mt-6">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
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
                          <SelectTrigger className="w-[80px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                          </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">
                          par page
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          Page {pagination.page} sur {pagination.totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                          >
                            <IconChevronLeft className="h-4 w-4 mr-1" />
                            Première
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            <IconChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="px-4 py-2 text-sm font-medium">
                            {pagination.page}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(currentPage + 1)}
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
                            onClick={() =>
                              setCurrentPage(pagination.totalPages || 1)
                            }
                            disabled={
                              currentPage === pagination.totalPages ||
                              !pagination.totalPages
                            }
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
            </div>
          </div>
        </div>
      </div>

      {/* View Detail Dialog */}
      <Dialog open={!!viewingOfferId} onOpenChange={(open) => !open && handleCloseViewModal()}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {viewingOffer && (
            <>
              <DialogHeader className="shrink-0 border-b px-6 py-4">
                <div className="flex items-start gap-4">
                  {viewingOffer.logo ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border bg-muted shrink-0">
                      <img
                        src={viewingOffer.logo}
                        alt={`Logo ${viewingOffer.company || "entreprise"}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border bg-muted flex items-center justify-center shrink-0">
                      <IconBriefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <DialogTitle className="text-xl">
                        {viewingOffer.title}
                      </DialogTitle>
                      {getStatutBadge(viewingOffer.etat || "active", viewingOffer.duedate)}
                    </div>
                    <DialogDescription className="flex items-center gap-4 mt-1 flex-wrap">
                      {viewingOffer.company && (
                        <span className="flex items-center gap-1">
                          <IconBriefcase className="h-4 w-4" />
                          {viewingOffer.company}
                        </span>
                      )}
                      {viewingOffer.location && (
                        <span className="flex items-center gap-1">
                          <IconMapPin className="h-4 w-4" />
                          {viewingOffer.location}
                        </span>
                      )}
                      {viewingOffer.type && (
                        <Badge variant="outline" className="uppercase">
                          {viewingOffer.type}
                        </Badge>
                      )}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="details" className="h-full flex flex-col">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-4 pt-2 shrink-0">
                    <TabsTrigger value="details" className="data-[state=active]:bg-background">
                      Détails de l'offre
                    </TabsTrigger>
                    <TabsTrigger value="candidatures" className="data-[state=active]:bg-background">
                      Candidatures ({viewingOffer.applications?.length || 0})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="flex-1 overflow-auto m-0">
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Type de contrat</p>
                          <p className="font-medium uppercase">{viewingOffer.type || "N/A"}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Salaire</p>
                          <p className="font-medium">
                            {viewingOffer.salaryMin || viewingOffer.salaryMax
                              ? `${viewingOffer.salaryMin || ""}${viewingOffer.salaryMin && viewingOffer.salaryMax ? " - " : ""}${viewingOffer.salaryMax || ""} ${viewingOffer.salaryCurrency || ""}`
                              : "Non spécifié"}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Date limite</p>
                          <p className={`font-medium flex items-center gap-1 ${isOfferExpired(viewingOffer.duedate) ? "text-red-600" : ""}`}>
                            <IconCalendar className={`h-4 w-4 ${isOfferExpired(viewingOffer.duedate) ? "text-red-500" : ""}`} />
                            {viewingOffer.duedate ? new Date(viewingOffer.duedate).toLocaleDateString("fr-FR") : "Non définie"}
                            {isOfferExpired(viewingOffer.duedate) && (
                              <Badge className="bg-red-100 text-red-800 ml-2 text-xs">Expirée</Badge>
                            )}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Vues</p>
                          <p className="font-medium flex items-center gap-1">
                            <IconEye className="h-4 w-4" />
                            {(viewingOffer as any).views || 0}
                          </p>
                        </div>
                      </div>

                      <Separator />

                      {viewingOffer.description && (
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">Description du poste</h3>
                          <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: viewingOffer.description }} />
                        </div>
                      )}

                      {viewingOffer.requirements && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Profil recherché</h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: viewingOffer.requirements }} />
                          </div>
                        </>
                      )}

                      {viewingOffer.benefits && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Avantages</h3>
                            <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: viewingOffer.benefits }} />
                          </div>
                        </>
                      )}

                      {viewingOffer.skills && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">Compétences requises</h3>
                            <div className="flex flex-wrap gap-2">
                              {viewingOffer.skills.split(",").map((skill, index) => (
                                <Badge key={index} variant="secondary">{skill.trim()}</Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="candidatures" className="flex-1 overflow-auto m-0">
                    <div className="p-6 space-y-4">
                      {!viewingOffer.applications || viewingOffer.applications.length === 0 ? (
                        <div className="text-center py-12">
                          <IconUsers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Aucune candidature</h3>
                          <p className="text-muted-foreground">Cette offre n'a pas encore reçu de candidatures.</p>
                        </div>
                      ) : (
                        viewingOffer.applications.map((application) => (
                          <Card key={application.id} className="hover:shadow-sm transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-12 w-12 shrink-0">
                                  <AvatarImage src={application.candidat?.image || ""} />
                                  <AvatarFallback>{getInitials(application.candidat?.nom, application.candidat?.prenom)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <h4 className="font-semibold">
                                      {application.candidat?.nom || "Nom inconnu"}{" "}{application.candidat?.prenom || ""}
                                    </h4>
                                    {getApplicationStatusBadge(application.status)}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                                    {application.candidat?.user?.email && (
                                      <span className="flex items-center gap-1">
                                        <IconMail className="h-4 w-4" />
                                        {application.candidat.user.email}
                                      </span>
                                    )}
                                    {application.candidat?.telephone && (
                                      <span className="flex items-center gap-1">
                                        <IconPhone className="h-4 w-4" />
                                        {application.candidat.telephone}
                                      </span>
                                    )}
                                    {application.candidat?.ville && (
                                      <span className="flex items-center gap-1">
                                        <IconMapPin className="h-4 w-4" />
                                        {application.candidat.ville}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <IconClock className="h-4 w-4" />
                                    Candidature reçue le{" "}
                                    {new Date(application.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                  </div>
                                  {application.message && (
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">"{application.message}"</p>
                                  )}
                                </div>
                                <div className="flex gap-2 shrink-0">
                                  {application.candidat?.cv && (
                                    <Button variant="outline" size="sm" onClick={() => window.open(application.candidat?.cv || "", "_blank")}>
                                      <IconFileText className="h-4 w-4 mr-1" />
                                      CV
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <DialogFooter className="shrink-0 border-t px-6 py-4 bg-muted/30 flex flex-row items-center justify-between sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <IconUsers className="h-4 w-4" />
                  {viewingOffer.applications?.length || 0} candidature(s)
                  <span className="mx-2">•</span>
                  <IconEye className="h-4 w-4" />
                  {(viewingOffer as any).views || 0} vue(s)
                </div>
                <div className="flex gap-2">
                  {viewingOffer.etat === "brouillon" && (
                    <Button
                      variant="outline"
                      onClick={() => handlePublishOffre(viewingOfferId!)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      disabled={updateOfferStatus.isPending}
                    >
                      {updateOfferStatus.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : <IconPlayerPlay className="h-4 w-4 mr-2" />}
                      Publier
                    </Button>
                  )}
                  {viewingOffer.etat === "active" && !isOfferExpired(viewingOffer.duedate) && (
                    <Button
                      variant="outline"
                      onClick={() => handleDraftOffre(viewingOfferId!)}
                      className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                      disabled={updateOfferStatus.isPending}
                    >
                      {updateOfferStatus.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : <IconArchive className="h-4 w-4 mr-2" />}
                      Brouillon
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => { handleCloseViewModal(); handleEditOffre(viewingOfferId!); }}>
                    <IconEdit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button onClick={handleCloseViewModal}>Fermer</Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingOfferId} onOpenChange={(open) => !open && handleCloseEditModal()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {editingOffer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <IconEdit className="h-5 w-5" />
                  Modifier l'offre
                </DialogTitle>
                <DialogDescription>
                  Modifiez les informations de votre offre d'emploi
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={(e) => handleSubmitEdit(e, editingOfferId!, editingOffer)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Logo de l'entreprise</Label>
                    <div className="flex flex-col items-center gap-3">
                      {editLogo ? (
                        <div className="relative group">
                          <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border bg-muted">
                            <img src={editLogo} alt="Logo entreprise" className="w-full h-full object-cover" />
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleRemoveEditLogo}
                          >
                            <IconX className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Input type="file" accept="image/*" className="hidden" onChange={handleEditLogoUpload} disabled={uploadingLogo} />
                          <div className={`w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 ${uploadingLogo ? "opacity-50 cursor-not-allowed" : ""}`}>
                            {uploadingLogo ? (
                              <>
                                <IconLoader className="h-5 w-5 animate-spin text-primary" />
                                <span className="text-xs text-muted-foreground">{uploadProgress}%</span>
                              </>
                            ) : (
                              <>
                                <IconPhoto className="h-5 w-5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground text-center px-1">Ajouter</span>
                              </>
                            )}
                          </div>
                        </label>
                      )}
                      <p className="text-xs text-muted-foreground text-center">Max 5MB</p>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-titre">Titre du poste *</Label>
                        <Input id="edit-titre" name="titre" placeholder="Ex: Développeur React Senior" defaultValue={editingOffer.title} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit-entreprise">Entreprise *</Label>
                        <Input id="edit-entreprise" name="entreprise" placeholder="Ex: TechCorp" defaultValue={editingOffer.company || ""} required />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-typeContrat">Type de contrat *</Label>
                    <Select value={editTypeContrat} onValueChange={setEditTypeContrat}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cdi">CDI</SelectItem>
                        <SelectItem value="cdd">CDD</SelectItem>
                        <SelectItem value="stage">Stage</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                        <SelectItem value="temps-partiel">Temps partiel</SelectItem>
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="typeContrat" value={editTypeContrat} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-lieu">Lieu de travail *</Label>
                    <Input id="edit-lieu" name="lieu" placeholder="Ex: Paris, France" defaultValue={editingOffer.location || ""} required />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombrePostes">Nombre de postes</Label>
                    <div className="relative">
                      <IconUsers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input id="nombrePostes" placeholder="1" className="pl-10" type="number" min="1" value={editingOffer.numberOfPosts || ""} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="date" className="px-1">Date Limite</Label>
                      <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" id="date" className="w-full justify-between font-normal">
                            {editDuedate ? editDuedate.toLocaleDateString() : editingOffer.duedate ? new Date(editingOffer.duedate).toLocaleDateString() : "Sélectionner une date"}
                            <ChevronDownIcon />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full overflow-hidden p-0" align="start">
                          <Calendar
                            className="w-full"
                            mode="single"
                            selected={editDuedate ?? (editingOffer?.duedate ? new Date(editingOffer.duedate) : undefined)}
                            captionLayout="dropdown"
                            onSelect={(date: Date | undefined) => { if (date) { setEditDuedate(date); setOpen(false); } }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaireMin">Salaire minimum</Label>
                    <Input id="edit-salaireMin" name="salaireMin" type="number" placeholder="Ex: 45000" defaultValue={editingOffer.salaryMin || ""} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-salaireMax">Salaire maximum</Label>
                    <Input id="edit-salaireMax" name="salaireMax" type="number" placeholder="Ex: 65000" defaultValue={editingOffer.salaryMax || ""} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description *</Label>
                  <RichTextEditorWrapper
                    value={editDescription}
                    onChange={setEditDescription}
                    placeholder="Décrivez les missions principales, les responsabilités et les objectifs du poste..."
                    className="min-h-50"
                  />
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between pt-2">
                  <div>
                    {editingOffer.etat === "brouillon" ? (
                      <Button type="button" variant="outline" onClick={() => { handlePublishOffre(editingOfferId!); handleCloseEditModal(); }} className="text-green-600 hover:text-green-700 hover:bg-green-50" disabled={updateOfferStatus.isPending}>
                        <IconPlayerPlay className="h-4 w-4 mr-2" />
                        Publier l'offre
                      </Button>
                    ) : (
                      editingOffer.etat === "active" && !isOfferExpired(editingOffer.duedate) && (
                        <Button type="button" variant="outline" onClick={() => { handleDraftOffre(editingOfferId!); handleCloseEditModal(); }} className="text-gray-600 hover:text-gray-700 hover:bg-gray-50" disabled={updateOfferStatus.isPending}>
                          <IconArchive className="h-4 w-4 mr-2" />
                          Mettre en brouillon
                        </Button>
                      )
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={handleCloseEditModal} disabled={updateOffer.isPending}>Annuler</Button>
                    <Button type="submit" disabled={updateOffer.isPending}>
                      {updateOffer.isPending ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog — Supprimer */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'offre et toutes ses candidatures associées seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteOffre} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteOffer.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog — Supprimer la sélection */}
      <AlertDialog open={bulkDeleteConfirm} onOpenChange={(open) => !open && setBulkDeleteConfirm(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer {selectedIds.size} offre(s) ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Les offres sélectionnées et toutes leurs candidatures associées seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {bulkDeleteOffers.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog — Publier */}
      <AlertDialog open={!!publishConfirmId} onOpenChange={(open) => !open && setPublishConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publier cette offre ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'offre sera visible par tous les candidats sur la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPublishOffre} className="bg-green-600 text-white hover:bg-green-700">
              {updateOfferStatus.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Publier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AlertDialog — Brouillon */}
      <AlertDialog open={!!draftConfirmId} onOpenChange={(open) => !open && setDraftConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mettre en brouillon ?</AlertDialogTitle>
            <AlertDialogDescription>
              L'offre ne sera plus visible par les candidats sur la plateforme.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDraftOffre}>
              {updateOfferStatus.isPending ? <IconLoader className="h-4 w-4 mr-2 animate-spin" /> : null}
              Confirmer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PlanSelectionModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </>
  );
}
