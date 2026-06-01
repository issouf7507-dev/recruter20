import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAlertes(candidatId?: string) {
  return useQuery({
    queryKey: ["alertes", candidatId],
    queryFn: async () => {
      const res = await fetch(`/api/candidats/${candidatId}/alertes`);
      if (!res.ok) throw new Error("Erreur chargement alertes");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!candidatId,
  });
}

export function useCreateAlerte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/alertes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur création alerte");
      return res.json();
    },
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: ["alertes", vars.candidatId] });
      toast.success("Alerte créée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateAlerte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/alertes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur mise à jour alerte");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alertes"] }),
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteAlerte() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/alertes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression alerte");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["alertes"] });
      toast.success("Alerte supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
