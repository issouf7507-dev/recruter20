import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createInvitation,
  fetchInvitations,
} from "@/lib/api/invitation/service";
import { CreateInvitation } from "../api/invitation/types";
import { toast } from "sonner";

export function useInvitations() {
  const queryClient = useQueryClient();
  const {
    data: invitations,
    isLoading: isLoadingInvitations,
    error: errorInvitations,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => fetchInvitations(),
  });

  const createAnInvitation = useMutation({
    mutationFn: async (data: CreateInvitation) => {
      const response = await createInvitation(data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast.success("Invitation créée avec succès");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Erreur lors de la création de l'invitation"
      );
    },
  });

  return {
    invitations,
    isLoadingInvitations,
    errorInvitations,
    refetchInvitations,
    createAnInvitation,
  };
}
