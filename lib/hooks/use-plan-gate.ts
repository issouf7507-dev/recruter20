import { useAbonnement } from "@/lib/hooks/use-abonnement";
import { planMeetsRequirement, type PlanDefinition } from "@/lib/plans";

/**
 * Retourne si le recruteur a accès à une fonctionnalité requérant `minPlan`.
 * Tant que l'abonnement charge, on considère l'accès bloqué (safe default).
 */
export function usePlanGate(recruteurId: string | undefined, minPlan: PlanDefinition["planType"]) {
  const { data: abonnement, isLoading } = useAbonnement(recruteurId);

  if (isLoading || !recruteurId) return { allowed: false, isLoading: true, abonnement: null };

  const allowed = planMeetsRequirement(abonnement ?? null, minPlan);
  return { allowed, isLoading: false, abonnement: abonnement ?? null };
}
