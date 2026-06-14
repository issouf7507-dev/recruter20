"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  IconCalendar,
  IconCalendarEvent,
  IconCircleCheck,
  IconClock,
  IconEdit,
  IconExternalLink,
  IconHistory,
  IconListCheck,
  IconPaperclip,
  IconPlus,
  IconSend,
  IconTag,
  IconTrash,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import {
  useUpdateKanbanCard,
  useDeleteKanbanCard,
  useAddCardMembers,
  useRemoveCardMember,
  useCreateCardNote,
  useCreateCheckItem,
  useUpdateCheckItem,
  useDeleteCheckItem,
  useCreateCardDueDate,
  useUpdateCardDueDate,
  useDeleteCardDueDate,
  useCreateCardAttachment,
  useDeleteCardAttachment,
  useLabels,
  useCreateLabel,
  useAddCardLabel,
  useRemoveCardLabel,
} from "@/lib/hooks/use-kanban";
import type {
  KanbanCard,
  KanbanColumn,
  CardActivity,
} from "@/lib/hooks/use-kanban";
import { useEdgeStore } from "@/lib/edgestore";
import { useCollaborateurs } from "@/lib/hooks/use-collaborateurs";
import { useCreateEntretien } from "@/lib/hooks/use-entretiens";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_REVISION: "En révision",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-800",
  EN_REVISION: "bg-blue-100 text-blue-800",
  ACCEPTE: "bg-green-100 text-green-800",
  REFUSE: "bg-red-100 text-red-800",
};

const ENTRETIEN_TYPE_LABELS: Record<string, string> = {
  PRESENTIEL: "Présentiel",
  VISIO: "Visio",
  TELEPHONE: "Téléphone",
};

const ENTRETIEN_STATUT_LABELS: Record<string, string> = {
  PLANIFIE: "Planifié",
  REALISE: "Réalisé",
  ANNULE: "Annulé",
};

const ENTRETIEN_STATUT_COLORS: Record<string, string> = {
  PLANIFIE: "bg-blue-100 text-blue-800",
  REALISE: "bg-green-100 text-green-800",
  ANNULE: "bg-red-100 text-red-800",
};

function formatDateTime(date: Date | string) {
  try {
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function describeActivity(
  activity: CardActivity,
  columns?: { id: string; name: string }[],
): string {
  const meta = activity.meta || {};
  switch (activity.action) {
    case "card_created":
      return "a créé la carte";
    case "card_updated": {
      const fields = Object.keys(meta.changes || {}).filter(
        (k) => k !== "order" && k !== "columnId",
      );
      return fields.length > 0
        ? `a modifié la carte (${fields.join(", ")})`
        : "a modifié la carte";
    }
    case "card_moved": {
      const target = columns?.find((c) => c.id === meta.targetColumnId);
      return target
        ? `a déplacé la carte vers "${target.name}"`
        : "a déplacé la carte";
    }
    case "members_added":
      return "a ajouté un ou plusieurs membres";
    case "member_removed":
      return "a retiré un membre";
    case "label_added":
      return "a ajouté un label";
    case "label_removed":
      return "a retiré un label";
    case "note_added":
      return "a ajouté un commentaire";
    default:
      return activity.action;
  }
}

interface Props {
  card: KanbanCard | null;
  columnName?: string;
  columns?: { id: string; name: string }[];
  open: boolean;
  onClose: () => void;
  recruteurId: string;
  userId?: string;
}

export function CardDetailSheet({
  card,
  columnName,
  columns,
  open,
  onClose,
  recruteurId,
  userId,
}: Props) {
  // Edit state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  // Notes
  const [noteContent, setNoteContent] = useState("");

  // Checklist
  const [newCheckItem, setNewCheckItem] = useState("");
  const [editingCheckId, setEditingCheckId] = useState<string | null>(null);
  const [editingCheckLabel, setEditingCheckLabel] = useState("");

  // Due date
  const [newDueDate, setNewDueDate] = useState("");
  const [showAddDueDate, setShowAddDueDate] = useState(false);
  const [editingDueDateId, setEditingDueDateId] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState("");

  // Attachments
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  // Dialogs
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
  const [isNewLabelDialogOpen, setIsNewLabelDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [checklistModalItem, setChecklistModalItem] = useState("");
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [dateModalValue, setDateModalValue] = useState("");

  // Entretien
  const [isEntretienDialogOpen, setIsEntretienDialogOpen] = useState(false);
  const [entretienTitre, setEntretienTitre] = useState("");
  const [entretienDate, setEntretienDate] = useState("");
  const [entretienType, setEntretienType] = useState("VISIO");
  const [entretienLieu, setEntretienLieu] = useState("");

  const dueDateRef = useRef<HTMLDivElement>(null);
  const checklistRef = useRef<HTMLDivElement>(null);
  const attachmentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mutations
  const updateCard = useUpdateKanbanCard();
  const deleteCard = useDeleteKanbanCard();
  const addMembers = useAddCardMembers();
  const removeMember = useRemoveCardMember();
  const createNote = useCreateCardNote();
  const createCheck = useCreateCheckItem();
  const updateCheck = useUpdateCheckItem();
  const deleteCheck = useDeleteCheckItem();
  const createDueDate = useCreateCardDueDate();
  const updateDueDate = useUpdateCardDueDate();
  const deleteDueDate = useDeleteCardDueDate();
  const createAttachment = useCreateCardAttachment();
  const deleteAttachment = useDeleteCardAttachment();
  const addLabel = useAddCardLabel();
  const removeLabel = useRemoveCardLabel();
  const createLabel = useCreateLabel();
  const createEntretien = useCreateEntretien();

  const { data: labels } = useLabels(recruteurId);
  const { data: collaborateurs } = useCollaborateurs(recruteurId);
  const { edgestore } = useEdgeStore();

  // Sync form state when card changes
  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || "");
      setPriority(card.priority || "medium");
    }
  }, [card?.id]);

  if (!card) return null;

  const app = card.application;
  const candidatName = app
    ? app.candidat?.user?.name ||
      `${app.candidat?.prenom || ""} ${app.candidat?.nom || ""}`.trim() ||
      "Candidat"
    : null;

  function handleSave() {
    updateCard.mutate(
      {
        id: card!.id,
        recruteurId,
        userId,
        data: { title: title.trim(), description, priority },
      },
      { onSuccess: onClose },
    );
  }

  function handleAddNote() {
    if (!noteContent.trim()) return;
    createNote.mutate(
      { cardId: card!.id, content: noteContent.trim(), recruteurId },
      { onSuccess: () => setNoteContent("") },
    );
  }

  function handleAddCheck() {
    if (!newCheckItem.trim()) return;
    createCheck.mutate(
      { cardId: card!.id, label: newCheckItem.trim(), recruteurId },
      { onSuccess: () => setNewCheckItem("") },
    );
  }

  function handleSaveCheck() {
    if (!editingCheckId || !editingCheckLabel.trim()) return;
    updateCheck.mutate(
      {
        checkItemId: editingCheckId,
        data: { label: editingCheckLabel.trim() },
        recruteurId,
      },
      {
        onSuccess: () => {
          setEditingCheckId(null);
          setEditingCheckLabel("");
        },
      },
    );
  }

  function handleAddDueDate() {
    if (!newDueDate.trim()) return;
    createDueDate.mutate(
      { cardId: card!.id, dueAt: newDueDate, recruteurId },
      { onSuccess: () => setNewDueDate("") },
    );
  }

  function handleUpdateDueDate() {
    if (!editingDueDateId || !editingDueDate.trim()) return;
    updateDueDate.mutate(
      { dueDateId: editingDueDateId, dueAt: editingDueDate, recruteurId },
      {
        onSuccess: () => {
          setEditingDueDateId(null);
          setEditingDueDate("");
        },
      },
    );
  }

  async function handleUploadAttachment(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("Max 10 MB");
      return;
    }
    setUploadingAttachment(true);
    try {
      const res = await edgestore.publicFiles.upload({ file });
      createAttachment.mutate({
        cardId: card!.id,
        url: res.url,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        recruteurId,
        uploadedById: userId,
      });
      e.target.value = "";
    } catch (err: any) {
      alert(err.message || "Erreur upload");
    } finally {
      setUploadingAttachment(false);
    }
  }

  async function handleDeleteAttachment(attachmentId: string, url: string) {
    if (!confirm("Supprimer cette pièce jointe ?")) return;
    try {
      await edgestore.publicFiles.delete({ url });
    } catch {}
    deleteAttachment.mutate({ attachmentId, recruteurId });
  }

  function handleSaveMembers() {
    const current = card!.members?.map((m) => m.userId) ?? [];
    const toAdd = selectedMemberIds.filter((id) => !current.includes(id));
    const toRemove = current.filter((id) => !selectedMemberIds.includes(id));
    if (toAdd.length > 0)
      addMembers.mutate({ cardId: card!.id, userIds: toAdd, recruteurId });
    for (const uid of toRemove) {
      removeMember.mutate({ cardId: card!.id, userId: uid, recruteurId });
    }
    setIsMembersDialogOpen(false);
  }

  function handleCreateLabel() {
    if (!newLabelName.trim()) return;
    createLabel.mutate(
      { name: newLabelName.trim(), color: newLabelColor, recruteurId },
      {
        onSuccess: () => {
          setNewLabelName("");
          setNewLabelColor("#3b82f6");
          setIsNewLabelDialogOpen(false);
        },
      },
    );
  }

  function handleCreateEntretien() {
    if (!app || !entretienTitre.trim() || !entretienDate.trim()) return;
    createEntretien.mutate(
      {
        applicationId: app.id,
        titre: entretienTitre.trim(),
        dateHeure: entretienDate,
        type: entretienType as "PRESENTIEL" | "VISIO" | "TELEPHONE",
        lieu: entretienLieu.trim() || undefined,
      },
      {
        onSuccess: () => {
          setEntretienTitre("");
          setEntretienDate("");
          setEntretienType("VISIO");
          setEntretienLieu("");
          setIsEntretienDialogOpen(false);
        },
      },
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent side="right" className="w-full max-w-5xl p-0">
          <div className="flex flex-1 min-h-0 overflow-hidden">
            {/* Left: main content */}
            <div className="flex-1 min-w-0 overflow-y-auto p-6 space-y-6">
              {/* Candidature info banner */}
              {app && candidatName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={app.candidat?.user?.image || ""} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-semibold">
                      {candidatName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{candidatName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.jobOffer?.title}
                      {app.candidat?.user?.email && (
                        <span className="ml-2 opacity-70">
                          {app.candidat.user.email}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-xs border-0 ${STATUS_COLORS[app.status] || ""}`}
                    >
                      {STATUS_LABELS[app.status] || app.status}
                    </Badge>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/recruteur/candidatures?id=${app.id}`}
                        target="_blank"
                      >
                        <IconExternalLink className="h-3.5 w-3.5 mr-1" />
                        Voir
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Entretiens */}
              {app && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconUsers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Entretiens</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 ml-auto"
                      onClick={() => setIsEntretienDialogOpen(true)}
                    >
                      <IconPlus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  {app.entretiens && app.entretiens.length > 0 ? (
                    app.entretiens.map((e) => (
                      <div
                        key={e.id}
                        className="flex items-center gap-2 p-2 rounded-lg border"
                      >
                        <IconCalendarEvent className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{e.titre}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(e.dateHeure)}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {ENTRETIEN_TYPE_LABELS[e.type] || e.type}
                        </Badge>
                        <Badge
                          className={`text-xs border-0 shrink-0 ${ENTRETIEN_STATUT_COLORS[e.statut] || ""}`}
                        >
                          {ENTRETIEN_STATUT_LABELS[e.statut] || e.statut}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Aucun entretien planifié
                    </p>
                  )}
                </div>
              )}

              {/* Header: title edit */}
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-semibold border-none shadow-none px-0 h-auto focus-visible:ring-0"
                    placeholder="Titre de la carte"
                  />
                  {columnName && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      dans <span className="text-primary">{columnName}</span>
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={onClose}
                >
                  <IconX className="h-4 w-4" />
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Ajouter une description…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              {/* Members */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Membres
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {card.members?.map((m) => (
                    <Avatar key={m.id} className="h-8 w-8">
                      <AvatarImage src={m.user?.image || ""} />
                      <AvatarFallback className="text-xs">
                        {m.user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full border-2 border-dashed"
                    onClick={() => {
                      setSelectedMemberIds(
                        card.members?.map((m) => m.userId) ?? [],
                      );
                      setIsMembersDialogOpen(true);
                    }}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Labels
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {card.labels?.map((lp) => (
                    <Badge
                      key={lp.id}
                      className="px-2 py-0.5 text-xs text-white cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: lp.label?.color || "#3b82f6" }}
                      onClick={() => {
                        if (confirm(`Retirer "${lp.label?.name}" ?`))
                          removeLabel.mutate({
                            cardId: card.id,
                            labelId: lp.labelId,
                            recruteurId,
                          });
                      }}
                    >
                      {lp.label?.name}
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs border-dashed"
                    onClick={() => setIsLabelsDialogOpen(true)}
                  >
                    <IconPlus className="h-3 w-3 mr-1" /> Label
                  </Button>
                </div>
              </div>

              {/* Due dates */}
              <div ref={dueDateRef} className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconClock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Date d'échéance</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 ml-auto"
                    onClick={() => setShowAddDueDate((v) => !v)}
                  >
                    <IconPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {card.dueDates?.map((dd) => (
                  <div
                    key={dd.id}
                    className="flex items-center gap-2 p-2 rounded-lg border group"
                  >
                    {editingDueDateId === dd.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          type="datetime-local"
                          value={editingDueDate}
                          onChange={(e) => setEditingDueDate(e.target.value)}
                          className="h-8 text-sm flex-1"
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleUpdateDueDate}
                        >
                          <IconCircleCheck className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingDueDateId(null);
                            setEditingDueDate("");
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <IconCalendar className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span
                          className="text-sm flex-1 cursor-pointer"
                          onClick={() => {
                            setEditingDueDateId(dd.id);
                            setEditingDueDate(
                              new Date(dd.dueAt).toISOString().slice(0, 16),
                            );
                          }}
                        >
                          {formatDateTime(dd.dueAt)}
                        </span>
                        {new Date(dd.dueAt) < new Date() && (
                          <Badge className="bg-red-500 text-white text-xs">
                            Échu
                          </Badge>
                        )}
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingDueDateId(dd.id);
                              setEditingDueDate(
                                new Date(dd.dueAt).toISOString().slice(0, 16),
                              );
                            }}
                          >
                            <IconEdit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer cette date ?"))
                                deleteDueDate.mutate({
                                  dueDateId: dd.id,
                                  recruteurId,
                                });
                            }}
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {(showAddDueDate ||
                  !card.dueDates ||
                  card.dueDates.length === 0) && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="datetime-local"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      autoFocus={showAddDueDate}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      disabled={!newDueDate.trim()}
                      onClick={() => {
                        handleAddDueDate();
                        setShowAddDueDate(false);
                      }}
                    >
                      <IconPlus className="h-4 w-4" />
                    </Button>
                    {card.dueDates && card.dueDates.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setShowAddDueDate(false);
                          setNewDueDate("");
                        }}
                      >
                        <IconX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div ref={checklistRef} className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconListCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Checklist</span>
                  {card.checklist && card.checklist.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {card.checklist.filter((c) => c.isDone).length}/
                      {card.checklist.length}
                    </span>
                  )}
                </div>
                {card.checklist?.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={item.isDone}
                      onCheckedChange={() =>
                        updateCheck.mutate({
                          checkItemId: item.id,
                          data: { isDone: !item.isDone },
                          recruteurId,
                        })
                      }
                    />
                    {editingCheckId === item.id ? (
                      <div className="flex flex-1 items-center gap-2">
                        <Input
                          value={editingCheckLabel}
                          onChange={(e) => setEditingCheckLabel(e.target.value)}
                          className="h-7 text-sm flex-1"
                          autoFocus
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSaveCheck()
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={handleSaveCheck}
                        >
                          <IconCircleCheck className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingCheckId(null);
                            setEditingCheckLabel("");
                          }}
                        >
                          <IconX className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-sm flex-1 ${item.isDone ? "line-through text-muted-foreground" : ""}`}
                        >
                          {item.label}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingCheckId(item.id);
                              setEditingCheckLabel(item.label);
                            }}
                          >
                            <IconEdit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer ?"))
                                deleteCheck.mutate({
                                  checkItemId: item.id,
                                  recruteurId,
                                });
                            }}
                          >
                            <IconTrash className="h-3 w-3" />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <Input
                    value={newCheckItem}
                    onChange={(e) => setNewCheckItem(e.target.value)}
                    placeholder="Ajouter une tâche…"
                    className="h-8 text-sm flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddCheck()}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!newCheckItem.trim()}
                    onClick={handleAddCheck}
                  >
                    <IconPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Attachments */}
              <div ref={attachmentRef} className="space-y-2">
                <div className="flex items-center gap-2">
                  <IconPaperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Pièces jointes</span>
                </div>
                {card.attachments?.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-2 rounded-lg border group"
                  >
                    <IconPaperclip className="h-4 w-4 text-muted-foreground shrink-0" />
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex-1 truncate"
                    >
                      {att.filename || "Fichier"}
                    </a>
                    {att.fileType && (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {att.fileType.split("/")[1]?.toUpperCase() ||
                          att.fileType}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100"
                      onClick={() => handleDeleteAttachment(att.id, att.url)}
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    id="att-upload"
                    onChange={handleUploadAttachment}
                    disabled={uploadingAttachment}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                    disabled={uploadingAttachment}
                  >
                    <label htmlFor="att-upload" className="cursor-pointer">
                      {uploadingAttachment ? "Upload…" : "Ajouter un fichier"}
                    </label>
                  </Button>
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Commentaires
                </span>
                {card.notes?.map((note) => (
                  <div key={note.id} className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px]">
                        {note.author?.name
                          ?.split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2) || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">
                          {note.author?.name || "Anonyme"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                      <p className="text-sm bg-muted/50 rounded-lg p-2.5">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ajouter un commentaire…"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    rows={2}
                    className="text-sm resize-none flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) handleAddNote();
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 self-end"
                    disabled={!noteContent.trim() || createNote.isPending}
                    onClick={handleAddNote}
                  >
                    <IconSend className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Activity timeline */}
              {card.activities && card.activities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconHistory className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">Activité</span>
                  </div>
                  <div className="space-y-2">
                    {card.activities.map((activity) => (
                      <div key={activity.id} className="flex gap-2 items-start">
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-[10px]">
                            {activity.user?.name
                              ?.split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="font-medium text-foreground">
                            {activity.user?.name || "Quelqu'un"}
                          </span>{" "}
                          {describeActivity(activity, columns)}
                          <span className="mx-1">·</span>
                          {formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Save/Priority */}
              <div className="flex items-center gap-3 pt-2 border-t">
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-36 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Priorité basse</SelectItem>
                    <SelectItem value="medium">Priorité moyenne</SelectItem>
                    <SelectItem value="high">Priorité haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateCard.isPending}
                >
                  {updateCard.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </div>

            {/* Right sidebar: quick actions */}
            <div className="w-48 shrink-0 border-l p-4 space-y-1 bg-muted/20 overflow-y-auto">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Actions
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setIsMembersDialogOpen(true)}
              >
                <IconUser className="h-3.5 w-3.5 mr-2" /> Membres
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => setIsLabelsDialogOpen(true)}
              >
                <IconTag className="h-3.5 w-3.5 mr-2" /> Labels
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setChecklistModalItem("");
                  setIsChecklistModalOpen(true);
                }}
              >
                <IconListCheck className="h-3.5 w-3.5 mr-2" /> Checklist
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => {
                  setDateModalValue("");
                  setIsDateModalOpen(true);
                }}
              >
                <IconClock className="h-3.5 w-3.5 mr-2" /> Date
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconPaperclip className="h-3.5 w-3.5 mr-2" /> Fichier
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Checklist modal */}
      <Dialog
        open={isChecklistModalOpen}
        onOpenChange={setIsChecklistModalOpen}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une tâche</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              placeholder="Titre de la tâche…"
              value={checklistModalItem}
              onChange={(e) => setChecklistModalItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && checklistModalItem.trim()) {
                  createCheck.mutate(
                    {
                      cardId: card.id,
                      label: checklistModalItem.trim(),
                      recruteurId,
                    },
                    {
                      onSuccess: () => {
                        setChecklistModalItem("");
                        setIsChecklistModalOpen(false);
                      },
                    },
                  );
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsChecklistModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              disabled={!checklistModalItem.trim() || createCheck.isPending}
              onClick={() =>
                createCheck.mutate(
                  {
                    cardId: card.id,
                    label: checklistModalItem.trim(),
                    recruteurId,
                  },
                  {
                    onSuccess: () => {
                      setChecklistModalItem("");
                      setIsChecklistModalOpen(false);
                    },
                  },
                )
              }
            >
              {createCheck.isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date modal */}
      <Dialog open={isDateModalOpen} onOpenChange={setIsDateModalOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ajouter une date d'échéance</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              autoFocus
              type="datetime-local"
              value={dateModalValue}
              onChange={(e) => setDateModalValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDateModalOpen(false)}>
              Annuler
            </Button>
            <Button
              disabled={!dateModalValue.trim() || createDueDate.isPending}
              onClick={() =>
                createDueDate.mutate(
                  { cardId: card.id, dueAt: dateModalValue, recruteurId },
                  {
                    onSuccess: () => {
                      setDateModalValue("");
                      setIsDateModalOpen(false);
                    },
                  },
                )
              }
            >
              {createDueDate.isPending ? "Ajout…" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Labels dialog */}
      <Dialog open={isLabelsDialogOpen} onOpenChange={setIsLabelsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Labels</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2 max-h-64 overflow-y-auto">
            {labels?.map((label) => {
              const isActive = card.labels?.some(
                (lp) => lp.labelId === label.id,
              );
              return (
                <div
                  key={label.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    if (isActive)
                      removeLabel.mutate({
                        cardId: card.id,
                        labelId: label.id,
                        recruteurId,
                      });
                    else
                      addLabel.mutate({
                        cardId: card.id,
                        labelId: label.id,
                        recruteurId,
                      });
                  }}
                >
                  <div
                    className="w-8 h-5 rounded"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="text-sm flex-1">{label.name}</span>
                  {isActive && (
                    <IconCircleCheck className="h-4 w-4 text-primary" />
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewLabelDialogOpen(true)}
            >
              <IconPlus className="h-3.5 w-3.5 mr-1" /> Nouveau label
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New label dialog */}
      <Dialog
        open={isNewLabelDialogOpen}
        onOpenChange={setIsNewLabelDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Créer un label</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label>Nom</Label>
              <Input
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Nom du label"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Couleur</Label>
              <input
                type="color"
                value={newLabelColor}
                onChange={(e) => setNewLabelColor(e.target.value)}
                className="w-full h-9 rounded border cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewLabelDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button
              onClick={handleCreateLabel}
              disabled={!newLabelName.trim() || createLabel.isPending}
            >
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Members dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assigner des membres</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto py-2">
            {collaborateurs?.map((collab) => (
              <div
                key={collab.userId}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
              >
                <Checkbox
                  id={`collab-${collab.userId}`}
                  checked={selectedMemberIds.includes(collab.userId)}
                  onCheckedChange={(c) =>
                    setSelectedMemberIds(
                      c
                        ? [...selectedMemberIds, collab.userId]
                        : selectedMemberIds.filter(
                            (id) => id !== collab.userId,
                          ),
                    )
                  }
                />
                <label
                  htmlFor={`collab-${collab.userId}`}
                  className="text-sm cursor-pointer flex-1"
                >
                  {collab.prenom} {collab.nom}
                </label>
              </div>
            ))}
            {(!collaborateurs || collaborateurs.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun collaborateur
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMembersDialogOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleSaveMembers}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
