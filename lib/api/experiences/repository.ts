import { prisma } from "@/lib/prisma";
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
   * Find all experiences for a candidate with competences
   */
  async findByCandidatId(candidatId: string): Promise<Experience[]> {
    return prisma.experience.findMany({
      where: { candidatId },
      orderBy: { dateDebut: "desc" },
      include: {
        experienceCompetences: true,
      },
    });
  }

  /**
   * Find experience by ID with candidat relation and competences
   */
  async findById(id: string) {
    return prisma.experience.findUnique({
      where: { id },
      include: {
        candidat: true,
        experienceCompetences: true,
      },
    });
  }

  /**
   * Create a new experience with competences
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
        // Créer les compétences associées
        experienceCompetences: data.competences?.length
          ? {
              create: data.competences.map((comp) => ({
                competence: comp,
              })),
            }
          : undefined,
      },
      include: {
        experienceCompetences: true,
      },
    });
  }

  /**
   * Update an experience with competences
   */
  async update(id: string, data: UpdateExperienceData): Promise<Experience> {
    // Si des compétences sont fournies, on les met à jour
    if (data.competences !== undefined) {
      // Supprimer les anciennes compétences
      await prisma.experienceCompetence.deleteMany({
        where: { experienceId: id },
      });

      // Créer les nouvelles compétences
      if (data.competences.length > 0) {
        await prisma.experienceCompetence.createMany({
          data: data.competences.map((comp) => ({
            experienceId: id,
            competence: comp,
          })),
        });
      }
    }

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
      include: {
        experienceCompetences: true,
      },
    });
  }

  /**
   * Delete an experience (competences are deleted via cascade)
   */
  async delete(id: string): Promise<void> {
    await prisma.experience.delete({
      where: { id },
    });
  }
}

export const experienceRepository = new ExperienceRepository();
