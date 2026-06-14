"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  IconCalendar,
  IconPlus,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconVideo,
  IconPhone,
  IconBuilding,
  IconStar,
  IconExternalLink,
} from "@tabler/icons-react";
import { toast } from "sonner";

interface Entretien {
  id: string;
  applicationId: string;
  titre: string;
  dateHeure: string;
  type: "PRESENTIEL" | "VISIO" | "TELEPHONE";
  lieu: string | null;
  notes: string | null;
  feedback: string | null;
  evaluation: number | null;
  statut: "PLANIFIE" | "REALISE" | "ANNULE";
  createdAt: string;
  application: {
    candidat: { nom: string; prenom: string; image: string | null };
    jobOffer: { title: string };
  };
}

const TYPE_ICONS = {
  VISIO: <IconVideo className="h-4 w-4" />,
  TELEPHONE: <IconPhone className="h-4 w-4" />,
  PRESENTIEL: <IconBuilding className="h-4 w-4" />,
};

const TYPE_LABELS = {
  VISIO: "Visio",
  TELEPHONE: "Téléphone",
  PRESENTIEL: "Présentiel",
};
const STATUT_LABELS = {
  PLANIFIE: "Planifié",
  REALISE: "Réalisé",
  ANNULE: "Annulé",
};
const STATUT_COLORS: Record<string, string> = {
  PLANIFIE: "bg-blue-100 text-blue-800",
  REALISE: "bg-green-100 text-green-800",
  ANNULE: "bg-red-100 text-red-800",
};

type EntretienFormType = {
  applicationId: string;
  titre: string;
  dateHeure: string;
  type: "VISIO" | "TELEPHONE" | "PRESENTIEL";
  lieu: string;
  notes: string;
};

const EMPTY_FORM: EntretienFormType = {
  applicationId: "",
  titre: "",
  dateHeure: "",
  type: "VISIO",
  lieu: "",
  notes: "",
};

export default function EntretiensPage() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Entretien | null>(null);
  const [feedbackTarget, setFeedbackTarget] = useState<Entretien | null>(null);
  const [form, setForm] = useState<EntretienFormType>(EMPTY_FORM);
  const [offerId, setOfferId] = useState("");
  const [feedback, setFeedback] = useState("");
  const [evaluation, setEvaluation] = useState(0);
  const [filterStatut, setFilterStatut] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["entretiens", recruteurId],
    queryFn: async () => {
      const res = await fetch(`/api/entretiens?recruteurId=${recruteurId}`);
      const json = await res.json();
      return json.data as Entretien[];
    },
    enabled: !!recruteurId,
  });

  const { candidaturesRecruteur } = useCandidatures(recruteurId ?? undefined);

  // Offres uniques issues des candidatures, pour le sélecteur "Offre" du formulaire
  const offers = Array.from(
    new Map(
      (candidaturesRecruteur ?? [])
        .filter(
          (c: { jobOffer?: { id: string; title: string } }) => c.jobOffer?.id,
        )
        .map((c: { jobOffer: { id: string; title: string } }) => [
          c.jobOffer.id,
          c.jobOffer,
        ]),
    ).values(),
  ) as { id: string; title: string }[];

  // Candidatures de l'offre sélectionnée, pour le sélecteur "Candidat"
  const candidaturesForOffer = (candidaturesRecruteur ?? []).filter(
    (c: { jobOffer?: { id: string } }) => c.jobOffer?.id === offerId,
  );

  const createMutation = useMutation({
    mutationFn: async (payload: typeof EMPTY_FORM) => {
      const res = await fetch("/api/entretiens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Erreur création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entretiens", recruteurId] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setOfferId("");
      toast.success("Entretien planifié");
    },
    onError: () => toast.error("Impossible de créer l'entretien"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      ...data
    }: {
      id: string;
      [k: string]: unknown;
    }) => {
      const res = await fetch(`/api/entretiens/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur mise à jour");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entretiens", recruteurId] });
      setEditTarget(null);
      setFeedbackTarget(null);
      toast.success("Entretien mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/entretiens/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entretiens", recruteurId] });
      toast.success("Entretien supprimé");
    },
    onError: () => toast.error("Impossible de supprimer l'entretien"),
  });

  const entretiens = data ?? [];
  const filtered =
    filterStatut === "all"
      ? entretiens
      : entretiens.filter((e) => e.statut === filterStatut);

  const upcoming = entretiens.filter(
    (e) => e.statut === "PLANIFIE" && new Date(e.dateHeure) >= new Date(),
  ).length;

  return (
    <>
      <SiteHeader title="Entretiens" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <IconCalendar className="h-6 w-6" />
                  Entretiens
                </h1>
                <p className="text-muted-foreground mt-1">
                  Planifiez, suivez et évaluez vos entretiens
                </p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <IconPlus className="h-4 w-4" />
                Planifier un entretien
              </Button>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <IconCalendar className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">À venir</p>
                    <p className="text-2xl font-bold">{upcoming}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <IconCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Réalisés</p>
                    <p className="text-2xl font-bold">
                      {entretiens.filter((e) => e.statut === "REALISE").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-3">
                  <IconX className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Annulés</p>
                    <p className="text-2xl font-bold">
                      {entretiens.filter((e) => e.statut === "ANNULE").length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtre */}
            <div className="mb-4 flex gap-2">
              {["all", "PLANIFIE", "REALISE", "ANNULE"].map((s) => (
                <Button
                  key={s}
                  variant={filterStatut === s ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatut(s)}
                >
                  {s === "all"
                    ? "Tous"
                    : STATUT_LABELS[s as keyof typeof STATUT_LABELS]}
                </Button>
              ))}
            </div>

            {/* Liste */}
            {isLoading ? (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                Chargement...
              </div>
            ) : filtered.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconCalendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Aucun entretien trouvé.
                  </p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => setShowCreate(true)}
                  >
                    Planifier le premier entretien
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filtered.map((e) => (
                  <Card
                    key={e.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {TYPE_ICONS[e.type]}
                            <CardTitle className="text-base">
                              {e.titre}
                            </CardTitle>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUT_COLORS[e.statut]}`}
                            >
                              {STATUT_LABELS[e.statut]}
                            </span>
                          </div>
                          <CardDescription>
                            {e.application.candidat.prenom}{" "}
                            {e.application.candidat.nom} —{" "}
                            {e.application.jobOffer.title}
                          </CardDescription>
                        </div>
                        <div className="flex gap-1">
                          {e.statut === "PLANIFIE" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setFeedbackTarget(e);
                                  setFeedback(e.feedback ?? "");
                                  setEvaluation(e.evaluation ?? 0);
                                }}
                              >
                                Feedback
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: e.id,
                                    statut: "REALISE",
                                  })
                                }
                              >
                                <IconCheck className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  updateMutation.mutate({
                                    id: e.id,
                                    statut: "ANNULE",
                                  })
                                }
                              >
                                <IconX className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditTarget(e)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMutation.mutate(e.id)}
                          >
                            <IconTrash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconCalendar className="h-4 w-4" />
                          {new Date(e.dateHeure).toLocaleString("fr-FR", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <Badge variant="outline">{TYPE_LABELS[e.type]}</Badge>
                        {e.lieu && (
                          e.lieu.startsWith("http") ? (
                            <a
                              href={e.lieu}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                            >
                              <IconExternalLink className="h-3.5 w-3.5" />
                              Rejoindre la réunion
                            </a>
                          ) : (
                            <span>{e.lieu}</span>
                          )
                        )}
                        {e.evaluation !== null && (
                          <span className="flex items-center gap-1">
                            <IconStar className="h-4 w-4 text-yellow-500" />
                            {e.evaluation}/5
                          </span>
                        )}
                      </div>
                      {e.notes && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {e.notes}
                        </p>
                      )}
                      {e.feedback && (
                        <p className="mt-1 text-sm italic text-muted-foreground line-clamp-2">
                          Feedback : {e.feedback}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog créer / modifier */}
      <Dialog
        open={showCreate || !!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreate(false);
            setEditTarget(null);
            setForm(EMPTY_FORM);
            setOfferId("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Modifier l'entretien" : "Planifier un entretien"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {editTarget ? (
              <div>
                <Label>Candidature</Label>
                <Input
                  disabled
                  value={`${editTarget.application.candidat.prenom} ${editTarget.application.candidat.nom} — ${editTarget.application.jobOffer.title}`}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Offre *</Label>
                  <Select
                    value={offerId}
                    onValueChange={(v) => {
                      setOfferId(v);
                      setForm({ ...form, applicationId: "" });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sélectionner une offre" />
                    </SelectTrigger>
                    <SelectContent>
                      {offers.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Candidat *</Label>
                  <Select
                    value={form.applicationId}
                    onValueChange={(v) =>
                      setForm({ ...form, applicationId: v })
                    }
                    disabled={!offerId}
                  >
                    <SelectTrigger
                      className="
                    w-full"
                    >
                      <SelectValue
                        placeholder={
                          offerId
                            ? "Sélectionner un candidat"
                            : "Choisir une offre d'abord"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {candidaturesForOffer.map(
                        (c: {
                          id: string;
                          candidat: { nom: string; prenom: string };
                        }) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.candidat.prenom} {c.candidat.nom}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div>
              <Label>Titre *</Label>
              <Input
                value={editTarget ? editTarget.titre : form.titre}
                onChange={(e) =>
                  editTarget
                    ? setEditTarget({ ...editTarget, titre: e.target.value })
                    : setForm({ ...form, titre: e.target.value })
                }
                placeholder="Ex: Entretien technique"
              />
            </div>
            <div>
              <Label>Date et heure *</Label>
              <Input
                type="datetime-local"
                value={
                  editTarget
                    ? new Date(editTarget.dateHeure).toISOString().slice(0, 16)
                    : form.dateHeure
                }
                onChange={(e) =>
                  editTarget
                    ? setEditTarget({
                        ...editTarget,
                        dateHeure: e.target.value,
                      })
                    : setForm({ ...form, dateHeure: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={editTarget ? editTarget.type : form.type}
                  onValueChange={(v: "VISIO" | "TELEPHONE" | "PRESENTIEL") =>
                    editTarget
                      ? setEditTarget({ ...editTarget, type: v })
                      : setForm({ ...form, type: v })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISIO">Visio</SelectItem>
                    <SelectItem value="TELEPHONE">Téléphone</SelectItem>
                    <SelectItem value="PRESENTIEL">Présentiel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lieu / Lien</Label>
                <Input
                  value={editTarget ? (editTarget.lieu ?? "") : form.lieu}
                  onChange={(e) =>
                    editTarget
                      ? setEditTarget({ ...editTarget, lieu: e.target.value })
                      : setForm({ ...form, lieu: e.target.value })
                  }
                  placeholder="Lien Meet ou adresse"
                />
              </div>
            </div>
            <div>
              <Label>Notes internes</Label>
              <Textarea
                value={editTarget ? (editTarget.notes ?? "") : form.notes}
                onChange={(e) =>
                  editTarget
                    ? setEditTarget({ ...editTarget, notes: e.target.value })
                    : setForm({ ...form, notes: e.target.value })
                }
                placeholder="Points à aborder, informations utiles..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setEditTarget(null);
                setForm(EMPTY_FORM);
                setOfferId("");
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editTarget) {
                  updateMutation.mutate({
                    id: editTarget.id,
                    titre: editTarget.titre,
                    dateHeure: editTarget.dateHeure,
                    type: editTarget.type,
                    lieu: editTarget.lieu,
                    notes: editTarget.notes,
                  });
                } else {
                  createMutation.mutate(form);
                }
              }}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                (!editTarget &&
                  (!form.applicationId ||
                    !form.titre.trim() ||
                    !form.dateHeure))
              }
            >
              {editTarget ? "Enregistrer" : "Planifier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog feedback */}
      <Dialog
        open={!!feedbackTarget}
        onOpenChange={(open) => {
          if (!open) setFeedbackTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Feedback — {feedbackTarget?.titre}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Évaluation</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setEvaluation(n)}
                    className={`p-1 rounded transition-colors ${
                      n <= evaluation
                        ? "text-yellow-500"
                        : "text-muted-foreground"
                    }`}
                  >
                    <IconStar className="h-6 w-6" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Commentaire</Label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Impressions, points forts, points faibles..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackTarget(null)}>
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (!feedbackTarget) return;
                updateMutation.mutate({
                  id: feedbackTarget.id,
                  feedback,
                  evaluation,
                  statut: "REALISE",
                });
              }}
              disabled={updateMutation.isPending}
            >
              Enregistrer le feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
