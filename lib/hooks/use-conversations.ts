/**
 * Hook pour gérer les conversations
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useConversations(id?: string, conversationId?: string) {
  const queryClient = useQueryClient();

  // Récupérer les conversations d'un recruteur
  const {
    data: conversationsRecruteur,
    isLoading: isLoadingConversationsRecruteur,
    error: errorConversationsRecruteur,
    refetch: refetchConversationsRecruteur,
  } = useQuery({
    queryKey: ["conversationsRecruteur", id],
    queryFn: async () => {
      if (!id) return [];
      const response = await fetch(`/api/conversations?recruteurId=${id}`);
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!id,
  });

  // Récupérer les messages d'une conversation

  const {
    data: conversationsMessages,
    isLoading: isLoadingConversationsMessages,
    error: errorConversationsMessages,
    refetch: refetchConversationsMessages,
  } = useQuery({
    queryKey: ["messagesConversation", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      const result = await response.json();
      return result.success ? result.data : [];
    },
    enabled: !!conversationId,
  });

  return {
    // Conversations d'un recruteur
    conversationsRecruteur,
    isLoadingConversationsRecruteur,
    errorConversationsRecruteur,
    refetchConversationsRecruteur,

    // Messages d'une conversation
    conversationsMessages,
    isLoadingConversationsMessages,
    errorConversationsMessages,
    refetchConversationsMessages,
  };
}
