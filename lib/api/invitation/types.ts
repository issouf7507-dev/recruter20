export interface Invitation {
  id: string;
  email: string;
  recruteurId: string;
  role: Role;
  token: string;
  accepted: boolean;
  createdAt: Date;
  expiresAt: Date;
  recruteur: Recruteur;
}

export interface Recruteur {
  id: string;
  userId: string;
  type: string;
  description?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  companyName?: string | null;
  logo?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  website?: string | null;
  email: string;
  phone?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvitation {
  email: string;
  recruteurId: string;
  role: Role;
}

export type Role = "ADMIN" | "USER" | "MANAGER" | "VIEWER";

export interface InvitationResponse {
  id: string;
  email: string;
  recruteurId: string;
  role: Role;
  token: string;
  accepted: boolean;
  createdAt: Date;
  expiresAt: Date;
}

export type { ApiResponse } from "../types";
