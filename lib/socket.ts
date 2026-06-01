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
let connectErrorCount = 0;
const MAX_SILENT_ERRORS = 1; // log une seule fois, ensuite silence

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      timeout: 5000,
    });

    socket.on("connect", () => {
      connectErrorCount = 0;
    });

    socket.on("connect_error", () => {
      if (connectErrorCount < MAX_SILENT_ERRORS) {
        connectErrorCount++;
      }
      // Après MAX_SILENT_ERRORS tentatives échouées, on arrête de reconnecter
      // pour ne pas polluer la console ni saturer le réseau
      if (connectErrorCount >= MAX_SILENT_ERRORS && socket) {
        socket.io.opts.reconnection = false;
      }
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
