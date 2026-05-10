export interface AlerteEmploi {
  id: string;
  titre: string;
  localisation: string;
  typeContrat: string;
  salaireMin?: number | null;
  salaireMax?: number | null;
  experience: string;
  frequence: string;
  active: boolean;
  derniereMiseAJour: Date;
  nombreResultats: number;
  candidatId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlerteWithMotsCles extends AlerteEmploi {
  alerteMotsCles: {
    id: string;
    motCle: string;
  }[];
}

export interface CreateAlerteData {
  titre: string;
  localisation: string;
  typeContrat: string;
  salaireMin?: number;
  salaireMax?: number;
  experience: string;
  frequence: string;
  active?: boolean;
  candidatId: string;
  motsCles?: string[];
}

export interface UpdateAlerteData {
  titre?: string;
  localisation?: string;
  typeContrat?: string;
  salaireMin?: number;
  salaireMax?: number;
  experience?: string;
  frequence?: string;
  active?: boolean;
  motsCles?: string[];
}

export interface AlerteMotCle {
  id: string;
  alerteId: string;
  motCle: string;
  createdAt: Date;
}

export type { ApiResponse } from "../types";
