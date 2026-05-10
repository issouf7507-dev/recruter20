export interface KanbanColumn {
  id: string;
  color: string;
  name: string;
  order: number;
  isDefault: boolean;
  recruteurId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  cards?: KanbanCard[];
}

export interface KanbanCard {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null; // low | medium | high | urgent
  order: number;
  isArchived: boolean;
  archivedAt?: Date | string | null;
  columnId: string;
  createdByRecruteurId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  // Relations
  offers?: CardJobOffer[];
  members?: CardMember[];
  notes?: CardNote[];
  checklist?: CheckItem[];
  attachments?: CardAttachment[];
  labels?: CardLabelPivot[];
  activities?: CardActivity[];
  dueDates?: CardDueDate[];
}

export interface CardJobOffer {
  id: string;
  cardId: string;
  jobOfferId: string;
  jobOffer?: {
    id: string;
    title: string;
    company?: string | null;
  };
}

export interface CardMember {
  id: string;
  cardId: string;
  userId: string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export interface CardNote {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  createdAt: Date | string;
  author?: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export interface CheckItem {
  id: string;
  label: string;
  isDone: boolean;
  order: number;
  cardId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CardAttachment {
  id: string;
  url: string;
  filename?: string | null;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedById: string;
  cardId: string;
  createdAt: Date | string;
  uploadedBy?: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export interface CardLabelPivot {
  id: string;
  cardId: string;
  labelId: string;
  label?: {
    id: string;
    name: string;
    color: string;
  };
}

export interface CardActivity {
  id: string;
  cardId: string;
  userId?: string | null;
  action: string;
  meta?: any;
  createdAt: Date | string;
  user?: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export interface CardDueDate {
  id: string;
  cardId: string;
  dueAt: Date | string;
  createdAt: Date | string;
}

export interface Application {
  id: string;
  candidatId: string;
  jobOfferId: string;
  status: ApplicationStatus;
  rating?: number | null;
  message?: string | null;
  cv?: string | null;
  favorite?: boolean | null;
  duedate?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  jobOffer?: {
    id: string;
    title: string;
    company?: string | null;
  };
  candidat?: {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    user?: {
      name?: string | null;
      email: string;
    };
  };
  collaborateurs?: Array<{
    id: string;
    collaborateur: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
    };
  }>;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>;
  notes?: Array<{
    id: string;
    content: string;
    authorName?: string | null;
    createdAt: Date | string;
  }>;
  checklist?: Array<{
    id: string;
    title: string;
    isCompleted: boolean;
  }>;
}

export enum ApplicationStatus {
  EN_ATTENTE = "EN_ATTENTE",
  EN_REVISION = "EN_REVISION",
  ACCEPTE = "ACCEPTE",
  REFUSE = "REFUSE",
}

export interface CreateKanbanColumnData {
  name: string;
  color: string;
  order?: number;
  isDefault?: boolean;
  jobOfferId?: string; // Optional, not really used since Kanban is independent
}

export interface UpdateKanbanColumnData {
  name?: string;
  color?: string;
  order?: number;
  isDefault?: boolean;
}

export interface MoveApplicationData {
  applicationId: string;
  targetColumnId: string;
  newStatus: ApplicationStatus;
}

export interface ReorderColumnData {
  columnId: string;
  newOrder: number;
}

export interface CreateKanbanCardData {
  title: string;
  description?: string;
  priority?: string; // low | medium | high | urgent
  columnId: string;
  jobOfferIds?: string[];
  memberIds?: string[];
}

export interface UpdateKanbanCardData {
  title?: string;
  description?: string;
  priority?: string;
  columnId?: string;
  order?: number;
  isArchived?: boolean;
}

export interface MoveCardData {
  cardId: string;
  targetColumnId: string;
  newOrder?: number;
  userId?: string;
}

export interface ReorderCardData {
  cardId: string;
  newOrder: number;
  columnId?: string;
}

export type { ApiResponse } from "../types";

export interface CardLabel {
  id: string;
  name: string;
  color: string;
}

export interface CreateCardLabelData {
  name: string;
  color: string;
  recruteurId: string;
}

export interface UpdateCardLabelData {
  name?: string;
  color?: string;
}

export interface AddCardLabelData {
  cardId: string;
  labelId: string;
  recruteurId: string;
}

export interface CreateCardDueDateData {
  cardId: string;
  dueAt: Date | string;
  recruteurId: string;
}

export interface UpdateCardDueDateData {
  dueAt: Date | string;
}

export interface CreateCardAttachmentData {
  cardId: string;
  url: string;
  filename?: string;
  fileType?: string;
  fileSize?: number;
  recruteurId: string;
  uploadedById: string;
}
