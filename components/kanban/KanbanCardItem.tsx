"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconArchive,
  IconCalendar,
  IconCalendarEvent,
  IconCircleCheck,
  IconDots,
  IconEye,
  IconMessageCircle,
  IconPaperclip,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import type { KanbanCard } from "@/lib/hooks/use-kanban";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300",
  high: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300",
  medium: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300",
  low: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent", high: "Haute", medium: "Moyenne", low: "Basse",
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: "bg-yellow-100 text-yellow-800",
  EN_REVISION: "bg-blue-100 text-blue-800",
  ACCEPTE: "bg-green-100 text-green-800",
  REFUSE: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_REVISION: "En révision",
  ACCEPTE: "Accepté",
  REFUSE: "Refusé",
};

function formatDate(date: Date | string) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

function formatEntretienDate(date: Date | string) {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface Props {
  card: KanbanCard;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onDelete: () => void;
  onArchive: () => void;
}

export function KanbanCardItem({ card, onDragStart, onDragEnd, onClick, onDelete, onArchive }: Props) {
  const app = card.application;
  const isLinked = !!app;

  const candidatName = isLinked
    ? app.candidat?.user?.name ||
      `${app.candidat?.prenom || ""} ${app.candidat?.nom || ""}`.trim() ||
      "Candidat"
    : null;

  const initials = candidatName
    ? candidatName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  const checklistDone = card.checklist?.filter((c) => c.isDone).length ?? 0;
  const checklistTotal = card.checklist?.length ?? 0;

  const upcomingEntretien = app?.entretiens?.find((e) => e.statut === "PLANIFIE");

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className="bg-card rounded-lg border border-border/60 p-3 space-y-2 cursor-pointer hover:shadow-sm hover:border-primary/30 transition-all select-none group"
    >
      {/* Application-linked card */}
      {isLinked ? (
        <>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={app.candidat?.user?.image || ""} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight truncate">{candidatName}</p>
              <p className="text-xs text-muted-foreground truncate">
                {app.jobOffer?.title}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            <Badge
              variant="secondary"
              className={`text-xs px-1.5 py-0 border-0 ${STATUS_COLORS[app.status] || ""}`}
            >
              {STATUS_LABELS[app.status] || app.status}
            </Badge>
            {card.labels?.slice(0, 2).map((lp) => (
              <Badge
                key={lp.id}
                className="text-xs px-1.5 py-0 text-white border-0"
                style={{ backgroundColor: lp.label?.color || "#3b82f6" }}
              >
                {lp.label?.name}
              </Badge>
            ))}
          </div>
        </>
      ) : (
        /* Generic card */
        <>
          <div className="flex flex-wrap gap-1">
            {card.priority && (
              <Badge
                variant="outline"
                className={`text-xs px-1.5 py-0 ${PRIORITY_COLORS[card.priority] || ""}`}
              >
                {PRIORITY_LABELS[card.priority] || card.priority}
              </Badge>
            )}
            {card.labels?.slice(0, 3).map((lp) => (
              <Badge
                key={lp.id}
                className="text-xs px-1.5 py-0 text-white border-0"
                style={{ backgroundColor: lp.label?.color || "#3b82f6" }}
              >
                {lp.label?.name}
              </Badge>
            ))}
          </div>
          <p className="text-sm font-medium leading-snug line-clamp-2">{card.title}</p>
          {card.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
          )}
        </>
      )}

      {/* Footer metadata */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <div className="flex items-center gap-2 text-muted-foreground">
          {/* Members */}
          {card.members && card.members.length > 0 && (
            <div className="flex -space-x-1.5">
              {card.members.slice(0, 3).map((m) => (
                <Avatar key={m.id} className="h-5 w-5 border-2 border-background">
                  <AvatarImage src={m.user?.image || ""} />
                  <AvatarFallback className="text-[9px] bg-muted">
                    {m.user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          )}
          {/* Due date */}
          {card.dueDates && card.dueDates.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <IconCalendar className="h-3 w-3" />
              {formatDate(card.dueDates[0].dueAt)}
            </span>
          )}
          {/* Upcoming entretien */}
          {upcomingEntretien && (
            <span className="flex items-center gap-0.5 text-xs text-blue-600 dark:text-blue-400">
              <IconCalendarEvent className="h-3 w-3" />
              {formatEntretienDate(upcomingEntretien.dateHeure)}
            </span>
          )}
          {/* Notes */}
          {card.notes && card.notes.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <IconMessageCircle className="h-3 w-3" />
              {card.notes.length}
            </span>
          )}
          {/* Checklist */}
          {checklistTotal > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <IconCircleCheck className="h-3 w-3" />
              {checklistDone}/{checklistTotal}
            </span>
          )}
          {/* Attachments */}
          {card.attachments && card.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-xs">
              <IconPaperclip className="h-3 w-3" />
              {card.attachments.length}
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <IconDots className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onClick(); }}>
              <IconEye className="h-4 w-4 mr-2" />
              Voir les détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              <IconArchive className="h-4 w-4 mr-2" />
              Archiver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <IconTrash className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
