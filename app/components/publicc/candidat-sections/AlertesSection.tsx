"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Bell, BellOff, Eye } from "lucide-react";
import { AlerteMatchesDialog } from "./AlerteMatchesDialog";

interface AlertesSectionProps {
  candidatId?: string;
}

interface Alerte {
  id?: string;
  titre: string;
  localisation: string;
  typeContrat: string;
  salaireMin?: number;
  salaireMax?: number;
  experience: string;
  frequence: string;
  active: boolean;
  nombreResultats: number;
  motsCles?: string[];
}

const FREQUENCES = ["Quotidienne", "Hebdomadaire", "Mensuelle"];

export function AlertesSection({ candidatId }: AlertesSectionProps) {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAlerte, setEditingAlerte] = useState<Alerte | null>(null);
  const [viewingAlerteId, setViewingAlerteId] = useState<string | null>(null);
  const [viewingAlerteTitre, setViewingAlerteTitre] = useState<string>("");

  const [alerteForm, setAlerteForm] = useState<Alerte>({
    titre: "",
    localisation: "",
    typeContrat: "",
    salaireMin: undefined,
    salaireMax: undefined,
    experience: "",
    frequence: "Quotidienne",
    active: true,
    nombreResultats: 0,
    motsCles: [],
  });

  const [nouveauMotCle, setNouveauMotCle] = useState("");

  useEffect(() => {
    if (candidatId) {
      fetchAlertes();
    }
  }, [candidatId]);

  const fetchAlertes = async () => {
    try {
      const response = await fetch(`/api/candidats/${candidatId}/alertes`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Mapper les mots-clés
          const alertesWithMotsCles = result.data.map((alerte: any) => ({
            ...alerte,
            motsCles: alerte.alerteMotsCles?.map((m: any) => m.motCle) || [],
          }));
          setAlertes(alertesWithMotsCles);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des alertes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validation
    if (
      !alerteForm.titre ||
      !alerteForm.localisation ||
      !alerteForm.frequence
    ) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      if (editingAlerte?.id) {
        // Mise à jour
        const response = await fetch(`/api/alertes/${editingAlerte.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...alerteForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchAlertes();
          resetForm();
          alert("Alerte mise à jour avec succès");
        } else {
          const error = await response.json();
          alert(
            `Erreur: ${error.error || "Impossible de mettre à jour l'alerte"}`
          );
        }
      } else {
        // Création
        const response = await fetch(`/api/alertes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...alerteForm,
            candidatId,
          }),
        });
        if (response.ok) {
          await fetchAlertes();
          resetForm();
          alert("Alerte créée avec succès");
        } else {
          const error = await response.json();
          alert(`Erreur: ${error.error || "Impossible de créer l'alerte"}`);
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Une erreur est survenue lors de la sauvegarde");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette alerte ?")) {
      return;
    }
    try {
      const response = await fetch(`/api/alertes/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchAlertes();
        alert("Alerte supprimée avec succès");
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || "Impossible de supprimer l'alerte"}`);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Une erreur est survenue lors de la suppression");
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/alertes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      });
      if (response.ok) {
        await fetchAlertes();
      } else {
        const error = await response.json();
        alert(
          `Erreur: ${error.error || "Impossible de mettre à jour l'alerte"}`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Une erreur est survenue lors de la mise à jour");
    }
  };

  const resetForm = () => {
    setAlerteForm({
      titre: "",
      localisation: "",
      typeContrat: "",
      salaireMin: undefined,
      salaireMax: undefined,
      experience: "",
      frequence: "Quotidienne",
      active: true,
      nombreResultats: 0,
      motsCles: [],
    });
    setEditingAlerte(null);
    setShowForm(false);
    setNouveauMotCle("");
  };

  const startEdit = (alerte: Alerte) => {
    setAlerteForm(alerte);
    setEditingAlerte(alerte);
    setShowForm(true);
  };

  const addMotCle = () => {
    if (
      nouveauMotCle &&
      !alerteForm.motsCles?.includes(nouveauMotCle) &&
      alerteForm.motsCles
    ) {
      setAlerteForm({
        ...alerteForm,
        motsCles: [...alerteForm.motsCles, nouveauMotCle],
      });
      setNouveauMotCle("");
    }
  };

  const removeMotCle = (motCle: string) => {
    setAlerteForm({
      ...alerteForm,
      motsCles: alerteForm.motsCles?.filter((m) => m !== motCle) || [],
    });
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-[#a590ff]">Alertes Emploi</h3>
          <p className="text-muted-foreground">
            Créez des alertes pour être notifié des nouvelles offres
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle alerte
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingAlerte ? "Modifier l'alerte" : "Nouvelle alerte"}
            </CardTitle>
            <CardDescription>
              Configurez les critères de recherche pour votre alerte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre / Mots-clés de recherche *</Label>
              <Input
                value={alerteForm.titre}
                onChange={(e) =>
                  setAlerteForm({ ...alerteForm, titre: e.target.value })
                }
                placeholder="Développeur Full Stack, Data Scientist..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Localisation *</Label>
                <Input
                  value={alerteForm.localisation}
                  onChange={(e) =>
                    setAlerteForm({
                      ...alerteForm,
                      localisation: e.target.value,
                    })
                  }
                  placeholder="Paris, Remote, France..."
                />
              </div>
              <div className="space-y-2">
                <Label>Type de contrat</Label>
                <Input
                  value={alerteForm.typeContrat}
                  onChange={(e) =>
                    setAlerteForm({
                      ...alerteForm,
                      typeContrat: e.target.value,
                    })
                  }
                  placeholder="CDI, CDD, Stage..."
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Salaire minimum (€)</Label>
                <Input
                  type="number"
                  value={alerteForm.salaireMin || ""}
                  onChange={(e) =>
                    setAlerteForm({
                      ...alerteForm,
                      salaireMin: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="30000"
                />
              </div>
              <div className="space-y-2">
                <Label>Salaire maximum (€)</Label>
                <Input
                  type="number"
                  value={alerteForm.salaireMax || ""}
                  onChange={(e) =>
                    setAlerteForm({
                      ...alerteForm,
                      salaireMax: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    })
                  }
                  placeholder="60000"
                />
              </div>
              <div className="space-y-2">
                <Label>Expérience requise</Label>
                <Input
                  value={alerteForm.experience}
                  onChange={(e) =>
                    setAlerteForm({
                      ...alerteForm,
                      experience: e.target.value,
                    })
                  }
                  placeholder="Junior, Senior..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fréquence de notification *</Label>
              <select
                value={alerteForm.frequence}
                onChange={(e) =>
                  setAlerteForm({ ...alerteForm, frequence: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {FREQUENCES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Mots-clés personnalisés</Label>
              <div className="flex gap-2">
                <Input
                  value={nouveauMotCle}
                  onChange={(e) => setNouveauMotCle(e.target.value)}
                  placeholder="Ajouter un mot-clé"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMotCle();
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addMotCle}
                  variant="outline"
                  className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
                >
                  Ajouter
                </Button>
              </div>
              {alerteForm.motsCles && alerteForm.motsCles.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {alerteForm.motsCles.map((motCle) => (
                    <Badge
                      key={motCle}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      {motCle}
                      <button
                        type="button"
                        onClick={() => removeMotCle(motCle)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Switch
                  checked={alerteForm.active}
                  onCheckedChange={(checked) =>
                    setAlerteForm({ ...alerteForm, active: checked })
                  }
                />
                <Label>Alerte active</Label>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
                >
                  Enregistrer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {alertes.length === 0 && !showForm ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Vous n&apos;avez pas encore créé d&apos;alerte
            </p>
            <Button
              className="mt-4 bg-[#a590ff] text-white hover:bg-[#a590ff]/90"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              Créer une alerte
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alertes.map((alerte) => (
            <Card
              key={alerte.id}
              className={
                !alerte.active ? "opacity-60 shadow-none" : "shadow-none"
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-[#a590ff]">
                        {alerte.titre}
                      </CardTitle>
                      {alerte.active ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{alerte.localisation}</Badge>
                        {alerte.typeContrat && (
                          <Badge variant="outline">{alerte.typeContrat}</Badge>
                        )}
                        {alerte.experience && (
                          <Badge variant="outline">{alerte.experience}</Badge>
                        )}
                        <Badge variant="secondary">{alerte.frequence}</Badge>
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={alerte.active}
                      onCheckedChange={() =>
                        alerte.id &&
                        handleToggleActive(alerte.id, alerte.active)
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(alerte)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alerte.id && handleDelete(alerte.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="space-y-1">
                    {alerte.salaireMin && alerte.salaireMax && (
                      <p className="text-muted-foreground">
                        Salaire : {alerte.salaireMin}€ - {alerte.salaireMax}€
                      </p>
                    )}
                    {alerte.motsCles && alerte.motsCles.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {alerte.motsCles.map((motCle) => (
                          <Badge
                            key={motCle}
                            variant="outline"
                            className="text-xs"
                          >
                            {motCle}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setViewingAlerteId(alerte.id || null);
                      setViewingAlerteTitre(alerte.titre);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {alerte.nombreResultats} résultat
                    {alerte.nombreResultats > 1 ? "s" : ""}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog pour afficher les offres correspondantes */}
      {viewingAlerteId && (
        <AlerteMatchesDialog
          alerteId={viewingAlerteId}
          alerteTitre={viewingAlerteTitre}
          onClose={() => {
            setViewingAlerteId(null);
            setViewingAlerteTitre("");
            fetchAlertes(); // Refresh pour mettre à jour le compteur
          }}
        />
      )}
    </div>
  );
}
