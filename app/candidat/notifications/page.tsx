"use client";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, useMarkAllRead, useMarkOneRead } from "@/lib/hooks/use-notifications";
import { IconBell, IconCheck, IconBriefcase, IconMessage, IconAlertCircle } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const TYPE_CONFIG: Record<string, { icon: typeof IconBell; color: string; label: string }> = {
  APPLICATION_STATUS_CHANGED: { icon: IconBriefcase, color: "text-blue-500", label: "Candidature" },
  CONVERSATION_NEW_MESSAGE: { icon: IconMessage, color: "text-purple-500", label: "Message" },
  JOB_ALERT_NEW_MATCHES: { icon: IconBell, color: "text-green-500", label: "Alerte" },
  APPLICATION_NEW: { icon: IconBriefcase, color: "text-orange-500", label: "Nouvelle candidature" },
};

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const markAll = useMarkAllRead();
  const markOne = useMarkOneRead();

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <>
      <SiteHeader title="Notifications" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-4 py-4 md:py-6 px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <IconBell className="h-6 w-6" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount}</Badge>
                )}
              </h1>
              <p className="text-muted-foreground mt-1">
                {notifications.length} notification{notifications.length > 1 ? "s" : ""}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
                <IconCheck className="h-4 w-4 mr-2" />
                Tout marquer comme lu
              </Button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Chargement...</div>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <IconBell className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">Aucune notification pour l'instant</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {notifications.map((notif: any) => {
                const config = TYPE_CONFIG[notif.type] ?? { icon: IconAlertCircle, color: "text-muted-foreground", label: notif.type };
                const Icon = config.icon;
                const data = notif.data ?? {};
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:bg-muted/50 ${!notif.read ? "bg-blue-50/50 border-blue-100 dark:bg-blue-950/20" : ""}`}
                    onClick={() => !notif.read && markOne.mutate(notif.id)}
                  >
                    <div className={`shrink-0 mt-0.5 ${config.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant="outline" className="text-xs">{config.label}</Badge>
                        {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                      </div>
                      <p className="text-sm font-medium">
                        {data.message ?? data.titre ?? notif.type}
                      </p>
                      {data.offreTitle && (
                        <p className="text-xs text-muted-foreground mt-0.5">Offre : {data.offreTitle}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
