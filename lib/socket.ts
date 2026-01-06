import { io, Socket } from "socket.io-client";

// Types pour les événements Socket
export interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "CANDIDAT" | "RECRUTEUR";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TypingData {
  conversationId: string;
  userId: string;
  userType: "CANDIDAT" | "RECRUTEUR";
  isTyping: boolean;
}

export interface ConversationUpdateData {
  conversationId: string;
  lastMessage: MessageData;
}

// URL du serveur Socket.IO
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

// Instance singleton du socket
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on("connect", () => {
      console.log("🔌 Connecté au serveur Socket.IO");
    });

    socket.on("disconnect", (reason) => {
      console.log("🔌 Déconnecté du serveur Socket.IO:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion Socket.IO:", error.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Reconnecté après ${attemptNumber} tentative(s)`);
    });
  }
  return socket;
};

export const connectSocket = (): Socket => {
  const socketInstance = getSocket();
  if (!socketInstance.connected) {
    socketInstance.connect();
  }
  return socketInstance;
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// Fonctions utilitaires pour les événements
export const joinConversation = (
  conversationId: string,
  userId: string,
  userType: "CANDIDAT" | "RECRUTEUR"
): void => {
  const socketInstance = getSocket();
  socketInstance.emit("join_conversation", {
    conversationId,
    userId,
    userType,
  });
};

export const leaveConversation = (conversationId: string): void => {
  const socketInstance = getSocket();
  socketInstance.emit("leave_conversation", { conversationId });
};

export const sendSocketMessage = (message: MessageData): void => {
  const socketInstance = getSocket();
  socketInstance.emit("send_message", message);
};

export const emitTyping = (
  conversationId: string,
  userId: string,
  userType: "CANDIDAT" | "RECRUTEUR",
  isTyping: boolean
): void => {
  const socketInstance = getSocket();
  socketInstance.emit("typing", {
    conversationId,
    userId,
    userType,
    isTyping,
  });
};

export const markMessageAsRead = (
  conversationId: string,
  messageId: string,
  readerId: string
): void => {
  const socketInstance = getSocket();
  socketInstance.emit("message_read", {
    conversationId,
    messageId,
    readerId,
  });
};
