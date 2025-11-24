"use client";

import { useState, useEffect, useRef } from "react";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SiteHeader } from "@/components/site-header";
import { useSession } from "@/lib/auth-client";
import {
  useRecruteurByUserId,
  useCollaborateurByUserId,
} from "@/lib/hooks/use-recruteurs";
import {
  useKanbanColumns,
  useMoveApplication,
  useReorderKanbanColumns,
  useCreateKanbanColumn,
  useUpdateKanbanColumn,
  useDeleteKanbanColumn,
  useCreateKanbanCard,
  useUpdateKanbanCard,
  useDeleteKanbanCard,
  useMoveCard,
  useAddCardMembers,
  useRemoveCardMember,
  useLabels,
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  useAddCardLabel,
  useRemoveCardLabel,
  useCreateCardNote,
  useCreateCheckItem,
  useUpdateCheckItem,
  useDeleteCheckItem,
  useCreateCardDueDate,
  useUpdateCardDueDate,
  useDeleteCardDueDate,
  useCreateCardAttachment,
  useDeleteCardAttachment,
} from "@/lib/hooks/use-kanban";
import { useCollaborateurs } from "@/lib/hooks/use-collaborateurs";
import { useOffers } from "@/lib/hooks/use-offers";
import { useEdgeStore } from "@/lib/edgestore";
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
  IconX,
  IconTag,
  IconListCheck,
  IconMapPin,
  IconDeviceDesktop,
  IconSettings,
  IconInfoCircle,
  IconMenu2,
  IconChevronDown,
  IconSend,
} from "@tabler/icons-react";
import type {
  KanbanColumn,
  KanbanCard,
  Application,
  ApplicationStatus,
} from "@/lib/api/kanban/types";

export default function KanbanPage() {
  const { data: session } = useSession();
  const { data: recruteur } = useRecruteurByUserId(session?.user?.id);
  const { data: collaborateur } = useCollaborateurByUserId(session?.user?.id);
  const recruteurId = recruteur ? recruteur?.id : collaborateur?.recruteurId;

  // Fetch kanban columns (independent of job offers)
  const {
    data: kanbanData,
    isLoading,
    error,
  } = useKanbanColumns(recruteurId || undefined, {
    enabled: !!recruteurId,
  });

  const columnsData = kanbanData?.columns || [];

  // Fetch offers for card creation
  const { data: offersData } = useOffers(
    {
      recruteurId: recruteurId || undefined,
      limit: 100,
    },
    {
      enabled: !!recruteurId,
    }
  );

  const offers = offersData?.items || [];

  const moveCard = useMoveCard();
  const reorderColumns = useReorderKanbanColumns();
  const createColumn = useCreateKanbanColumn();
  const updateColumn = useUpdateKanbanColumn();
  const deleteColumn = useDeleteKanbanColumn();
  const createCard = useCreateKanbanCard();
  const updateCard = useUpdateKanbanCard();
  const deleteCard = useDeleteKanbanCard();

  // Dialog state for creating a new column
  const [isCreateColumnDialogOpen, setIsCreateColumnDialogOpen] =
    useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState(
    "bg-gray-50 border-gray-200"
  );

  // Dialog state for editing a column
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editColumnName, setEditColumnName] = useState("");
  const [editColumnColor, setEditColumnColor] = useState(
    "bg-gray-50 border-gray-200"
  );

  // Dialog state for deleting a column
  const [isDeleteColumnDialogOpen, setIsDeleteColumnDialogOpen] =
    useState(false);
  const [columnToDelete, setColumnToDelete] = useState<KanbanColumn | null>(
    null
  );

  // Dialog state for creating a card
  const [isCreateCardDialogOpen, setIsCreateCardDialogOpen] = useState(false);
  const [selectedColumnForCard, setSelectedColumnForCard] = useState<
    string | null
  >(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDescription, setNewCardDescription] = useState("");
  const [newCardPriority, setNewCardPriority] = useState<string>("medium");
  const [newCardJobOfferIds, setNewCardJobOfferIds] = useState<string[]>([]);
  const [isCardDetailsSheetOpen, setIsCardDetailsSheetOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [selectedCardColumnId, setSelectedCardColumnId] = useState<
    string | null
  >(null);
  const [cardDetailsTitle, setCardDetailsTitle] = useState("");
  const [cardDetailsDescription, setCardDetailsDescription] = useState("");
  const [cardDetailsPriority, setCardDetailsPriority] =
    useState<string>("medium");
  const [isAddMembersDialogOpen, setIsAddMembersDialogOpen] = useState(false);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [noteContent, setNoteContent] = useState("");
  const [newCheckItemLabel, setNewCheckItemLabel] = useState("");
  const [editingCheckItemId, setEditingCheckItemId] = useState<string | null>(
    null
  );
  const [editingCheckItemLabel, setEditingCheckItemLabel] = useState("");
  const [hideCompletedItems, setHideCompletedItems] = useState(false);

  // Ref for checklist section
  const checklistSectionRef = useRef<HTMLDivElement>(null);
  // Ref for due date section
  const dueDateSectionRef = useRef<HTMLDivElement>(null);
  // Ref for attachment section
  const attachmentSectionRef = useRef<HTMLDivElement>(null);

  // Due date state
  const [newDueDate, setNewDueDate] = useState("");
  const [editingDueDateId, setEditingDueDateId] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState("");

  // Attachment state
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

  const addCardMembers = useAddCardMembers();
  const removeCardMember = useRemoveCardMember();
  const createCardNote = useCreateCardNote();
  const createCheckItem = useCreateCheckItem();
  const updateCheckItem = useUpdateCheckItem();
  const deleteCheckItem = useDeleteCheckItem();
  const createCardDueDate = useCreateCardDueDate();
  const updateCardDueDate = useUpdateCardDueDate();
  const deleteCardDueDate = useDeleteCardDueDate();
  const createCardAttachment = useCreateCardAttachment();
  const deleteCardAttachment = useDeleteCardAttachment();
  const { edgestore } = useEdgeStore();
  const { data: collaborateurs } = useCollaborateurs(recruteurId || undefined);

  // Labels management
  const { data: labels } = useLabels(recruteurId || undefined);
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();
  const deleteLabel = useDeleteLabel();
  const addCardLabel = useAddCardLabel();
  const removeCardLabel = useRemoveCardLabel();

  // Dialog state for labels
  const [isLabelsDialogOpen, setIsLabelsDialogOpen] = useState(false);
  const [isCreateLabelDialogOpen, setIsCreateLabelDialogOpen] = useState(false);
  const [isEditLabelDialogOpen, setIsEditLabelDialogOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<{
    id: string;
    name: string;
    color: string;
  } | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3b82f6");
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("#3b82f6");

  console.log("collaborateurs", collaborateurs);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("board");
  const [draggedCard, setDraggedCard] = useState<{
    id: string;
    fromColonne: string;
  } | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<{
    id: string;
    index: number;
  } | null>(null);
  // Helper function to map status to column
  // For now, we'll use a simple mapping - you can enhance this
  const getStatusFromColumn = (columnName: string): ApplicationStatus => {
    const nameLower = columnName.toLowerCase();
    if (nameLower.includes("accept") || nameLower.includes("accepté")) {
      return "ACCEPTE" as ApplicationStatus;
    }
    if (nameLower.includes("refus") || nameLower.includes("refusé")) {
      return "REFUSE" as ApplicationStatus;
    }
    if (nameLower.includes("revis") || nameLower.includes("révision")) {
      return "EN_REVISION" as ApplicationStatus;
    }
    return "EN_ATTENTE" as ApplicationStatus;
  };

  // Transform columns to match UI structure - now includes cards
  const kanbanColumns = columnsData.map((col: KanbanColumn) => ({
    id: col.id,
    titre: col.name,
    couleur: col.color || "bg-gray-50 border-gray-200",
    cards: col.cards || [],
  }));

  const getInitials = (nom: string) => {
    return nom
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite?.toLowerCase()) {
      case "high":
      case "urgent":
        return "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800";
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800";
      case "low":
        return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getPrioriteLabel = (priorite: string) => {
    switch (priorite?.toLowerCase()) {
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      case "medium":
        return "Medium";
      case "low":
        return "Low";
      default:
        return "Medium";
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      return `${months[d.getMonth()]} ${d.getDate()}`;
    } catch {
      return "";
    }
  };

  const formatDateTime = (date: Date | string) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return "";
      const now = new Date();
      const diff = now.getTime() - d.getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (days === 0) return "today";
      if (days === 1) return "yesterday";
      if (days < 7) return `${days} days ago`;

      const hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      return `${formatDate(date)} at ${displayHours}:${displayMinutes} ${ampm}`;
    } catch {
      return "";
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

  const filteredCandidatures = (
    candidatures: Array<{
      id: string;
      titre: string;
      description: string;
      [key: string]: any;
    }>
  ) => {
    if (!searchTerm) return candidatures;
    return candidatures.filter(
      (candidature) =>
        candidature.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidature.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Fonctions de drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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

    if (!columnsData) {
      setDraggedColumn(null);
      return;
    }

    // Reorder columns via API
    const updates = columnsData.map((col, index) => {
      let newOrder = index;
      if (index === draggedColumn.index) {
        newOrder = targetIndex;
      } else if (
        draggedColumn.index < targetIndex &&
        index > draggedColumn.index &&
        index <= targetIndex
      ) {
        newOrder = index - 1;
      } else if (
        draggedColumn.index > targetIndex &&
        index >= targetIndex &&
        index < draggedColumn.index
      ) {
        newOrder = index + 1;
      }
      return {
        columnId: col.id,
        newOrder,
      };
    });

    reorderColumns.mutate(updates);

    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Handle create column
  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !recruteurId) {
      return;
    }

    createColumn.mutate(
      {
        recruteurId,
        data: {
          name: newColumnName.trim(),
          color: newColumnColor,
          isDefault: false,
        },
      },
      {
        onSuccess: () => {
          setIsCreateColumnDialogOpen(false);
          setNewColumnName("");
          setNewColumnColor("bg-gray-50 border-gray-200");
        },
      }
    );
  };

  // Handle create card
  const handleCreateCard = async () => {
    if (!newCardTitle.trim() || !recruteurId || !selectedColumnForCard) {
      return;
    }

    createCard.mutate(
      {
        recruteurId,
        userId: session?.user?.id,
        data: {
          title: newCardTitle.trim(),
          description: newCardDescription || undefined,
          priority: newCardPriority,
          columnId: selectedColumnForCard,
          jobOfferIds:
            newCardJobOfferIds.length > 0 ? newCardJobOfferIds : undefined,
        },
      },
      {
        onSuccess: () => {
          setIsCreateCardDialogOpen(false);
          setNewCardTitle("");
          setNewCardDescription("");
          setNewCardPriority("medium");
          setNewCardJobOfferIds([]);
          setSelectedColumnForCard(null);
        },
      }
    );
  };

  // Handle opening create card dialog for a specific column
  const handleOpenCreateCardDialog = (columnId: string) => {
    setSelectedColumnForCard(columnId);
    setIsCreateCardDialogOpen(true);
  };

  const handleOpenCardDetails = (card: KanbanCard, columnId: string) => {
    setSelectedCard(card);
    setSelectedCardColumnId(columnId);
    setCardDetailsTitle(card.title || "");
    setCardDetailsDescription(card.description || "");
    setCardDetailsPriority(card.priority || "medium");
    setNoteContent("");
    setIsCardDetailsSheetOpen(true);
  };

  const handleCloseCardDetails = () => {
    setIsCardDetailsSheetOpen(false);
    setSelectedCard(null);
    setSelectedCardColumnId(null);
    setNoteContent("");
  };

  // Handle scrolling to checklist section
  const handleScrollToChecklist = () => {
    if (checklistSectionRef.current) {
      checklistSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Handle scrolling to due date section
  const handleScrollToDueDate = () => {
    if (dueDateSectionRef.current) {
      dueDateSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Handle adding a due date
  const handleAddDueDate = () => {
    if (!selectedCard || !recruteurId || !newDueDate.trim()) {
      return;
    }

    createCardDueDate.mutate(
      {
        cardId: selectedCard.id,
        dueAt: newDueDate,
        recruteurId,
      },
      {
        onSuccess: () => {
          setNewDueDate("");
        },
      }
    );
  };

  // Handle updating a due date
  const handleUpdateDueDate = () => {
    if (!editingDueDateId || !recruteurId || !editingDueDate.trim()) {
      return;
    }

    updateCardDueDate.mutate(
      {
        dueDateId: editingDueDateId,
        dueAt: editingDueDate,
        recruteurId,
      },
      {
        onSuccess: () => {
          setEditingDueDateId(null);
          setEditingDueDate("");
        },
      }
    );
  };

  // Handle deleting a due date
  const handleDeleteDueDate = (dueDateId: string) => {
    if (!recruteurId) {
      return;
    }

    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette date d'échéance ?"
    );
    if (!confirmDelete) {
      return;
    }

    deleteCardDueDate.mutate({
      dueDateId,
      recruteurId,
    });
  };

  // Handle starting to edit a due date
  const handleStartEditDueDate = (dueDate: {
    id: string;
    dueAt: Date | string;
  }) => {
    setEditingDueDateId(dueDate.id);
    // Format date for input (YYYY-MM-DDTHH:mm)
    const date = new Date(dueDate.dueAt);
    const formattedDate = date.toISOString().slice(0, 16);
    setEditingDueDate(formattedDate);
  };

  // Handle scrolling to attachment section
  const handleScrollToAttachment = () => {
    if (attachmentSectionRef.current) {
      attachmentSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  // Handle uploading an attachment
  const handleUploadAttachment = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!selectedCard || !recruteurId || !session?.user?.id) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Le fichier est trop volumineux (max 10MB)");
      return;
    }

    setUploadingAttachment(true);
    try {
      // 1. Upload vers EdgeStore
      const res = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          console.log("Upload progress:", progress);
        },
      });

      // 2. Create attachment record with EdgeStore URL
      createCardAttachment.mutate({
        cardId: selectedCard.id,
        url: res.url,
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
        recruteurId,
        uploadedById: session.user.id,
      });

      // Reset file input
      event.target.value = "";
    } catch (error: any) {
      console.error("Error uploading attachment:", error);
      alert(error.message || "Erreur lors de l'upload du fichier");
    } finally {
      setUploadingAttachment(false);
    }
  };

  // Handle deleting an attachment
  const handleDeleteAttachment = async (
    attachmentId: string,
    fileUrl: string
  ) => {
    if (!recruteurId) {
      return;
    }

    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette pièce jointe ?"
    );
    if (!confirmDelete) {
      return;
    }

    try {
      // 1. Supprimer d'EdgeStore
      try {
        await edgestore.publicFiles.delete({
          url: fileUrl,
        });
      } catch (edgeStoreError) {
        console.error(
          "Erreur lors de la suppression sur EdgeStore:",
          edgeStoreError
        );
        // Continue même si la suppression EdgeStore échoue
      }

      // 2. Supprimer l'enregistrement de la base de données
      deleteCardAttachment.mutate({
        attachmentId,
        recruteurId,
      });
    } catch (error: any) {
      console.error("Error deleting attachment:", error);
      alert(
        error.message || "Erreur lors de la suppression de la pièce jointe"
      );
    }
  };

  // Synchroniser selectedCard avec les données mises à jour
  useEffect(() => {
    if (selectedCard && columnsData && isCardDetailsSheetOpen) {
      // Trouver la carte mise à jour dans les données
      for (const col of columnsData) {
        const updatedCard = col.cards?.find((c) => c.id === selectedCard.id);
        if (updatedCard) {
          // Mettre à jour selectedCard avec les données fraîches
          setSelectedCard(updatedCard);
          break;
        }
      }
    }
  }, [columnsData, selectedCard?.id, isCardDetailsSheetOpen]);

  const handleUpdateCardDetails = () => {
    if (!selectedCard || !recruteurId) {
      return;
    }

    updateCard.mutate(
      {
        id: selectedCard.id,
        recruteurId,
        userId: session?.user?.id,
        data: {
          title: cardDetailsTitle.trim() || selectedCard.title,
          description: cardDetailsDescription || undefined,
          priority: cardDetailsPriority || undefined,
        },
      },
      {
        onSuccess: () => {
          handleCloseCardDetails();
        },
      }
    );
  };

  const handleDeleteCard = (card: KanbanCard) => {
    if (!recruteurId) {
      return;
    }

    const confirmDelete = window.confirm(
      `Supprimer définitivement la card "${card.title}" ?`
    );
    if (!confirmDelete) {
      return;
    }

    deleteCard.mutate(
      {
        id: card.id,
        recruteurId,
      },
      {
        onSuccess: () => {
          if (selectedCard?.id === card.id) {
            handleCloseCardDetails();
          }
        },
      }
    );
  };

  // Handle adding a note to a card
  const handleAddNote = () => {
    if (!selectedCard || !recruteurId || !noteContent.trim()) {
      return;
    }

    createCardNote.mutate(
      {
        cardId: selectedCard.id,
        content: noteContent.trim(),
        recruteurId,
      },
      {
        onSuccess: () => {
          setNoteContent("");
        },
      }
    );
  };

  // Handle adding a checklist item
  const handleAddCheckItem = () => {
    if (!selectedCard || !recruteurId || !newCheckItemLabel.trim()) {
      return;
    }

    createCheckItem.mutate(
      {
        cardId: selectedCard.id,
        label: newCheckItemLabel.trim(),
        recruteurId,
      },
      {
        onSuccess: () => {
          setNewCheckItemLabel("");
        },
      }
    );
  };

  // Handle toggling a checklist item
  const handleToggleCheckItem = (checkItemId: string, isDone: boolean) => {
    if (!selectedCard || !recruteurId) {
      return;
    }

    updateCheckItem.mutate({
      checkItemId,
      data: { isDone: !isDone },
      recruteurId,
    });
  };

  // Handle deleting a checklist item
  const handleDeleteCheckItem = (checkItemId: string) => {
    if (!selectedCard || !recruteurId) {
      return;
    }

    if (confirm("Supprimer cette tâche ?")) {
      deleteCheckItem.mutate({
        checkItemId,
        recruteurId,
      });
    }
  };

  // Handle editing a checklist item
  const handleStartEditCheckItem = (item: { id: string; label: string }) => {
    setEditingCheckItemId(item.id);
    setEditingCheckItemLabel(item.label);
  };

  const handleSaveEditCheckItem = () => {
    if (
      !selectedCard ||
      !recruteurId ||
      !editingCheckItemId ||
      !editingCheckItemLabel.trim()
    ) {
      return;
    }

    updateCheckItem.mutate(
      {
        checkItemId: editingCheckItemId,
        data: { label: editingCheckItemLabel.trim() },
        recruteurId,
      },
      {
        onSuccess: () => {
          setEditingCheckItemId(null);
          setEditingCheckItemLabel("");
        },
      }
    );
  };

  // Card drag and drop handlers
  const handleCardDragStart = (
    e: React.DragEvent,
    cardId: string,
    fromColonneId: string
  ) => {
    setDraggedCard({
      id: cardId,
      fromColonne: fromColonneId,
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", cardId);
  };

  const handleCardDragEnd = () => {
    setDraggedCard(null);
  };

  const handleCardDrop = async (
    e: React.DragEvent,
    targetColonneId: string
  ) => {
    e.preventDefault();
    if (!draggedCard || draggedCard.fromColonne === targetColonneId) {
      setDraggedCard(null);
      return;
    }

    // Move card
    try {
      await moveCard.mutateAsync({
        cardId: draggedCard.id,
        targetColumnId: targetColonneId,
        userId: session?.user?.id,
      });
    } catch (error) {
      console.error("Error moving card:", error);
    }

    setDraggedCard(null);
  };

  // Handle edit column
  const handleEditColumn = (column: KanbanColumn) => {
    setEditingColumn(column);
    setEditColumnName(column.name);
    setEditColumnColor(column.color || "bg-gray-50 border-gray-200");
    setIsEditColumnDialogOpen(true);
  };

  // Handle update column
  const handleUpdateColumn = async () => {
    if (!editColumnName.trim() || !editingColumn) {
      return;
    }

    updateColumn.mutate(
      {
        id: editingColumn.id,
        data: {
          name: editColumnName.trim(),
          color: editColumnColor,
        },
      },
      {
        onSuccess: () => {
          setIsEditColumnDialogOpen(false);
          setEditingColumn(null);
          setEditColumnName("");
          setEditColumnColor("bg-gray-50 border-gray-200");
        },
      }
    );
  };

  // Handle delete column
  const handleDeleteColumn = (column: KanbanColumn) => {
    setColumnToDelete(column);
    setIsDeleteColumnDialogOpen(true);
  };

  // Confirm delete column
  const handleConfirmDeleteColumn = async () => {
    if (!columnToDelete) {
      return;
    }

    deleteColumn.mutate(columnToDelete.id, {
      onSuccess: () => {
        setIsDeleteColumnDialogOpen(false);
        setColumnToDelete(null);
      },
    });
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
                <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                  Tableau Kanban
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
              <div className="mb-4 flex justify-between items-center gap-2">
                <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    onClick={() => setActiveTab("overview")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "list" ? "default" : "ghost"}
                    onClick={() => setActiveTab("list")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Lists
                  </Button>
                  <Button
                    variant={activeTab === "board" ? "default" : "ghost"}
                    onClick={() => setActiveTab("board")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Board
                  </Button>
                  <Button
                    variant={activeTab === "timeline" ? "default" : "ghost"}
                    onClick={() => setActiveTab("timeline")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Timeline
                  </Button>
                  <Button
                    variant={activeTab === "files" ? "default" : "ghost"}
                    onClick={() => setActiveTab("files")}
                    className="h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm"
                  >
                    Files
                  </Button>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="relative hidden w-auto lg:block">
                    <IconSearch className="absolute top-2.5 left-3 h-4 w-4 opacity-50" />
                    <Input
                      placeholder="Search tasks..."
                      className="ps-8 h-9 w-[200px] rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="lg:hidden">
                    <Button variant="outline" size="sm">
                      <IconSearch className="h-4 w-4" />
                    </Button>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="h-9 w-[120px] text-sm">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="newest">
                    <SelectTrigger className="h-9 w-[120px] text-sm">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <IconFilter className="h-4 w-4" />
                    <span className="hidden lg:inline">Filters</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCreateColumnDialogOpen(true)}
                    disabled={!recruteurId}
                  >
                    <IconPlus className="h-4 w-4" />
                    <span className="hidden lg:inline">
                      Ajouter une colonne
                    </span>
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="text-center py-8">Chargement...</div>
              )}

              {/* Error State */}
              {error && (
                <div className="text-center py-8 text-red-500">
                  Erreur lors du chargement des données
                </div>
              )}

              {/* Tableau Kanban */}
              {!isLoading && !error && (
                <div className="size-full flex-row flex w-full gap-4 overflow-x-auto pb-4">
                  {kanbanColumns.map((colonne, index) => (
                    <div key={colonne.id} className="relative">
                      {/* Colonne */}
                      <div
                        className={`bg-muted/50 flex size-full flex-col gap-3 rounded-lg p-3 w-[320px] min-w-[320px] transition-all duration-200 border border-border/50 ${
                          draggedCard && draggedCard.fromColonne !== colonne.id
                            ? "ring-2 ring-primary ring-opacity-50 bg-primary/5"
                            : ""
                        } ${
                          draggedColumn?.id === colonne.id
                            ? "opacity-50 scale-95 shadow-lg"
                            : ""
                        } ${
                          draggedColumn && draggedColumn.index !== index
                            ? "ring-2 ring-primary ring-opacity-70 bg-primary/10 transform scale-105"
                            : ""
                        }`}
                        onDragOver={(e) => {
                          handleDragOver(e);
                          handleColumnDragOver(e);
                        }}
                        onDrop={(e) => {
                          handleCardDrop(e, colonne.id);
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
                            <span className="text-sm font-semibold text-foreground">
                              {colonne.titre}
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs font-medium"
                            >
                              {colonne.cards?.length || 0}
                            </Badge>
                            {draggedColumn && draggedColumn.index !== index && (
                              <span className="text-xs text-primary font-medium animate-pulse">
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="size-9 cursor-pointer border-0 bg-muted"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDots className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the original column from columnsData
                                    const originalColumn = columnsData.find(
                                      (col) => col.id === colonne.id
                                    );
                                    if (originalColumn) {
                                      handleEditColumn(originalColumn);
                                    }
                                  }}
                                >
                                  <IconEdit className="h-4 w-4" />
                                  Modifier
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Find the original column from columnsData
                                    const originalColumn = columnsData.find(
                                      (col) => col.id === colonne.id
                                    );
                                    if (originalColumn) {
                                      handleDeleteColumn(originalColumn);
                                    }
                                  }}
                                >
                                  <IconTrash className="h-4 w-4" />
                                  Supprimer
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-9"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreateCardDialog(colonne.id);
                              }}
                            >
                              <IconPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {/* Cards */}
                          {colonne.cards && colonne.cards.length > 0 ? (
                            colonne.cards
                              .filter((card: KanbanCard) => {
                                if (!searchTerm) return true;
                                const searchLower = searchTerm.toLowerCase();
                                return (
                                  card.title
                                    .toLowerCase()
                                    .includes(searchLower) ||
                                  card.description
                                    ?.toLowerCase()
                                    .includes(searchLower) ||
                                  false
                                );
                              })
                              .map((card: KanbanCard) => (
                                <div
                                  key={card.id}
                                  className={`bg-card text-card-foreground flex flex-col gap-3 rounded-lg p-3.5 cursor-grab border transition-all duration-200 shadow-sm ${
                                    draggedCard?.id === card.id
                                      ? "opacity-50 scale-95 shadow-lg"
                                      : "hover:shadow-md hover:border-primary/20"
                                  }`}
                                  draggable
                                  onDragStart={(e) =>
                                    handleCardDragStart(e, card.id, colonne.id)
                                  }
                                  onDragEnd={handleCardDragEnd}
                                  onClick={() =>
                                    handleOpenCardDetails(card, colonne.id)
                                  }
                                >
                                  {/* Tags de priorité et catégories */}
                                  <div className="flex flex-wrap gap-1.5 items-start">
                                    {card.priority && (
                                      <Badge
                                        variant="outline"
                                        className={`text-xs font-medium px-2 py-0.5 border ${getPrioriteColor(
                                          card.priority
                                        )}`}
                                      >
                                        {getPrioriteLabel(card.priority)}
                                      </Badge>
                                    )}
                                    {/* Labels comme catégories */}
                                    {card.labels &&
                                      card.labels
                                        .slice(0, 3)
                                        .map((labelPivot) => (
                                          <Badge
                                            key={labelPivot.id}
                                            className="text-xs font-medium px-2 py-0.5 text-white border-0"
                                            style={{
                                              backgroundColor:
                                                labelPivot.label?.color ||
                                                "#3b82f6",
                                            }}
                                          >
                                            {labelPivot.label?.name}
                                          </Badge>
                                        ))}
                                    {card.labels && card.labels.length > 3 && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs font-medium px-2 py-0.5"
                                      >
                                        +{card.labels.length - 3}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Titre */}
                                  <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                                    {card.title}
                                  </h3>

                                  {/* Description */}
                                  {card.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                      {card.description}
                                    </p>
                                  )}

                                  {/* Métadonnées en bas */}
                                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      {/* Avatars des membres */}
                                      {card.members &&
                                        card.members.length > 0 && (
                                          <div className="flex -space-x-2 shrink-0">
                                            {card.members
                                              .slice(0, 3)
                                              .map((member) => (
                                                <Avatar
                                                  key={member.id}
                                                  className="h-6 w-6 border-2 border-background"
                                                >
                                                  <AvatarImage
                                                    src={
                                                      member.user?.image || ""
                                                    }
                                                  />
                                                  <AvatarFallback className="text-[10px] bg-muted">
                                                    {member.user?.name
                                                      ?.split(" ")
                                                      .map((n) => n[0])
                                                      .join("")
                                                      .toUpperCase()
                                                      .slice(0, 2)}
                                                  </AvatarFallback>
                                                </Avatar>
                                              ))}
                                            {card.members.length > 3 && (
                                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-medium">
                                                +{card.members.length - 3}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                      {/* Date d'échéance */}
                                      {card.dueDates &&
                                        card.dueDates.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                            <IconCalendar className="h-3.5 w-3.5" />
                                            <span>
                                              {formatDate(
                                                card.dueDates[0].dueAt
                                              )}
                                            </span>
                                          </div>
                                        )}

                                      {/* Nombre de commentaires */}
                                      {card.notes && card.notes.length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                          <IconMessageCircle className="h-3.5 w-3.5" />
                                          <span>{card.notes.length}</span>
                                        </div>
                                      )}

                                      {/* Checklist progress */}
                                      {card.checklist &&
                                        card.checklist.length > 0 && (
                                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                            <IconCircleCheck className="h-3.5 w-3.5" />
                                            <span>
                                              {
                                                card.checklist.filter(
                                                  (c) => c.isDone
                                                ).length
                                              }
                                              /{card.checklist.length}
                                            </span>
                                          </div>
                                        )}
                                    </div>

                                    {/* Badge supplémentaire (sous-tâches ou autres) */}
                                    {card.checklist &&
                                      card.checklist.length > 0 &&
                                      card.checklist.filter((c) => !c.isDone)
                                        .length > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                          <IconPlus className="h-3.5 w-3.5" />
                                          <span>
                                            {
                                              card.checklist.filter(
                                                (c) => !c.isDone
                                              ).length
                                            }
                                          </span>
                                        </div>
                                      )}

                                    {/* Menu d'actions */}
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <IconDots className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenCardDetails(
                                              card,
                                              colonne.id
                                            );
                                          }}
                                        >
                                          <IconEye className="h-4 w-4 mr-2" />
                                          Voir les détails
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          variant="destructive"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCard(card);
                                          }}
                                        >
                                          <IconTrash className="h-4 w-4 mr-2" />
                                          Supprimer
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div
                              className="border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground hover:border-primary/30 transition-colors min-h-[80px] flex items-center justify-center bg-muted/30"
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleCardDrop(e, colonne.id)}
                            >
                              {draggedCard &&
                              draggedCard.fromColonne !== colonne.id
                                ? "Déposer ici"
                                : "Aucune card"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !error && kanbanColumns.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  Aucune colonne Kanban trouvée. Créez-en une pour commencer.
                </div>
              )}

              {/* Create Column Dialog */}
              <Dialog
                open={isCreateColumnDialogOpen}
                onOpenChange={setIsCreateColumnDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle colonne</DialogTitle>
                    <DialogDescription>
                      Ajoutez une nouvelle colonne au tableau Kanban
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="column-name">Nom de la colonne</Label>
                      <Input
                        id="column-name"
                        placeholder="Ex: En attente, En cours, Accepté, Refusé"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleCreateColumn();
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="column-color">Couleur</Label>
                      <Select
                        value={newColumnColor}
                        onValueChange={setNewColumnColor}
                      >
                        <SelectTrigger id="column-color">
                          <SelectValue placeholder="Sélectionner une couleur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bg-gray-50 border-gray-200">
                            Gris
                          </SelectItem>
                          <SelectItem value="bg-blue-50 border-blue-200">
                            Bleu
                          </SelectItem>
                          <SelectItem value="bg-green-50 border-green-200">
                            Vert
                          </SelectItem>
                          <SelectItem value="bg-yellow-50 border-yellow-200">
                            Jaune
                          </SelectItem>
                          <SelectItem value="bg-red-50 border-red-200">
                            Rouge
                          </SelectItem>
                          <SelectItem value="bg-purple-50 border-purple-200">
                            Violet
                          </SelectItem>
                          <SelectItem value="bg-pink-50 border-pink-200">
                            Rose
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>
                        💡 Le statut sera automatiquement détecté depuis le nom
                        de la colonne :
                      </p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Colonnes avec "accepté" → Statut ACCEPTE</li>
                        <li>Colonnes avec "refusé" → Statut REFUSE</li>
                        <li>Colonnes avec "révision" → Statut EN_REVISION</li>
                        <li>Autres → Statut EN_ATTENTE</li>
                      </ul>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateColumnDialogOpen(false)}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateColumn}
                      disabled={
                        !newColumnName.trim() ||
                        createColumn.isPending ||
                        !recruteurId
                      }
                    >
                      {createColumn.isPending ? "Création..." : "Créer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Column Dialog */}
              <Dialog
                open={isEditColumnDialogOpen}
                onOpenChange={setIsEditColumnDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Modifier la colonne</DialogTitle>
                    <DialogDescription>
                      Modifiez le nom et la couleur de la colonne
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-column-name">
                        Nom de la colonne
                      </Label>
                      <Input
                        id="edit-column-name"
                        placeholder="Ex: En attente, En cours, Accepté, Refusé"
                        value={editColumnName}
                        onChange={(e) => setEditColumnName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateColumn();
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-column-color">Couleur</Label>
                      <Select
                        value={editColumnColor}
                        onValueChange={setEditColumnColor}
                      >
                        <SelectTrigger id="edit-column-color">
                          <SelectValue placeholder="Sélectionner une couleur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bg-gray-50 border-gray-200">
                            Gris
                          </SelectItem>
                          <SelectItem value="bg-blue-50 border-blue-200">
                            Bleu
                          </SelectItem>
                          <SelectItem value="bg-green-50 border-green-200">
                            Vert
                          </SelectItem>
                          <SelectItem value="bg-yellow-50 border-yellow-200">
                            Jaune
                          </SelectItem>
                          <SelectItem value="bg-red-50 border-red-200">
                            Rouge
                          </SelectItem>
                          <SelectItem value="bg-purple-50 border-purple-200">
                            Violet
                          </SelectItem>
                          <SelectItem value="bg-pink-50 border-pink-200">
                            Rose
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditColumnDialogOpen(false);
                        setEditingColumn(null);
                        setEditColumnName("");
                        setEditColumnColor("bg-gray-50 border-gray-200");
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleUpdateColumn}
                      disabled={
                        !editColumnName.trim() ||
                        updateColumn.isPending ||
                        !editingColumn
                      }
                    >
                      {updateColumn.isPending ? "Modification..." : "Modifier"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Column Dialog */}
              <Dialog
                open={isDeleteColumnDialogOpen}
                onOpenChange={setIsDeleteColumnDialogOpen}
              >
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer la colonne</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer la colonne{" "}
                      <strong>&quot;{columnToDelete?.name}&quot;</strong> ?
                      Cette action est irréversible.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteColumnDialogOpen(false);
                        setColumnToDelete(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleConfirmDeleteColumn}
                      disabled={deleteColumn.isPending || !columnToDelete}
                    >
                      {deleteColumn.isPending ? "Suppression..." : "Supprimer"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Create Card Dialog */}
              <Dialog
                open={isCreateCardDialogOpen}
                onOpenChange={setIsCreateCardDialogOpen}
              >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle card</DialogTitle>
                    <DialogDescription>
                      Créez une nouvelle card pour suivre votre processus de
                      recrutement
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="card-title">
                        Titre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="card-title"
                        placeholder="Ex: Candidature de John Doe"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.ctrlKey) {
                            handleCreateCard();
                          }
                        }}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-description">Description</Label>
                      <Textarea
                        id="card-description"
                        placeholder="Détails sur la candidature, notes, etc."
                        value={newCardDescription}
                        onChange={(e) => setNewCardDescription(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-priority">Priorité</Label>
                      <Select
                        value={newCardPriority}
                        onValueChange={setNewCardPriority}
                      >
                        <SelectTrigger id="card-priority">
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basse</SelectItem>
                          <SelectItem value="medium">Moyenne</SelectItem>
                          <SelectItem value="high">Haute</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {offers.length > 0 && (
                      <div className="grid gap-2">
                        <Label>Offres d&apos;emploi associées</Label>
                        <div className="border rounded-lg p-4 max-h-48 overflow-y-auto">
                          {offers.map((offer) => (
                            <div
                              key={offer.id}
                              className="flex items-center space-x-2 py-2"
                            >
                              <Checkbox
                                id={`offer-${offer.id}`}
                                checked={newCardJobOfferIds.includes(offer.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewCardJobOfferIds([
                                      ...newCardJobOfferIds,
                                      offer.id,
                                    ]);
                                  } else {
                                    setNewCardJobOfferIds(
                                      newCardJobOfferIds.filter(
                                        (id) => id !== offer.id
                                      )
                                    );
                                  }
                                }}
                              />
                              <label
                                htmlFor={`offer-${offer.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {offer.title}
                                {offer.company && (
                                  <span className="text-muted-foreground ml-2">
                                    - {offer.company}
                                  </span>
                                )}
                              </label>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Vous pourrez ajouter d&apos;autres éléments (membres,
                          notes, checklist, etc.) après la création de la card
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateCardDialogOpen(false);
                        setNewCardTitle("");
                        setNewCardDescription("");
                        setNewCardPriority("medium");
                        setNewCardJobOfferIds([]);
                        setSelectedColumnForCard(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreateCard}
                      disabled={
                        !newCardTitle.trim() ||
                        createCard.isPending ||
                        !recruteurId ||
                        !selectedColumnForCard
                      }
                    >
                      {createCard.isPending ? "Création..." : "Créer la card"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Card Details Sheet */}
              <Sheet
                open={isCardDetailsSheetOpen}
                onOpenChange={(open) => {
                  if (!open) {
                    handleCloseCardDetails();
                  }
                }}
              >
                <SheetContent
                  side="right"
                  className="w-full max-w-5xl p-0 overflow-hidden"
                >
                  {selectedCard ? (
                    <div className="flex h-full">
                      {/* Main Content Area - Left Side */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Input
                              value={cardDetailsTitle}
                              onChange={(e) =>
                                setCardDetailsTitle(e.target.value)
                              }
                              className="text-xl font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0 mb-1"
                              placeholder="Card title"
                            />
                            <p className="text-sm text-muted-foreground">
                              in list{" "}
                              <button className="text-primary hover:underline">
                                {kanbanColumns.find(
                                  (col) => col.id === selectedCardColumnId
                                )?.titre || "Unknown"}
                              </button>
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleCloseCardDetails}
                            className="h-8 w-8"
                          >
                            <IconX className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Members Section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Membres
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedCard.members &&
                            selectedCard.members.length > 0 ? (
                              <>
                                {selectedCard.members.map((member) => (
                                  <Avatar
                                    key={member.id}
                                    className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
                                  >
                                    <AvatarImage
                                      src={member.user?.image || ""}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {member.user?.name
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase()
                                        .slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full border-2 border-dashed"
                                  onClick={() => {
                                    setSelectedMemberIds(
                                      selectedCard.members?.map(
                                        (m) => m.userId
                                      ) || []
                                    );
                                    setIsAddMembersDialogOpen(true);
                                  }}
                                >
                                  <IconPlus className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full border-2 border-dashed"
                                onClick={() => {
                                  setSelectedMemberIds([]);
                                  setIsAddMembersDialogOpen(true);
                                }}
                              >
                                <IconPlus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Labels Section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Labels
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {selectedCard.labels &&
                            selectedCard.labels.length > 0 ? (
                              <>
                                {selectedCard.labels.map((labelPivot) => (
                                  <Badge
                                    key={labelPivot.id}
                                    className="px-3 py-1 text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity"
                                    style={{
                                      backgroundColor:
                                        labelPivot.label?.color || "#3b82f6",
                                    }}
                                    onClick={() => {
                                      if (
                                        confirm(
                                          `Retirer le label "${labelPivot.label?.name}" de cette card ?`
                                        )
                                      ) {
                                        removeCardLabel.mutate({
                                          cardId: selectedCard.id,
                                          labelId: labelPivot.labelId,
                                          recruteurId: recruteurId!,
                                        });
                                      }
                                    }}
                                  >
                                    {labelPivot.label?.name}
                                  </Badge>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs border-dashed"
                                  onClick={() => setIsLabelsDialogOpen(true)}
                                >
                                  <IconPlus className="h-3.5 w-3.5 mr-1" />
                                  Ajouter un label
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs border-dashed"
                                onClick={() => setIsLabelsDialogOpen(true)}
                              >
                                <IconPlus className="h-3.5 w-3.5 mr-1" />
                                Ajouter un label
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Due Date Section */}
                        <div ref={dueDateSectionRef} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconClock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                Date d'échéance
                              </span>
                            </div>
                          </div>
                          {selectedCard.dueDates &&
                            selectedCard.dueDates.length > 0 && (
                              <div className="space-y-2">
                                {selectedCard.dueDates.map((dueDate) => (
                                  <div
                                    key={dueDate.id}
                                    className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 group"
                                  >
                                    {editingDueDateId === dueDate.id ? (
                                      <div className="flex-1 flex items-center gap-2">
                                        <Input
                                          type="datetime-local"
                                          value={editingDueDate}
                                          onChange={(e) =>
                                            setEditingDueDate(e.target.value)
                                          }
                                          className="h-8 text-sm"
                                          autoFocus
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={handleUpdateDueDate}
                                          disabled={
                                            updateCardDueDate.isPending ||
                                            !editingDueDate.trim()
                                          }
                                        >
                                          <IconCircleCheck className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => {
                                            setEditingDueDateId(null);
                                            setEditingDueDate("");
                                          }}
                                        >
                                          <IconX className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex-1 flex items-center gap-2">
                                          <IconCalendar className="h-4 w-4 text-muted-foreground" />
                                          <span
                                            className={`text-sm cursor-pointer ${
                                              new Date(dueDate.dueAt) <
                                              new Date()
                                                ? "text-green-600 font-semibold"
                                                : new Date(dueDate.dueAt) <
                                                  new Date(
                                                    Date.now() +
                                                      24 * 60 * 60 * 1000
                                                  )
                                                ? "text-orange-600 font-semibold"
                                                : ""
                                            }`}
                                            onClick={() =>
                                              handleStartEditDueDate(dueDate)
                                            }
                                          >
                                            {formatDateTime(dueDate.dueAt)}
                                          </span>
                                          {new Date(dueDate.dueAt) <
                                            new Date() && (
                                            <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                                              ÉCHU
                                            </Badge>
                                          )}
                                          {new Date(dueDate.dueAt) >=
                                            new Date() &&
                                            new Date(dueDate.dueAt) <
                                              new Date(
                                                Date.now() + 24 * 60 * 60 * 1000
                                              ) && (
                                              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5">
                                                Bientôt
                                              </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() =>
                                              handleStartEditDueDate(dueDate)
                                            }
                                          >
                                            <IconEdit className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                            onClick={() =>
                                              handleDeleteDueDate(dueDate.id)
                                            }
                                            disabled={
                                              deleteCardDueDate.isPending
                                            }
                                          >
                                            <IconTrash className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          {selectedCard.dueDates &&
                            selectedCard.dueDates.length === 0 && (
                              <>
                                <p className="text-sm text-muted-foreground">
                                  Aucune date d'échéance définie
                                </p>
                                <div className="flex items-center gap-2 pt-2 border-t">
                                  <Input
                                    type="datetime-local"
                                    placeholder="Ajouter une date d'échéance"
                                    value={newDueDate}
                                    onChange={(e) =>
                                      setNewDueDate(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        handleAddDueDate();
                                      }
                                    }}
                                    className="flex-1 h-8 text-sm"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2"
                                    onClick={handleAddDueDate}
                                    disabled={
                                      !newDueDate.trim() ||
                                      createCardDueDate.isPending
                                    }
                                  >
                                    <IconPlus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          {selectedCard.dueDates &&
                            selectedCard.dueDates.length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-xs text-muted-foreground italic">
                                  Supprimez la date d'échéance existante pour en
                                  ajouter une nouvelle
                                </p>
                              </div>
                            )}
                        </div>

                        {/* Attachment Section */}
                        <div ref={attachmentSectionRef} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconPaperclip className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                Pièces jointes
                              </span>
                            </div>
                          </div>
                          {selectedCard.attachments &&
                          selectedCard.attachments.length > 0 ? (
                            <div className="space-y-2">
                              {selectedCard.attachments.map((attachment) => (
                                <div
                                  key={attachment.id}
                                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-muted/50 group"
                                >
                                  <div className="flex-1 flex items-center gap-2">
                                    <IconPaperclip className="h-4 w-4 text-muted-foreground" />
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-primary hover:underline flex-1 truncate"
                                    >
                                      {attachment.filename || "Fichier"}
                                    </a>
                                    {attachment.fileType && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {attachment.fileType
                                          .split("/")[1]
                                          ?.toUpperCase() ||
                                          attachment.fileType}
                                      </Badge>
                                    )}
                                    {attachment.uploadedBy && (
                                      <span className="text-xs text-muted-foreground">
                                        par{" "}
                                        {attachment.uploadedBy.name ||
                                          attachment.uploadedBy.email}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDeleteAttachment(
                                          attachment.id,
                                          attachment.url
                                        )
                                      }
                                      disabled={deleteCardAttachment.isPending}
                                    >
                                      <IconTrash className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Aucune pièce jointe
                            </p>
                          )}
                          <div className="pt-2 border-t">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <Input
                                type="file"
                                className="hidden"
                                id="attachment-upload"
                                onChange={handleUploadAttachment}
                                disabled={uploadingAttachment}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                asChild
                                disabled={uploadingAttachment}
                              >
                                <label
                                  htmlFor="attachment-upload"
                                  className="cursor-pointer flex items-center justify-center gap-2"
                                >
                                  {uploadingAttachment ? (
                                    <>
                                      <IconClock className="h-4 w-4 animate-spin" />
                                      Upload en cours...
                                    </>
                                  ) : (
                                    <>
                                      <IconPlus className="h-4 w-4" />
                                      Ajouter une pièce jointe
                                    </>
                                  )}
                                </label>
                              </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-2">
                              Taille maximale : 10MB
                            </p>
                          </div>
                        </div>

                        {/* Description Section */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <IconMenu2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-semibold">
                              Description
                            </span>
                          </div>
                          <Textarea
                            value={cardDetailsDescription}
                            onChange={(e) =>
                              setCardDetailsDescription(e.target.value)
                            }
                            placeholder="Add a more detailed description..."
                            className="min-h-[100px] resize-none"
                          />
                        </div>

                        {/* Checklist Section */}
                        <div
                          ref={checklistSectionRef}
                          className="space-y-3"
                          data-checklist-section
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconListCheck className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                Checklist
                              </span>
                            </div>
                            {selectedCard.checklist &&
                              selectedCard.checklist.length > 0 && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() =>
                                      setHideCompletedItems(!hideCompletedItems)
                                    }
                                  >
                                    {hideCompletedItems
                                      ? "Afficher les tâches complétées"
                                      : "Masquer les tâches complétées"}
                                  </Button>
                                </div>
                              )}
                          </div>
                          {selectedCard.checklist &&
                            selectedCard.checklist.length > 0 && (
                              <>
                                <div className="space-y-1">
                                  {/* Progress Bar */}
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{
                                        width: `${
                                          (selectedCard.checklist.filter(
                                            (c) => c.isDone
                                          ).length /
                                            selectedCard.checklist.length) *
                                          100
                                        }%`,
                                      }}
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {Math.round(
                                      (selectedCard.checklist.filter(
                                        (c) => c.isDone
                                      ).length /
                                        selectedCard.checklist.length) *
                                        100
                                    )}
                                    %
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {selectedCard.checklist
                                    .filter(
                                      (item) =>
                                        !hideCompletedItems || !item.isDone
                                    )
                                    .map((item) => (
                                      <div
                                        key={item.id}
                                        className="flex items-center gap-2 text-sm hover:bg-muted/50 p-2 rounded group"
                                      >
                                        <Checkbox
                                          checked={item.isDone}
                                          onCheckedChange={() =>
                                            handleToggleCheckItem(
                                              item.id,
                                              item.isDone
                                            )
                                          }
                                        />
                                        {editingCheckItemId === item.id ? (
                                          <div className="flex-1 flex items-center gap-2">
                                            <Input
                                              value={editingCheckItemLabel}
                                              onChange={(e) =>
                                                setEditingCheckItemLabel(
                                                  e.target.value
                                                )
                                              }
                                              onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                  handleSaveEditCheckItem();
                                                } else if (e.key === "Escape") {
                                                  setEditingCheckItemId(null);
                                                  setEditingCheckItemLabel("");
                                                }
                                              }}
                                              className="h-7 text-sm"
                                              autoFocus
                                            />
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={handleSaveEditCheckItem}
                                            >
                                              <IconCircleCheck className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0"
                                              onClick={() => {
                                                setEditingCheckItemId(null);
                                                setEditingCheckItemLabel("");
                                              }}
                                            >
                                              <IconX className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <>
                                            <span
                                              className={`flex-1 cursor-pointer ${
                                                item.isDone
                                                  ? "text-muted-foreground line-through"
                                                  : ""
                                              }`}
                                              onClick={() =>
                                                handleStartEditCheckItem(item)
                                              }
                                            >
                                              {item.label}
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                              onClick={() =>
                                                handleDeleteCheckItem(item.id)
                                              }
                                            >
                                              <IconTrash className="h-3.5 w-3.5" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </>
                            )}
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Ajouter une tâche..."
                              value={newCheckItemLabel}
                              onChange={(e) =>
                                setNewCheckItemLabel(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddCheckItem();
                                }
                              }}
                              className="flex-1 h-8 text-sm"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={handleAddCheckItem}
                              disabled={
                                !newCheckItemLabel.trim() ||
                                createCheckItem.isPending
                              }
                            >
                              <IconPlus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Activity Section */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <IconDots className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">
                                Activités
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                            >
                              Masquer les détails
                            </Button>
                          </div>
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={session?.user?.image || ""} />
                              <AvatarFallback className="text-xs">
                                {session?.user?.name
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <Input
                              placeholder="Tapez votre message..."
                              className="flex-1"
                              value={noteContent}
                              onChange={(e) => setNoteContent(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddNote();
                                }
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={handleAddNote}
                              disabled={
                                !noteContent.trim() || createCardNote.isPending
                              }
                            >
                              <IconSend className="h-4 w-4" />
                            </Button>
                          </div>
                          {selectedCard.notes &&
                            selectedCard.notes.length > 0 && (
                              <div className="space-y-3 mt-4">
                                {selectedCard.notes.map((note) => (
                                  <div
                                    key={note.id}
                                    className="flex items-start gap-3"
                                  >
                                    <Avatar className="h-8 w-8">
                                      <AvatarImage
                                        src={note.author?.image || ""}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {note.author?.name
                                          ?.split(" ")
                                          .map((n) => n[0])
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm">{note.content}</p>
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {note.author?.name ||
                                          note.author?.email}
                                        {note.createdAt && (
                                          <span className="ml-2">
                                            • {formatDateTime(note.createdAt)}
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                        </div>

                        {/* Footer with Save Button */}
                        <div className="pt-4 border-t flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={handleCloseCardDetails}
                          >
                            Fermer
                          </Button>
                          <Button
                            onClick={handleUpdateCardDetails}
                            disabled={
                              updateCard.isPending ||
                              !selectedCard ||
                              !recruteurId ||
                              !cardDetailsTitle.trim()
                            }
                          >
                            {updateCard.isPending
                              ? "Enregistrement..."
                              : "Enregistrer"}
                          </Button>
                        </div>
                      </div>

                      {/* Add Members Dialog */}
                      <Dialog
                        open={isAddMembersDialogOpen}
                        onOpenChange={setIsAddMembersDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gérer les membres</DialogTitle>
                            <DialogDescription>
                              Ajoutez ou retirez des collaborateurs de cette
                              card. Cliquez sur un membre existant pour le
                              retirer.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                            {collaborateurs && collaborateurs.length > 0 ? (
                              collaborateurs
                                .filter(
                                  (collaborateur) =>
                                    collaborateur.invitation?.accepted
                                )
                                .map((collaborateur) => {
                                  const isSelected = selectedMemberIds.includes(
                                    collaborateur.userId
                                  );
                                  const isAlreadyMember =
                                    selectedCard.members?.some(
                                      (m) => m.userId === collaborateur.userId
                                    ) || false;

                                  return (
                                    <div
                                      key={collaborateur.id}
                                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                                      onClick={() => {
                                        if (isAlreadyMember) {
                                          // Permettre de retirer un membre existant
                                          if (
                                            confirm(
                                              `Retirer ${
                                                collaborateur.user?.name ||
                                                `${collaborateur.prenom} ${collaborateur.nom}`
                                              } de cette card ?`
                                            )
                                          ) {
                                            removeCardMember.mutate(
                                              {
                                                cardId: selectedCard.id,
                                                userId: collaborateur.userId,
                                                recruteurId: recruteurId!,
                                              },
                                              {
                                                onSuccess: () => {
                                                  // Mettre à jour la liste des membres sélectionnés
                                                  setSelectedMemberIds(
                                                    selectedMemberIds.filter(
                                                      (id) =>
                                                        id !==
                                                        collaborateur.userId
                                                    )
                                                  );
                                                },
                                              }
                                            );
                                          }
                                          return;
                                        }
                                        // Pour les non-membres, toggle la sélection
                                        if (isSelected) {
                                          setSelectedMemberIds(
                                            selectedMemberIds.filter(
                                              (id) =>
                                                id !== collaborateur.userId
                                            )
                                          );
                                        } else {
                                          setSelectedMemberIds([
                                            ...selectedMemberIds,
                                            collaborateur.userId,
                                          ]);
                                        }
                                      }}
                                    >
                                      <Checkbox
                                        checked={isSelected || isAlreadyMember}
                                        disabled={false}
                                        className={
                                          isAlreadyMember ? "opacity-50" : ""
                                        }
                                      />
                                      <Avatar className="h-10 w-10">
                                        <AvatarImage
                                          src={collaborateur.user?.image || ""}
                                        />
                                        <AvatarFallback>
                                          {collaborateur.user?.name
                                            ?.split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2) ||
                                            `${collaborateur.prenom[0]}${collaborateur.nom[0]}`.toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                        <p className="text-sm font-medium">
                                          {collaborateur.user?.name ||
                                            `${collaborateur.prenom} ${collaborateur.nom}`}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {collaborateur.user?.email ||
                                            collaborateur.email}
                                        </p>
                                      </div>
                                      {isAlreadyMember && (
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          Membre actuel
                                        </Badge>
                                      )}
                                      {isAlreadyMember && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (
                                              confirm(
                                                `Retirer ${
                                                  collaborateur.user?.name ||
                                                  `${collaborateur.prenom} ${collaborateur.nom}`
                                                } de cette card ?`
                                              )
                                            ) {
                                              removeCardMember.mutate(
                                                {
                                                  cardId: selectedCard.id,
                                                  userId: collaborateur.userId,
                                                  recruteurId: recruteurId!,
                                                },
                                                {
                                                  onSuccess: () => {
                                                    setSelectedMemberIds(
                                                      selectedMemberIds.filter(
                                                        (id) =>
                                                          id !==
                                                          collaborateur.userId
                                                      )
                                                    );
                                                  },
                                                }
                                              );
                                            }
                                          }}
                                          title="Retirer ce membre"
                                        >
                                          <IconX className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Aucun collaborateur disponible. Invitez des
                                personnes pour les ajouter comme membres.
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsAddMembersDialogOpen(false)}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={() => {
                                if (
                                  selectedCard &&
                                  recruteurId &&
                                  selectedMemberIds.length > 0
                                ) {
                                  // Filtrer les membres déjà présents
                                  const newMemberIds = selectedMemberIds.filter(
                                    (userId) =>
                                      !selectedCard.members?.some(
                                        (m) => m.userId === userId
                                      )
                                  );

                                  if (newMemberIds.length > 0) {
                                    addCardMembers.mutate(
                                      {
                                        cardId: selectedCard.id,
                                        userIds: newMemberIds,
                                        recruteurId,
                                      },
                                      {
                                        onSuccess: () => {
                                          setIsAddMembersDialogOpen(false);
                                          setSelectedMemberIds([]);
                                        },
                                      }
                                    );
                                  } else {
                                    setIsAddMembersDialogOpen(false);
                                  }
                                }
                              }}
                              disabled={
                                !selectedCard ||
                                !recruteurId ||
                                selectedMemberIds.length === 0 ||
                                addCardMembers.isPending
                              }
                            >
                              {addCardMembers.isPending
                                ? "Ajout..."
                                : "Ajouter les membres"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Labels Management Dialog */}
                      <Dialog
                        open={isLabelsDialogOpen}
                        onOpenChange={setIsLabelsDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Gérer les labels</DialogTitle>
                            <DialogDescription>
                              Ajoutez ou retirez des labels de cette card
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">
                                Labels disponibles
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCreateLabelDialogOpen(true)}
                              >
                                <IconPlus className="h-4 w-4 mr-1" />
                                Créer un label
                              </Button>
                            </div>
                            {labels && labels.length > 0 ? (
                              <div className="space-y-2">
                                {labels.map((label) => {
                                  const isOnCard =
                                    selectedCard?.labels?.some(
                                      (lp) => lp.labelId === label.id
                                    ) || false;

                                  return (
                                    <div
                                      key={label.id}
                                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                                    >
                                      <div className="flex items-center gap-2 flex-1">
                                        <div
                                          className="w-4 h-4 rounded"
                                          style={{
                                            backgroundColor: label.color,
                                          }}
                                        />
                                        <span className="text-sm">
                                          {label.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0"
                                          onClick={() => {
                                            setEditingLabel(label);
                                            setEditLabelName(label.name);
                                            setEditLabelColor(label.color);
                                            setIsEditLabelDialogOpen(true);
                                          }}
                                        >
                                          <IconEdit className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                          onClick={() => {
                                            if (
                                              confirm(
                                                `Supprimer le label "${label.name}" ? Cette action est irréversible.`
                                              )
                                            ) {
                                              deleteLabel.mutate(label.id);
                                            }
                                          }}
                                        >
                                          <IconTrash className="h-3.5 w-3.5" />
                                        </Button>
                                        {isOnCard ? (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                              if (selectedCard) {
                                                removeCardLabel.mutate({
                                                  cardId: selectedCard.id,
                                                  labelId: label.id,
                                                  recruteurId: recruteurId!,
                                                });
                                              }
                                            }}
                                          >
                                            Retirer
                                          </Button>
                                        ) : (
                                          <Button
                                            variant="default"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => {
                                              if (selectedCard) {
                                                addCardLabel.mutate(
                                                  {
                                                    cardId: selectedCard.id,
                                                    labelId: label.id,
                                                    recruteurId: recruteurId!,
                                                  },
                                                  {
                                                    onSuccess: () => {
                                                      setIsLabelsDialogOpen(
                                                        false
                                                      );
                                                    },
                                                  }
                                                );
                                              }
                                            }}
                                          >
                                            Ajouter
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Aucun label disponible. Créez-en un pour
                                commencer.
                              </p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setIsLabelsDialogOpen(false)}
                            >
                              Fermer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Create Label Dialog */}
                      <Dialog
                        open={isCreateLabelDialogOpen}
                        onOpenChange={setIsCreateLabelDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Créer un label</DialogTitle>
                            <DialogDescription>
                              Créez un nouveau label pour vos cards
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="label-name">Nom</Label>
                              <Input
                                id="label-name"
                                placeholder="Ex: Urgent, Design, Backend..."
                                value={newLabelName}
                                onChange={(e) =>
                                  setNewLabelName(e.target.value)
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="label-color">Couleur</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  id="label-color"
                                  value={newLabelColor}
                                  onChange={(e) =>
                                    setNewLabelColor(e.target.value)
                                  }
                                  className="h-10 w-20 rounded border cursor-pointer"
                                />
                                <Input
                                  value={newLabelColor}
                                  onChange={(e) =>
                                    setNewLabelColor(e.target.value)
                                  }
                                  placeholder="#3b82f6"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsCreateLabelDialogOpen(false);
                                setNewLabelName("");
                                setNewLabelColor("#3b82f6");
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={() => {
                                if (!newLabelName.trim() || !recruteurId)
                                  return;
                                createLabel.mutate(
                                  {
                                    name: newLabelName.trim(),
                                    color: newLabelColor,
                                    recruteurId,
                                  },
                                  {
                                    onSuccess: () => {
                                      setIsCreateLabelDialogOpen(false);
                                      setNewLabelName("");
                                      setNewLabelColor("#3b82f6");
                                    },
                                  }
                                );
                              }}
                              disabled={
                                !newLabelName.trim() ||
                                createLabel.isPending ||
                                !recruteurId
                              }
                            >
                              {createLabel.isPending ? "Création..." : "Créer"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Edit Label Dialog */}
                      <Dialog
                        open={isEditLabelDialogOpen}
                        onOpenChange={setIsEditLabelDialogOpen}
                      >
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le label</DialogTitle>
                            <DialogDescription>
                              Modifiez le nom et la couleur du label
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-label-name">Nom</Label>
                              <Input
                                id="edit-label-name"
                                value={editLabelName}
                                onChange={(e) =>
                                  setEditLabelName(e.target.value)
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="edit-label-color">Couleur</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  id="edit-label-color"
                                  value={editLabelColor}
                                  onChange={(e) =>
                                    setEditLabelColor(e.target.value)
                                  }
                                  className="h-10 w-20 rounded border cursor-pointer"
                                />
                                <Input
                                  value={editLabelColor}
                                  onChange={(e) =>
                                    setEditLabelColor(e.target.value)
                                  }
                                  placeholder="#3b82f6"
                                  className="flex-1"
                                />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditLabelDialogOpen(false);
                                setEditingLabel(null);
                                setEditLabelName("");
                                setEditLabelColor("#3b82f6");
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={() => {
                                if (!editingLabel || !editLabelName.trim())
                                  return;
                                updateLabel.mutate(
                                  {
                                    id: editingLabel.id,
                                    data: {
                                      name: editLabelName.trim(),
                                      color: editLabelColor,
                                    },
                                  },
                                  {
                                    onSuccess: () => {
                                      setIsEditLabelDialogOpen(false);
                                      setEditingLabel(null);
                                      setEditLabelName("");
                                      setEditLabelColor("#3b82f6");
                                    },
                                  }
                                );
                              }}
                              disabled={
                                !editingLabel ||
                                !editLabelName.trim() ||
                                updateLabel.isPending
                              }
                            >
                              {updateLabel.isPending
                                ? "Modification..."
                                : "Modifier"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {/* Sidebar - Right Side */}
                      <div className="w-64 border-l bg-muted/30 p-4 space-y-4 overflow-y-auto">
                        {/* Suggested Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              suggéré
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <IconSettings className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <IconUserPlus className="h-4 w-4 mr-2" />
                            Members
                          </Button>
                        </div>

                        {/* Add to Card Section */}
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Add to Card
                          </span>
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={() => {
                                if (selectedCard) {
                                  setSelectedMemberIds(
                                    selectedCard.members?.map(
                                      (m) => m.userId
                                    ) || []
                                  );
                                  setIsAddMembersDialogOpen(true);
                                }
                              }}
                            >
                              <IconUserPlus className="h-4 w-4 mr-2" />
                              Members
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log("Labels button clicked", {
                                  isLabelsDialogOpen,
                                  selectedCard,
                                });
                                setIsLabelsDialogOpen(true);
                              }}
                            >
                              <IconTag className="h-4 w-4 mr-2" />
                              Labels
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleScrollToChecklist();
                              }}
                            >
                              <IconListCheck className="h-4 w-4 mr-2" />
                              Checklist
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleScrollToDueDate();
                              }}
                            >
                              <IconClock className="h-4 w-4 mr-2" />
                              Due date
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleScrollToAttachment();
                              }}
                            >
                              <IconPaperclip className="h-4 w-4 mr-2" />
                              Attachment
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start"
                            >
                              <IconDeviceDesktop className="h-4 w-4 mr-2" />
                              Cover
                            </Button>
                          </div>
                        </div>

                        {/* Power-Ups Section */}
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Power-Ups
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start mb-1"
                          >
                            <span className="text-xs font-semibold mr-2">
                              G
                            </span>
                            Google Drive
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add Power-Ups
                          </Button>
                        </div>

                        {/* Butler Section */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Butler
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                            >
                              <IconInfoCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start"
                          >
                            <IconPlus className="h-4 w-4 mr-2" />
                            Add button
                          </Button>
                        </div>

                        {/* Actions Section */}
                        <div>
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                            Actions
                          </span>
                          <div className="space-y-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-destructive"
                            >
                              <IconTrash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <p className="text-sm text-muted-foreground">
                        Sélectionnez une card pour afficher ses détails.
                      </p>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
