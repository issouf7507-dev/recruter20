import prisma from "@/lib/prisma";
import type {
  Experience,
  CreateExperienceData,
  UpdateExperienceData,
} from "./types";

/**
 * Repository for experiences - Database operations
 */
export class ExperienceRepository {
  /**
   * Find all experiences for a candidate
   */
  async findByCandidatId(candidatId: string): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { candidatId },
      orderBy: { dateDebut: "desc" },
    });
  }

  /**
   * Find experience by ID with candidat relation
   */
  async findById(id: string) {
    return prisma.experience.findUnique({
      where: { id },
      include: {
        candidat: true,
      },
    });
  }

  /**
   * Create a new experience
   */
  async create(data: CreateExperienceData): Promise<Experience> {
    return prisma.experience.create({
      data: {
        candidatId: data.candidatId,
        poste: data.poste,
        entreprise: data.entreprise,
        localisation: data.localisation || "",
        typeContrat: data.typeContrat || "",
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        description: data.description || "",
      },
    });
  }

  /**
   * Update an experience
   */
  async update(id: string, data: UpdateExperienceData): Promise<Experience> {
    return prisma.experience.update({
      where: { id },
      data: {
        poste: data.poste,
        entreprise: data.entreprise,
        localisation: data.localisation,
        typeContrat: data.typeContrat,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        description: data.description,
      },
    });
  }

  /**
   * Delete an experience
   */
  async delete(id: string): Promise<void> {
    await prisma.experience.delete({
      where: { id },
    });
  }
}

export const experienceRepository = new ExperienceRepository();
