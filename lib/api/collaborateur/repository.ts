import { prisma } from "@/lib/prisma";

/**
 * Repository for recruteurs - Database operations
 */
export class CollaborateurRepository {
  /**
   * Get recruteur by userId
   */
  async findByUserId(userId: string) {
    return prisma.collaborateur.findUnique({
      where: { userId },
      include: {
        user: true,
        recruteur: true,
      },
    });
  }

  /**
   * Get recruteur by ID
   */
  async findById(id: string) {
    return prisma.collaborateur.findUnique({
      where: { id },
      include: {
        user: true,
        recruteur: true,
      },
    });
  }

  /**
   * Get all recruteurs
   */
  async findAll(params?: { limit?: number }) {
    return prisma.collaborateur.findMany({
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

export const collaborateurRepository = new CollaborateurRepository();
