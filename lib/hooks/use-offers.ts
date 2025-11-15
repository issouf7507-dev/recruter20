import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as offerService from "@/lib/api/offres/service";
import type { JobOffer, CreateOfferData } from "@/lib/api/offres/types";

/**
 * Hook to fetch all offers
 */
export function useOffers(params?: {
  page?: number;
  limit?: number;
  recruteurId?: string;
  search?: string;
  etat?: string;
  location?: string;
  types?: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  datePosted?: string;
  experience?: string[];
}) {
  return useQuery({
    queryKey: ["offers", params],
    queryFn: () => offerService.fetchOffers(params),
  });
}

/**
 * Hook to fetch a single offer
 */
export function useOffer(id: string) {
  return useQuery({
    queryKey: ["offer", id],
    queryFn: () => offerService.fetchOffer(id),
    enabled: !!id,
  });
}

/**
 * Hook to create an offer
 */
export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: offerService.createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la création de l'offre");
    },
  });
}

/**
 * Hook to update an offer
 */
export function useUpdateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateOfferData>;
    }) => offerService.updateOffer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre mise à jour avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'offre");
    },
  });
}

/**
 * Hook to delete an offer
 */
export function useDeleteOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: offerService.deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offre supprimée avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la suppression de l'offre");
    },
  });
}

// Re-export types
export type { JobOffer, CreateOfferData };
