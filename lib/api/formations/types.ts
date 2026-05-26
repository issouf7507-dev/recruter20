export interface Formation {
  id: string;
  candidatId: string;
  diplome: string;
  etablissement: string;
  domaine: string;
  dateDebut: Date;
  dateFin?: Date | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFormationData {
  candidatId: string;
  diplome: string;
  etablissement: string;
  domaine?: string;
  dateDebut: string | Date;
  dateFin?: string | Date | null;
  description?: string;
}

export interface UpdateFormationData {
  diplome?: string;
  etablissement?: string;
  domaine?: string;
  dateDebut?: string | Date;
  dateFin?: string | Date | null;
  description?: string;
}

export type { ApiResponse } from "../types";

