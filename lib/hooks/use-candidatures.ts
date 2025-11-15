import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApplicationStatus } from "../api/candidatures/types";
import { toast } from "sonner";

interface CreateApplicationData {
  jobOfferId: string;
  message?: string;
  cv?: string;
}

/**
 * Hook pour gérer les candidatures
 */
export function useCandidatures(id?: string) {
  const queryClient = useQueryClient();

  // Récupérer les candidatures d'un candidat

  const {
    data: candidatures,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["candidatures", id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`/api/candidats/${id}/candidatures`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  // Récupérer les candidatures d'un recruteur

  const {
    data: candidaturesRecruteur,
    isLoading: isLoadingRecruteur,
    error: errorRecruteur,
    refetch: refetchRecruteur,
  } = useQuery({
    queryKey: ["candidaturesRecruteur", id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`/api/recruteurs/${id}/candidatures`);
      if (!response.ok) return [];
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!id,
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

  // Mutation pour mettre à jour le statut d'une candidature
  const updateStatusCandidature = useMutation({
    mutationFn: async (data: { id: string; status: ApplicationStatus }) => {
      // console.log("data", data.id);
      const response = await fetch(`/api/recruteurs/${data.id}/candidatures`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update status");
      }

      return result;
    },

    onSuccess: () => {
      // Invalider le cache des candidatures
      queryClient.invalidateQueries({ queryKey: ["candidaturesRecruteur"] });
    },
  });

  // Mutation pour mettre à candidature en favoris
  const updateFavoriteCandidature = useMutation({
    mutationFn: async (data: { id: string; favorite: boolean }) => {
      const response = await fetch(
        `/api/recruteurs/${data.id}/candidatures-favorites`,
        {
          method: "PUT",
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update favorite");
      }
      return result;
    },
    onSuccess: () => {
      // Invalider le cache des candidatures
      queryClient.invalidateQueries({ queryKey: ["candidaturesRecruteur"] });
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

  // Mutation pour créer une conversation
  const createConversation = useMutation({
    mutationFn: async (data: {
      candidatId: string;
      jobOfferId: string;
      recruteurId: string;
    }) => {
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create conversation");
      }

      return result;
    },
    onSuccess: (result) => {
      // Invalider le cache des conversations
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Afficher un message de succès
      if (result.success) {
        toast.success(
          result.isNew
            ? "Conversation créée avec succès"
            : "Conversation ouverte"
        );

        // Rediriger vers la messagerie avec l'ID de la conversation
        if (result.data?.id) {
          window.location.href = `/recruteur/messagerie?conversationId=${result.data.id}`;
        }
      }
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la création de la conversation"
      );
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
    candidaturesRecruteur,
    candidaturesFavorites: candidaturesRecruteur?.filter(
      (c: any) => c.favorite === true
    ),
    isLoading,
    isLoadingRecruteur,
    error,
    errorRecruteur,
    refetch,
    refetchRecruteur,
    createCandidature,
    updateStatusCandidature,
    updateFavoriteCandidature,
    deleteCandidature,
    createConversation,
    hasApplied,
  };
}
