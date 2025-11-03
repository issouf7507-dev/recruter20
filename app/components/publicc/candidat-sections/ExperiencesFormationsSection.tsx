"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Briefcase,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface ExperiencesFormationsSectionProps {
  candidatId?: string;
}

interface Experience {
  id?: string;
  poste: string;
  entreprise: string;
  localisation: string;
  typeContrat: string;
  dateDebut: string;
  dateFin?: string;
  description: string;
}

interface Formation {
  id?: string;
  diplome: string;
  etablissement: string;
  domaine: string;
  dateDebut: string;
  dateFin?: string;
  description: string;
}

export function ExperiencesFormationsSection({
  candidatId,
}: ExperiencesFormationsSectionProps) {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExperienceForm, setShowExperienceForm] = useState(false);
  const [showFormationForm, setShowFormationForm] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(
    null
  );
  const [editingFormation, setEditingFormation] = useState<Formation | null>(
    null
  );

  const [experienceForm, setExperienceForm] = useState<Experience>({
    poste: "",
    entreprise: "",
    localisation: "",
    typeContrat: "",
    dateDebut: "",
    dateFin: "",
    description: "",
  });

  const [formationForm, setFormationForm] = useState<Formation>({
    diplome: "",
    etablissement: "",
    domaine: "",
    dateDebut: "",
    dateFin: "",
    description: "",
  });

  useEffect(() => {
    if (candidatId) {
      fetchExperiences();
      fetchFormations();
    }
  }, [candidatId]);

  const fetchExperiences = async () => {
    try {
      const response = await fetch(`/api/candidats/${candidatId}/experiences`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setExperiences(result.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des expériences:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await fetch(`/api/candidats/${candidatId}/formations`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setFormations(result.data);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des formations:", error);
    }
  };

  const handleSaveExperience = async () => {
    // Validation
    if (
      !experienceForm.poste ||
      !experienceForm.entreprise ||
      !experienceForm.dateDebut
    ) {
      alert(
        "Veuillez remplir tous les champs obligatoires (Poste, Entreprise, Date de début)"
      );
      return;
    }

    try {
      if (editingExperience?.id) {
        // Mise à jour
        const response = await fetch(
          `/api/experiences/${editingExperience.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(experienceForm),
          }
        );
        if (response.ok) {
          await fetchExperiences();
          resetExperienceForm();
        } else {
          const error = await response.json();
          alert(
            `Erreur: ${
              error.error || "Impossible de mettre à jour l'expérience"
            }`
          );
        }
      } else {
        // Création
        const response = await fetch(`/api/experiences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...experienceForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchExperiences();
          resetExperienceForm();
        } else {
          const error = await response.json();
          alert(`Erreur: ${error.error || "Impossible de créer l'expérience"}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const handleSaveFormation = async () => {
    // Validation
    if (
      !formationForm.diplome ||
      !formationForm.etablissement ||
      !formationForm.dateDebut
    ) {
      alert(
        "Veuillez remplir tous les champs obligatoires (Diplôme, Établissement, Date de début)"
      );
      return;
    }

    try {
      if (editingFormation?.id) {
        // Mise à jour
        const response = await fetch(`/api/formations/${editingFormation.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formationForm),
        });
        if (response.ok) {
          await fetchFormations();
          resetFormationForm();
        } else {
          const error = await response.json();
          alert(
            `Erreur: ${
              error.error || "Impossible de mettre à jour la formation"
            }`
          );
        }
      } else {
        // Création
        const response = await fetch(`/api/formations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formationForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchFormations();
          resetFormationForm();
        } else {
          const error = await response.json();
          alert(`Erreur: ${error.error || "Impossible de créer la formation"}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette expérience ?")) {
      return;
    }
    try {
      const response = await fetch(`/api/experiences/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchExperiences();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleDeleteFormation = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?")) {
      return;
    }
    try {
      const response = await fetch(`/api/formations/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchFormations();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const resetExperienceForm = () => {
    setExperienceForm({
      poste: "",
      entreprise: "",
      localisation: "",
      typeContrat: "",
      dateDebut: "",
      dateFin: "",
      description: "",
    });
    setEditingExperience(null);
    setShowExperienceForm(false);
  };

  const resetFormationForm = () => {
    setFormationForm({
      diplome: "",
      etablissement: "",
      domaine: "",
      dateDebut: "",
      dateFin: "",
      description: "",
    });
    setEditingFormation(null);
    setShowFormationForm(false);
  };

  const startEditExperience = (exp: Experience) => {
    setExperienceForm({
      ...exp,
      dateDebut: exp.dateDebut
        ? new Date(exp.dateDebut).toISOString().split("T")[0]
        : "",
      dateFin: exp.dateFin
        ? new Date(exp.dateFin).toISOString().split("T")[0]
        : "",
    });
    setEditingExperience(exp);
    setShowExperienceForm(true);
  };

  const startEditFormation = (form: Formation) => {
    setFormationForm({
      ...form,
      dateDebut: form.dateDebut
        ? new Date(form.dateDebut).toISOString().split("T")[0]
        : "",
      dateFin: form.dateFin
        ? new Date(form.dateFin).toISOString().split("T")[0]
        : "",
    });
    setEditingFormation(form);
    setShowFormationForm(true);
  };

  if (loading) {
    return (
      <div className="text-center h-[80vh] py-8 w-full flex items-center justify-center">
        {/* Chargement... */}
        <Loader2 className="h-10 w-10 animate-spin text-[#a590ff]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Expériences Professionnelles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#a590ff]">
                <Briefcase className="h-5 w-5 text-[#a590ff]" />
                Expériences Professionnelles
              </CardTitle>
              <CardDescription>
                Ajoutez vos expériences professionnelles
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetExperienceForm();
                setShowExperienceForm(true);
              }}
              size="sm"
              className="bg-[#a590ff] hover:bg-[#a590ff]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showExperienceForm && (
            <Card className="bg-muted/50 border-l-4 border-l-[#a590ff]">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Poste *</Label>
                    <Input
                      value={experienceForm.poste}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          poste: e.target.value,
                        })
                      }
                      placeholder="Développeur Full Stack"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Entreprise *</Label>
                    <Input
                      value={experienceForm.entreprise}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          entreprise: e.target.value,
                        })
                      }
                      placeholder="Nom de l'entreprise"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Localisation</Label>
                    <Input
                      value={experienceForm.localisation}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          localisation: e.target.value,
                        })
                      }
                      placeholder="Paris, France"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type de contrat</Label>

                    <Select
                      value={experienceForm.typeContrat}
                      onValueChange={(value) =>
                        setExperienceForm({
                          ...experienceForm,
                          typeContrat: value,
                        })
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
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début *</Label>
                    <Input
                      type="date"
                      value={experienceForm.dateDebut}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          dateDebut: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input
                      type="date"
                      value={experienceForm.dateFin}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          dateFin: e.target.value,
                        })
                      }
                    />
                    <Label className="text-xs text-muted-foreground">
                      Laisser vide si en cours
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={experienceForm.description}
                    onChange={(e) =>
                      setExperienceForm({
                        ...experienceForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Décrivez vos missions et réalisations..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetExperienceForm}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveExperience}
                    className="bg-[#a590ff] hover:bg-[#a590ff]/90"
                  >
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {experiences.length === 0 && !showExperienceForm ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune expérience ajoutée
            </div>
          ) : (
            <div className="space-y-3">
              {experiences.map((exp) => (
                <Card key={exp.id} className="border-l-4 border-l-[#a590ff]">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-[#a590ff]">
                          {exp.poste}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {exp.entreprise}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline" className="uppercase">
                            {exp.typeContrat}
                          </Badge>
                          <Badge variant="outline">{exp.localisation}</Badge>
                          <Badge variant="outline">
                            {new Date(exp.dateDebut).toLocaleDateString()} -{" "}
                            {exp.dateFin
                              ? new Date(exp.dateFin).toLocaleDateString()
                              : "En cours"}
                          </Badge>
                        </div>
                        {exp.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {exp.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditExperience(exp)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            exp.id && handleDeleteExperience(exp.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-[#a590ff]">
                <GraduationCap className="h-5 w-5 text-[#a590ff]" />
                Formations
              </CardTitle>
              <CardDescription>
                Ajoutez vos formations et diplômes
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                resetFormationForm();
                setShowFormationForm(true);
              }}
              size="sm"
              className="bg-[#a590ff] hover:bg-[#a590ff]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showFormationForm && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Diplôme *</Label>
                    <Input
                      value={formationForm.diplome}
                      onChange={(e) =>
                        setFormationForm({
                          ...formationForm,
                          diplome: e.target.value,
                        })
                      }
                      placeholder="Master Informatique"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Établissement *</Label>
                    <Input
                      value={formationForm.etablissement}
                      onChange={(e) =>
                        setFormationForm({
                          ...formationForm,
                          etablissement: e.target.value,
                        })
                      }
                      placeholder="Université Paris"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Domaine</Label>
                  <Input
                    value={formationForm.domaine}
                    onChange={(e) =>
                      setFormationForm({
                        ...formationForm,
                        domaine: e.target.value,
                      })
                    }
                    placeholder="Informatique, Management..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date de début *</Label>
                    <Input
                      type="date"
                      value={formationForm.dateDebut}
                      onChange={(e) =>
                        setFormationForm({
                          ...formationForm,
                          dateDebut: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de fin</Label>
                    <Input
                      type="date"
                      value={formationForm.dateFin}
                      onChange={(e) =>
                        setFormationForm({
                          ...formationForm,
                          dateFin: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formationForm.description}
                    onChange={(e) =>
                      setFormationForm({
                        ...formationForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Description de la formation..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={resetFormationForm}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveFormation}
                    className="bg-[#a590ff] hover:bg-[#a590ff]/90"
                  >
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {formations.length === 0 && !showFormationForm ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune formation ajoutée
            </div>
          ) : (
            <div className="space-y-3">
              {formations.map((form) => (
                <Card key={form.id} className="border-l-4 border-l-[#a590ff]">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-[#a590ff]">
                          {form.diplome}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {form.etablissement}
                        </p>
                        <div className="flex gap-2 mt-2">
                          {form.domaine && (
                            <Badge variant="secondary">{form.domaine}</Badge>
                          )}
                          <Badge variant="outline">
                            {new Date(form.dateDebut).toLocaleDateString()} -{" "}
                            {form.dateFin
                              ? new Date(form.dateFin).toLocaleDateString()
                              : "En cours"}
                          </Badge>
                        </div>
                        {form.description && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {form.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEditFormation(form)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            form.id && handleDeleteFormation(form.id)
                          }
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
