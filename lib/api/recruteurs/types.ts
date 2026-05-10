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

export interface RecruteurInformation {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface RecruteurInformationEntreprise {
  companyName?: string;
  description?: string;
  industry?: string;
  size?: string;
  location?: string;
  website?: string;
}
export type { ApiResponse } from "../types";
