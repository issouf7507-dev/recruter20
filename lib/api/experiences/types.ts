export interface ExperienceCompetence {
  id: string;
  experienceId: string;
  competence: string;
  createdAt: Date;
}

export interface Experience {
  id: string;
  candidatId: string;
  poste: string;
  entreprise: string;
  localisation: string;
  typeContrat: string;
  dateDebut: Date;
  dateFin?: Date | null;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  experienceCompetences?: ExperienceCompetence[];
}

export interface CreateExperienceData {
  candidatId: string;
  poste: string;
  entreprise: string;
  localisation?: string;
  typeContrat?: string;
  dateDebut: string | Date;
  dateFin?: string | Date | null;
  description?: string;
  competences?: string[];
}

export interface UpdateExperienceData {
  poste?: string;
  entreprise?: string;
  localisation?: string;
  typeContrat?: string;
  dateDebut?: string | Date;
  dateFin?: string | Date | null;
  description?: string;
  competences?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

