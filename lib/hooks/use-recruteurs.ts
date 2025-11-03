import { useQuery } from "@tanstack/react-query";
import { fetchRecruteurByUserId } from "@/lib/api/recruteurs/service";
import type { Recruteur } from "@/lib/api/recruteurs/types";

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

// Re-export types
export type { Recruteur };
