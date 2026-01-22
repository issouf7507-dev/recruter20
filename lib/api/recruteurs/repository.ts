import { prisma } from "@/lib/prisma";
import { RecruteurInformation, RecruteurInformationEntreprise } from "./types";

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

  /**
   * Update recruteur
   */
  async updateRecruteurInformation(id: string, data: RecruteurInformation) {
    return await prisma.$transaction(async (tx) => {
      const recruteurexist = await tx.recruteur.findUnique({
        where: { id },
      });

      if (!recruteurexist) {
        throw new Error("Recruteur non trouvé");
      }

      const recruteur = await tx.recruteur.update({
        where: { id },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        },
      });

      const user = await tx.user.update({
        where: { id: recruteur.userId },
        data: {
          name: `${data.firstName} ${data.lastName}`,
        },
        include: {
          recruteur: true,
        },
      });

      return { recruteur, user };
    });
  }

  /**
   * Update recruteur information entreprise
   */
  async updateRecruteurInformationEntreprise(
    id: string,
    data: RecruteurInformationEntreprise,
  ) {
    return await prisma.recruteur.update({
      where: { id },
      data: {
        companyName: data.companyName,
        description: data.description,
        industry: data.industry,
        size: data.size,
        location: data.location,
        website: data.website,
      },
    });
  }
}

export const recruteurRepository = new RecruteurRepository();
