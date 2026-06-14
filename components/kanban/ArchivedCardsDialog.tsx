"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { IconArchiveOff, IconTrash } from "@tabler/icons-react";
import { useArchivedCards, useUpdateKanbanCard, useDeleteKanbanCard } from "@/lib/hooks/use-kanban";

interface Props {
  open: boolean;
  onClose: () => void;
  recruteurId: string;
}

function formatDate(date: Date | string) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

export function ArchivedCardsDialog({ open, onClose, recruteurId }: Props) {
  const { data: cards = [], isLoading } = useArchivedCards(open ? recruteurId : undefined);
  const updateCard = useUpdateKanbanCard();
  const deleteCard = useDeleteKanbanCard();

  function handleRestore(cardId: string) {
    updateCard.mutate({ id: cardId, recruteurId, data: { isArchived: false } });
  }

  function handleDelete(cardId: string, title: string) {
    if (!confirm(`Supprimer définitivement la carte "${title}" ? Cette action est irréversible.`)) return;
    deleteCard.mutate({ id: cardId, recruteurId });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Cartes archivées</DialogTitle>
          <DialogDescription>
            {cards.length === 0 && !isLoading
              ? "Aucune carte archivée."
              : `${cards.length} carte(s) archivée(s).`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">Chargement…</p>
        ) : cards.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Les cartes archivées apparaîtront ici.
          </p>
        ) : (
          <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
            {cards.map((card) => {
              const app = card.application;
              const candidatName = app
                ? app.candidat?.user?.name ||
                  `${app.candidat?.prenom || ""} ${app.candidat?.nom || ""}`.trim() ||
                  "Candidat"
                : null;
              const initials = candidatName
                ? candidatName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                : null;

              return (
                <div key={card.id} className="flex items-center gap-3 p-3">
                  {candidatName && (
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={app?.candidat?.user?.image || ""} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{candidatName || card.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {card.column?.name && `Depuis "${card.column.name}"`}
                      {card.archivedAt && ` · Archivée le ${formatDate(card.archivedAt)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 shrink-0"
                    title="Restaurer"
                    disabled={updateCard.isPending}
                    onClick={() => handleRestore(card.id)}
                  >
                    <IconArchiveOff className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                    title="Supprimer définitivement"
                    disabled={deleteCard.isPending}
                    onClick={() => handleDelete(card.id, card.title)}
                  >
                    <IconTrash className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
