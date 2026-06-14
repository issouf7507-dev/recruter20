// Source unique des plans CVthèque Premium — modèle économique YLSIX 2026-2028

export type CVthequePlanId = "basic" | "pro" | "illimite";

export interface CVthequePlanDefinition {
  id: CVthequePlanId;
  planType: "BASIC" | "PRO" | "ILLIMITE";
  name: string;
  description: string;
  price: number; // FCFA/mois
  period: "mois";
  maxCVConsultables: number | null; // null = illimité
  features: string[];
  popular?: boolean;
}

export const CVTHEQUE_PLANS: Record<CVthequePlanId, CVthequePlanDefinition> = {
  basic: {
    id: "basic",
    planType: "BASIC",
    name: "Basic",
    description: "Pour débuter la recherche de talents",
    price: 10000,
    period: "mois",
    maxCVConsultables: 100,
    features: [
      "100 CV consultables / mois",
      "Recherche par compétences",
      "Filtres avancés (localisation, domaine)",
      "Déblocage contact : 500 FCFA / profil",
    ],
  },
  pro: {
    id: "pro",
    planType: "PRO",
    name: "Pro",
    description: "Pour les équipes RH actives",
    price: 25000,
    period: "mois",
    maxCVConsultables: 500,
    features: [
      "500 CV consultables / mois",
      "Recherche par compétences",
      "Filtres avancés (localisation, domaine)",
      "Déblocage contact : 500 FCFA / profil",
      "Export des profils",
    ],
    popular: true,
  },
  illimite: {
    id: "illimite",
    planType: "ILLIMITE",
    name: "Illimité",
    description: "Pour les grandes entreprises et cabinets",
    price: 50000,
    period: "mois",
    maxCVConsultables: null,
    features: [
      "CV illimités consultables",
      "Recherche par compétences",
      "Filtres avancés (localisation, domaine)",
      "Pack 50 contacts inclus (15 000 FCFA)",
      "Pack 200 contacts : 50 000 FCFA",
      "Export des profils",
    ],
  },
};

export const CVTHEQUE_PLAN_LIST = Object.values(CVTHEQUE_PLANS);

export interface ContactPack {
  id: "single" | "pack50" | "pack200";
  label: string;
  description: string;
  price: number;
  quantity: number;
}

export const CONTACT_PACKS: ContactPack[] = [
  {
    id: "single",
    label: "Déblocage unitaire",
    description: "Accéder aux coordonnées d'un candidat",
    price: 500,
    quantity: 1,
  },
  {
    id: "pack50",
    label: "Pack 50 contacts",
    description: "Économisez avec un pack de 50 déblocages",
    price: 15000,
    quantity: 50,
  },
  {
    id: "pack200",
    label: "Pack 200 contacts",
    description: "Le meilleur rapport qualité-prix",
    price: 50000,
    quantity: 200,
  },
];

export function getCVthequePlan(id: string): CVthequePlanDefinition | undefined {
  return CVTHEQUE_PLANS[id as CVthequePlanId];
}
