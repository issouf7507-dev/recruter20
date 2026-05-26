import prisma from "@/lib/prisma";
import { Prisma, SenderType } from "@/app/generated/prisma";
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

    const where: Prisma.JobOfferWhereInput = {
      deletedAt: null,
    };

    if (recruteurId) {
      where.recruteurId = recruteurId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { company: { contains: search } },
        { location: { contains: search } },
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

  async findByRecruteurId(recruteurId: string) {
    return prisma.conversation.findMany({
      where: { recruteurId },
      include: {
        candidat: { include: { user: { select: { email: true, name: true } } } },
        jobOffer: { select: { id: true, title: true, company: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findByCandidatId(candidatId: string) {
    return prisma.conversation.findMany({
      where: { candidatId },
      include: {
        recruteur: {
          select: { id: true, firstName: true, lastName: true, companyName: true, logo: true, type: true },
        },
        jobOffer: { select: { id: true, title: true, company: true, location: true } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  async findWithDetails(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        candidat: { include: { user: { select: { email: true, name: true } } } },
        recruteur: { include: { user: { select: { name: true } } } },
        jobOffer: { select: { title: true, company: true } },
      },
    });
  }

  async createMessage(data: {
    conversationId: string;
    senderId: string;
    senderType: SenderType;
    content: string;
  }) {
    return prisma.message.create({ data });
  }

  async findMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }

  async updateActivity(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}

export const conversationRepository = new ConversationRepository();
