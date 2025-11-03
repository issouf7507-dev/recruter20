import { formationRepository } from "./repository";
import type { CreateFormationData, UpdateFormationData } from "./types";

/**
 * Service layer for formations - Business logic
 */
export class FormationService {
  /**
   * Get all formations for a candidate
   */
  async getFormationsByCandidatId(candidatId: string) {
    return formationRepository.findByCandidatId(candidatId);
  }

  /**
   * Get formation by ID
   */
  async getFormationById(id: string) {
    return formationRepository.findById(id);
  }

  /**
   * Create a new formation
   */
  async createFormation(data: CreateFormationData) {
    // Validation
    if (!data.candidatId || !data.diplome || !data.etablissement || !data.dateDebut) {
      throw new Error(
        "Missing required fields: candidatId, diplome, etablissement, dateDebut"
      );
    }

    return formationRepository.create(data);
  }

  /**
   * Update a formation
   */
  async updateFormation(id: string, data: UpdateFormationData) {
    const formation = await formationRepository.findById(id);
    if (!formation) {
      throw new Error("Formation not found");
    }

    return formationRepository.update(id, data);
  }

  /**
   * Delete a formation
   */
  async deleteFormation(id: string) {
    const formation = await formationRepository.findById(id);
    if (!formation) {
      throw new Error("Formation not found");
    }

    return formationRepository.delete(id);
  }

  /**
   * Check if user owns the formation
   */
  async checkOwnership(formationId: string, userId: string): Promise<boolean> {
    const formation = await formationRepository.findById(formationId);
    return formation?.candidat.userId === userId;
  }
}

export const formationService = new FormationService();

