"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconDots, IconEdit, IconGripVertical, IconPlus, IconTrash,
} from "@tabler/icons-react";
import type { KanbanCard, KanbanColumn as KanbanColumnType } from "@/lib/hooks/use-kanban";
import { KanbanCardItem } from "./KanbanCardItem";

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_REVISION: "En révision",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

interface Props {
  column: KanbanColumnType & { titre: string; couleur: string };
  index: number;
  draggedCard: { id: string; fromColonne: string } | null;
  draggedColumn: { id: string; index: number } | null;
  onCardDragStart: (e: React.DragEvent, cardId: string, columnId: string) => void;
  onCardDragEnd: () => void;
  onCardDrop: (e: React.DragEvent, columnId: string) => void;
  onCardClick: (card: KanbanCard, columnId: string) => void;
  onCardDelete: (card: KanbanCard) => void;
  onCardArchive: (card: KanbanCard) => void;
  onColumnDragStart: (e: React.DragEvent, columnId: string, index: number) => void;
  onColumnDragEnd: () => void;
  onColumnDrop: (e: React.DragEvent, targetIndex: number) => void;
  onEditColumn: (column: KanbanColumnType) => void;
  onDeleteColumn: (column: KanbanColumnType) => void;
  onAddCard: (columnId: string) => void;
}

export function KanbanColumn({
  column, index, draggedCard, draggedColumn,
  onCardDragStart, onCardDragEnd, onCardDrop,
  onCardClick, onCardDelete, onCardArchive,
  onColumnDragStart, onColumnDragEnd, onColumnDrop,
  onEditColumn, onDeleteColumn, onAddCard,
}: Props) {
  const isDraggingOver = !!draggedCard && draggedCard.fromColonne !== column.id;
  const isBeingDragged = draggedColumn?.id === column.id;
  const isDropTarget = !!draggedColumn && draggedColumn.index !== index;
  const cardCount = column.cards?.length ?? 0;
  const isOverLimit = !!column.maxCards && cardCount > column.maxCards;

  return (
    <div
      className={`bg-muted/50 flex flex-col gap-3 rounded-lg p-3 w-[300px] min-w-[300px]
        border border-border/50 transition-all duration-150
        ${isDraggingOver ? "ring-2 ring-primary/50 bg-primary/5" : ""}
        ${isBeingDragged ? "opacity-50 scale-95" : ""}
        ${isDropTarget ? "ring-2 ring-primary/70 bg-primary/10 scale-105" : ""}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={(e) => {
        onCardDrop(e, column.id);
        onColumnDrop(e, index);
      }}
    >
      {/* Column header */}
      <div
        className="flex items-center justify-between cursor-grab"
        draggable
        onDragStart={(e) => onColumnDragStart(e, column.id, index)}
        onDragEnd={onColumnDragEnd}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold truncate">{column.titre}</span>
          <Badge variant={isOverLimit ? "destructive" : "secondary"} className="text-xs shrink-0">
            {column.maxCards ? `${cardCount}/${column.maxCards}` : cardCount}
          </Badge>
          {column.mappedStatus && (
            <Badge variant="outline" className="text-xs shrink-0 px-1 py-0">
              → {STATUS_LABELS[column.mappedStatus] || column.mappedStatus}
            </Badge>
          )}
          {isDropTarget && (
            <span className="text-xs text-primary font-medium animate-pulse shrink-0">Déposer ici</span>
          )}
        </div>
        <div className="flex items-center shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 cursor-grab">
            <IconGripVertical className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                <IconDots className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddCard(column.id)}>
                <IconPlus className="h-4 w-4 mr-2" /> Ajouter une carte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEditColumn(column)}>
                <IconEdit className="h-4 w-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => onDeleteColumn(column)}>
                <IconTrash className="h-4 w-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 flex-1 min-h-[60px]">
        {column.cards && column.cards.length > 0 ? (
          column.cards.map((card) => (
            <KanbanCardItem
              key={card.id}
              card={card}
              onDragStart={(e) => onCardDragStart(e, card.id, column.id)}
              onDragEnd={onCardDragEnd}
              onClick={() => onCardClick(card, column.id)}
              onDelete={() => onCardDelete(card)}
              onArchive={() => onCardArchive(card)}
            />
          ))
        ) : (
          <div
            className="border-2 border-dashed border-border rounded-lg p-4 text-center text-sm
              text-muted-foreground min-h-[60px] flex items-center justify-center"
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => onCardDrop(e, column.id)}
          >
            {isDraggingOver ? "Déposer ici" : "Aucune carte"}
          </div>
        )}
      </div>

      {/* Add card button */}
      <Button
        variant="ghost" size="sm"
        className="w-full justify-start text-muted-foreground hover:text-foreground text-xs"
        onClick={() => onAddCard(column.id)}
      >
        <IconPlus className="h-3.5 w-3.5 mr-1" /> Ajouter une carte
      </Button>
    </div>
  );
}
