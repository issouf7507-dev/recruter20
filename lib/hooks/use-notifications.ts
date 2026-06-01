import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return { data: [], unreadCount: 0 };
      return res.json();
    },
    refetchInterval: 60_000,
    refetchIntervalInBackground: false, // ne poll pas quand l'onglet est en arrière-plan
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkOneRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetch(`/api/notifications/${id}`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}
