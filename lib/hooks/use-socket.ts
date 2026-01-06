"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  getSocket,
  connectSocket,
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  emitTyping,
  MessageData,
  TypingData,
  ConversationUpdateData,
} from "@/lib/socket";
import type { Socket } from "socket.io-client";

interface UseSocketOptions {
  conversationId?: string;
  userId?: string;
  userType?: "CANDIDAT" | "RECRUTEUR";
  onNewMessage?: (message: MessageData) => void;
  onTyping?: (data: TypingData) => void;
  onConversationUpdate?: (data: ConversationUpdateData) => void;
  onMessageRead?: (data: {
    conversationId: string;
    messageId: string;
    readerId: string;
  }) => void;
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    conversationId,
    userId,
    userType,
    onNewMessage,
    onTyping,
    onConversationUpdate,
    onMessageRead,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connexion au socket
  useEffect(() => {
    socketRef.current = connectSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("disconnect", handleDisconnect);

    // Vérifier l'état actuel
    if (socketRef.current.connected) {
      setIsConnected(true);
    }

    return () => {
      socketRef.current?.off("connect", handleConnect);
      socketRef.current?.off("disconnect", handleDisconnect);
    };
  }, []);

  // Rejoindre une conversation
  useEffect(() => {
    if (conversationId && userId && userType && isConnected) {
      joinConversation(conversationId, userId, userType);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [conversationId, userId, userType, isConnected]);

  // Écouter les nouveaux messages
  useEffect(() => {
    if (!socketRef.current) return;

    const handleNewMessage = (message: MessageData) => {
      onNewMessage?.(message);
    };

    socketRef.current.on("new_message", handleNewMessage);

    return () => {
      socketRef.current?.off("new_message", handleNewMessage);
    };
  }, [onNewMessage]);

  // Écouter les indicateurs de saisie
  useEffect(() => {
    if (!socketRef.current) return;

    const handleTyping = (data: TypingData) => {
      setIsTyping((prev) => ({
        ...prev,
        [data.userId]: data.isTyping,
      }));
      onTyping?.(data);
    };

    socketRef.current.on("user_typing", handleTyping);

    return () => {
      socketRef.current?.off("user_typing", handleTyping);
    };
  }, [onTyping]);

  // Écouter les mises à jour de conversation
  useEffect(() => {
    if (!socketRef.current) return;

    const handleConversationUpdate = (data: ConversationUpdateData) => {
      onConversationUpdate?.(data);
    };

    socketRef.current.on("conversation_updated", handleConversationUpdate);

    return () => {
      socketRef.current?.off("conversation_updated", handleConversationUpdate);
    };
  }, [onConversationUpdate]);

  // Écouter les messages lus
  useEffect(() => {
    if (!socketRef.current) return;

    const handleMessageRead = (data: {
      conversationId: string;
      messageId: string;
      readerId: string;
    }) => {
      onMessageRead?.(data);
    };

    socketRef.current.on("message_was_read", handleMessageRead);

    return () => {
      socketRef.current?.off("message_was_read", handleMessageRead);
    };
  }, [onMessageRead]);

  // Envoyer un message via socket
  const sendMessage = useCallback((message: MessageData) => {
    sendSocketMessage(message);
  }, []);

  // Émettre l'indicateur de saisie avec debounce
  const handleTypingStart = useCallback(() => {
    if (!conversationId || !userId || !userType) return;

    emitTyping(conversationId, userId, userType, true);

    // Réinitialiser le timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Arrêter l'indicateur après 2 secondes d'inactivité
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(conversationId, userId, userType, false);
    }, 2000);
  }, [conversationId, userId, userType]);

  const handleTypingStop = useCallback(() => {
    if (!conversationId || !userId || !userType) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    emitTyping(conversationId, userId, userType, false);
  }, [conversationId, userId, userType]);

  return {
    isConnected,
    isTyping,
    sendMessage,
    handleTypingStart,
    handleTypingStop,
    socket: socketRef.current,
  };
}
