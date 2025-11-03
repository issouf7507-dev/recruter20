"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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

// Données mockées pour les chats
const mockChats = [
  {
    id: 1,
    name: "Marie Dubois",
    avatar: "/images/avatars/01.png",
    lastMessage: "Great! Looking forward to it. See you later!",
    timestamp: "10 minutes",
    unreadCount: 8,
    isOnline: true,
    status: "online",
    lastMessageStatus: "sent", // sent, delivered, read
  },
  {
    id: 2,
    name: "Jean Martin",
    avatar: "/images/avatars/02.png",
    lastMessage:
      "Sounds perfect! I've been wanting to try that place. See you there!",
    timestamp: "40 minutes",
    unreadCount: 2,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
  {
    id: 3,
    name: "Sophie Laurent",
    avatar: "/images/avatars/03.png",
    lastMessage: "How about 7 PM at the new Italian place downtown?",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
    isSelected: true,
  },
  {
    id: 4,
    name: "Pierre Moreau",
    avatar: "/images/avatars/04.png",
    lastMessage: "Hey Bonnie, yes, definitely! What time should we meet?",
    timestamp: "13 days",
    unreadCount: 0,
    isOnline: false,
    status: "offline",
    lastMessageStatus: "sent",
  },
  {
    id: 5,
    name: "Alice Johnson",
    avatar: "/images/avatars/05.png",
    lastMessage:
      "No worries at all! I'll grab a table and wait for you. Drive safe!",
    timestamp: "2 days",
    unreadCount: 0,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
  {
    id: 6,
    name: "Bob Smith",
    avatar: "/images/avatars/06.png",
    lastMessage: "She just told me today.",
    timestamp: "Yesterday",
    unreadCount: 0,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
  {
    id: 7,
    name: "Charlie Brown",
    avatar: "/images/avatars/07.png",
    lastMessage: "See you in 5 minutes!",
    timestamp: "1 day",
    unreadCount: 0,
    isOnline: false,
    status: "offline",
    lastMessageStatus: "sent",
  },
  {
    id: 8,
    name: "Diana Prince",
    avatar: "/images/avatars/08.png",
    lastMessage: "If it takes long you can mail",
    timestamp: "3 hours",
    unreadCount: 0,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
  {
    id: 9,
    name: "Eve Wilson",
    avatar: "/images/avatars/09.png",
    lastMessage:
      "Absolutely! It's amazing to see her so happy and passionate about it.",
    timestamp: "1 day",
    unreadCount: 2,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
  {
    id: 10,
    name: "Frank Miller",
    avatar: "/images/avatars/10.png",
    lastMessage: "Yeah, she mentioned it last week.",
    timestamp: "1 day",
    unreadCount: 0,
    isOnline: true,
    status: "online",
    lastMessageStatus: "read",
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "Sophie Laurent",
    content: "How about 7 PM at the new Italian place downtown?",
    timestamp: "2024-01-15T17:30:00Z",
    isOwn: false,
    status: "read",
  },
  {
    id: 2,
    sender: "Vous",
    content: "Sorry :( send you as soon as possible.",
    timestamp: "2024-01-15T17:23:00Z",
    isOwn: true,
    status: "read",
  },
];

export default function MessageriePage() {
  const [chats, setChats] = useState(mockChats);
  const [selectedChat, setSelectedChat] = useState(chats[2]); // Sophie Laurent par défaut
  const [messages, setMessages] = useState(mockMessages);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChatSelect = (chat: any) => {
    setSelectedChat(chat);
    setShowMobileChat(true);
    // Marquer les messages comme lus
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: "Vous",
        content: newMessage,
        timestamp: new Date().toISOString(),
        isOwn: true,
        status: "sent",
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <IconCheck className="h-4 w-4 text-muted-foreground" />;
      case "delivered":
        return <IconChecks className="h-4 w-4 text-muted-foreground" />;
      case "read":
        return <IconChecks className="h-4 w-4 text-green-500" />;
      default:
        return null;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="flex h-[calc(100vh-var(--header-height)-3rem)] w-full">
                {/* Sidebar - Liste des chats */}
                <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 w-full pb-0 lg:w-96">
                  <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                    <div className="font-semibold font-display text-xl lg:text-2xl">
                      Chats
                    </div>
                    <div className="col-start-2 row-span-2 row-start-1 self-start justify-self-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="size-9 rounded-full"
                      >
                        <IconPlus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-muted-foreground text-sm relative col-span-2 mt-4 flex w-full items-center">
                      <IconSearch className="text-muted-foreground absolute start-4 size-4" />
                      <Input
                        placeholder="Chats search..."
                        className="ps-10 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto p-0">
                    <div className="block min-w-0 divide-y">
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`group/item hover:bg-muted relative flex min-w-0 cursor-pointer items-center gap-4 px-6 py-4 ${
                            chat.isSelected ? "bg-muted" : ""
                          }`}
                          onClick={() => handleChatSelect(chat)}
                        >
                          <Avatar className="relative flex size-8 shrink-0 rounded-full overflow-visible md:size-10">
                            <AvatarImage src={chat.avatar} />
                            <AvatarFallback>
                              {chat.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                            {chat.isOnline && (
                              <div className="size-2 absolute rounded-full bg-green-400 end-0.5 bottom-0.5" />
                            )}
                          </Avatar>
                          <div className="min-w-0 grow">
                            <div className="flex items-center justify-between">
                              <span className="truncate text-sm font-medium">
                                {chat.name}
                              </span>
                              <span className="text-muted-foreground flex-none text-xs">
                                {chat.timestamp}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(chat.lastMessageStatus)}
                              <span className="text-muted-foreground truncate text-start text-sm">
                                {chat.lastMessage}
                              </span>
                              {chat.unreadCount > 0 && (
                                <div className="ms-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm text-white">
                                  {chat.unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="absolute end-0 top-0 bottom-0 flex items-center bg-gradient-to-l from-50% px-4 opacity-0 group-hover/item:opacity-100 from-muted">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9 rounded-full"
                            >
                              <IconDots className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Zone de chat principale */}
                <div className="grow">
                  <div className="bg-background fixed inset-0 z-50 flex h-full flex-col p-4 lg:relative lg:z-10 lg:bg-transparent lg:p-0">
                    {/* Header du chat */}
                    <div className="flex justify-between gap-4 lg:px-4">
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
                          <AvatarImage src={selectedChat.avatar} />
                          <AvatarFallback>
                            {selectedChat.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                          {selectedChat.isOnline && (
                            <div className="size-2 absolute rounded-full bg-green-400 end-0.5 bottom-0.5" />
                          )}
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-semibold">
                            {selectedChat.name}
                          </span>
                          <span className="text-xs text-green-500">
                            {selectedChat.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="hidden lg:flex lg:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="size-9"
                          >
                            <IconVideo className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="size-9"
                          >
                            <IconPhone className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" className="size-9">
                          <IconDots className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Zone des messages */}
                    <div className="flex-1 overflow-y-auto lg:px-4">
                      <div>
                        <div className="flex flex-col items-start space-y-10 py-8">
                          {messages.map((message) => (
                            <div
                              key={message.id}
                              className={`max-w-sm space-y-1 ${
                                message.isOwn ? "self-end" : "self-start"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className={`inline-flex rounded-md border p-4 ${
                                    message.isOwn
                                      ? "bg-muted order-1"
                                      : "bg-background order-1"
                                  }`}
                                >
                                  {message.content}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-9"
                                >
                                  <IconDots className="h-4 w-4" />
                                </Button>
                              </div>
                              <div
                                className={`flex items-center gap-2 ${
                                  message.isOwn
                                    ? "justify-end"
                                    : "justify-start"
                                }`}
                              >
                                <time className="text-muted-foreground mt-1 flex items-center text-xs">
                                  {formatTime(message.timestamp)}
                                </time>
                                {message.isOwn && getStatusIcon(message.status)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Zone de saisie */}
                    <div className="lg:px-4">
                      <div className="bg-muted relative flex items-center rounded-md border">
                        <Input
                          placeholder="Enter message..."
                          className="h-14 border-transparent bg-white pe-32 text-base shadow-transparent ring-transparent lg:pe-56"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                        />
                        <div className="absolute end-4 flex items-center">
                          <div className="block lg:hidden">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-11 rounded-full p-0"
                            >
                              <IconCirclePlus className="size-4" />
                            </Button>
                          </div>
                          <div className="hidden lg:block">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9 rounded-full"
                            >
                              <IconMoodSmile className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9 rounded-full"
                            >
                              <IconPaperclip className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9 rounded-full"
                            >
                              <IconMicrophone className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            onClick={handleSendMessage}
                            className="ms-3 h-9 px-4 py-2"
                            disabled={!newMessage.trim()}
                          >
                            <span className="hidden lg:inline">Send</span>
                            <IconSend className="inline lg:hidden h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
