export interface JobOffer {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  type?: string;
  etat?: string;
  experience?: string;
  logo?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: string;
  benefits?: string;
  requirements?: string;
  responsibilities?: string;
  skills?: string;
  duedate?: Date | string;
  recruteurId: string;
  createdAt: Date;
  updatedAt: Date;
  views?: number;
  numberOfPosts?: number;
  dueDate?: Date | string;
  applicationCount?: number;
  applications?: any[];
  anneesexperience?: string;
  recruteur?: {
    id?: string;
    companyName?: string | null;
    description?: string | null;
    industry?: string | null;
    size?: string | null;
    location?: string | null;
    website?: string | null;
    logo?: string | null;
  } | null;
}

export interface CreateOfferData {
  titre: string;
  entreprise: string;
  typeContrat: string;
  lieu: string;
  salaireMin?: string;
  salaireMax?: string;
  description?: string;
  profilRecherche?: string;
  competences?: string;
  avantages?: string;
  nombrePostes?: string;
  duedate?: Date | undefined;
  salaryCurrency: string;
  anneesexperience: string;
  logo?: string;
  etat?: "active" | "brouillon";
}

export type { ApiResponse, PaginatedResponse } from "../types";
