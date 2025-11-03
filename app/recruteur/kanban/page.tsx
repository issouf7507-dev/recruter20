"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import {
  IconLayoutKanban,
  IconPlus,
  IconSearch,
  IconFilter,
  IconUserPlus,
  IconCalendar,
  IconPaperclip,
  IconMessageCircle,
  IconCircleCheck,
  IconCircle,
  IconClock,
  IconAlertCircle,
  IconStar,
  IconEye,
  IconEdit,
  IconTrash,
  IconDots,
  IconGripVertical,
} from "@tabler/icons-react";

// Données mockées pour le tableau Kanban
const mockKanbanData = {
  colonnes: [
    {
      id: "backlog",
      titre: "Backlog",
      couleur: "bg-gray-50 border-gray-200",
      candidatures: [
        {
          id: 1,
          titre: "Integrate Stripe payment gateway",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 10,
          assignes: [
            { nom: "Emma", avatar: "/images/avatars/01.png", initiales: "EM" },
            {
              nom: "Daniel",
              avatar: "/images/avatars/02.png",
              initiales: "DN",
            },
          ],
          priorite: "High",
          piecesJointes: 2,
          commentaires: 4,
          dateEcheance: "2024-02-15",
          competences: ["React", "Stripe", "Payment"],
        },
        {
          id: 2,
          titre: "Redesign marketing homepage",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 0,
          assignes: [
            { nom: "Lucas", avatar: "/images/avatars/03.png", initiales: "LC" },
            {
              nom: "Sophia",
              avatar: "/images/avatars/04.png",
              initiales: "SP",
            },
          ],
          priorite: "Medium",
          piecesJointes: 1,
          commentaires: 1,
          dateEcheance: "2024-02-20",
          competences: ["Design", "Marketing", "UI/UX"],
        },
        {
          id: 3,
          titre: "Set up automated backups",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 5,
          assignes: [
            { nom: "Mia", avatar: "/images/avatars/05.png", initiales: "MI" },
            { nom: "Jack", avatar: "/images/avatars/06.png", initiales: "JK" },
          ],
          priorite: "Low",
          piecesJointes: 0,
          commentaires: 3,
          dateEcheance: "2024-02-25",
          competences: ["DevOps", "Backup", "Infrastructure"],
        },
        {
          id: 4,
          titre: "Implement blog search functionality",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 0,
          assignes: [
            {
              nom: "Olivia",
              avatar: "/images/avatars/07.png",
              initiales: "OL",
            },
            { nom: "Henry", avatar: "/images/avatars/08.png", initiales: "HY" },
          ],
          priorite: "Medium",
          piecesJointes: 1,
          commentaires: 0,
          dateEcheance: "2024-03-01",
          competences: ["Search", "Blog", "Frontend"],
        },
      ],
    },
    {
      id: "in-progress",
      titre: "In Progress",
      couleur: "bg-blue-50 border-blue-200",
      candidatures: [
        {
          id: 5,
          titre: "Dark mode toggle implementation",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 40,
          assignes: [
            {
              nom: "Charlie",
              avatar: "/images/avatars/09.png",
              initiales: "CH",
            },
            { nom: "Ava", avatar: "/images/avatars/10.png", initiales: "AV" },
          ],
          priorite: "High",
          piecesJointes: 2,
          commentaires: 6,
          dateEcheance: "2024-02-10",
          competences: ["React", "CSS", "Theme"],
        },
        {
          id: 6,
          titre: "Database schema refactoring",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 55,
          assignes: [
            { nom: "Liam", avatar: "/images/avatars/11.png", initiales: "LM" },
            {
              nom: "Isabella",
              avatar: "/images/avatars/12.png",
              initiales: "IS",
            },
          ],
          priorite: "Medium",
          piecesJointes: 3,
          commentaires: 2,
          dateEcheance: "2024-02-18",
          competences: ["Database", "SQL", "Optimization"],
        },
        {
          id: 7,
          titre: "Accessibility improvements",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 35,
          assignes: [
            { nom: "Noémie Thomas", avatar: "", initiales: "NT" },
            { nom: "Elena Garcia", avatar: "", initiales: "EL" },
          ],
          priorite: "Low",
          piecesJointes: 1,
          commentaires: 1,
          dateEcheance: "2024-02-28",
          competences: ["Accessibility", "WCAG", "UX"],
        },
      ],
    },
    {
      id: "done",
      titre: "Done",
      couleur: "bg-green-50 border-green-200",
      candidatures: [
        {
          id: 8,
          titre: "Set up CI/CD pipeline",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 100,
          assignes: [
            { nom: "Eric Chen", avatar: "", initiales: "EC" },
            { nom: "Gabriel Rodriguez", avatar: "", initiales: "GR" },
          ],
          priorite: "High",
          piecesJointes: 2,
          commentaires: 4,
          dateEcheance: "2024-01-30",
          competences: ["CI/CD", "DevOps", "Deployment"],
        },
        {
          id: 9,
          titre: "Initial project setup",
          description:
            "Compile competitor landing page designs for inspiration. G..",
          progression: 100,
          assignes: [
            { nom: "Hugo Lambert", avatar: "", initiales: "HL" },
            { nom: "Baptiste Martin", avatar: "", initiales: "BM" },
          ],
          priorite: "Medium",
          piecesJointes: 1,
          commentaires: 2,
          dateEcheance: "2024-01-15",
          competences: ["Setup", "Configuration", "Initialization"],
        },
      ],
    },
  ],
};

export default function KanbanPage() {
  const [kanbanData, setKanbanData] = useState(mockKanbanData);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("board");
  const [draggedItem, setDraggedItem] = useState<{
    id: number;
    fromColonne: string;
  } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<{
    id: string;
    index: number;
  } | null>(null);

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "High":
        return "bg-red-100 text-red-800 border-red-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrioriteIcon = (priorite: string) => {
    switch (priorite) {
      case "High":
        return <IconAlertCircle className="h-3 w-3" />;
      case "Medium":
        return <IconClock className="h-3 w-3" />;
      case "Low":
        return <IconCircleCheck className="h-3 w-3" />;
      default:
        return <IconCircle className="h-3 w-3" />;
    }
  };

  const filteredCandidatures = (candidatures: any[]) => {
    if (!searchTerm) return candidatures;
    return candidatures.filter(
      (candidature) =>
        candidature.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fonctions de drag and drop
  const handleDragStart = (
    e: React.DragEvent,
    candidatureId: number,
    colonneId: string
  ) => {
    // Empêcher la propagation vers les colonnes
    e.stopPropagation();
    setDraggedItem({ id: candidatureId, fromColonne: colonneId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        type: "task",
        id: candidatureId,
        fromColonne: colonneId,
      })
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetColonneId: string) => {
    e.preventDefault();
    e.stopPropagation();

    // Vérifier que c'est bien une tâche qui est déplacée
    const dragData = e.dataTransfer.getData("application/json");
    if (!dragData) return;

    const { type } = JSON.parse(dragData);
    if (type !== "task") return;

    if (!draggedItem || draggedItem.fromColonne === targetColonneId) {
      setDraggedItem(null);
      return;
    }

    setKanbanData((prevData) => {
      const newData = { ...prevData };

      // Trouver la colonne source et la tâche
      const sourceColonne = newData.colonnes.find(
        (col) => col.id === draggedItem.fromColonne
      );
      const targetColonne = newData.colonnes.find(
        (col) => col.id === targetColonneId
      );

      if (sourceColonne && targetColonne) {
        const taskIndex = sourceColonne.candidatures.findIndex(
          (task) => task.id === draggedItem.id
        );

        if (taskIndex !== -1) {
          // Retirer la tâche de la colonne source
          const [movedTask] = sourceColonne.candidatures.splice(taskIndex, 1);

          // Ajouter la tâche à la colonne cible
          targetColonne.candidatures.push(movedTask);
        }
      }

      return newData;
    });

    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Fonctions de drag and drop pour les colonnes
  const handleColumnDragStart = (
    e: React.DragEvent,
    colonneId: string,
    index: number
  ) => {
    // Empêcher la propagation vers les tâches
    e.stopPropagation();
    setDraggedColumn({ id: colonneId, index });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "column", id: colonneId, index })
    );
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleColumnDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Vérifier que c'est bien une colonne qui est déplacée
    const dragData = e.dataTransfer.getData("application/json");
    if (!dragData) return;

    const { type } = JSON.parse(dragData);
    if (type !== "column") return;

    if (!draggedColumn || draggedColumn.index === targetIndex) {
      setDraggedColumn(null);
      return;
    }

    setKanbanData((prevData) => {
      const newData = { ...prevData };
      const columns = [...newData.colonnes];

      // Calculer la nouvelle position
      let newIndex = targetIndex;

      // Si on déplace vers la droite, ajuster l'index
      if (draggedColumn.index < targetIndex) {
        newIndex = targetIndex;
      } else {
        // Si on déplace vers la gauche, insérer avant
        newIndex = targetIndex;
      }

      // Retirer la colonne de sa position actuelle
      const [movedColumn] = columns.splice(draggedColumn.index, 1);

      // Insérer la colonne à sa nouvelle position
      columns.splice(newIndex, 0, movedColumn);

      return { ...newData, colonnes: columns };
    });

    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-xl font-bold tracking-tight lg:text-2xl">
                  Kanban Board
                </h1>
              </div>

              {/* Header avec assignés */}
              <div className="flex flex-row items-center justify-between mb-6">
                <div className="flex -space-x-2 overflow-hidden">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/images/avatars/05.png" />
                    <AvatarFallback>05</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/images/avatars/04.png" />
                    <AvatarFallback>04</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarImage src="/images/avatars/03.png" />
                    <AvatarFallback>03</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="bg-muted text-xs">
                      +5
                    </AvatarFallback>
                  </Avatar>
                </div>
                <Button variant="outline" size="sm">
                  <IconUserPlus className="h-4 w-4" />
                  <span className="hidden lg:inline">Add Assignee</span>
                </Button>
              </div>

              {/* Tabs */}
              <div className="mb-2 flex justify-between gap-2">
                <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                  <Button
                    variant={activeTab === "board" ? "default" : "ghost"}
                    onClick={() => setActiveTab("board")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Board
                  </Button>
                  <Button
                    variant={activeTab === "list" ? "default" : "ghost"}
                    onClick={() => setActiveTab("list")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    List
                  </Button>
                  <Button
                    variant={activeTab === "table" ? "default" : "ghost"}
                    onClick={() => setActiveTab("table")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Table
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="relative hidden w-auto lg:block">
                    <IconSearch className="absolute top-2.5 left-3 h-4 w-4 opacity-50" />
                    <Input
                      placeholder="Search tasks..."
                      className="ps-8 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <IconSearch className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm">
                    <IconFilter className="h-4 w-4" />
                    <span className="hidden lg:inline">Filters</span>
                  </Button>
                  <Button size="sm">
                    <IconPlus className="h-4 w-4" />
                    <span className="hidden lg:inline">Add Board</span>
                  </Button>
                </div>
              </div>

              {/* Tableau Kanban */}
              <div className="size-full flex-row flex w-full gap-4 overflow-x-auto pb-4">
                {kanbanData.colonnes.map((colonne, index) => (
                  <div key={colonne.id} className="relative">
                    {/* Colonne */}
                    <div
                      className={`bg-muted flex size-full flex-col gap-2 rounded-lg p-2.5 w-[340px] min-w-[340px] transition-all duration-200 ${
                        draggedItem && draggedItem.fromColonne !== colonne.id
                          ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50"
                          : ""
                      } ${
                        draggedColumn?.id === colonne.id
                          ? "opacity-50 scale-95 shadow-lg"
                          : ""
                      } ${
                        draggedColumn && draggedColumn.index !== index
                          ? "ring-2 ring-blue-500 ring-opacity-70 bg-blue-100 transform scale-105"
                          : ""
                      }`}
                      onDragOver={(e) => {
                        handleDragOver(e);
                        handleColumnDragOver(e);
                      }}
                      onDrop={(e) => {
                        handleDrop(e, colonne.id);
                        handleColumnDrop(e, index);
                      }}
                    >
                      <div
                        className="flex items-center justify-between cursor-grab"
                        draggable
                        onDragStart={(e) =>
                          handleColumnDragStart(e, colonne.id, index)
                        }
                        onDragEnd={handleColumnDragEnd}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {colonne.titre}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {filteredCandidatures(colonne.candidatures).length}
                          </Badge>
                          {draggedColumn && draggedColumn.index !== index && (
                            <span className="text-xs text-blue-600 font-medium animate-pulse">
                              Déposer ici
                            </span>
                          )}
                        </div>
                        <div className="flex">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="size-9 cursor-grab"
                          >
                            <IconGripVertical className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-9">
                            <IconDots className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="size-9">
                            <IconPlus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 p-0.5">
                        {filteredCandidatures(colonne.candidatures).map(
                          (candidature) => (
                            <div
                              key={candidature.id}
                              className={`bg-card text-card-foreground flex flex-col gap-6 rounded-xl py-6 cursor-grab border-0 transition-all duration-200 ${
                                draggedItem?.id === candidature.id
                                  ? "opacity-50 scale-95 shadow-lg"
                                  : "hover:shadow-md"
                              }`}
                              draggable
                              onDragStart={(e) =>
                                handleDragStart(e, candidature.id, colonne.id)
                              }
                              onDragEnd={handleDragEnd}
                            >
                              <div className="grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6">
                                <div className="text-base font-semibold">
                                  {candidature.titre}
                                </div>
                                <div className="text-muted-foreground text-sm">
                                  Compile competitor landing page designs for
                                  inspiration. G..
                                </div>
                              </div>
                              <div className="px-6 space-y-4">
                                <div className="text-muted-foreground flex items-center justify-between text-sm">
                                  <div className="flex -space-x-2 overflow-hidden">
                                    {candidature.assignes.map(
                                      (assignee: any, index: number) => (
                                        <Avatar
                                          key={index}
                                          className="h-8 w-8 border-2 border-background"
                                        >
                                          <AvatarImage src={assignee.avatar} />
                                          <AvatarFallback className="bg-muted text-xs">
                                            {assignee.initiales}
                                          </AvatarFallback>
                                        </Avatar>
                                      )
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 rounded-lg border p-1">
                                    <div className="relative size-4">
                                      <svg
                                        className="size-full -rotate-90"
                                        viewBox="0 0 36 36"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <circle
                                          cx="18"
                                          cy="18"
                                          r="16"
                                          fill="none"
                                          className="stroke-current text-gray-200 dark:text-neutral-700"
                                          strokeWidth="2"
                                        ></circle>
                                        <circle
                                          cx="18"
                                          cy="18"
                                          r="16"
                                          fill="none"
                                          className={`stroke-current ${
                                            candidature.progression === 100
                                              ? "text-green-600"
                                              : candidature.progression >= 50
                                              ? "text-orange-500"
                                              : "text-blue-500"
                                          }`}
                                          strokeWidth="2"
                                          strokeDasharray="100.53096491487338"
                                          strokeDashoffset={
                                            100.53096491487338 -
                                            (candidature.progression *
                                              100.53096491487338) /
                                              100
                                          }
                                          strokeLinecap="round"
                                        ></circle>
                                      </svg>
                                    </div>
                                    {candidature.progression}%
                                  </div>
                                </div>
                                <div className="bg-border shrink-0 h-px w-full"></div>
                                <div className="text-muted-foreground flex items-center justify-between text-sm">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {candidature.priorite.toLowerCase()}
                                  </Badge>
                                  <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1">
                                      <IconPaperclip className="h-4 w-4" />
                                      <span>{candidature.piecesJointes}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <IconMessageCircle className="h-4 w-4" />
                                      <span>{candidature.commentaires}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        {/* Zone de drop */}
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-muted-foreground hover:border-gray-400 transition-colors min-h-[60px] flex items-center justify-center"
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, colonne.id)}
                        >
                          {draggedItem && draggedItem.fromColonne !== colonne.id
                            ? "Déposer ici"
                            : "Zone de drop"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
