import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId, useCollaborateurByUserId } from "@/lib/hooks/use-recruteurs";
import { useAbonnement } from "@/lib/hooks/use-abonnement";
import { useOffers } from "@/lib/hooks/use-offers";
import { getEffectivePlan } from "@/lib/plans";

/**
 * Retourne le quota d'offres actives du recruteur courant.
 * used  : nombre d'offres actives actuellement
 * max   : limite du plan (null = illimité)
 * isAtLimit : true si le quota est atteint
 */
export function useOffreQuota() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  const { data: abonnement, isLoading: abonnementLoading } = useAbonnement(recruteurId);

  const plan = getEffectivePlan(abonnement ?? null);
  const max = plan.limits.maxOffresActives; // null = illimité

  const { data: offresData, isLoading: offresLoading } = useOffers(
    { recruteurId: recruteurId ?? "", etat: "active", limit: 999 },
    { enabled: !!recruteurId && max !== null },
  );

  const used = offresData?.pagination?.total ?? offresData?.items?.length ?? 0;
  const isLoading = abonnementLoading || offresLoading;
  const isAtLimit = max !== null && used >= max;

  return { used, max, isAtLimit, isLoading, plan, recruteurId };
}
