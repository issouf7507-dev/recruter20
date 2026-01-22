import { prisma } from "@/lib/prisma";
import type {
  Formation,
  CreateFormationData,
  UpdateFormationData,
} from "./types";

/**
 * Repository for formations - Database operations
 */
export class FormationRepository {
  /**
   * Find all formations for a candidate
   */
  async findByCandidatId(candidatId: string): Promise<Formation[]> {
    return prisma.formation.findMany({
      where: { candidatId },
      orderBy: { dateDebut: "desc" },
    });
  }

  /**
   * Find formation by ID with candidat relation
   */
  async findById(id: string) {
    return prisma.formation.findUnique({
      where: { id },
      include: {
        candidat: true,
      },
    });
  }

  /**
   * Create a new formation
   */
  async create(data: CreateFormationData): Promise<Formation> {
    return prisma.formation.create({
      data: {
        candidatId: data.candidatId,
        diplome: data.diplome,
        etablissement: data.etablissement,
        domaine: data.domaine || "",
        dateDebut: new Date(data.dateDebut),
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        description: data.description || "",
      },
    });
  }

  /**
   * Update a formation
   */
  async update(id: string, data: UpdateFormationData): Promise<Formation> {
    return prisma.formation.update({
      where: { id },
      data: {
        diplome: data.diplome,
        etablissement: data.etablissement,
        domaine: data.domaine,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
        dateFin: data.dateFin ? new Date(data.dateFin) : null,
        description: data.description,
      },
    });
  }

  /**
   * Delete a formation
   */
  async delete(id: string): Promise<void> {
    await prisma.formation.delete({
      where: { id },
    });
  }
}

export const formationRepository = new FormationRepository();
