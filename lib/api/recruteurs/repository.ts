import prisma from "@/lib/prisma";

/**
 * Repository for recruteurs - Database operations
 */
export class RecruteurRepository {
  /**
   * Get recruteur by userId
   */
  async findByUserId(userId: string) {
    return prisma.recruteur.findUnique({
      where: { userId },
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
    });
  }

  /**
   * Get recruteur by ID
   */
  async findById(id: string) {
    return prisma.recruteur.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        _count: {
          select: {
            JobOffer: true,
            conversations: true,
            collaborateurs: true,
          },
        },
      },
    });
  }

  /**
   * Get all recruteurs
   */
  async findAll(params?: { limit?: number }) {
    return prisma.recruteur.findMany({
      take: params?.limit || 10,
      orderBy: { createdAt: "desc" },
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
    });
  }
}

export const recruteurRepository = new RecruteurRepository();
