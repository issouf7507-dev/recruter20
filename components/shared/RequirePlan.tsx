"use client";

import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId, useCollaborateurByUserId } from "@/lib/hooks/use-recruteurs";
import { PlanGate } from "@/components/shared/PlanGate";
import type { PlanDefinition } from "@/lib/plans";

interface RequirePlanProps {
  minPlan: PlanDefinition["planType"];
  featureName?: string;
  children: React.ReactNode;
}

/**
 * Wrapper autonome : lit la session et l'abonnement du recruteur courant,
 * puis délègue à PlanGate. À utiliser directement dans les pages protégées.
 */
export function RequirePlan({ minPlan, featureName, children }: RequirePlanProps) {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  return (
    <PlanGate recruteurId={recruteurId} minPlan={minPlan} featureName={featureName}>
      {children}
    </PlanGate>
  );
}
