import prisma from "@/lib/prisma";
import type { CreateConversationData } from "./types";

/**
 * Repository for job offers - Database operations
 */
export class ConversationRepository {
  /**
   * Get all offers with pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    recruteurId?: string;
    search?: string;
    etat?: string;
  }) {
    const { page = 1, limit = 10, recruteurId, search, etat } = params;

    const where: any = {
      deletedAt: null,
    };

    if (recruteurId) {
      where.recruteurId = recruteurId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (etat && etat !== "all") {
      where.etat = etat;
    }

    const [offres, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          recruteur: {
            select: {
              id: true,
              companyName: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    return {
      items: offres,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get offer by ID
   */
  async findById(id: string) {
    return prisma.jobOffer.findUnique({
      where: { id },
      include: {
        recruteur: {
          select: {
            id: true,
            companyName: true,
          },
        },
        applications: {
          include: {
            candidat: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Create a new offer
   */
  async create(data: CreateConversationData) {
    // Vérifier si une conversation existe déjà
    let conversation = await prisma.conversation.findUnique({
      where: {
        jobOfferId_candidatId_recruteurId: {
          jobOfferId: data.jobOfferId,
          candidatId: data.candidatId,
          recruteurId: data.recruteurId,
        },
      },
      include: {
        candidat: {
          include: {
            user: {
              select: {
                email: true,
                name: true,
              },
            },
          },
        },
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          jobOfferId: data.jobOfferId,
          candidatId: data.candidatId,
          recruteurId: data.recruteurId,
          isActive: true,
        },
        include: {
          candidat: {
            include: {
              user: {
                select: {
                  email: true,
                  name: true,
                },
              },
            },
          },
          jobOffer: {
            select: {
              id: true,
              title: true,
              company: true,
            },
          },
          messages: {
            orderBy: { createdAt: "desc" },
          },
        },
      });
    } else {
      // Si elle existe, la réactiver si nécessaire
      if (!conversation.isActive) {
        conversation = await prisma.conversation.update({
          where: { id: conversation.id },
          data: { isActive: true },
          include: {
            candidat: {
              include: {
                user: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
              },
            },
            jobOffer: {
              select: {
                id: true,
                title: true,
                company: true,
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
            },
          },
        });
      }
    }

    return conversation;
  }

  /**
   * Update an offer
   */

  /**
   * Soft delete an offer
   */
  async delete(id: string) {
    return prisma.jobOffer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        etat: "deleted",
      },
    });
  }
}

export const conversationRepository = new ConversationRepository();
