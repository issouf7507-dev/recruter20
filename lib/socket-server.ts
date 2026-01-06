import { io as SocketIOClient } from "socket.io-client";

// Cette fonction est utilisée côté serveur (API routes) pour émettre des messages
// Elle se connecte au serveur Socket.IO en tant que client interne

const SOCKET_URL = process.env.SOCKET_SERVER_URL || "http://localhost:3001";

let internalSocket: ReturnType<typeof SocketIOClient> | null = null;

export function getInternalSocket() {
  if (!internalSocket) {
    internalSocket = SocketIOClient(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    internalSocket.on("connect", () => {
      console.log("🔌 API connectée au serveur Socket.IO");
    });

    internalSocket.on("connect_error", (error) => {
      console.error("❌ Erreur de connexion API -> Socket.IO:", error.message);
    });
  }

  return internalSocket;
}

export interface EmitMessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "CANDIDAT" | "RECRUTEUR";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

// Émettre un nouveau message via Socket.IO
export function emitNewMessage(message: EmitMessageData) {
  try {
    const socket = getInternalSocket();

    if (socket.connected) {
      socket.emit("send_message", message);
      console.log(
        `📤 Message émis via Socket.IO pour la conversation ${message.conversationId}`
      );
    } else {
      // Si pas encore connecté, attendre la connexion
      socket.once("connect", () => {
        socket.emit("send_message", message);
        console.log(
          `📤 Message émis via Socket.IO (après reconnexion) pour la conversation ${message.conversationId}`
        );
      });
    }
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'émission du message via Socket.IO:",
      error
    );
  }
}
