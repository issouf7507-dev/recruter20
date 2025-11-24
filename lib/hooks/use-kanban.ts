import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as kanbanService from "@/lib/api/kanban/service";
import type {
  KanbanColumn,
  KanbanCard,
  CreateKanbanColumnData,
  UpdateKanbanColumnData,
  CreateKanbanCardData,
  UpdateKanbanCardData,
  MoveApplicationData,
  ReorderColumnData,
  MoveCardData,
  ReorderCardData,
  ApplicationStatus,
  CardLabel,
  CreateCardLabelData,
  UpdateCardLabelData,
} from "@/lib/api/kanban/types";

/**
 * Hook to fetch kanban columns with applications (all job offers)
 */
export function useKanbanColumns(
  recruteurId?: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ["kanban-columns", recruteurId],
    queryFn: () => kanbanService.fetchKanbanColumns(recruteurId!),
    enabled: options?.enabled !== false && !!recruteurId,
  });
}

/**
 * Hook to create a kanban column
 */
export function useCreateKanbanColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recruteurId,
      data,
    }: {
      recruteurId: string;
      data: CreateKanbanColumnData;
    }) => kanbanService.createKanbanColumn(recruteurId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-columns", variables.recruteurId],
      });
      toast.success("Colonne créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de la colonne");
    },
  });
}

/**
 * Hook to update a kanban column
 */
export function useUpdateKanbanColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateKanbanColumnData }) =>
      kanbanService.updateKanbanColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Colonne mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la mise à jour de la colonne"
      );
    },
  });
}

/**
 * Hook to delete a kanban column
 */
export function useDeleteKanbanColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kanbanService.deleteKanbanColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Colonne supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la suppression de la colonne"
      );
    },
  });
}

/**
 * Hook to reorder kanban columns
 */
export function useReorderKanbanColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ReorderColumnData[]) =>
      kanbanService.reorderKanbanColumns(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors du réordonnancement des colonnes"
      );
    },
  });
}

/**
 * Hook to move an application to a different column
 */
export function useMoveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveApplicationData) =>
      kanbanService.moveApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors du déplacement de l'application"
      );
    },
  });
}

/**
 * Hook to create a kanban card
 */
export function useCreateKanbanCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recruteurId,
      data,
      userId,
    }: {
      recruteurId: string;
      data: CreateKanbanCardData;
      userId?: string;
    }) => kanbanService.createKanbanCard(recruteurId, data, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-columns"],
      });
      toast.success("Card créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de la card");
    },
  });
}

/**
 * Hook to update a kanban card
 */
export function useUpdateKanbanCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      recruteurId,
      data,
      userId,
    }: {
      id: string;
      recruteurId: string;
      data: UpdateKanbanCardData;
      userId?: string;
    }) => kanbanService.updateKanbanCard(id, recruteurId, data, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Card mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de la card");
    },
  });
}

/**
 * Hook to delete a kanban card
 */
export function useDeleteKanbanCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, recruteurId }: { id: string; recruteurId: string }) =>
      kanbanService.deleteKanbanCard(id, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Card supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de la card");
    },
  });
}

/**
 * Hook to move a card to another column
 */
export function useMoveCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MoveCardData & { userId?: string }) =>
      kanbanService.moveCard(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du déplacement de la card");
    },
  });
}

/**
 * Hook to reorder cards in a column
 */
export function useReorderCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: ReorderCardData[]) =>
      kanbanService.reorderCards(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du réordonnancement des cards");
    },
  });
}

/**
 * Hook to add members to a card
 */
export function useAddCardMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      userIds,
      recruteurId,
    }: {
      cardId: string;
      userIds: string[];
      recruteurId: string;
    }) => kanbanService.addCardMembers(cardId, userIds, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Membres ajoutés avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'ajout des membres");
    },
  });
}

/**
 * Hook to remove a member from a card
 */
export function useRemoveCardMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      userId,
      recruteurId,
    }: {
      cardId: string;
      userId: string;
      recruteurId: string;
    }) => kanbanService.removeCardMember(cardId, userId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Membre retiré avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du membre");
    },
  });
}

/**
 * Hook to fetch labels
 */
export function useLabels(recruteurId?: string) {
  return useQuery({
    queryKey: ["kanban-labels", recruteurId],
    queryFn: () => kanbanService.fetchLabels(recruteurId!),
    enabled: !!recruteurId,
  });
}

/**
 * Hook to create a label
 */
export function useCreateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardLabelData) => kanbanService.createLabel(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["kanban-labels", variables.recruteurId],
      });
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Label créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création du label");
    },
  });
}

/**
 * Hook to update a label
 */
export function useUpdateLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCardLabelData }) =>
      kanbanService.updateLabel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-labels"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Label modifié avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la modification du label");
    },
  });
}

/**
 * Hook to delete a label
 */
export function useDeleteLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => kanbanService.deleteLabel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-labels"] });
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Label supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du label");
    },
  });
}

/**
 * Hook to add a label to a card
 */
export function useAddCardLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      labelId,
      recruteurId,
    }: {
      cardId: string;
      labelId: string;
      recruteurId: string;
    }) => kanbanService.addCardLabel(cardId, labelId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Label ajouté avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'ajout du label");
    },
  });
}

/**
 * Hook to remove a label from a card
 */
export function useRemoveCardLabel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      labelId,
      recruteurId,
    }: {
      cardId: string;
      labelId: string;
      recruteurId: string;
    }) => kanbanService.removeCardLabel(cardId, labelId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Label retiré avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression du label");
    },
  });
}

/**
 * Hook to create a note for a card
 */
export function useCreateCardNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      content,
      recruteurId,
    }: {
      cardId: string;
      content: string;
      recruteurId: string;
    }) => kanbanService.createCardNote(cardId, content, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Note ajoutée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'ajout de la note");
    },
  });
}

/**
 * Hook to create a checklist item
 */
export function useCreateCheckItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      label,
      recruteurId,
    }: {
      cardId: string;
      label: string;
      recruteurId: string;
    }) => kanbanService.createCheckItem(cardId, label, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Tâche ajoutée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de l'ajout de la tâche");
    },
  });
}

/**
 * Hook to update a checklist item
 */
export function useUpdateCheckItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkItemId,
      data,
      recruteurId,
    }: {
      checkItemId: string;
      data: { label?: string; isDone?: boolean };
      recruteurId: string;
    }) => kanbanService.updateCheckItem(checkItemId, data, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de la tâche");
    },
  });
}

/**
 * Hook to delete a checklist item
 */
export function useDeleteCheckItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      checkItemId,
      recruteurId,
    }: {
      checkItemId: string;
      recruteurId: string;
    }) => kanbanService.deleteCheckItem(checkItemId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Tâche supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de la tâche");
    },
  });
}

/**
 * Hook to create a due date for a card
 */
export function useCreateCardDueDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cardId,
      dueAt,
      recruteurId,
    }: {
      cardId: string;
      dueAt: Date | string;
      recruteurId: string;
    }) => kanbanService.createCardDueDate(cardId, dueAt, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Date d'échéance ajoutée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de l'ajout de la date d'échéance"
      );
    },
  });
}

/**
 * Hook to update a due date
 */
export function useUpdateCardDueDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dueDateId,
      dueAt,
      recruteurId,
    }: {
      dueDateId: string;
      dueAt: Date | string;
      recruteurId: string;
    }) => kanbanService.updateCardDueDate(dueDateId, dueAt, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Date d'échéance mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la mise à jour de la date d'échéance"
      );
    },
  });
}

/**
 * Hook to delete a due date
 */
export function useDeleteCardDueDate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      dueDateId,
      recruteurId,
    }: {
      dueDateId: string;
      recruteurId: string;
    }) => kanbanService.deleteCardDueDate(dueDateId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Date d'échéance supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la suppression de la date d'échéance"
      );
    },
  });
}

/**
 * Hook to create an attachment for a card
 */
export function useCreateCardAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      cardId: string;
      url: string;
      filename?: string;
      fileType?: string;
      fileSize?: number;
      recruteurId: string;
      uploadedById: string;
    }) => kanbanService.createCardAttachment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Pièce jointe ajoutée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de l'ajout de la pièce jointe"
      );
    },
  });
}

/**
 * Hook to delete an attachment
 */
export function useDeleteCardAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attachmentId,
      recruteurId,
    }: {
      attachmentId: string;
      recruteurId: string;
    }) => kanbanService.deleteCardAttachment(attachmentId, recruteurId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      toast.success("Pièce jointe supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la suppression de la pièce jointe"
      );
    },
  });
}

// Re-export types
export type {
  KanbanColumn,
  KanbanCard,
  CreateKanbanColumnData,
  UpdateKanbanColumnData,
  CreateKanbanCardData,
  UpdateKanbanCardData,
  ApplicationStatus,
};
