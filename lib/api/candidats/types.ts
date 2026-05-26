import { NotificationType, SenderType, UserType } from "@/app/generated/prisma";
import { JobOffer } from "../offres";
import { Recruteur } from "../recruteurs";

export interface Notification {
  id: string;
  recipientId: string;
  recipientType: UserType;
  type: NotificationType;
  data: any;
  read: boolean;
  readAt: Date;
  createdAt: Date;
  recipient: User;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;

  image?: string | null;
  type?: UserType | null;
  createdAt: Date;
  updatedAt: Date;

  // notifications?: Notification[] | null;
}

export interface AlerteEmploi {
  id: string;
  titre: string;
  localisation: string;
  typeContrat: string;
  salaireMin: number;
  salaireMax: number;
  experience: string;
  frequence: string;
  active: boolean;
  derniereMiseAJour: Date;
  nombreResultats: number;
  candidatId: string;
  createdAt: Date;
  updatedAt: Date;
  candidat: Candidat;
  alerteMotsCles: AlerteMotCle[];
}
export interface AlerteMotCle {
  id: string;
  alerteId: string;
  motCle: string;
  createdAt: Date;
  alerte: AlerteEmploi;
}

export interface CandidatCompetence {
  id: string;
  candidatId: string;
  competence: string;
  createdAt: Date;
  candidat: Candidat;
}

export interface Competence {
  id: string;
  candidatId: string;
  competence: string;
  createdAt: Date;
  candidat: Candidat;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: SenderType;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  jobOfferId: string;
  candidatId: string;
  recruteurId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  candidat: Candidat;
  jobOffer: JobOffer;
  recruteur: Recruteur;
  messages: Message[];
}

export interface Candidat {
  id: string;
  userId: string;
  nom?: string | null;
  prenom?: string | null;
  telephone?: string | null;
  cv?: string | null;
  letterm?: string | null;
  bio?: string | null;
  adresse?: string | null;
  ville?: string | null;
  statut?: string | null;
  pays?: string | null;
  dateNaissance?: Date | null;
  nationalite?: string | null;
  situationFamiliale?: string | null;
  permisConduire?: string | null;
  image?: string | null;
  competences?: string[] | null;
  certifications?: string[] | null;
  linkedinUrl?: string | null;
  domaine?: string | null;
  portfolioUrl?: string | null;
  niveauxEtude?: string[] | null;
}

export type { ApiResponse } from "../types";
