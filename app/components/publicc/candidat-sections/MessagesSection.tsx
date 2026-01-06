"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconSend,
  IconCheck,
  IconChecks,
  IconBriefcase,
  IconMapPin,
  IconDots,
  IconArrowLeft,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { useSocket } from "@/lib/hooks/use-socket";
import type { MessageData } from "@/lib/socket";

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: "CANDIDAT" | "RECRUTEUR";
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Conversation {
  id: string;
  jobOfferId: string;
  candidatId: string;
  recruteurId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  recruteur: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    companyName: string | null;
    logo: string | null;
    type: string;
  };
  jobOffer: {
    id: string;
    title: string;
    company: string | null;
    location: string | null;
  };
  messages: Message[];
}

interface MessagesSectionProps {
  candidatId?: string;
}

export function MessagesSection({ candidatId }: MessagesSectionProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Callback pour gérer les nouveaux messages en temps réel
  const handleNewMessage = useCallback(
    (message: MessageData) => {
      // Ajouter le message s'il appartient à la conversation sélectionnée
      if (message.conversationId === selectedConversation?.id) {
        setMessages((prev) => {
          // Éviter les doublons
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    },
    [selectedConversation?.id]
  );

  // Callback pour les mises à jour de conversation (liste des conversations)
  const handleConversationUpdate = useCallback(() => {
    loadConversations();
  }, [candidatId]);

  // Hook Socket.IO pour les messages en temps réel
  const {
    isConnected,
    isTyping,
    handleTypingStart,
    handleTypingStop,
    sendMessage,
  } = useSocket({
    conversationId: selectedConversation?.id,
    userId: candidatId,
    userType: "CANDIDAT",
    onNewMessage: handleNewMessage,
    onConversationUpdate: handleConversationUpdate,
  });

  useEffect(() => {
    if (candidatId) {
      loadConversations();
    }
  }, [candidatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/candidats/${candidatId}/conversations`
      );
      const result = await response.json();

      if (result.success) {
        setConversations(result.data);
        if (result.data.length > 0 && !selectedConversation) {
          handleConversationSelect(result.data[0]);
        }
      } else {
        toast.error("Erreur lors du chargement des conversations");
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Erreur lors du chargement des conversations");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/conversations/${conversationId}/messages`
      );
      const result = await response.json();

      if (result.success) {
        setMessages(result.data);
      } else {
        toast.error("Erreur lors du chargement des messages");
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Erreur lors du chargement des messages");
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowChat(true);
    loadMessages(conversation.id);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !candidatId) {
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(
        `/api/conversations/${selectedConversation.id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            senderId: candidatId,
            senderType: "CANDIDAT",
            content: newMessage,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setMessages((prev) => [...prev, result.data]);
        setNewMessage("");
        loadConversations();
      } else {
        toast.error("Erreur lors de l'envoi du message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusIcon = (message: Message) => {
    if (message.senderType === "CANDIDAT") {
      if (message.isRead) {
        return <IconChecks className="h-4 w-4 text-green-500" />;
      }
      return <IconCheck className="h-4 w-4 text-muted-foreground" />;
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return "À l'instant";
    if (diffInMinutes < 60) return `${diffInMinutes} min`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays === 1) return "Hier";
    if (diffInDays < 7) return `${diffInDays}j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const getRecruteurName = (recruteur: Conversation["recruteur"]) => {
    if (recruteur.type === "ENTREPRISE" && recruteur.companyName) {
      return recruteur.companyName;
    }
    if (recruteur.firstName && recruteur.lastName) {
      return `${recruteur.firstName} ${recruteur.lastName}`;
    }
    return "Recruteur";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredConversations = conversations.filter(
    (conv) =>
      getRecruteurName(conv.recruteur)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      conv.jobOffer.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Aucun message</h3>
          <p className="text-muted-foreground">
            Vous n'avez pas encore de conversations avec des recruteurs.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Les recruteurs pourront vous contacter après avoir consulté votre
            profil.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-[calc(100vh-20rem)]">
      <div className="flex h-full w-full gap-4">
        {/* Sidebar - Liste des conversations */}
        <div
          className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 pb-0 ${
            showChat ? "hidden lg:flex" : "flex"
          } w-full lg:w-96`}
        >
          <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
            <div className="font-semibold font-display text-xl lg:text-2xl">
              Conversations
            </div>
            <div className="text-muted-foreground text-sm relative col-span-2 mt-4 flex w-full items-center">
              <IconSearch className="text-muted-foreground absolute start-4 size-4" />
              <Input
                placeholder="Rechercher..."
                className="ps-10 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <div className="block min-w-0 divide-y">
              {filteredConversations.map((conversation) => {
                const lastMessage = conversation.messages[0];
                const isSelected = selectedConversation?.id === conversation.id;
                const recruteurName = getRecruteurName(conversation.recruteur);

                return (
                  <div
                    key={conversation.id}
                    className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 px-6 py-4 ${
                      isSelected ? "bg-muted" : ""
                    }`}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <Avatar className="relative flex size-8 shrink-0 rounded-full overflow-visible md:size-10">
                      <AvatarImage src={conversation.recruteur.logo || ""} />
                      <AvatarFallback>
                        {getInitials(recruteurName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 grow">
                      <div className="flex items-center justify-between">
                        <span className="truncate text-sm font-medium">
                          {recruteurName}
                        </span>
                        {lastMessage && (
                          <span className="text-muted-foreground flex-none text-xs">
                            {formatLastMessageTime(lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {lastMessage && getStatusIcon(lastMessage)}
                        <span className="text-muted-foreground truncate text-start text-sm">
                          {lastMessage ? lastMessage.content : "Aucun message"}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {conversation.jobOffer.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Zone de chat principale */}
        {selectedConversation && (
          <div className={`grow ${showChat ? "flex" : "hidden lg:flex"}`}>
            <div className="bg-background flex h-full w-full flex-col lg:border lg:rounded-xl">
              {/* Header du chat */}
              <div className="flex justify-between gap-4 p-4 border-b">
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="size-10 p-0 lg:hidden"
                    onClick={() => setShowChat(false)}
                  >
                    <IconArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="relative flex size-8 shrink-0 rounded-full overflow-visible lg:size-10">
                    <AvatarImage
                      src={selectedConversation.recruteur.logo || ""}
                    />
                    <AvatarFallback>
                      {getInitials(
                        getRecruteurName(selectedConversation.recruteur)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold">
                      {getRecruteurName(selectedConversation.recruteur)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedConversation.jobOffer.title}
                    </span>
                    {selectedConversation.jobOffer.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <IconMapPin className="h-3 w-3" />
                        <span>{selectedConversation.jobOffer.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="size-9">
                    <IconDots className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Zone des messages */}
              <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <IconMessage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Aucun message pour le moment.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Commencez la conversation !
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.senderType === "CANDIDAT";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] space-y-1 ${
                              isOwn ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`inline-flex rounded-lg px-4 py-2 ${
                                isOwn
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap wrap-break-word">
                                {message.content}
                              </p>
                            </div>
                            <div
                              className={`flex items-center gap-2 px-1 ${
                                isOwn ? "justify-end" : "justify-start"
                              }`}
                            >
                              <time className="text-muted-foreground text-xs">
                                {formatTime(message.createdAt)}
                              </time>
                              {isOwn && getStatusIcon(message)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t">
                {/* Indicateur de frappe */}
                {Object.values(isTyping).some(Boolean) && (
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="animate-bounce">.</span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      >
                        .
                      </span>
                      <span
                        className="animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      >
                        .
                      </span>
                    </div>
                    <span>Le recruteur est en train d'écrire</span>
                  </div>
                )}
                <div className="bg-muted relative flex items-center rounded-md border">
                  <Input
                    placeholder="Tapez votre message..."
                    className="h-14 border-transparent bg-white pe-32 text-base shadow-transparent ring-transparent lg:pe-20"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTypingStart();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleTypingStop();
                        handleSendMessage();
                      }
                    }}
                    onBlur={handleTypingStop}
                    disabled={isSending}
                  />
                  <div className="absolute end-4 flex items-center gap-2">
                    {/* Indicateur de connexion Socket */}
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isConnected ? "bg-green-500" : "bg-red-500"
                      }`}
                      title={
                        isConnected ? "Connecté en temps réel" : "Non connecté"
                      }
                    />
                    <Button
                      onClick={() => {
                        handleTypingStop();
                        handleSendMessage();
                      }}
                      className="h-9 px-4 py-2"
                      disabled={!newMessage.trim() || isSending}
                    >
                      {isSending ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <span className="hidden lg:inline">Envoyer</span>
                          <IconSend className="inline lg:hidden h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function IconMessage({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  );
}
