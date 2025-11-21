import { useQuery } from "@tanstack/react-query";

interface Collaborateur {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  recruteurId: string;
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  invitation: {
    accepted: boolean;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

/**
 * Hook to fetch collaborateurs for a recruteur
 */
export function useCollaborateurs(recruteurId?: string) {
  return useQuery({
    queryKey: ["collaborateurs", recruteurId],
    queryFn: async (): Promise<Collaborateur[]> => {
      if (!recruteurId) {
        return [];
      }

      const response = await fetch(
        `/api/collaborateurs?recruteurId=${recruteurId}`
      );
      const result: ApiResponse<Collaborateur[]> = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch collaborateurs");
      }

      return result.data;
    },
    enabled: !!recruteurId,
  });
}
