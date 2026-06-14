"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCandidat } from "@/lib/hooks/use-candidat";
import { useCandidatures } from "@/lib/hooks/use-candidatures";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IconCalendar, IconBriefcase, IconMapPin, IconPlus,
  IconNotes, IconTrash, IconBuilding, IconExternalLink,
} from "@tabler/icons-react";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

const STATUT_COLORS: Record<string, string> = {
  ACCEPTE: "bg-green-100 text-green-800",
  EN_REVISION: "bg-blue-100 text-blue-800",
  EN_ATTENTE: "bg-yellow-100 text-yellow-800",
  REFUSE: "bg-red-100 text-red-800",
};
const STATUT_LABELS: Record<string, string> = {
  ACCEPTE: "Accepté", EN_REVISION: "En révision", EN_ATTENTE: "En attente", REFUSE: "Refusé",
};

const ENTRETIEN_TYPE_LABELS: Record<string, string> = {
  VISIO: "Visio", TELEPHONE: "Téléphone", PRESENTIEL: "Présentiel",
};
const ENTRETIEN_STATUT_LABELS: Record<string, string> = {
  PLANIFIE: "Planifié", REALISE: "Réalisé", ANNULE: "Annulé",
};
const ENTRETIEN_STATUT_COLORS: Record<string, string> = {
  PLANIFIE: "bg-blue-100 text-blue-800",
  REALISE: "bg-green-100 text-green-800",
  ANNULE: "bg-red-100 text-red-800",
};

function formatEntretienDate(date: string | Date) {
  return new Date(date).toLocaleString("fr-FR", {
    weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

export default function EntretiensPage() {
  const { candidat } = useCandidat();
  const { candidatures = [] } = useCandidatures(candidat?.id);
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [entretienDate, setEntretienDate] = useState<Date | undefined>(undefined);
  const [dateOpen, setDateOpen] = useState(false);

  const accepted = (candidatures as any[]).filter((c) =>
    ["ACCEPTE", "EN_REVISION"].includes(c.status)
  );

  const { data: notesData } = useQuery({
    queryKey: ["candidature-notes", selectedId],
    queryFn: async () => {
      const res = await fetch(`/api/candidatures/${selectedId}/notes`);
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!selectedId,
  });

  const addNote = useMutation({
    mutationFn: async ({ id, content, entretienDate }: { id: string; content: string; entretienDate?: Date }) => {
      const res = await fetch(`/api/candidatures/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, entretienDate: entretienDate ? entretienDate.toISOString() : null }),
      });
      if (!res.ok) throw new Error("Erreur");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidature-notes", selectedId] });
      setNewNote("");
      setEntretienDate(undefined);
      toast.success("Note ajoutée");
    },
  });

  const deleteNote = useMutation({
    mutationFn: async ({ appId, noteId }: { appId: string; noteId: string }) => {
      await fetch(`/api/candidatures/${appId}/notes?noteId=${noteId}`, { method: "DELETE" });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidature-notes", selectedId] }),
  });

  const handleAddNote = () => {
    if (!selectedId || !newNote.trim()) return;
    addNote.mutate({ id: selectedId, content: newNote, entretienDate });
  };

  const selected = (candidatures as any[]).find((c) => c.id === selectedId);

  return (
    <>
      <SiteHeader title="Entretiens & Notes" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:py-6 px-4 lg:px-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <IconCalendar className="h-6 w-6" />
              Entretiens & Notes
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivez vos entretiens et ajoutez des notes personnelles sur vos candidatures.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Liste candidatures */}
            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Candidatures actives ({accepted.length})
              </h2>
              {(candidatures as any[]).length === 0 ? (
                <Card><CardContent className="py-8 text-center text-sm text-muted-foreground">Aucune candidature</CardContent></Card>
              ) : (
                (candidatures as any[]).map((c: any) => (
                  <Card
                    key={c.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${selectedId === c.id ? "border-[#a590ff] bg-purple-50/30" : ""}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <IconBriefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{c.jobOffer?.title ?? "—"}</p>
                          <p className="text-xs text-muted-foreground truncate">{c.jobOffer?.company ?? ""}</p>
                        </div>
                        <Badge className={`text-xs border-0 shrink-0 ${STATUT_COLORS[c.status] ?? "bg-gray-100 text-gray-700"}`}>
                          {STATUT_LABELS[c.status] ?? c.status}
                        </Badge>
                      </div>
                      {(() => {
                        const upcoming = (c.entretiens as { dateHeure: string; statut: string }[] | undefined)?.find(
                          (e) => e.statut === "PLANIFIE"
                        );
                        return upcoming ? (
                          <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 mt-1.5 pl-6">
                            <IconCalendar className="h-3 w-3" />
                            Entretien le {formatEntretienDate(upcoming.dateHeure)}
                          </div>
                        ) : null;
                      })()}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Panneau notes */}
            <div className="lg:col-span-2">
              {!selectedId ? (
                <Card className="h-full border-dashed">
                  <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    Sélectionnez une candidature pour voir les notes
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <IconNotes className="h-5 w-5" />
                      {selected?.jobOffer?.title ?? ""}
                      {selected?.jobOffer?.company && (
                        <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                          <IconBuilding className="h-3.5 w-3.5" />{selected.jobOffer.company}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Entretiens planifiés par le recruteur */}
                    {selected?.entretiens && selected.entretiens.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                          <IconCalendar className="h-4 w-4" />
                          Entretien(s) planifié(s)
                        </h3>
                        {(selected.entretiens as {
                          id: string; titre: string; dateHeure: string;
                          type: string; lieu: string | null; statut: string;
                        }[]).map((e) => (
                          <div key={e.id} className="flex items-center justify-between gap-2 p-3 bg-muted/40 rounded-lg">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{e.titre}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {formatEntretienDate(e.dateHeure)}
                                {e.lieu && !e.lieu.startsWith("http") && ` · ${e.lieu}`}
                              </p>
                              {e.lieu && e.lieu.startsWith("http") && (
                                <a
                                  href={e.lieu}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400 mt-0.5"
                                >
                                  <IconExternalLink className="h-3 w-3" />
                                  Rejoindre la réunion
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="outline" className="text-xs">
                                {ENTRETIEN_TYPE_LABELS[e.type] ?? e.type}
                              </Badge>
                              <Badge className={`text-xs border-0 ${ENTRETIEN_STATUT_COLORS[e.statut] ?? "bg-gray-100 text-gray-700"}`}>
                                {ENTRETIEN_STATUT_LABELS[e.statut] ?? e.statut}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Ajouter une note */}
                    <div className="space-y-2 p-3 bg-muted/40 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Date d'entretien (optionnel)</Label>
                          <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="h-8 w-full justify-between text-xs font-normal">
                                {entretienDate
                                  ? entretienDate.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                                  : "Sélectionner une date"}
                                <ChevronDownIcon className="h-3.5 w-3.5 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={entretienDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                  setEntretienDate(date);
                                  setDateOpen(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                      <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Notez vos impressions, questions posées, salaire discuté..."
                        className="min-h-[80px] text-sm"
                      />
                      <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim() || addNote.isPending} className="bg-[#a590ff] text-white hover:bg-[#a590ff]/90">
                        <IconPlus className="h-3.5 w-3.5 mr-1.5" />
                        Ajouter la note
                      </Button>
                    </div>

                    {/* Notes existantes */}
                    <div className="space-y-2">
                      {!notesData || notesData.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Aucune note pour cette candidature</p>
                      ) : (
                        notesData.map((note: any) => (
                          <div key={note.id} className="flex items-start gap-2 p-3 bg-background border rounded-lg">
                            <div className="flex-1 min-w-0">
                              {note.entretienDate && (
                                <Badge variant="outline" className="text-xs mb-1.5 gap-1">
                                  <IconCalendar className="h-3 w-3" />
                                  Entretien du {new Date(note.entretienDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                                </Badge>
                              )}
                              <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(note.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                            <Button variant="ghost" size="sm" className="shrink-0 h-7 w-7 p-0"
                              onClick={() => deleteNote.mutate({ appId: selectedId, noteId: note.id })}>
                              <IconTrash className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
