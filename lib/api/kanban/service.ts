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
  ApiResponse,
  CardLabel,
  CreateCardLabelData,
  UpdateCardLabelData,
  CreateCardDueDateData,
  UpdateCardDueDateData,
  CreateCardAttachmentData,
} from "./types";
import { kanbanRepository } from "./repository";

/**
 * Fetch all columns with cards for a recruteur
 */
export async function fetchKanbanColumns(
  recruteurId: string
): Promise<{ columns: KanbanColumn[] }> {
  const response = await fetch(
    `/api/kanban/columns?recruteurId=${recruteurId}`
  );
  const result: ApiResponse<{ columns: KanbanColumn[] }> =
    await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch kanban columns");
  }

  return result.data;
}

/**
 * Create a new column
 */
export async function createKanbanColumn(
  recruteurId: string,
  data: CreateKanbanColumnData
): Promise<KanbanColumn> {
  const response = await fetch("/api/kanban/columns", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, recruteurId }),
  });

  const result: ApiResponse<KanbanColumn> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create column");
  }

  return result.data;
}

/**
 * Update a column
 */
export async function updateKanbanColumn(
  id: string,
  data: UpdateKanbanColumnData
): Promise<KanbanColumn> {
  const response = await fetch(`/api/kanban/columns/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<KanbanColumn> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update column");
  }

  return result.data;
}

/**
 * Delete a column
 */
export async function deleteKanbanColumn(id: string): Promise<void> {
  const response = await fetch(`/api/kanban/columns/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const result: ApiResponse<null> = await response.json();
    throw new Error(result.error || "Failed to delete column");
  }
}

/**
 * Reorder columns
 */
export async function reorderKanbanColumns(
  updates: ReorderColumnData[]
): Promise<void> {
  const response = await fetch("/api/kanban/columns/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const result: ApiResponse<null> = await response.json();
    throw new Error(result.error || "Failed to reorder columns");
  }
}

/**
 * Move an application to a different column (update status)
 */
export async function moveApplication(data: MoveApplicationData): Promise<any> {
  const response = await fetch("/api/kanban/applications/move", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<any> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to move application");
  }

  return result.data;
}

/**
 * Create a new card
 */
export async function createKanbanCard(
  recruteurId: string,
  data: CreateKanbanCardData,
  userId?: string
): Promise<KanbanCard> {
  const response = await fetch("/api/kanban/cards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, recruteurId, userId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create card");
  }

  return result.data;
}

/**
 * Update a card
 */
export async function updateKanbanCard(
  id: string,
  recruteurId: string,
  data: UpdateKanbanCardData,
  userId?: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, recruteurId, userId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update card");
  }

  return result.data;
}

/**
 * Delete a card
 */
export async function deleteKanbanCard(
  id: string,
  recruteurId: string
): Promise<void> {
  const response = await fetch(`/api/kanban/cards/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recruteurId }),
  });

  if (!response.ok) {
    const result: ApiResponse<null> = await response.json();
    throw new Error(result.error || "Failed to delete card");
  }
}

/**
 * Move a card to another column
 */
export async function moveCard(
  data: MoveCardData & { userId?: string }
): Promise<KanbanCard> {
  const response = await fetch("/api/kanban/cards/move", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to move card");
  }

  return result.data;
}

/**
 * Reorder cards in a column
 */
export async function reorderCards(updates: ReorderCardData[]): Promise<void> {
  const response = await fetch("/api/kanban/cards/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ updates }),
  });

  if (!response.ok) {
    const result: ApiResponse<null> = await response.json();
    throw new Error(result.error || "Failed to reorder cards");
  }
}

/**
 * Add members to a card
 */
export async function addCardMembers(
  cardId: string,
  userIds: string[],
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userIds, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to add card members");
  }

  return result.data;
}

/**
 * Remove a member from a card
 */
export async function removeCardMember(
  cardId: string,
  userId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/members`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to remove card member");
  }

  return result.data;
}

// Label management functions
export async function fetchLabels(recruteurId: string): Promise<CardLabel[]> {
  const response = await fetch(`/api/kanban/labels?recruteurId=${recruteurId}`);
  const result: ApiResponse<CardLabel[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to fetch labels");
  }

  return result.data;
}

export async function createLabel(
  data: CreateCardLabelData
): Promise<CardLabel> {
  const response = await fetch("/api/kanban/labels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<CardLabel> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create label");
  }

  return result.data;
}

export async function updateLabel(
  id: string,
  data: UpdateCardLabelData
): Promise<CardLabel> {
  const response = await fetch(`/api/kanban/labels/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<CardLabel> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update label");
  }

  return result.data;
}

export async function deleteLabel(id: string): Promise<void> {
  const response = await fetch(`/api/kanban/labels/${id}`, {
    method: "DELETE",
  });

  const result: ApiResponse<null> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete label");
  }
}

export async function addCardLabel(
  cardId: string,
  labelId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/labels`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ labelId, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to add card label");
  }

  return result.data;
}

export async function removeCardLabel(
  cardId: string,
  labelId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/labels`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ labelId, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to remove card label");
  }

  return result.data;
}

/**
 * Create a note for a card
 */
export async function createCardNote(
  cardId: string,
  content: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create card note");
  }

  return result.data;
}

/**
 * Create a checklist item for a card
 */
export async function createCheckItem(
  cardId: string,
  label: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/cards/${cardId}/checklist`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ label, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create check item");
  }

  return result.data;
}

/**
 * Update a checklist item
 */
export async function updateCheckItem(
  checkItemId: string,
  data: { label?: string; isDone?: boolean },
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/checklist/${checkItemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update check item");
  }

  return result.data;
}

/**
 * Delete a checklist item
 */
export async function deleteCheckItem(
  checkItemId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/checklist/${checkItemId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete check item");
  }

  return result.data;
}

/**
 * Create a due date for a card
 */
export async function createCardDueDate(
  cardId: string,
  dueAt: Date | string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch("/api/kanban/due-dates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      cardId,
      dueAt,
      recruteurId,
    }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create due date");
  }

  return result.data;
}

/**
 * Update a due date
 */
export async function updateCardDueDate(
  dueDateId: string,
  dueAt: Date | string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/due-dates/${dueDateId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dueAt,
      recruteurId,
    }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to update due date");
  }

  return result.data;
}

/**
 * Delete a due date
 */
export async function deleteCardDueDate(
  dueDateId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/due-dates/${dueDateId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete due date");
  }

  return result.data;
}

/**
 * Create an attachment for a card
 */
export async function createCardAttachment(
  data: CreateCardAttachmentData
): Promise<KanbanCard> {
  const response = await fetch("/api/kanban/attachments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to create attachment");
  }

  return result.data;
}

/**
 * Delete an attachment
 */
export async function deleteCardAttachment(
  attachmentId: string,
  recruteurId: string
): Promise<KanbanCard> {
  const response = await fetch(`/api/kanban/attachments/${attachmentId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recruteurId }),
  });

  const result: ApiResponse<KanbanCard> = await response.json();

  if (!result.success) {
    throw new Error(result.error || "Failed to delete attachment");
  }

  return result.data;
}
