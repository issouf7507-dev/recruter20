"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { IconArchive, IconDownload, IconPlus } from "@tabler/icons-react";
import {
  useKanbanColumns, useMoveCard, useReorderKanbanColumns,
  useCreateKanbanColumn, useUpdateKanbanColumn, useDeleteKanbanColumn,
  useCreateKanbanCard, useDeleteKanbanCard, useUpdateKanbanCard,
} from "@/lib/hooks/use-kanban";
import type { KanbanCard, KanbanColumn } from "@/lib/hooks/use-kanban";
import { useOffers } from "@/lib/hooks/use-offers";
import { KanbanColumn as KanbanColumnComp } from "./KanbanColumn";
import { CardDetailSheet } from "./CardDetailSheet";
import { ImportApplicationsDialog } from "./ImportApplicationsDialog";
import { ArchivedCardsDialog } from "./ArchivedCardsDialog";
import { KanbanFilters, EMPTY_KANBAN_FILTERS } from "./KanbanFilters";
import type { KanbanFiltersState } from "./KanbanFilters";
import {
  CreateColumnDialog, EditColumnDialog, DeleteColumnDialog,
} from "./dialogs/ColumnDialogs";
import { CreateCardDialog } from "./dialogs/CreateCardDialog";

interface Props {
  recruteurId: string;
  userId?: string;
}

export function KanbanBoard({ recruteurId, userId }: Props) {
  const { data: kanbanData, isLoading, error } = useKanbanColumns(recruteurId, { enabled: true });
  const columnsData = kanbanData?.columns ?? [];

  const { data: offersData } = useOffers({ recruteurId, limit: 100 }, { enabled: true });
  const offers = offersData?.items ?? [];

  const moveCard = useMoveCard();
  const reorderColumns = useReorderKanbanColumns();
  const createColumn = useCreateKanbanColumn();
  const updateColumn = useUpdateKanbanColumn();
  const deleteColumn = useDeleteKanbanColumn();
  const createCard = useCreateKanbanCard();
  const deleteCard = useDeleteKanbanCard();
  const updateCard = useUpdateKanbanCard();

  // Drag state
  const [draggedCard, setDraggedCard] = useState<{ id: string; fromColonne: string } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<{ id: string; index: number } | null>(null);

  // Card detail
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedCardColumnId, setSelectedCardColumnId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Import dialog
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Archived cards dialog
  const [isArchivedOpen, setIsArchivedOpen] = useState(false);

  // Create column dialog
  const [isCreateColOpen, setIsCreateColOpen] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColColor, setNewColColor] = useState("bg-gray-50 border-gray-200");
  const [newColMaxCards, setNewColMaxCards] = useState("");

  // Edit column dialog
  const [isEditColOpen, setIsEditColOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editColName, setEditColName] = useState("");
  const [editColColor, setEditColColor] = useState("bg-gray-50 border-gray-200");
  const [editColMappedStatus, setEditColMappedStatus] = useState("");
  const [editColMaxCards, setEditColMaxCards] = useState("");

  // Board filters
  const [filters, setFilters] = useState<KanbanFiltersState>(EMPTY_KANBAN_FILTERS);

  // Delete column dialog
  const [isDeleteColOpen, setIsDeleteColOpen] = useState(false);
  const [deletingColumn, setDeletingColumn] = useState<KanbanColumn | null>(null);

  // Create card dialog
  const [isCreateCardOpen, setIsCreateCardOpen] = useState(false);
  const [cardColumnId, setCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [newCardPriority, setNewCardPriority] = useState("medium");
  const [newCardOfferIds, setNewCardOfferIds] = useState<string[]>([]);

  // Derived columns with shape expected by KanbanColumn
  const kanbanColumns = columnsData.map((col) => ({
    ...col,
    titre: col.name,
    couleur: col.color || "bg-gray-50 border-gray-200",
  }));

  const hasActiveFilters =
    filters.labelIds.length > 0 || filters.memberIds.length > 0 || filters.overdueOnly;

  // Columns with cards filtered by label/member/overdue
  const filteredColumns = !hasActiveFilters
    ? kanbanColumns
    : kanbanColumns.map((col) => {
        const now = new Date();
        return {
          ...col,
          cards: (col.cards ?? []).filter((card) => {
            if (filters.labelIds.length > 0) {
              const cardLabelIds = card.labels?.map((lp) => lp.labelId) ?? [];
              if (!filters.labelIds.some((id) => cardLabelIds.includes(id))) return false;
            }
            if (filters.memberIds.length > 0) {
              const cardMemberIds = card.members?.map((m) => m.userId) ?? [];
              if (!filters.memberIds.some((id) => cardMemberIds.includes(id))) return false;
            }
            if (filters.overdueOnly) {
              const isOverdue = card.dueDates?.some((d) => new Date(d.dueAt) < now);
              if (!isOverdue) return false;
            }
            return true;
          }),
        };
      });

  // Derive selectedCard from fresh data
  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    for (const col of columnsData) {
      const c = col.cards?.find((x) => x.id === selectedCardId);
      if (c) return c;
    }
    return null;
  }, [columnsData, selectedCardId]);

  const selectedColumnName = useMemo(
    () => columnsData.find((c) => c.id === selectedCardColumnId)?.name,
    [columnsData, selectedCardColumnId]
  );

  // --- Drag handlers ---

  function handleCardDragStart(e: React.DragEvent, cardId: string, columnId: string) {
    setDraggedCard({ id: cardId, fromColonne: columnId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
  }

  function handleCardDragEnd() { setDraggedCard(null); }

  async function handleCardDrop(e: React.DragEvent, targetColId: string) {
    e.preventDefault();
    if (!draggedCard || draggedCard.fromColonne === targetColId) {
      setDraggedCard(null);
      return;
    }
    try {
      await moveCard.mutateAsync({ cardId: draggedCard.id, targetColumnId: targetColId, userId });
    } catch {}
    setDraggedCard(null);
  }

  function handleColumnDragStart(e: React.DragEvent, columnId: string, index: number) {
    e.stopPropagation();
    setDraggedColumn({ id: columnId, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("application/json", JSON.stringify({ type: "column", id: columnId, index }));
  }

  function handleColumnDragEnd() { setDraggedColumn(null); }

  function handleColumnDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    e.stopPropagation();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw) return;
    const { type } = JSON.parse(raw);
    if (type !== "column") return;
    if (!draggedColumn || draggedColumn.index === targetIndex) { setDraggedColumn(null); return; }

    const updates = columnsData.map((col, i) => {
      let newOrder = i;
      if (i === draggedColumn.index) newOrder = targetIndex;
      else if (draggedColumn.index < targetIndex && i > draggedColumn.index && i <= targetIndex) newOrder = i - 1;
      else if (draggedColumn.index > targetIndex && i >= targetIndex && i < draggedColumn.index) newOrder = i + 1;
      return { columnId: col.id, newOrder };
    });
    reorderColumns.mutate(updates);
    setDraggedColumn(null);
  }

  // --- Column handlers ---

  function handleCreateColumn() {
    if (!newColName.trim()) return;
    createColumn.mutate(
      {
        recruteurId,
        data: {
          name: newColName.trim(),
          color: newColColor,
          maxCards: newColMaxCards.trim() ? Number(newColMaxCards) : null,
        },
      },
      { onSuccess: () => { setIsCreateColOpen(false); setNewColName(""); setNewColColor("bg-gray-50 border-gray-200"); setNewColMaxCards(""); } }
    );
  }

  function handleEditColumn(col: KanbanColumn) {
    setEditingColumn(col);
    setEditColName(col.name);
    setEditColColor(col.color || "bg-gray-50 border-gray-200");
    setEditColMappedStatus(col.mappedStatus || "");
    setEditColMaxCards(col.maxCards != null ? String(col.maxCards) : "");
    setIsEditColOpen(true);
  }

  function handleUpdateColumn() {
    if (!editingColumn || !editColName.trim()) return;
    updateColumn.mutate(
      {
        id: editingColumn.id,
        data: {
          name: editColName.trim(),
          color: editColColor,
          mappedStatus: editColMappedStatus || null,
          maxCards: editColMaxCards.trim() ? Number(editColMaxCards) : null,
        },
      },
      { onSuccess: () => { setIsEditColOpen(false); setEditingColumn(null); } }
    );
  }

  function handleDeleteColumn(col: KanbanColumn) {
    setDeletingColumn(col);
    setIsDeleteColOpen(true);
  }

  function handleConfirmDeleteColumn() {
    if (!deletingColumn) return;
    deleteColumn.mutate(deletingColumn.id, {
      onSuccess: () => { setIsDeleteColOpen(false); setDeletingColumn(null); },
    });
  }

  // --- Card handlers ---

  function handleAddCard(columnId: string) {
    setCardColumnId(columnId);
    setIsCreateCardOpen(true);
  }

  function handleCreateCard() {
    if (!newCardTitle.trim() || !cardColumnId) return;
    createCard.mutate(
      { recruteurId, userId, data: { title: newCardTitle.trim(), description: newCardDesc || undefined, priority: newCardPriority, columnId: cardColumnId, jobOfferIds: newCardOfferIds.length > 0 ? newCardOfferIds : undefined } },
      { onSuccess: () => { setIsCreateCardOpen(false); setNewCardTitle(""); setNewCardDesc(""); setNewCardPriority("medium"); setNewCardOfferIds([]); setCardColumnId(null); } }
    );
  }

  function handleCardClick(card: KanbanCard, columnId: string) {
    setSelectedCardId(card.id);
    setSelectedCardColumnId(columnId);
    setIsSheetOpen(true);
  }

  function handleDeleteCard(card: KanbanCard) {
    if (!confirm(`Supprimer la carte "${card.title}" ?`)) return;
    deleteCard.mutate({ id: card.id, recruteurId }, {
      onSuccess: () => { if (selectedCardId === card.id) setIsSheetOpen(false); },
    });
  }

  function handleArchiveCard(card: KanbanCard) {
    updateCard.mutate(
      { id: card.id, recruteurId, data: { isArchived: true } },
      { onSuccess: () => { if (selectedCardId === card.id) setIsSheetOpen(false); } }
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Tableau Kanban</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
            <IconDownload className="h-4 w-4 mr-1.5" /> Importer des candidatures
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsArchivedOpen(true)}>
            <IconArchive className="h-4 w-4 mr-1.5" /> Cartes archivées
          </Button>
          <KanbanFilters recruteurId={recruteurId} filters={filters} onChange={setFilters} />
          <Button size="sm" onClick={() => setIsCreateColOpen(true)} disabled={!recruteurId}>
            <IconPlus className="h-4 w-4 mr-1" /> Ajouter une colonne
          </Button>
        </div>
      </div>

      {/* Loading / error */}
      {isLoading && <p className="text-center py-8 text-muted-foreground">Chargement…</p>}
      {error && <p className="text-center py-8 text-red-500">Erreur lors du chargement du Kanban</p>}

      {/* Board */}
      {!isLoading && !error && (
        <>
          {kanbanColumns.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="mb-3">Aucune colonne. Créez-en une pour commencer votre pipeline.</p>
              <Button onClick={() => setIsCreateColOpen(true)}>
                <IconPlus className="h-4 w-4 mr-1" /> Créer une colonne
              </Button>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6 items-start">
              {filteredColumns.map((col, index) => (
                <KanbanColumnComp
                  key={col.id}
                  column={col}
                  index={index}
                  draggedCard={draggedCard}
                  draggedColumn={draggedColumn}
                  onCardDragStart={handleCardDragStart}
                  onCardDragEnd={handleCardDragEnd}
                  onCardDrop={handleCardDrop}
                  onCardClick={handleCardClick}
                  onCardDelete={handleDeleteCard}
                  onCardArchive={handleArchiveCard}
                  onColumnDragStart={handleColumnDragStart}
                  onColumnDragEnd={handleColumnDragEnd}
                  onColumnDrop={handleColumnDrop}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onAddCard={handleAddCard}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      <CreateColumnDialog
        open={isCreateColOpen} onOpenChange={setIsCreateColOpen}
        name={newColName} onNameChange={setNewColName}
        color={newColColor} onColorChange={setNewColColor}
        maxCards={newColMaxCards} onMaxCardsChange={setNewColMaxCards}
        onSubmit={handleCreateColumn} isPending={createColumn.isPending}
      />
      <EditColumnDialog
        open={isEditColOpen} onOpenChange={setIsEditColOpen}
        column={editingColumn} name={editColName} onNameChange={setEditColName}
        color={editColColor} onColorChange={setEditColColor}
        mappedStatus={editColMappedStatus} onMappedStatusChange={setEditColMappedStatus}
        maxCards={editColMaxCards} onMaxCardsChange={setEditColMaxCards}
        onSubmit={handleUpdateColumn} isPending={updateColumn.isPending}
      />
      <DeleteColumnDialog
        open={isDeleteColOpen} onOpenChange={setIsDeleteColOpen}
        column={deletingColumn} onConfirm={handleConfirmDeleteColumn}
        isPending={deleteColumn.isPending}
      />
      <CreateCardDialog
        open={isCreateCardOpen} onOpenChange={setIsCreateCardOpen}
        title={newCardTitle} onTitleChange={setNewCardTitle}
        description={newCardDesc} onDescriptionChange={setNewCardDesc}
        priority={newCardPriority} onPriorityChange={setNewCardPriority}
        jobOfferIds={newCardOfferIds} onJobOfferIdsChange={setNewCardOfferIds}
        offers={offers} onSubmit={handleCreateCard} isPending={createCard.isPending}
        disabled={!recruteurId || !cardColumnId}
      />
      <ImportApplicationsDialog
        open={isImportOpen} onClose={() => setIsImportOpen(false)}
        recruteurId={recruteurId}
        columns={kanbanColumns.map((c) => ({ id: c.id, titre: c.titre }))}
      />
      <ArchivedCardsDialog
        open={isArchivedOpen} onClose={() => setIsArchivedOpen(false)}
        recruteurId={recruteurId}
      />
      <CardDetailSheet
        card={selectedCard} columnName={selectedColumnName}
        open={isSheetOpen} onClose={() => setIsSheetOpen(false)}
        recruteurId={recruteurId} userId={userId}
        columns={columnsData.map((c) => ({ id: c.id, name: c.name }))}
      />
    </>
  );
}
