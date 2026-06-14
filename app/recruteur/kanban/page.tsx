"use client";

import { RequirePlan } from "@/components/shared/RequirePlan";
import { SiteHeader } from "@/components/site-header";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId, useCollaborateurByUserId } from "@/lib/hooks/use-recruteurs";

export default function KanbanPage() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id ?? collaborateur?.recruteurId;

  return (
    <RequirePlan minPlan="PME" featureName="Tableau Kanban">
      <>
        <SiteHeader title="Tableau Kanban" />
        <div className="flex flex-1 flex-col">
          <div className="px-4 lg:px-6 py-4 lg:py-6 flex-1">
            {recruteurId && (
              <KanbanBoard recruteurId={recruteurId} userId={session?.user?.id} />
            )}
          </div>
        </div>
      </>
    </RequirePlan>
  );
}
