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
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Target, CheckCircle2 } from "lucide-react";

interface ObjectifsSectionProps {
  candidatId?: string;
}

interface Objectif {
  id?: string;
  titre: string;
  description: string;
  categorie: string;
  dateLimite: string;
  progression: number;
  etapes?: string[];
}

export function ObjectifsSection({ candidatId }: ObjectifsSectionProps) {
  const [objectifs, setObjectifs] = useState<Objectif[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingObjectif, setEditingObjectif] = useState<Objectif | null>(
    null
  );

  const [objectifForm, setObjectifForm] = useState<Objectif>({
    titre: "",
    description: "",
    categorie: "",
    dateLimite: "",
    progression: 0,
    etapes: [],
  });

  const [nouvelleEtape, setNouvelleEtape] = useState("");

  useEffect(() => {
    if (candidatId) {
      fetchObjectifs();
    }
  }, [candidatId]);

  const fetchObjectifs = async () => {
    try {
      const response = await fetch(`/api/candidats/${candidatId}/objectifs`);
      if (response.ok) {
        const data = await response.json();
        setObjectifs(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des objectifs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingObjectif?.id) {
        // Mise à jour
        const response = await fetch(`/api/objectifs/${editingObjectif.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...objectifForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchObjectifs();
          resetForm();
        }
      } else {
        // Création
        const response = await fetch(`/api/objectifs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...objectifForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchObjectifs();
          resetForm();
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet objectif ?")) {
      return;
    }
    try {
      const response = await fetch(`/api/objectifs/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchObjectifs();
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleUpdateProgression = async (id: string, progression: number) => {
    try {
      const response = await fetch(`/api/objectifs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progression: Math.min(100, Math.max(0, progression)) }),
      });
      if (response.ok) {
        await fetchObjectifs();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const resetForm = () => {
    setObjectifForm({
      titre: "",
      description: "",
      categorie: "",
      dateLimite: "",
      progression: 0,
      etapes: [],
    });
    setEditingObjectif(null);
    setShowForm(false);
    setNouvelleEtape("");
  };

  const startEdit = (objectif: Objectif) => {
    setObjectifForm(objectif);
    setEditingObjectif(objectif);
    setShowForm(true);
  };

  const addEtape = () => {
    if (nouvelleEtape && !objectifForm.etapes?.includes(nouvelleEtape)) {
      setObjectifForm({
        ...objectifForm,
        etapes: [...(objectifForm.etapes || []), nouvelleEtape],
      });
      setNouvelleEtape("");
    }
  };

  const removeEtape = (etape: string) => {
    setObjectifForm({
      ...objectifForm,
      etapes: objectifForm.etapes?.filter((e) => e !== etape) || [],
    });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">Objectifs de Carrière</h3>
          <p className="text-muted-foreground">
            Définissez et suivez vos objectifs professionnels
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvel objectif
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingObjectif ? "Modifier l'objectif" : "Nouvel objectif"}
            </CardTitle>
            <CardDescription>
              Créez un objectif professionnel avec des étapes intermédiaires
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre *</Label>
              <Input
                value={objectifForm.titre}
                onChange={(e) =>
                  setObjectifForm({ ...objectifForm, titre: e.target.value })
                }
                placeholder="Obtenir une certification AWS..."
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={objectifForm.description}
                onChange={(e) =>
                  setObjectifForm({
                    ...objectifForm,
                    description: e.target.value,
                  })
                }
                placeholder="Décrivez votre objectif en détail..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Input
                  value={objectifForm.categorie}
                  onChange={(e) =>
                    setObjectifForm({
                      ...objectifForm,
                      categorie: e.target.value,
                    })
                  }
                  placeholder="Formation, Certification, Promotion..."
                />
              </div>
              <div className="space-y-2">
                <Label>Date limite *</Label>
                <Input
                  type="date"
                  value={objectifForm.dateLimite}
                  onChange={(e) =>
                    setObjectifForm({
                      ...objectifForm,
                      dateLimite: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Progression (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={objectifForm.progression}
                  onChange={(e) =>
                    setObjectifForm({
                      ...objectifForm,
                      progression: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-24"
                />
                <Progress value={objectifForm.progression} className="flex-1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Étapes intermédiaires</Label>
              <div className="flex gap-2">
                <Input
                  value={nouvelleEtape}
                  onChange={(e) => setNouvelleEtape(e.target.value)}
                  placeholder="Ajouter une étape"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEtape();
                    }
                  }}
                />
                <Button type="button" onClick={addEtape} variant="outline">
                  Ajouter
                </Button>
              </div>
              {objectifForm.etapes && objectifForm.etapes.length > 0 && (
                <div className="space-y-2 mt-2">
                  {objectifForm.etapes.map((etape, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted rounded-md"
                    >
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{etape}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeEtape(etape)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {objectifs.length === 0 && !showForm ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore défini d&apos;objectif
            </p>
            <Button
              className="mt-4"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Créer un objectif
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {objectifs.map((objectif) => {
            const dateLimite = new Date(objectif.dateLimite);
            const aujourdHui = new Date();
            const joursRestants = Math.ceil(
              (dateLimite.getTime() - aujourdHui.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={objectif.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {objectif.titre}
                      </CardTitle>
                      {objectif.categorie && (
                        <Badge variant="secondary" className="mt-2">
                          {objectif.categorie}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(objectif)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          objectif.id && handleDelete(objectif.id)
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {objectif.description && (
                    <p className="text-sm text-muted-foreground">
                      {objectif.description}
                    </p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progression</span>
                      <span className="font-semibold">
                        {objectif.progression}%
                      </span>
                    </div>
                    <Progress value={objectif.progression} />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          objectif.id &&
                          handleUpdateProgression(
                            objectif.id,
                            objectif.progression - 10
                          )
                        }
                        disabled={objectif.progression <= 0}
                      >
                        -10%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          objectif.id &&
                          handleUpdateProgression(
                            objectif.id,
                            objectif.progression + 10
                          )
                        }
                        disabled={objectif.progression >= 100}
                      >
                        +10%
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div>
                      <span className="text-muted-foreground">
                        Date limite :{" "}
                      </span>
                      <span className="font-medium">
                        {dateLimite.toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <Badge
                      variant={
                        joursRestants < 0
                          ? "destructive"
                          : joursRestants < 7
                          ? "default"
                          : "secondary"
                      }
                    >
                      {joursRestants < 0
                        ? "En retard"
                        : `${joursRestants} jour${
                            joursRestants > 1 ? "s" : ""
                          } restant${joursRestants > 1 ? "s" : ""}`}
                    </Badge>
                  </div>

                  {objectif.etapes && objectif.etapes.length > 0 && (
                    <div className="space-y-2 pt-2 border-t">
                      <Label className="text-sm font-semibold">Étapes</Label>
                      <div className="space-y-1">
                        {objectif.etapes.map((etape, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                            <span>{etape}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

