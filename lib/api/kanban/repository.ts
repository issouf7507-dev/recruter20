import prisma from "@/lib/prisma";
import type {
  KanbanColumn,
  KanbanCard,
  CreateKanbanColumnData,
  UpdateKanbanColumnData,
  CreateKanbanCardData,
  UpdateKanbanCardData,
  ApplicationStatus,
} from "./types";

/**
 * Repository for Kanban operations - Database operations
 */
export class KanbanRepository {
  /**
   * Get all columns with their cards for a recruteur
   */
  async findColumnsByRecruteur(recruteurId: string) {
    const columns = await prisma.kanbanColumn.findMany({
      where: {
        recruteurId,
      },
      include: {
        cards: {
          where: {
            isArchived: false,
          },
          include: {
            offers: {
              include: {
                jobOffer: {
                  select: {
                    id: true,
                    title: true,
                    company: true,
                  },
                },
              },
            },
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
            notes: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            checklist: {
              orderBy: {
                order: "asc",
              },
            },
            attachments: {
              include: {
                uploadedBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            labels: {
              include: {
                label: true,
              },
            },
            activities: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
            dueDates: {
              orderBy: {
                dueAt: "asc",
              },
            },
          },
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });

    return {
      columns,
    };
  }

  /**
   * Get a single column by ID
   */
  async findColumnById(id: string) {
    const column = await prisma.kanbanColumn.findUnique({
      where: { id },
    });

    return column;
  }

  /**
   * Create a new column
   */
  async createColumn(
    recruteurId: string,
    data: CreateKanbanColumnData
  ): Promise<KanbanColumn> {
    // Get the maximum order for this recruteur
    const maxOrderColumn = await prisma.kanbanColumn.findFirst({
      where: {
        recruteurId,
      },
      orderBy: {
        order: "desc",
      },
    });

    const newOrder = maxOrderColumn ? maxOrderColumn.order + 1 : 0;

    // Kanban is independent of offers, but schema requires jobOfferId
    // Use empty string as placeholder
    const column = await prisma.kanbanColumn.create({
      data: {
        name: data.name,
        color: data.color,
        order: newOrder,
        isDefault: data.isDefault || false,
        recruteurId,
      },
    });
    // console.log("column", column);

    return column;
  }

  /**
   * Update a column
   */
  async updateColumn(
    id: string,
    data: UpdateKanbanColumnData
  ): Promise<KanbanColumn> {
    const column = await prisma.kanbanColumn.update({
      where: { id },
      data,
    });

    return column;
  }

  /**
   * Delete a column
   */
  async deleteColumn(id: string): Promise<void> {
    await prisma.kanbanColumn.delete({
      where: { id },
    });
  }

  /**
   * Reorder columns
   */
  async reorderColumns(
    updates: Array<{ id: string; order: number }>
  ): Promise<void> {
    await prisma.$transaction(
      updates.map(({ id, order }) =>
        prisma.kanbanColumn.update({
          where: { id },
          data: { order },
        })
      )
    );
  }

  /**
   * Get application by ID
   */
  async findApplicationById(id: string) {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        collaborateurs: {
          include: {
            collaborateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
        files: true,
        notes: {
          orderBy: {
            createdAt: "desc",
          },
        },
        checklist: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return application;
  }

  /**
   * Update application status (used when moving between columns)
   */
  async updateApplicationStatus(
    applicationId: string,
    newStatus: ApplicationStatus
  ) {
    const application = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
        collaborateurs: {
          include: {
            collaborateur: {
              select: {
                id: true,
                nom: true,
                prenom: true,
                email: true,
              },
            },
          },
        },
        files: true,
        notes: true,
        checklist: true,
      },
    });

    return application;
  }

  /**
   * Verify ownership of a column
   */
  async verifyColumnOwnership(
    columnId: string,
    recruteurId: string
  ): Promise<boolean> {
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: columnId,
        recruteurId,
      },
    });

    return !!column;
  }

  /**
   * Verify ownership of an application (via jobOffer)
   */
  async verifyApplicationOwnership(
    applicationId: string,
    recruteurId: string
  ): Promise<boolean> {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        jobOffer: {
          recruteurId,
        },
      },
    });

    return !!application;
  }

  /**
   * Create a new card
   */
  async createCard(
    recruteurId: string,
    data: CreateKanbanCardData,
    userId?: string
  ): Promise<KanbanCard> {
    // Verify column ownership
    const column = await prisma.kanbanColumn.findFirst({
      where: {
        id: data.columnId,
        recruteurId,
      },
    });

    if (!column) {
      throw new Error("Column not found or access denied");
    }

    // Get the maximum order for cards in this column
    const maxOrderCard = await prisma.kanbanCard.findFirst({
      where: {
        columnId: data.columnId,
      },
      orderBy: {
        order: "desc",
      },
    });

    const newOrder = maxOrderCard ? maxOrderCard.order + 1 : 0;

    // Create card with relations
    const card = await prisma.kanbanCard.create({
      data: {
        title: data.title,
        description: data.description || null,
        priority: data.priority || null,
        order: newOrder,
        columnId: data.columnId,
        createdByRecruteurId: recruteurId,
        offers: data.jobOfferIds?.length
          ? {
              create: data.jobOfferIds.map((jobOfferId) => ({
                jobOfferId,
              })),
            }
          : undefined,
        members: data.memberIds?.length
          ? {
              create: data.memberIds.map((userId) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        offers: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        notes: true,
        checklist: true,
        attachments: true,
        labels: {
          include: {
            label: true,
          },
        },
        activities: true,
        dueDates: true,
      },
    });

    // Log activity (only if userId is provided)
    if (userId) {
      await prisma.cardActivity.create({
        data: {
          cardId: card.id,
          userId: userId,
          action: "card_created",
          meta: JSON.parse(JSON.stringify({ title: card.title })),
        },
      });
    }

    return card as any;
  }

  /**
   * Update a card
   */
  async updateCard(
    id: string,
    data: UpdateKanbanCardData,
    recruteurId: string,
    userId?: string
  ): Promise<KanbanCard> {
    // Verify ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    const updatedCard = await prisma.kanbanCard.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        columnId: data.columnId,
        order: data.order,
        isArchived: data.isArchived,
        archivedAt: data.isArchived ? new Date() : null,
      },
      include: {
        offers: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        checklist: {
          orderBy: {
            order: "asc",
          },
        },
        attachments: true,
        labels: {
          include: {
            label: true,
          },
        },
        activities: true,
        dueDates: true,
      },
    });

    // Log activity if important fields changed (only if userId is provided)
    if (userId && (data.title || data.priority || data.columnId)) {
      await prisma.cardActivity.create({
        data: {
          cardId: updatedCard.id,
          userId: userId,
          action: "card_updated",
          meta: JSON.parse(JSON.stringify({ changes: data })),
        },
      });
    }

    return updatedCard as any;
  }

  /**
   * Delete a card
   */
  async deleteCard(id: string, recruteurId: string): Promise<void> {
    // Verify ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    await prisma.kanbanCard.delete({
      where: { id },
    });
  }

  /**
   * Move a card to another column
   */
  async moveCard(
    cardId: string,
    targetColumnId: string,
    newOrder?: number,
    recruteurId?: string,
    userId?: string
  ): Promise<KanbanCard> {
    // Verify column ownership if recruteurId provided
    if (recruteurId) {
      const targetColumn = await prisma.kanbanColumn.findFirst({
        where: {
          id: targetColumnId,
          recruteurId,
        },
      });

      if (!targetColumn) {
        throw new Error("Target column not found or access denied");
      }
    }

    // Get current order if not provided
    let finalOrder = newOrder;
    if (finalOrder === undefined) {
      const maxOrderCard = await prisma.kanbanCard.findFirst({
        where: {
          columnId: targetColumnId,
        },
        orderBy: {
          order: "desc",
        },
      });
      finalOrder = maxOrderCard ? maxOrderCard.order + 1 : 0;
    }

    const card = await prisma.kanbanCard.update({
      where: { id: cardId },
      data: {
        columnId: targetColumnId,
        order: finalOrder,
      },
      include: {
        offers: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        notes: true,
        checklist: true,
        attachments: true,
        labels: {
          include: {
            label: true,
          },
        },
        activities: true,
        dueDates: true,
      },
    });

    // Log activity (only if userId is provided)
    if (userId) {
      await prisma.cardActivity.create({
        data: {
          cardId: card.id,
          userId: userId,
          action: "card_moved",
          meta: JSON.parse(
            JSON.stringify({
              targetColumnId,
              newOrder: finalOrder,
            })
          ),
        },
      });
    }

    return card as any;
  }

  /**
   * Reorder cards in a column
   */
  async reorderCards(
    updates: Array<{ cardId: string; newOrder: number }>
  ): Promise<void> {
    await prisma.$transaction(
      updates.map(({ cardId, newOrder }) =>
        prisma.kanbanCard.update({
          where: { id: cardId },
          data: { order: newOrder },
        })
      )
    );
  }

  /**
   * Add members to a card
   */
  async addCardMembers(
    cardId: string,
    userIds: string[],
    recruteurId: string,
    userId?: string
  ): Promise<KanbanCard> {
    // Verify card ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    // Add members (using createMany with skipDuplicates to avoid errors if already exists)
    await prisma.cardMember.createMany({
      data: userIds.map((userId) => ({
        cardId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Log activity
    if (userId) {
      await prisma.cardActivity.create({
        data: {
          cardId,
          userId,
          action: "members_added",
          meta: JSON.parse(JSON.stringify({ userIds })),
        },
      });
    }

    // Return updated card
    return this.findCardById(cardId, recruteurId);
  }

  /**
   * Remove a member from a card
   */
  async removeCardMember(
    cardId: string,
    userId: string,
    recruteurId: string,
    actorUserId?: string
  ): Promise<KanbanCard> {
    // Verify card ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    // Remove member
    await prisma.cardMember.deleteMany({
      where: {
        cardId,
        userId,
      },
    });

    // Log activity
    if (actorUserId) {
      await prisma.cardActivity.create({
        data: {
          cardId,
          userId: actorUserId,
          action: "member_removed",
          meta: JSON.parse(JSON.stringify({ removedUserId: userId })),
        },
      });
    }

    // Return updated card
    return this.findCardById(cardId, recruteurId);
  }

  /**
   * Find a card by ID with all relations
   */
  private async findCardById(
    cardId: string,
    recruteurId: string
  ): Promise<KanbanCard> {
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        createdByRecruteurId: recruteurId,
      },
      include: {
        offers: {
          include: {
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        checklist: {
          orderBy: {
            order: "asc",
          },
        },
        attachments: true,
        labels: {
          include: {
            label: true,
          },
        },
        activities: true,
        dueDates: true,
      },
    });

    if (!card) {
      throw new Error("Card not found");
    }

    return card as any;
  }

  /**
   * Get all labels for a recruteur
   */
  async findLabelsByRecruteur(recruteurId: string) {
    // Les labels sont globaux, pas liés à un recruteur spécifique
    // Pour l'instant, on retourne tous les labels
    // Vous pouvez ajouter un champ recruteurId au modèle CardLabel si nécessaire
    return prisma.cardLabel.findMany({
      orderBy: {
        name: "asc",
      },
    });
  }

  /**
   * Create a new label
   */
  async createLabel(data: {
    name: string;
    color: string;
    recruteurId: string;
  }) {
    return prisma.cardLabel.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  /**
   * Update a label
   */
  async updateLabel(id: string, data: { name?: string; color?: string }) {
    return prisma.cardLabel.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  /**
   * Delete a label
   */
  async deleteLabel(id: string) {
    // Les CardLabelPivot seront supprimés automatiquement grâce à onDelete: Cascade
    return prisma.cardLabel.delete({
      where: { id },
    });
  }

  /**
   * Add a label to a card
   */
  async addCardLabel(
    cardId: string,
    labelId: string,
    recruteurId: string,
    userId?: string
  ): Promise<KanbanCard> {
    // Verify card ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    // Add label (using create with skipDuplicates handling)
    await prisma.cardLabelPivot
      .create({
        data: {
          cardId,
          labelId,
        },
      })
      .catch((error: any) => {
        // Ignore unique constraint errors (label already exists on card)
        if (error.code !== "P2002") {
          throw error;
        }
      });

    // Log activity
    if (userId) {
      await prisma.cardActivity.create({
        data: {
          cardId,
          userId,
          action: "label_added",
          meta: JSON.parse(JSON.stringify({ labelId })),
        },
      });
    }

    // Return updated card
    return this.findCardById(cardId, recruteurId);
  }

  /**
   * Remove a label from a card
   */
  async removeCardLabel(
    cardId: string,
    labelId: string,
    recruteurId: string,
    actorUserId?: string
  ): Promise<KanbanCard> {
    // Verify card ownership
    const card = await prisma.kanbanCard.findFirst({
      where: {
        id: cardId,
        createdByRecruteurId: recruteurId,
      },
    });

    if (!card) {
      throw new Error("Card not found or access denied");
    }

    // Remove label
    await prisma.cardLabelPivot.deleteMany({
      where: {
        cardId,
        labelId,
      },
    });

    // Log activity
    if (actorUserId) {
      await prisma.cardActivity.create({
        data: {
          cardId,
          userId: actorUserId,
          action: "label_removed",
          meta: JSON.parse(JSON.stringify({ labelId })),
        },
      });
    }

    // Return updated card
    return this.findCardById(cardId, recruteurId);
  }
}

export const kanbanRepository = new KanbanRepository();
