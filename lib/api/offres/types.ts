export interface JobOffer {
  id: string;
  title: string;
  description?: string;
  company?: string;
  location?: string;
  type?: string;
  etat?: string;
  experience?: string;
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
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
