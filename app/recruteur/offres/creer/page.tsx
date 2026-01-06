"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { RichTextEditorWrapper } from "@/components/rich-text-editor-wrapper";
import { useCreateOffer } from "@/lib/hooks/use-offers";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "sonner";
import {
  IconBriefcase,
  IconMapPin,
  IconCurrencyEuro,
  IconCalendar,
  IconUsers,
  IconPhoto,
  IconUpload,
  IconX,
  IconLoader2,
  IconBulb,
  IconCheck,
  IconCode,
  IconMapPinFilled,
  IconSchool,
  IconClock,
  IconSparkles,
} from "@tabler/icons-react";
import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface FormData {
  titre: string;
  entreprise: string;
  typeContrat: string;
  lieu: string;
  salaireMin: string;
  salaireMax: string;
  description: string;
  profilRecherche: string;
  competences: string;
  avantages: string;
  nombrePostes: string;
  duedate: Date | undefined;
  salaryCurrency: string;
  anneesexperience: string;
  logo: string;
  etat?: "active" | "brouillon";
}

// Clé pour le localStorage
const TIPS_MODAL_KEY = "recruteur_offre_tips_seen";

export default function CreerOffrePage() {
  const router = useRouter();
  const createOffer = useCreateOffer();
  const { edgestore } = useEdgeStore();
  const [open, setOpen] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Afficher la modal au premier chargement si pas déjà vue
  useEffect(() => {
    const hasSeenTips = localStorage.getItem(TIPS_MODAL_KEY);
    if (!hasSeenTips) {
      setShowTipsModal(true);
    }
  }, []);

  const handleCloseTipsModal = () => {
    if (dontShowAgain) {
      localStorage.setItem(TIPS_MODAL_KEY, "true");
    }
    setShowTipsModal(false);
  };

  const [formData, setFormData] = useState<FormData>({
    titre: "",
    entreprise: "",
    typeContrat: "",
    lieu: "",
    salaireMin: "",
    salaireMax: "",
    description: "",
    profilRecherche: "",
    competences: "",
    avantages: "",
    nombrePostes: "",
    duedate: new Date(),
    salaryCurrency: "XOF",
    anneesexperience: "",
    logo: "",
  });

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
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

      setFormData((prev) => ({
        ...prev,
        logo: res.url,
      }));
      toast.success("Logo uploadé avec succès");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Erreur lors de l'upload du logo");
    } finally {
      setUploadingLogo(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveLogo = async () => {
    if (!formData.logo) return;

    try {
      await edgestore.publicFiles.delete({
        url: formData.logo,
      });
    } catch (error) {
      console.error("Error deleting logo from EdgeStore:", error);
    }

    setFormData((prev) => ({
      ...prev,
      logo: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.titre ||
      !formData.entreprise ||
      !formData.typeContrat ||
      !formData.lieu ||
      !formData.duedate
    ) {
      toast.error("Veuillez remplir tous les champs obligatoires *");
      return;
    }

    try {
      console.log(formData);
      await createOffer.mutateAsync({ ...formData, etat: "active" });
      router.push("/recruteur/offres");
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de la création de l'offre");
    }
  };

  const handleSaveAsDraft = async () => {
    // Validation minimale pour un brouillon (juste le titre requis)
    if (!formData.titre) {
      toast.error("Veuillez au moins renseigner le titre du poste");
      return;
    }

    setIsSavingDraft(true);
    try {
      await createOffer.mutateAsync({ ...formData, etat: "brouillon" });
      toast.success("Brouillon sauvegardé avec succès");
      router.push("/recruteur/offres");
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du brouillon");
    } finally {
      setIsSavingDraft(false);
    }
  };

  const resetForm = () => {
    setFormData({
      titre: "",
      entreprise: "",
      typeContrat: "",
      lieu: "",
      salaireMin: "",
      salaireMax: "",
      description: "",
      profilRecherche: "",
      competences: "",
      avantages: "",
      duedate: new Date(),
      nombrePostes: "",
      salaryCurrency: "XOF",
      anneesexperience: "",
      logo: "",
    });
  };

  return (
    <>
      <SiteHeader title="Créer une nouvelle offre d'emploi" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold flex items-center gap-2">
                    <IconBriefcase className="h-6 w-6" />
                    Créer une nouvelle offre d'emploi
                  </h1>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTipsModal(true)}
                    className="flex items-center gap-2"
                  >
                    <IconBulb className="h-4 w-4" />
                    Conseils pour le matching
                  </Button>
                </div>
                <p className="text-muted-foreground mt-2">
                  Remplissez les informations ci-dessous pour publier votre
                  offre d'emploi
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informations principales */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Informations principales
                    </CardTitle>
                    <CardDescription>
                      Les informations essentielles de votre offre d'emploi
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Logo Upload */}
                      <div className="space-y-2">
                        <Label>Logo de l'entreprise</Label>
                        <div className="flex flex-col items-center gap-3">
                          {formData.logo ? (
                            <div className="relative group">
                              <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted">
                                <img
                                  src={formData.logo}
                                  alt="Logo entreprise"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemoveLogo}
                              >
                                <IconX className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <label className="cursor-pointer">
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoUpload}
                                disabled={uploadingLogo}
                              />
                              <div
                                className={`w-24 h-24 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center gap-1 ${
                                  uploadingLogo
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                {uploadingLogo ? (
                                  <>
                                    <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">
                                      {uploadProgress}%
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <IconPhoto className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground text-center px-1">
                                      Ajouter logo
                                    </span>
                                  </>
                                )}
                              </div>
                            </label>
                          )}
                          <p className="text-xs text-muted-foreground text-center">
                            JPG, PNG (max 5MB)
                          </p>
                        </div>
                      </div>

                      {/* Titre et Entreprise */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="titre">Titre du poste *</Label>
                            <Input
                              id="titre"
                              placeholder="Ex: Développeur React Senior"
                              value={formData.titre}
                              onChange={(e) =>
                                handleInputChange("titre", e.target.value)
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="entreprise">
                              Nom de l'entreprise *
                            </Label>
                            <Input
                              id="entreprise"
                              placeholder="Ex: TechCorp"
                              value={formData.entreprise}
                              onChange={(e) =>
                                handleInputChange("entreprise", e.target.value)
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="typeContrat">Type de contrat *</Label>
                        <Select
                          value={formData.typeContrat}
                          onValueChange={(value) =>
                            handleInputChange("typeContrat", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cdi">CDI</SelectItem>
                            <SelectItem value="cdd">CDD</SelectItem>
                            <SelectItem value="stage">Stage</SelectItem>
                            <SelectItem value="freelance">Freelance</SelectItem>
                            <SelectItem value="consultance">
                              Consultance
                            </SelectItem>
                            <SelectItem value="temps-partiel">
                              Temps partiel
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lieu">Lieu de travail *</Label>
                        <div className="relative">
                          <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="lieu"
                            placeholder="Ex: Paris, France"
                            className="pl-10"
                            value={formData.lieu}
                            onChange={(e) =>
                              handleInputChange("lieu", e.target.value)
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="typeContrat">Type de contrat *</Label>
                        <Select
                          value={formData.salaryCurrency}
                          onValueChange={(value) =>
                            handleInputChange("salaryCurrency", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="XOF">XOF</SelectItem>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="anneesexperience">
                          Années d'expérience *
                        </Label>
                        <Select
                          value={formData.anneesexperience}
                          onValueChange={(value) =>
                            handleInputChange("anneesexperience", value)
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                            <SelectItem value="7">7</SelectItem>
                            <SelectItem value="8">8</SelectItem>
                            <SelectItem value="9">9</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nombrePostes">Nombre de postes</Label>
                        <div className="relative">
                          <IconUsers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="nombrePostes"
                            placeholder="1"
                            className="pl-10"
                            type="number"
                            min="1"
                            value={formData.nombrePostes}
                            onChange={(e) =>
                              handleInputChange("nombrePostes", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-col gap-3">
                          <Label htmlFor="date" className="px-1">
                            Date Limite
                          </Label>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                id="date"
                                className="w-full justify-between font-normal"
                              >
                                {formData.duedate
                                  ? new Date(
                                      formData.duedate
                                    ).toLocaleDateString()
                                  : "Sélectionner une date"}
                                <ChevronDownIcon />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-full overflow-hidden p-0"
                              align="start"
                            >
                              <Calendar
                                className="w-full"
                                mode="single"
                                selected={formData.duedate}
                                fromYear={new Date().getFullYear()}
                                toYear={2055}
                                captionLayout="dropdown"
                                onSelect={(date: Date | undefined) => {
                                  if (date) {
                                    setFormData((prev) => ({
                                      ...prev,
                                      duedate: date,
                                    }));
                                    setOpen(false);
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Rémunération */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Rémunération
                    </CardTitle>
                    <CardDescription>
                      Informations sur la rémunération proposée
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaireMin">Salaire minimum </Label>
                        <Input
                          id="salaireMin"
                          placeholder="Ex: 45000"
                          type="number"
                          value={formData.salaireMin}
                          onChange={(e) =>
                            handleInputChange("salaireMin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="salaireMax">Salaire maximum </Label>
                        <Input
                          id="salaireMax"
                          placeholder="Ex: 65000"
                          type="number"
                          value={formData.salaireMax}
                          onChange={(e) =>
                            handleInputChange("salaireMax", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Description et profil */}
                <Card>
                  <CardHeader>
                    <CardTitle>Description et profil recherché</CardTitle>
                    <CardDescription>
                      Décrivez le poste et le profil idéal du candidat
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        Description du poste *
                      </Label>
                      <RichTextEditorWrapper
                        value={formData.description}
                        onChange={(value) =>
                          handleInputChange("description", value)
                        }
                        placeholder="Décrivez les missions principales, les responsabilités et les objectifs du poste..."
                        className="min-h-[250px]"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveAsDraft}
                    disabled={isSavingDraft || createOffer.isPending}
                  >
                    {isSavingDraft
                      ? "Sauvegarde..."
                      : "Sauvegarder comme brouillon"}
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary"
                    disabled={createOffer.isPending || isSavingDraft}
                  >
                    {createOffer.isPending
                      ? "Publication..."
                      : "Publier l'offre"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de conseils pour optimiser le matching */}
      <Dialog open={showTipsModal} onOpenChange={setShowTipsModal}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <IconSparkles className="h-6 w-6" />
              Optimisez votre offre pour le matching IA
            </DialogTitle>
            <DialogDescription>
              Suivez ces conseils pour que notre système de matching trouve les
              meilleurs candidats pour votre offre.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Section Compétences */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <IconCode className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg">
                  Compétences techniques
                </h3>
                <Badge variant="secondary" className="ml-auto">
                  Poids: 40%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Mentionnez clairement les technologies et outils requis dans la
                description.
              </p>
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                  <IconCheck className="h-4 w-4" /> Exemples reconnus :
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "React",
                    "Python",
                    "TypeScript",
                    "Node.js",
                    "PostgreSQL",
                    "AWS",
                    "Docker",
                    "GraphQL",
                    "Figma",
                    "Jira",
                  ].map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Section Expérience */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <IconClock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold text-lg">Niveau d'expérience</h3>
                <Badge variant="secondary" className="ml-auto">
                  Poids: 20%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Indiquez clairement les années d'expérience requises.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"3-5 ans d'expérience"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Junior / Débutant accepté"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Profil senior (5+ ans)"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Minimum 2 ans d'expérience"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Localisation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <IconMapPinFilled className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold text-lg">Localisation</h3>
                <Badge variant="secondary" className="ml-auto">
                  Poids: 20%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Précisez le lieu de travail et les options de télétravail.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Abidjan, Côte d'Ivoire"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Remote / 100% télétravail"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Hybride (2j/semaine bureau)"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconCheck className="h-4 w-4 text-green-500" />
                    <span>"Paris, France ou remote"</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section Formation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                  <IconSchool className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-semibold text-lg">Formation requise</h3>
                <Badge variant="secondary" className="ml-auto">
                  Poids: 5%
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Mentionnez le niveau de diplôme souhaité si applicable.
              </p>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Bac+2",
                    "Bac+3 / Licence",
                    "Bac+5 / Master",
                    "Ingénieur",
                    "BTS/DUT",
                    "Autodidacte accepté",
                  ].map((level) => (
                    <Badge key={level} variant="outline" className="text-xs">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Exemple complet */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <IconBulb className="h-5 w-5 text-yellow-500" />
                Exemple de description optimale
              </h3>
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-4 text-sm space-y-2 border border-primary/20">
                <p>
                  <strong>Missions :</strong> Développer des applications web
                  avec <strong>React</strong> et <strong>TypeScript</strong>,
                  concevoir des APIs <strong>GraphQL</strong> avec{" "}
                  <strong>Node.js</strong>.
                </p>
                <p>
                  <strong>Profil :</strong>{" "}
                  <strong>2-4 ans d'expérience</strong> en développement web.
                  Formation <strong>Bac+3</strong> minimum en informatique.
                </p>
                <p>
                  <strong>Stack :</strong> React, TypeScript, Node.js, GraphQL,
                  PostgreSQL, Docker, AWS.
                </p>
                <p>
                  <strong>Localisation :</strong> Abidjan avec possibilité de{" "}
                  <strong>télétravail partiel</strong>.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dontShowAgain"
                checked={dontShowAgain}
                onCheckedChange={(checked) =>
                  setDontShowAgain(checked as boolean)
                }
              />
              <label
                htmlFor="dontShowAgain"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Ne plus afficher ce message
              </label>
            </div>
            <Button onClick={handleCloseTipsModal} className="sm:ml-auto">
              J'ai compris, créer mon offre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
