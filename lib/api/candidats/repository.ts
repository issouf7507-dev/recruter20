import prisma from "@/lib/prisma";
import { Candidat, User } from "./types";

// import type { JobOffer, CreateOfferData } from "./types";÷

/**
 * Repository for job offers - Database operations
 */
export class CandidatRepository {
  /**
   * Get offer by ID
   */
  async findById(id: string) {
    return;
  }

  /**
   * Create a new offer
   */
  async create(data: {}) {
    return null;
  }

  /**
   * Update a candidat
   */
  async update(id: string, data: Partial<Candidat>) {
    // Extraire les compétences pour les gérer séparément
    const { competences, ...candidatData } = data;

    // Gérer les compétences si elles sont fournies
    if (competences !== undefined && competences !== null) {
      // Supprimer les anciennes compétences
      await prisma.candidatCompetence.deleteMany({
        where: { candidatId: id },
      });

      // Créer les nouvelles compétences
      if (competences.length > 0) {
        await prisma.candidatCompetence.createMany({
          data: competences.map((competence) => ({
            candidatId: id,
            competence: competence,
          })),
        });
      }
    }

    // Mettre à jour les données du candidat (sans les compétences)
    return prisma.candidat.update({
      where: { id },
      data: {
        nom: candidatData.nom ?? undefined,
        prenom: candidatData.prenom ?? undefined,
        telephone: candidatData.telephone ?? undefined,
        cv: candidatData.cv ?? undefined,
        letterm: candidatData.letterm ?? undefined,
        bio: candidatData.bio ?? undefined,
        adresse: candidatData.adresse ?? undefined,
        ville: candidatData.ville ?? undefined,
        statut: candidatData.statut ?? undefined,
        pays: candidatData.pays ?? undefined,
        dateNaissance: candidatData.dateNaissance ?? undefined,
        nationalite: candidatData.nationalite ?? undefined,
        situationFamiliale: candidatData.situationFamiliale ?? undefined,
        permisConduire: candidatData.permisConduire ?? undefined,
        image: candidatData.image ?? undefined,
      },
      include: {
        candidatCompetences: true, // Inclure les compétences dans la réponse
      },
    });
  }

  /**
   * Soft delete an offer
   */
  async delete(id: string) {
    return;
  }
}

export const candidatRepository = new CandidatRepository();
