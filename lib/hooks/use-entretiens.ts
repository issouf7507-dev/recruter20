import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateEntretienData {
  applicationId: string;
  titre: string;
  dateHeure: string;
  type?: "PRESENTIEL" | "VISIO" | "TELEPHONE";
  lieu?: string;
  notes?: string;
}

async function createEntretien(data: CreateEntretienData) {
  const response = await fetch("/api/entretiens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result: ApiResponse<unknown> = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Impossible de planifier l'entretien");
  }
  return result.data;
}

/**
 * Hook to schedule an interview for an application
 */
export function useCreateEntretien() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEntretien,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kanban-columns"] });
      queryClient.invalidateQueries({ queryKey: ["entretiens"] });
      toast.success("Entretien planifié avec succès");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la planification de l'entretien");
    },
  });
}
