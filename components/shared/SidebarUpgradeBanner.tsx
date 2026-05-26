"use client";

import { useState } from "react";
import { IconSparkles, IconCheck } from "@tabler/icons-react";
import { useAbonnement } from "@/lib/hooks/use-abonnement";
import { PlanSelectionModal } from "@/components/shared/PlanSelectionModal";

interface Props {
  recruteurId?: string;
}

export function SidebarUpgradeBanner({ recruteurId }: Props) {
  const { data: abonnement, isLoading } = useAbonnement(recruteurId);
  const [modalOpen, setModalOpen] = useState(false);

  if (isLoading || !recruteurId) return null;

  // Abonnement actif → badge discret "Pro"
  if (abonnement?.statut === "ACTIF") {
    return (
      <div className="mx-2 mb-2 rounded-lg bg-[#a590ff]/10 border border-[#a590ff]/20 px-3 py-2 flex items-center gap-2">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#a590ff]">
          <IconCheck className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#a590ff]">
            Plan {abonnement.plan}
          </p>
          {abonnement.dateFin && (
            <p className="text-[10px] text-muted-foreground truncate">
              Expire le{" "}
              {new Date(abonnement.dateFin).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Pas d'abonnement ou expiré → bannière upgrade
  return (
    <>
      <div className="mx-2 mb-2 rounded-xl bg-gradient-to-br from-[#a590ff] to-[#7c5cbf] p-3 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20">
            <IconSparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <p className="text-xs font-bold">Passer au plan Pro</p>
        </div>
        <p className="text-[10px] leading-relaxed opacity-90 mb-3">
          Multi-diffusion, offres illimitées, Kanban avancé et statistiques détaillées.
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-lg bg-white text-[#7c5cbf] text-xs font-semibold py-1.5 hover:bg-white/90 transition-colors"
        >
          Voir les plans
        </button>
      </div>

      <PlanSelectionModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
