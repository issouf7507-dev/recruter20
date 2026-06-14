"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { usePlanGate } from "@/lib/hooks/use-plan-gate";
import { PlanSelectionModal } from "@/components/shared/PlanSelectionModal";
import { PLANS, type PlanDefinition } from "@/lib/plans";

interface PlanGateProps {
  recruteurId: string | undefined;
  minPlan: PlanDefinition["planType"];
  children: React.ReactNode;
  featureName?: string;
}

/**
 * Enveloppe un contenu dans un guard de plan.
 * Si le plan est insuffisant, affiche un écran de verrouillage avec upgrade CTA.
 */
export function PlanGate({ recruteurId, minPlan, children, featureName }: PlanGateProps) {
  const { allowed, isLoading } = usePlanGate(recruteurId, minPlan);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading) return null;

  if (!allowed) {
    const requiredPlan = PLANS[minPlan.toLowerCase() as keyof typeof PLANS];
    return (
      <>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
          <div className="w-16 h-16 rounded-full bg-[#a590ff]/10 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-[#a590ff]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Fonctionnalité verrouillée
          </h2>
          <p className="text-gray-600 mb-2 max-w-md">
            {featureName
              ? `"${featureName}" est disponible`
              : "Cette fonctionnalité est disponible"}{" "}
            à partir du plan{" "}
            <span className="font-semibold text-[#a590ff]">{requiredPlan?.name ?? minPlan}</span>.
          </p>
          <p className="text-sm text-gray-500 mb-8 max-w-sm">
            Passez à un plan supérieur pour débloquer l'accès et booster vos recrutements.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-3 bg-[#a590ff] text-white rounded-full font-semibold hover:bg-[#9580ef] transition-colors"
          >
            Voir les plans
          </button>
        </div>
        <PlanSelectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  return <>{children}</>;
}
