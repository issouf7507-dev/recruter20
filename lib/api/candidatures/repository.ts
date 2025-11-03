import prisma from "@/lib/prisma";
import type { Application, CreateApplicationData } from "./types";

/**
 * Repository for applications (candidatures) - Database operations
 */
export class ApplicationRepository {
  /**
   * Find all applications for a candidate
   */
  async findByCandidatId(candidatId: string) {
    return prisma.application.findMany({
      where: {
        candidatId,
        deletedAt: null,
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find application by ID with relations
   */
  async findById(id: string) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        candidat: true,
        jobOffer: true,
      },
    });
  }

  /**
   * Check if candidate already applied to this job offer
   */
  async existsForCandidateAndOffer(
    candidatId: string,
    jobOfferId: string
  ): Promise<boolean> {
    const count = await prisma.application.count({
      where: {
        candidatId,
        jobOfferId,
        deletedAt: null,
      },
    });
    return count > 0;
  }

  /**
   * Create a new application
   */
  async create(data: CreateApplicationData): Promise<Application> {
    return prisma.application.create({
      data: {
        candidatId: data.candidatId,
        jobOfferId: data.jobOfferId,
        status: "EN_ATTENTE", // Statut par défaut
        message: data.message || null,
        cv: data.cv || null,
      },
    });
  }

  /**
   * Update an application
   */
  async update(id: string, data: Partial<Application>) {
    return prisma.application.update({
      where: { id },
      data: {
        status: data.status,
        rating: data.rating,
        message: data.message,
        favorite: data.favorite,
      },
    });
  }

  /**
   * Soft delete an application
   */
  async softDelete(id: string): Promise<void> {
    await prisma.application.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Hard delete an application
   */
  async delete(id: string): Promise<void> {
    await prisma.application.delete({
      where: { id },
    });
  }
}

export const applicationRepository = new ApplicationRepository();
