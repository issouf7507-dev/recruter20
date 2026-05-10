export interface Collaborateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  recruteurId: string;
  invitationId: string | null;
  userId: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  recruteur: Recruteur;
  // user: User;
}

export interface Recruteur {
  id: string;
  userId: string;
  type: string;
  description?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  logo?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
  email: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type { ApiResponse } from "../types";
