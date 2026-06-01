import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useExperiences(candidatId?: string) {
  return useQuery({
    queryKey: ["experiences", candidatId],
    queryFn: async () => {
      const res = await fetch(`/api/candidats/${candidatId}/experiences`);
      if (!res.ok) throw new Error("Erreur chargement expériences");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!candidatId,
  });
}

export function useFormations(candidatId?: string) {
  return useQuery({
    queryKey: ["formations", candidatId],
    queryFn: async () => {
      const res = await fetch(`/api/candidats/${candidatId}/formations`);
      if (!res.ok) throw new Error("Erreur chargement formations");
      const json = await res.json();
      return json.data ?? [];
    },
    enabled: !!candidatId,
  });
}

export function useCreateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/experiences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur création expérience");
      return res.json();
    },
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: ["experiences", vars.candidatId] });
      toast.success("Expérience ajoutée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/experiences/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur mise à jour expérience");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["experiences"] }),
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteExperience() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/experiences/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression expérience");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["experiences"] });
      toast.success("Expérience supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

export function useCreateFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      const res = await fetch("/api/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur création formation");
      return res.json();
    },
    onSuccess: (_, vars: any) => {
      qc.invalidateQueries({ queryKey: ["formations", vars.candidatId] });
      toast.success("Formation ajoutée");
    },
    onError: () => toast.error("Erreur lors de la création"),
  });
}

export function useUpdateFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
      const res = await fetch(`/api/formations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur mise à jour formation");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["formations"] }),
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

export function useDeleteFormation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/formations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur suppression formation");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["formations"] });
      toast.success("Formation supprimée");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
