// Source unique des offres ATS SaaS — aligné sur le modèle économique YLSIX 2026-2028
// (docs/Modèle Économique YLSIX 2026.pdf)

export type PlanId = "decouverte" | "pme" | "business" | "corporate";

export interface PlanDefinition {
  id: PlanId;
  planType: "DECOUVERTE" | "PME" | "BUSINESS" | "CORPORATE";
  name: string;
  description: string;
  price: number; // en FCFA, 0 = gratuit
  period: "mois" | null;
  cible: string[];
  features: string[];
  popular?: boolean;
  limits: {
    maxOffresActives: number | null; // null = illimité
    maxUtilisateurs: number | null; // null = illimité
  };
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  decouverte: {
    id: "decouverte",
    planType: "DECOUVERTE",
    name: "Découverte",
    description: "Pour permettre l'adoption",
    price: 0,
    period: null,
    cible: [],
    features: [
      "2 offres actives",
      "1 utilisateur",
      "Réception des candidatures",
      "Pipeline simplifié",
      "Page entreprise",
    ],
    limits: { maxOffresActives: 2, maxUtilisateurs: 1 },
  },
  pme: {
    id: "pme",
    planType: "PME",
    name: "PME",
    description: "Pour les PME, cabinets RH et startups",
    price: 15000,
    period: "mois",
    cible: ["PME", "Cabinets RH", "Startups"],
    features: [
      "10 offres simultanées",
      "ATS complet",
      "Kanban",
      "CVthèque",
      "3 utilisateurs",
      "Statistiques de base",
    ],
    limits: { maxOffresActives: 10, maxUtilisateurs: 3 },
  },
  business: {
    id: "business",
    planType: "BUSINESS",
    name: "Business",
    description: "Pour les entreprises de 50 à 500 employés",
    price: 45000,
    period: "mois",
    cible: ["Entreprises de 50 à 500 employés"],
    features: [
      "Offres illimitées",
      "Multi-utilisateurs",
      "CVthèque avancée",
      "Pipeline personnalisable",
      "Reporting avancé",
      "Marque employeur",
    ],
    popular: true,
    limits: { maxOffresActives: null, maxUtilisateurs: null },
  },
  corporate: {
    id: "corporate",
    planType: "CORPORATE",
    name: "Corporate",
    description: "Pour les grandes organisations",
    price: 150000,
    period: "mois",
    cible: ["Banques", "Télécoms", "Industries", "Grandes administrations"],
    features: [
      "Utilisateurs illimités",
      "Multi-filiales",
      "API",
      "Workflow personnalisé",
      "Accompagnement dédié",
      "Formation RH",
    ],
    limits: { maxOffresActives: null, maxUtilisateurs: null },
  },
};

export const PLAN_LIST = Object.values(PLANS);

// Hiérarchie numérique : plus le chiffre est élevé, plus le plan est supérieur
export const PLAN_RANK: Record<PlanDefinition["planType"], number> = {
  DECOUVERTE: 0,
  PME: 1,
  BUSINESS: 2,
  CORPORATE: 3,
};

export function getPlan(id: string): PlanDefinition | undefined {
  return PLANS[id as PlanId];
}

export function planTypeToId(planType: PlanDefinition["planType"]): PlanId {
  return PLAN_LIST.find((p) => p.planType === planType)!.id;
}

/**
 * Vérifie si un abonnement actif couvre le plan minimum requis.
 * Ex : planMeetsRequirement(abonnement, "PME") → true si plan ≥ PME
 */
export function planMeetsRequirement(
  abonnement: { plan: PlanDefinition["planType"]; statut: "INACTIF" | "ACTIF" | "EXPIRE" | "SUSPENDU" } | null,
  required: PlanDefinition["planType"],
): boolean {
  const effective = getEffectivePlan(abonnement);
  return PLAN_RANK[effective.planType] >= PLAN_RANK[required];
}

/**
 * Détermine le plan effectif d'un recruteur.
 * Un abonnement payant non ACTIF (expiré, suspendu, inactif) retombe sur Découverte.
 */
export function getEffectivePlan(abonnement: {
  plan: PlanDefinition["planType"];
  statut: "INACTIF" | "ACTIF" | "EXPIRE" | "SUSPENDU";
} | null): PlanDefinition {
  if (!abonnement || abonnement.statut !== "ACTIF") {
    return PLANS.decouverte;
  }
  return PLANS[planTypeToId(abonnement.plan)];
}
