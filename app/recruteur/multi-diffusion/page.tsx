"use client";
import { RequirePlan } from "@/components/shared/RequirePlan";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import { useOffers } from "@/lib/hooks/use-offers";
import {
  useCollaborateurByUserId,
  useRecruteurByUserId,
} from "@/lib/hooks/use-recruteurs";
import type { JobOffer } from "@/lib/api/offres/types";
import { toast } from "sonner";
import {
  IconBrandLinkedin,
  IconBriefcase,
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconLink,
  IconLinkOff,
  IconLoader,
  IconMapPin,
  IconSearch,
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Types
interface LinkedInStatus {
  connected: boolean;
  expired?: boolean;
  canPublish?: boolean; // true si w_member_social est activé
  profileName?: string;
  profileImage?: string;
  expiresAt?: string;
}

interface DiffusionHistoryItem {
  id: string;
  jobOfferId: string;
  platform: string;
  status: string;
  postId?: string;
  postUrl?: string;
  message: string;
  publishedAt?: string;
  createdAt: string;
}

export default function MultiDiffusionPage() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const searchParams = useSearchParams();

  const recruteurId = recruteur?.id || collaborateur?.recruteurId;

  const { data: offersData, isLoading: isLoadingOffers } = useOffers(
    { recruteurId, etat: "active", limit: 1000 },
    { enabled: !!recruteurId }
  );

  const offers = offersData?.items || [];

  // État LinkedIn
  const [linkedInStatus, setLinkedInStatus] = useState<LinkedInStatus | null>(
    null
  );
  const [isLoadingLinkedIn, setIsLoadingLinkedIn] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // État général
  const [selectedOffers, setSelectedOffers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewOffer, setPreviewOffer] = useState<JobOffer | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [diffusionHistory, setDiffusionHistory] = useState<
    DiffusionHistoryItem[]
  >([]);
  const [isPublishing, setIsPublishing] = useState(false);

  // Vérifier le statut LinkedIn au chargement
  useEffect(() => {
    checkLinkedInStatus();
    loadDiffusionHistory();
  }, []);

  // Afficher les messages de retour OAuth
  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    const connected = searchParams.get("connected");

    if (error) {
      toast.error(decodeURIComponent(error));
    }
    if (success === "true" && connected === "linkedin") {
      toast.success("LinkedIn connecté avec succès !");
      checkLinkedInStatus();
    }
  }, [searchParams]);

  // Vérifier le statut de connexion LinkedIn
  const checkLinkedInStatus = async () => {
    setIsLoadingLinkedIn(true);
    try {
      const response = await fetch("/api/linkedin/status");
      const result = await response.json();
      if (result.success) {
        setLinkedInStatus(result.data);
      }
    } catch (error) {
      console.error("Error checking LinkedIn status:", error);
    } finally {
      setIsLoadingLinkedIn(false);
    }
  };

  // Charger l'historique des diffusions
  const loadDiffusionHistory = async () => {
    try {
      const response = await fetch("/api/multidiffusion");
      const result = await response.json();
      if (result.success) {
        setDiffusionHistory(result.data || []);
      }
    } catch (error) {
      console.error("Error loading diffusion history:", error);
    }
  };

  // Connecter LinkedIn (redirige vers OAuth)
  const connectLinkedIn = () => {
    window.location.href = "/api/auth/linkedin";
  };

  // Déconnecter LinkedIn
  const disconnectLinkedIn = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/linkedin/status", {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setLinkedInStatus({ connected: false });
        toast.success("LinkedIn déconnecté");
      }
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Filtrer les offres
  const filteredOffers = offers.filter(
    (offer: JobOffer) =>
      offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vérifier si une offre a expiré
  const isOfferExpired = (duedate?: Date | string | null) => {
    if (!duedate) return false;
    const dueDateObj = new Date(duedate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDateObj < today;
  };

  // Offres actives non expirées
  const activeOffers = filteredOffers.filter(
    (offer: JobOffer) => !isOfferExpired(offer.duedate)
  );

  // Toggle selection
  const toggleOfferSelection = (offerId: string) => {
    setSelectedOffers((prev) =>
      prev.includes(offerId)
        ? prev.filter((id) => id !== offerId)
        : [...prev, offerId]
    );
  };

  // Sélectionner tout
  const toggleSelectAll = () => {
    if (selectedOffers.length === activeOffers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(activeOffers.map((o: JobOffer) => o.id));
    }
  };

  // Générer le message LinkedIn
  const generateLinkedInMessage = (offer: JobOffer) => {
    const salaryText =
      offer.salaryMin && offer.salaryMax
        ? `💰 Salaire: ${offer.salaryMin.toLocaleString()} - ${offer.salaryMax.toLocaleString()} ${
            offer.salaryCurrency || "EUR"
          }\n`
        : "";

    return `🚀 Nous recrutons !

📌 ${offer.title}
🏢 ${offer.company || "Notre entreprise"}
📍 ${offer.location || "France"}
📋 ${offer.type || "CDI"}
${salaryText}
${
  offer.description
    ? offer.description.replace(/<[^>]*>/g, "").substring(0, 200) + "..."
    : ""
}

👉 Postulez dès maintenant ou partagez cette offre avec votre réseau !

#Recrutement #Emploi #${(offer.title || "").replace(/\s+/g, "")} #Opportunité`;
  };

  // Ouvrir la preview
  const openLinkedInPreview = (offer: JobOffer) => {
    if (!linkedInStatus?.connected) {
      toast.error("Veuillez d'abord connecter votre compte LinkedIn");
      return;
    }
    setPreviewOffer(offer);
    setCustomMessage(generateLinkedInMessage(offer));
    setIsPreviewOpen(true);
  };

  // Publier sur LinkedIn via l'API ou partage URL
  const publishToLinkedIn = async (offer: JobOffer, message: string) => {
    setIsPublishing(true);

    // Si la publication API n'est pas disponible, utiliser le partage URL
    if (!linkedInStatus?.canPublish) {
      const offerUrl = `${window.location.origin}/offres/${offer.id}`;
      const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        offerUrl
      )}`;

      // Copier le message dans le presse-papier
      try {
        await navigator.clipboard.writeText(message);
        toast.success("Message copié ! LinkedIn va s'ouvrir pour le partage.");
      } catch {
        toast.info("LinkedIn va s'ouvrir pour le partage.");
      }

      // Ouvrir LinkedIn Share
      window.open(linkedInShareUrl, "_blank", "width=600,height=600");
      setIsPublishing(false);
      setIsPreviewOpen(false);
      return;
    }

    // Publication via API (si w_member_social est activé)
    try {
      const response = await fetch("/api/multidiffusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: offer.id,
          platforms: ["linkedin"],
          message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        const linkedInResult = result.data.find(
          (r: any) => r.platform === "linkedin"
        );
        if (linkedInResult?.success) {
          toast.success("Offre publiée sur LinkedIn !");
          if (linkedInResult.postUrl) {
            window.open(linkedInResult.postUrl, "_blank");
          }
          loadDiffusionHistory();
        } else {
          toast.error(linkedInResult?.error || "Erreur lors de la publication");
        }
      } else {
        toast.error(result.error || "Erreur lors de la publication");
      }
    } catch (error) {
      toast.error("Erreur lors de la publication");
    } finally {
      setIsPublishing(false);
      setIsPreviewOpen(false);
    }
  };

  // Copier le message
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Message copié !");
    } catch {
      toast.error("Erreur lors de la copie");
    }
  };

  // Diffuser les offres sélectionnées
  const publishSelectedOffers = () => {
    if (selectedOffers.length === 0) {
      toast.error("Veuillez sélectionner au moins une offre");
      return;
    }

    // Pour la publication API, on vérifie la connexion LinkedIn
    // Pour le partage URL, pas besoin de connexion
    if (linkedInStatus?.canPublish && !linkedInStatus?.connected) {
      toast.error("Veuillez d'abord connecter votre compte LinkedIn");
      return;
    }

    const selectedOffersList = activeOffers.filter((o: JobOffer) =>
      selectedOffers.includes(o.id)
    );

    if (selectedOffersList.length === 1) {
      openLinkedInPreview(selectedOffersList[0]);
    } else {
      toast.info("Pour diffuser plusieurs offres, publiez-les une par une");
    }
  };

  // Badge de type
  const getTypeBadge = (type?: string) => {
    const typeColors: Record<string, string> = {
      CDI: "bg-green-100 text-green-800",
      CDD: "bg-blue-100 text-blue-800",
      Stage: "bg-purple-100 text-purple-800",
      STAGE: "bg-purple-100 text-purple-800",
      Freelance: "bg-orange-100 text-orange-800",
      FREELANCE: "bg-orange-100 text-orange-800",
      CONSULTANCE: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={typeColors[type || ""] || "bg-gray-100 text-gray-800"}>
        {type || "Non spécifié"}
      </Badge>
    );
  };

  // Vérifier si déjà diffusé
  const isOfferPublished = (offerId: string) => {
    return diffusionHistory.some(
      (d) => d.jobOfferId === offerId && d.status === "published"
    );
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <IconLoader className="w-8 h-8 animate-spin text-[#a590ff]" />
      </div>
    );
  }

  return (
    <RequirePlan minPlan="BUSINESS" featureName="Multi-diffusion">
      <>
      <SiteHeader title="Multi-Diffusion" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* En-tête */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Multi-Diffusion</h1>
          <p className="text-muted-foreground">
            Diffusez vos offres d&apos;emploi sur les réseaux professionnels
          </p>
        </div>

        {/* Carte LinkedIn avec statut de connexion */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card
            className={`border-2 ${
              linkedInStatus?.connected
                ? "border-[#0A66C2] bg-gradient-to-br from-[#0A66C2]/5 to-[#0A66C2]/10"
                : "border-dashed border-[#0A66C2]/50"
            }`}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex items-center justify-center w-14 h-14 rounded-xl ${
                  linkedInStatus?.connected ? "bg-[#0A66C2]" : "bg-[#0A66C2]/20"
                }`}
              >
                <IconBrandLinkedin
                  className={`w-8 h-8 ${
                    linkedInStatus?.connected ? "text-white" : "text-[#0A66C2]"
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">LinkedIn</h3>
                {isLoadingLinkedIn ? (
                  <p className="text-sm text-muted-foreground">
                    Vérification...
                  </p>
                ) : linkedInStatus?.connected ? (
                  <div className="flex items-center gap-2">
                    {linkedInStatus.profileImage && (
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={linkedInStatus.profileImage} />
                        <AvatarFallback>
                          <IconUser className="w-3 h-3" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {linkedInStatus.profileName || "Connecté"}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Non connecté</p>
                )}
              </div>
              {isLoadingLinkedIn ? (
                <IconLoader className="w-5 h-5 animate-spin" />
              ) : linkedInStatus?.connected ? (
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-green-100 text-green-800">
                      <IconCheck className="w-3 h-3 mr-1" />
                      Connecté
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {linkedInStatus?.canPublish
                        ? "Publication auto"
                        : "Partage URL"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={disconnectLinkedIn}
                    disabled={isDisconnecting}
                    title="Déconnecter"
                  >
                    {isDisconnecting ? (
                      <IconLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <IconLinkOff className="w-4 h-4 text-red-500" />
                    )}
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  className="bg-[#0A66C2] hover:bg-[#004182]"
                  onClick={connectLinkedIn}
                >
                  <IconLink className="w-4 h-4 mr-2" />
                  Connecter
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border border-dashed opacity-60">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-200">
                <IconBriefcase className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Indeed</h3>
                <p className="text-sm text-muted-foreground">
                  Bientôt disponible
                </p>
              </div>
              <Badge variant="secondary">Bientôt</Badge>
            </CardContent>
          </Card>

          <Card className="border border-dashed opacity-60">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-200">
                <IconBriefcase className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Welcome to the Jungle</h3>
                <p className="text-sm text-muted-foreground">
                  Bientôt disponible
                </p>
              </div>
              <Badge variant="secondary">Bientôt</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Alerte si LinkedIn non connecté */}
        {!isLoadingLinkedIn && !linkedInStatus?.connected && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardContent className="flex items-center gap-4 p-4">
              <IconBrandLinkedin className="w-8 h-8 text-[#0A66C2]" />
              <div className="flex-1">
                <p className="font-medium text-blue-800 dark:text-blue-200">
                  Partager vos offres sur LinkedIn
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-300">
                  Sélectionnez une offre et cliquez sur &quot;Diffuser&quot;
                  pour la partager sur LinkedIn. Le message sera copié et
                  LinkedIn s&apos;ouvrira pour le partage.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des offres */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vos offres actives</CardTitle>
                    <CardDescription>
                      Sélectionnez les offres à diffuser sur LinkedIn
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedOffers.length === activeOffers.length
                      ? "Tout désélectionner"
                      : "Tout sélectionner"}
                  </Button>
                </div>
                <div className="relative mt-4">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher une offre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingOffers ? (
                  <div className="flex items-center justify-center py-12">
                    <IconLoader className="w-8 h-8 animate-spin text-[#a590ff]" />
                  </div>
                ) : activeOffers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <IconBriefcase className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg">
                      Aucune offre active
                    </h3>
                    <p className="text-muted-foreground">
                      Créez une offre pour commencer à diffuser
                    </p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {activeOffers.map((offer: JobOffer) => (
                      <div
                        key={offer.id}
                        className={`flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          selectedOffers.includes(offer.id)
                            ? "bg-[#a590ff]/10"
                            : ""
                        }`}
                        onClick={() => toggleOfferSelection(offer.id)}
                      >
                        <Checkbox
                          checked={selectedOffers.includes(offer.id)}
                          onCheckedChange={() => toggleOfferSelection(offer.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="shrink-0">
                          <Avatar className="w-12 h-12">
                            {offer.logo ? (
                              <AvatarImage
                                src={offer.logo}
                                alt={offer.company}
                              />
                            ) : (
                              <AvatarFallback className="bg-[#a590ff]/20">
                                <IconBriefcase className="w-6 h-6 text-[#a590ff]" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {offer.title}
                            </h3>
                            {isOfferPublished(offer.id) && (
                              <Badge className="bg-green-100 text-green-800">
                                <IconCheck className="w-3 h-3 mr-1" />
                                Diffusé
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>{offer.company}</span>
                            <span className="flex items-center gap-1">
                              <IconMapPin className="w-3 h-3" />
                              {offer.location || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTypeBadge(offer.type)}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openLinkedInPreview(offer);
                            }}
                            disabled={!linkedInStatus?.connected}
                          >
                            <IconBrandLinkedin
                              className={`w-5 h-5 ${
                                linkedInStatus?.connected
                                  ? "text-[#0A66C2]"
                                  : "text-gray-400"
                              }`}
                            />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Panneau latéral */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Offres sélectionnées
                  </span>
                  <Badge variant="secondary">{selectedOffers.length}</Badge>
                </div>
                <Separator />
                <Button
                  className="w-full bg-[#0A66C2] hover:bg-[#004182]"
                  disabled={
                    selectedOffers.length === 0 || !linkedInStatus?.connected
                  }
                  onClick={publishSelectedOffers}
                >
                  <IconSend className="w-5 h-5 mr-2" />
                  Publier sur LinkedIn
                </Button>
                {!linkedInStatus?.connected && (
                  <p className="text-xs text-center text-muted-foreground">
                    Connectez LinkedIn pour publier
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Historique */}
            {/* <Card>
              <CardHeader>
                <CardTitle className="text-lg">Historique récent</CardTitle>
              </CardHeader>
              <CardContent>
                {diffusionHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucune diffusion récente
                  </p>
                ) : (
                  <div className="space-y-3">
                    {diffusionHistory.slice(0, 5).map((item) => {
                      const offer = offers.find(
                        (o: JobOffer) => o.id === item.jobOfferId
                      );
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="shrink-0">
                            <IconBrandLinkedin className="w-5 h-5 text-[#0A66C2]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {offer?.title || "Offre"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          <Badge
                            className={
                              item.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {item.status === "published" ? (
                              <IconCheck className="w-3 h-3" />
                            ) : (
                              "Échec"
                            )}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card> */}

            {/* Conseils */}
            <Card className="bg-linear-to-br from-[#a590ff]/5 to-[#a590ff]/10 border-[#a590ff]/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  💡 Conseils
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>• Publiez aux heures de forte activité (9h-11h, 14h-16h)</p>
                <p>
                  • Utilisez des hashtags pertinents pour plus de visibilité
                </p>
                <p>• Personnalisez le message pour chaque offre</p>
                <p>• Ajoutez une image attractive si possible</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de preview */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <IconBrandLinkedin className="w-6 h-6 text-[#0A66C2]" />
              Aperçu de la publication LinkedIn
            </DialogTitle>
            <DialogDescription>
              Personnalisez votre message avant de le publier
            </DialogDescription>
          </DialogHeader>

          {previewOffer && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="w-12 h-12">
                  {previewOffer.logo ? (
                    <AvatarImage
                      src={previewOffer.logo}
                      alt={previewOffer.company}
                    />
                  ) : (
                    <AvatarFallback className="bg-[#a590ff]/20">
                      <IconBriefcase className="w-6 h-6 text-[#a590ff]" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold">{previewOffer.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {previewOffer.company} • {previewOffer.location}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Message de la publication</Label>
                <Textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{customMessage.length} caractères</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(customMessage)}
                  >
                    <IconCopy className="w-4 h-4 mr-1" />
                    Copier
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-white p-4 dark:bg-gray-900">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white font-bold">
                      {linkedInStatus?.profileName?.charAt(0) ||
                        session?.user?.name?.charAt(0) ||
                        "R"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {linkedInStatus?.profileName ||
                          session?.user?.name ||
                          "Votre entreprise"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Recruteur • Maintenant
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 whitespace-pre-wrap text-sm">
                    {customMessage.split("\n").map((line, i) => (
                      <p key={i} className="min-h-5">
                        {line}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4 border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 dark:bg-gray-800 h-32 flex items-center justify-center">
                      {previewOffer.logo ? (
                        <img
                          src={previewOffer.logo}
                          alt=""
                          className="max-h-full object-contain"
                        />
                      ) : (
                        <IconBriefcase className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50">
                      <p className="font-semibold text-sm">
                        {previewOffer.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {typeof window !== "undefined"
                          ? `${window.location.origin}/offres/${previewOffer.id}`
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(customMessage)}
            >
              <IconCopy className="w-4 h-4 mr-2" />
              Copier le message
            </Button>
            <Button
              className="bg-[#0A66C2] hover:bg-[#004182]"
              disabled={isPublishing}
              onClick={() =>
                previewOffer && publishToLinkedIn(previewOffer, customMessage)
              }
            >
              {isPublishing ? (
                <IconLoader className="w-4 h-4 mr-2 animate-spin" />
              ) : linkedInStatus?.canPublish ? (
                <IconSend className="w-4 h-4 mr-2" />
              ) : (
                <IconExternalLink className="w-4 h-4 mr-2" />
              )}
              {linkedInStatus?.canPublish
                ? "Publier sur LinkedIn"
                : "Partager sur LinkedIn"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>
    </RequirePlan>
  );
}
