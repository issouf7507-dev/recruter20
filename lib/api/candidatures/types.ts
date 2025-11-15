export type ApplicationStatus =
  | "EN_ATTENTE"
  | "EN_REVISION"
  | "ACCEPTE"
  | "REFUSE";

export interface Application {
  id: string;
  candidatId: string;
  jobOfferId: string;
  status: ApplicationStatus;
  rating?: number | null;
  message?: string | null;
  cv?: string | null;
  favorite?: boolean | null;
  duedate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export interface ApplicationWithRelations extends Application {
  candidat: {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    email?: string;
  };
  jobOffer: {
    id: string;
    title: string;
    company?: string | null;
    location?: string | null;
    type?: string | null;
  };
}

export interface CreateApplicationData {
  candidatId: string;
  jobOfferId: string;
  message?: string;
  cv?: string;
}

export interface UpdateApplicationData {
  status?: ApplicationStatus;
  rating?: number;
  message?: string;
  favorite?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
