import { experienceRepository } from "./repository";
import type { CreateExperienceData, UpdateExperienceData } from "./types";

/**
 * Service layer for experiences - Business logic
 */
export class ExperienceService {
  /**
   * Get all experiences for a candidate
   */
  async getExperiencesByCandidatId(candidatId: string) {
    return experienceRepository.findByCandidatId(candidatId);
  }

  /**
   * Get experience by ID
   */
  async getExperienceById(id: string) {
    return experienceRepository.findById(id);
  }

  /**
   * Create a new experience
   */
  async createExperience(data: CreateExperienceData) {
    // Validation
    if (!data.candidatId || !data.poste || !data.entreprise || !data.dateDebut) {
      throw new Error(
        "Missing required fields: candidatId, poste, entreprise, dateDebut"
      );
    }

    return experienceRepository.create(data);
  }

  /**
   * Update an experience
   */
  async updateExperience(id: string, data: UpdateExperienceData) {
    const experience = await experienceRepository.findById(id);
    if (!experience) {
      throw new Error("Experience not found");
    }

    return experienceRepository.update(id, data);
  }

  /**
   * Delete an experience
   */
  async deleteExperience(id: string) {
    const experience = await experienceRepository.findById(id);
    if (!experience) {
      throw new Error("Experience not found");
    }

    return experienceRepository.delete(id);
  }

  /**
   * Check if user owns the experience
   */
  async checkOwnership(experienceId: string, userId: string): Promise<boolean> {
    const experience = await experienceRepository.findById(experienceId);
    return experience?.candidat.userId === userId;
  }
}

export const experienceService = new ExperienceService();

