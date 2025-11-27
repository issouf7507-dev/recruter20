"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IconSearch,
  IconPlus,
  IconDots,
  IconCheck,
  IconChecks,
  IconSend,
  IconMoodSmile,
  IconPaperclip,
  IconMicrophone,
  IconVideo,
  IconPhone,
  IconArrowLeft,
  IconCirclePlus,
} from "@tabler/icons-react";
import { useSession } from "@/lib/auth-client";
import { useRecruteurByUserId } from "@/lib/hooks/use-recruteurs";
import { toast } from "sonner";
import { useConversations } from "@/lib/hooks/use-conversations";

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
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    image: string | null;
    user: {
      email: string;
      name: string | null;
    };
  };
  jobOffer: {
    id: string;
    title: string;
    company: string | null;
  };
  messages: Message[];
}

export default function MessageriePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const conversationIdFromUrl = searchParams.get("conversationId");

  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const recruteurId = recruteur?.id;

  const {
    conversationsRecruteur,
    isLoadingConversationsRecruteur,
    errorConversationsRecruteur,
    refetchConversationsRecruteur,

    conversationsMessages,
    isLoadingConversationsMessages,
    errorConversationsMessages,
    refetchConversationsMessages,
  } = useConversations(recruteurId, conversationIdFromUrl || undefined);

  // console.log("conversationsRecruteur", conversationsRecruteur);

  // Synchroniser les messages avec conversationsMessages
  useEffect(() => {
    if (conversationsMessages) {
      setMessages(conversationsMessages);
    } else {
      setMessages([]);
    }
  }, [conversationsMessages]);

  // Sélectionner la conversation depuis l'URL
  useEffect(() => {
    if (conversationIdFromUrl && conversationsRecruteur?.length > 0) {
      const conversation = conversationsRecruteur?.find(
        (c: Conversation) => c.id === conversationIdFromUrl
      );
      if (conversation) {
        handleConversationSelect(conversation);
      }
    } else if (conversationsRecruteur?.length > 0 && !selectedConversation) {
      // Sélectionner la première conversation par défaut
      handleConversationSelect(conversationsRecruteur[0]);
    }
  }, [conversationIdFromUrl, conversationsRecruteur]);

  // Scroll vers le bas quand les messages changent
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setShowMobileChat(true);

    // Mettre à jour l'URL - React Query refetch automatiquement quand conversationIdFromUrl change
    router.push(`/recruteur/messagerie?conversationId=${conversation.id}`);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !recruteurId) {
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
            senderId: recruteurId,
            senderType: "RECRUTEUR",
            content: newMessage,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setNewMessage("");
        // Recharger les messages et les conversations
        refetchConversationsMessages();
        refetchConversationsRecruteur();
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
    // Pour l'instant, on considère tous les messages comme envoyés
    if (message.senderType === "RECRUTEUR") {
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

  const getInitials = (nom: string, prenom: string) => {
    return `${nom?.[0] || ""}${prenom?.[0] || ""}`.toUpperCase();
  };

  const filteredConversations = conversationsRecruteur?.filter(
    (conv: Conversation) =>
      `${conv.candidat.prenom} ${conv.candidat.nom}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (isLoadingConversationsRecruteur) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">
              Chargement des conversations...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (conversationsRecruteur?.length === 0) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="py-8 text-center">
              <IconPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                Aucune conversation
              </h3>
              <p className="text-muted-foreground mb-4">
                Vous n'avez pas encore de conversations. Contactez un candidat
                depuis la page des candidatures pour commencer.
              </p>
              <Button onClick={() => router.push("/recruteur/candidatures")}>
                Voir les candidatures
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full gap-4">
                {/* Sidebar - Liste des conversations */}
                <div
                  className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 pb-0 ${
                    showMobileChat ? "hidden lg:flex" : "flex"
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
                      {filteredConversations?.map(
                        (conversation: Conversation) => {
                          const lastMessage =
                            conversation.messages[
                              conversation.messages.length - 1
                            ];
                          const isSelected =
                            selectedConversation?.id === conversation.id;

                          return (
                            <div
                              key={conversation.id}
                              className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 px-6 py-4 ${
                                isSelected ? "bg-muted" : ""
                              }`}
                              onClick={() =>
                                handleConversationSelect(conversation)
                              }
                            >
                              <Avatar className="relative flex size-8 shrink-0 rounded-full overflow-visible md:size-10">
                                <AvatarImage
                                  src={conversation.candidat.image || ""}
                                />
                                <AvatarFallback>
                                  {getInitials(
                                    conversation.candidat.nom,
                                    conversation.candidat.prenom
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 grow">
                                <div className="flex items-center justify-between">
                                  <span className="truncate text-sm font-medium">
                                    {conversation.candidat.prenom}{" "}
                                    {conversation.candidat.nom}
                                  </span>
                                  {lastMessage && (
                                    <span className="text-muted-foreground flex-none text-xs">
                                      {formatLastMessageTime(
                                        lastMessage.createdAt
                                      )}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {lastMessage && getStatusIcon(lastMessage)}
                                  <span className="text-muted-foreground truncate text-start text-sm">
                                    {lastMessage
                                      ? lastMessage.content
                                      : "Aucun message"}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {conversation.jobOffer.title}
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>

                {/* Zone de chat principale */}
                {selectedConversation && (
                  <div
                    className={`grow ${
                      showMobileChat ? "flex" : "hidden lg:flex"
                    }`}
                  >
                    <div className="bg-background flex h-full w-full flex-col lg:border lg:rounded-xl">
                      {/* Header du chat */}
                      <div className="flex justify-between gap-4 p-4 border-b">
                        <div className="flex gap-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="size-10 p-0 lg:hidden"
                            onClick={() => setShowMobileChat(false)}
                          >
                            <IconArrowLeft className="h-4 w-4" />
                          </Button>
                          <Avatar className="relative flex size-8 shrink-0 rounded-full overflow-visible lg:size-10">
                            <AvatarImage
                              src={selectedConversation.candidat.image || ""}
                            />
                            <AvatarFallback>
                              {getInitials(
                                selectedConversation.candidat.nom,
                                selectedConversation.candidat.prenom
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold">
                              {selectedConversation.candidat.prenom}{" "}
                              {selectedConversation.candidat.nom}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {selectedConversation.jobOffer.title}
                            </span>
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
                        {isLoadingConversationsMessages ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                              <p className="text-muted-foreground">
                                Chargement des messages...
                              </p>
                            </div>
                          </div>
                        ) : messages.length === 0 ? (
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
                              const isOwn = message.senderType === "RECRUTEUR";
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
                        <div className="bg-muted relative flex items-center rounded-md border">
                          <Input
                            placeholder="Tapez votre message..."
                            className="h-14 border-transparent bg-white pe-32 text-base shadow-transparent ring-transparent lg:pe-20"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                            disabled={isSending}
                          />
                          <div className="absolute end-4 flex items-center gap-2">
                            <Button
                              onClick={handleSendMessage}
                              className="h-9 px-4 py-2"
                              disabled={!newMessage.trim() || isSending}
                            >
                              {isSending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <>
                                  <span className="hidden lg:inline">
                                    Envoyer
                                  </span>
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
          </div>
        </div>
      </div>
    </>
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
