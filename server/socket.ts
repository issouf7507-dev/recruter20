import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";

const PORT = parseInt(process.env.SOCKET_PORT || "3001", 10);

// Créer un serveur HTTP
const httpServer = createServer();

// Créer le serveur Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Types pour les événements
interface MessageData {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "CANDIDAT" | "RECRUTEUR";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface JoinRoomData {
  conversationId: string;
  userId: string;
  userType: "CANDIDAT" | "RECRUTEUR";
}

interface TypingData {
  conversationId: string;
  userId: string;
  userType: "CANDIDAT" | "RECRUTEUR";
  isTyping: boolean;
}

// Map pour stocker les utilisateurs connectés par conversation
const connectedUsers = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`🔌 Client connecté: ${socket.id}`);

  // Rejoindre une conversation (room)
  socket.on("join_conversation", (data: JoinRoomData) => {
    const { conversationId, userId, userType } = data;

    // Rejoindre la room de la conversation
    socket.join(`conversation:${conversationId}`);

    // Stocker l'utilisateur dans la map
    if (!connectedUsers.has(conversationId)) {
      connectedUsers.set(conversationId, new Set());
    }
    connectedUsers.get(conversationId)?.add(socket.id);

    console.log(
      `👤 ${userType} ${userId} a rejoint la conversation ${conversationId}`
    );

    // Notifier les autres membres de la conversation
    socket.to(`conversation:${conversationId}`).emit("user_joined", {
      conversationId,
      userId,
      userType,
    });
  });

  // Quitter une conversation
  socket.on("leave_conversation", (data: { conversationId: string }) => {
    const { conversationId } = data;
    socket.leave(`conversation:${conversationId}`);
    connectedUsers.get(conversationId)?.delete(socket.id);
    console.log(
      `👋 Client ${socket.id} a quitté la conversation ${conversationId}`
    );
  });

  // Nouveau message
  socket.on("send_message", (message: MessageData) => {
    console.log(
      `📨 Nouveau message dans la conversation ${message.conversationId}`
    );

    // Émettre le message à tous les membres de la conversation (y compris l'expéditeur)
    io.to(`conversation:${message.conversationId}`).emit(
      "new_message",
      message
    );

    // Émettre aussi une mise à jour de la liste des conversations
    io.emit("conversation_updated", {
      conversationId: message.conversationId,
      lastMessage: message,
    });
  });

  // Indicateur de saisie
  socket.on("typing", (data: TypingData) => {
    socket.to(`conversation:${data.conversationId}`).emit("user_typing", data);
  });

  // Message lu
  socket.on(
    "message_read",
    (data: { conversationId: string; messageId: string; readerId: string }) => {
      socket
        .to(`conversation:${data.conversationId}`)
        .emit("message_was_read", data);
    }
  );

  // Déconnexion
  socket.on("disconnect", () => {
    console.log(`🔌 Client déconnecté: ${socket.id}`);

    // Nettoyer les references de l'utilisateur dans toutes les conversations
    connectedUsers.forEach((users, conversationId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        socket.to(`conversation:${conversationId}`).emit("user_left", {
          socketId: socket.id,
        });
      }
    });
  });
});

// Démarrer le serveur
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur Socket.IO démarré sur le port ${PORT}`);
});

// Exporter le serveur io pour pouvoir émettre des messages depuis l'API
export { io, httpServer };
