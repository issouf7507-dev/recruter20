"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Save } from "lucide-react";
import { updateCandidat } from "@/lib/api/candidats";
import { toast } from "sonner";
import { useEdgeStore } from "@/lib/edgestore";

interface ProfilSectionProps {
  candidat: any;
}

const COMPETENCES_PREDEFINIES = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Python",
  "Java",
  "PHP",
  "SQL",
  "MongoDB",
  "Git",
  "Docker",
  "AWS",
  "UI/UX",
  "Agile",
  "Node.js",
  "Vue.js",
  "Angular",
  "PostgreSQL",
  "MySQL",
  "GraphQL",
];

const SITUATIONS_FAMILIALES = [
  "Célibataire",
  "Marié(e)",
  "Divorcé(e)",
  "Veuf(ve)",
];

export function ProfilSection({ candidat }: ProfilSectionProps) {
  const [file, setFile] = useState<File>();
  const { edgestore } = useEdgeStore();
  const [formData, setFormData] = useState({
    nom: candidat?.nom || "",
    prenom: candidat?.prenom || "",
    telephone: candidat?.telephone || "",
    adresse: candidat?.adresse || "",
    ville: candidat?.ville || "",
    pays: candidat?.pays || "",
    dateNaissance: candidat?.dateNaissance
      ? new Date(candidat.dateNaissance).toISOString().split("T")[0]
      : "",
    nationalite: candidat?.nationalite || "",
    situationFamiliale: candidat?.situationFamiliale || "",
    permisConduire: candidat?.permisConduire || "",
    bio: candidat?.bio || "",
    image: candidat?.image || "",
    competences:
      candidat?.candidatCompetences?.map((c: any) => c.competence) || [],
  });

  const [competences, setCompetences] = useState<string[]>(
    candidat?.candidatCompetences?.map((c: any) => c.competence) || []
  );
  const [nouvelleCompetence, setNouvelleCompetence] = useState("");
  const [showCompetenceInput, setShowCompetenceInput] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddCompetence = (competence: string) => {
    if (competence && !competences.includes(competence)) {
      setCompetences([...competences, competence]);
      setNouvelleCompetence("");
      setShowCompetenceInput(false);
    }
  };

  const handleRemoveCompetence = (competence: string) => {
    setCompetences(competences.filter((c) => c !== competence));
  };
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validation de la taille du fichier (max 5MB pour les logos)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        toast.error("Seuls les fichiers image sont acceptés");
        return;
      }

      const uploadedFile = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          console.log(progress);
        },
      });

      if (uploadedFile) {
        // console.log(uploadedFile);
        setFormData((prev) => ({ ...prev, image: uploadedFile.url }));
      } else {
        toast.error("Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (
    file: File,
    type: "image" | "cv" | "lettre"
  ) => {
    if (file) {
      if (type === "image") {
        await handleImageUpload(file);
        // setFile(file);
      }
    }
  };

  const handleSave = async () => {
    // console.log("handleSave", { ...formData, competences: competences });
    setSaving(true);
    try {
      const response = await updateCandidat(candidat?.id, {
        ...formData,
        dateNaissance: formData.dateNaissance
          ? new Date(formData.dateNaissance)
          : null,
        competences: competences,
      });
      if (response.success) {
        toast.success("Profil sauvegardé");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  // console.log(candidat);

  // console.log(formData.bio);

  return (
    <div className="space-y-6 pb-6">
      {/* Photo de profil */}
      <Card>
        <CardHeader>
          <CardTitle>Photo de profil</CardTitle>
          <CardDescription>
            Téléchargez une photo de profil pour améliorer votre visibilité
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={formData.image}
              alt={`${formData.prenom} ${formData.nom}`}
            />
            <AvatarFallback>
              {formData.prenom?.[0] || ""}
              {formData.nom?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("image-upload")?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Changer la photo
            </Button>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFile(file);
                if (file) {
                  handleFileUpload(file, "image");
                }
              }}
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG ou GIF. Max 5MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle>Informations personnelles</CardTitle>
          <CardDescription>
            Vos informations de base et coordonnées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom *</Label>
              <Input
                id="nom"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                placeholder="Votre nom"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleInputChange}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              placeholder="123 Rue Example"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                name="ville"
                value={formData.ville}
                onChange={handleInputChange}
                placeholder="Paris"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pays">Pays *</Label>
              <Input
                id="pays"
                name="pays"
                value={formData.pays}
                onChange={handleInputChange}
                placeholder="France"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations détaillées */}
      <Card>
        <CardHeader>
          <CardTitle>Informations détaillées</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateNaissance">Date de naissance *</Label>
              <Input
                id="dateNaissance"
                name="dateNaissance"
                type="date"
                value={formData.dateNaissance}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalite">Nationalité</Label>
              <Input
                id="nationalite"
                name="nationalite"
                value={formData.nationalite}
                onChange={handleInputChange}
                placeholder="Française"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="situationFamiliale">Situation familiale</Label>
              <select
                id="situationFamiliale"
                name="situationFamiliale"
                value={formData.situationFamiliale}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Sélectionner</option>
                {SITUATIONS_FAMILIALES.map((sit) => (
                  <option key={sit} value={sit}>
                    {sit}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="permisConduire">Permis de conduire</Label>
              <Input
                id="permisConduire"
                name="permisConduire"
                value={formData.permisConduire}
                onChange={handleInputChange}
                placeholder="B, A, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Biographie */}
      <Card>
        <CardHeader>
          <CardTitle>Biographieww</CardTitle>
          <CardDescription>
            Décrivez-vous en quelques lignes (description personnelle et
            professionnelle)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Parlez-nous de vous, de votre parcours, de vos aspirations..."
            className="min-h-[120px]"
          />
        </CardContent>
      </Card>

      {/* Compétences */}
      <Card>
        <CardHeader>
          <CardTitle>Compétences</CardTitle>
          <CardDescription>
            Ajoutez vos compétences professionnelles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Compétences sélectionnées */}
          <div className="flex flex-wrap gap-2">
            {competences.map((comp) => (
              <Badge
                key={comp}
                variant="secondary"
                className="flex items-center gap-2 py-1"
              >
                {comp}
                <button
                  type="button"
                  onClick={() => handleRemoveCompetence(comp)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>

          {/* Liste prédéfinie */}
          <div className="space-y-2">
            <Label>Compétences suggérées</Label>
            <div className="flex flex-wrap gap-2">
              {COMPETENCES_PREDEFINIES.filter(
                (c) => !competences.includes(c)
              ).map((comp) => (
                <Badge
                  key={comp}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleAddCompetence(comp)}
                >
                  + {comp}
                </Badge>
              ))}
            </div>
          </div>

          {/* Ajout personnalisé */}
          {showCompetenceInput ? (
            <div className="flex gap-2">
              <Input
                value={nouvelleCompetence}
                onChange={(e) => setNouvelleCompetence(e.target.value)}
                placeholder="Nouvelle compétence"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCompetence(nouvelleCompetence);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  handleAddCompetence(nouvelleCompetence);
                }}
              >
                Ajouter
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowCompetenceInput(false);
                  setNouvelleCompetence("");
                }}
              >
                Annuler
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCompetenceInput(true)}
            >
              + Ajouter une compétence personnalisée
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            "Enregistrement..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
