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
import { toast } from "sonner";
import {
  IconBriefcase,
  IconMapPin,
  IconCurrencyEuro,
  IconCalendar,
  IconUsers,
} from "@tabler/icons-react";
import { ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

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
}

export default function CreerOffrePage() {
  const router = useRouter();
  const createOffer = useCreateOffer();
  const [open, setOpen] = useState(false);

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
  });

  const handleInputChange = (field: string, value: string | Date) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
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
      await createOffer.mutateAsync(formData);
      router.push("/recruteur/offres");
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
      });
    } catch (error) {
      toast.error("Erreur lors de la création de l'offre");
    }
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconBriefcase className="h-6 w-6" />
                  Créer une nouvelle offre d'emploi
                </h1>
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

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                            handleInputChange("typeContrat", value)
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
                  <Button type="button" variant="outline">
                    Sauvegarder comme brouillon
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary"
                    disabled={createOffer.isPending}
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
    </>
  );
}
