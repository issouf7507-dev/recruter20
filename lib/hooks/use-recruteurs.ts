import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchRecruteurByUserId,
  updateRecruteurInformation,
  updateRecruteurInformationEntreprise,
} from "@/lib/api/recruteurs/service";
import type {
  Recruteur,
  RecruteurInformation,
  RecruteurInformationEntreprise,
} from "@/lib/api/recruteurs/types";
import { fetchCollaborateurByUserId } from "../api/collaborateur/service";
import { toast } from "sonner";

/**
 * Hook to fetch recruteur by userId
 */
export function useRecruteurByUserId(userId?: string) {
  return useQuery({
    queryKey: ["recruteur", "userId", userId],
    queryFn: () => fetchRecruteurByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCollaborateurByUserId(userId?: string) {
  return useQuery({
    queryKey: ["collaborateur", "userId", userId],
    queryFn: () => fetchCollaborateurByUserId(userId!),
    enabled: !!userId,
  });
}

/**
 * Hook to update recruteur information
 */
export function useUpdateRecruteurInformation(
  id: string,
  data: RecruteurInformation
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateRecruteurInformation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruteur", "userId", id] });
    },
  });
}

/**
 * Hook to update recruteur information entreprise
 */
export function useUpdateRecruteurInformationEntreprise(
  id: string,
  data: RecruteurInformationEntreprise
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => updateRecruteurInformationEntreprise(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruteur", "userId", id] });
      toast.success("Entreprise mise à jour avec succès");
    },
  });
}
// Re-export types
export type { Recruteur };
