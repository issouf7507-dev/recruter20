import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateApplicationData {
  jobOfferId: string;
  message?: string;
  cv?: string;
}

/**
 * Hook pour gérer les candidatures
 */
export function useCandidatures(candidatId?: string) {
  const queryClient = useQueryClient();

  // Récupérer les candidatures d'un candidat
  const {
    data: candidatures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidatures", candidatId],
    queryFn: async () => {
      if (!candidatId) return [];
      const response = await fetch(`/api/candidats/${candidatId}/candidatures`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!candidatId,
  });

  // Mutation pour créer une candidature
  const createCandidature = useMutation({
    mutationFn: async (data: CreateApplicationData) => {
      const response = await fetch("/api/candidatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create application");
      }

      return result;
    },
    onSuccess: () => {
      // Invalider le cache des candidatures
      queryClient.invalidateQueries({ queryKey: ["candidatures"] });
    },
  });

  // Mutation pour supprimer une candidature
  const deleteCandidature = useMutation({
    mutationFn: async (candidatureId: string) => {
      const response = await fetch(`/api/candidatures/${candidatureId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete application");
      }

      return result;
    },
    onSuccess: () => {
      // Invalider le cache des candidatures
      queryClient.invalidateQueries({ queryKey: ["candidatures"] });
    },
  });

  // Vérifier si le candidat a déjà postulé à une offre
  const hasApplied = (jobOfferId: string) => {
    return candidatures?.some(
      (c: any) => c.jobOfferId === jobOfferId && !c.deletedAt
    );
  };

  return {
    candidatures,
    isLoading,
    error,
    refetch,
    createCandidature,
    deleteCandidature,
    hasApplied,
  };
}
