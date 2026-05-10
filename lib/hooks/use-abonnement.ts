import { useQuery } from "@tanstack/react-query";

interface Abonnement {
  plan: "STARTER" | "PRO" | "ENTREPRISE";
  statut: "INACTIF" | "ACTIF" | "EXPIRE" | "SUSPENDU";
  dateDebut: string | null;
  dateFin: string | null;
}

async function fetchAbonnement(recruteurId: string): Promise<Abonnement> {
  const res = await fetch(`/api/recruteurs/${recruteurId}/abonnement`);
  if (!res.ok) throw new Error("Erreur chargement abonnement");
  const json = await res.json();
  return json.data;
}

export function useAbonnement(recruteurId?: string) {
  return useQuery({
    queryKey: ["abonnement", recruteurId],
    queryFn: () => fetchAbonnement(recruteurId!),
    enabled: !!recruteurId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
