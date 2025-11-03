import { applicationRepository } from "./repository";
import type { CreateApplicationData, UpdateApplicationData } from "./types";

/**
 * Service layer for applications - Business logic
 */
export class ApplicationService {
  /**
   * Get all applications for a candidate
   */
  async getApplicationsByCandidatId(candidatId: string) {
    return applicationRepository.findByCandidatId(candidatId);
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: string) {
    return applicationRepository.findById(id);
  }

  /**
   * Create a new application (postulation)
   */
  async createApplication(data: CreateApplicationData) {
    // Validation
    if (!data.candidatId || !data.jobOfferId) {
      throw new Error("Missing required fields: candidatId, jobOfferId");
    }

    // Vérifier si le candidat a déjà postulé
    const alreadyApplied =
      await applicationRepository.existsForCandidateAndOffer(
        data.candidatId,
        data.jobOfferId
      );

    if (alreadyApplied) {
      throw new Error("You have already applied to this job offer");
    }

    // Créer l'application avec statut par défaut "EN_ATTENTE"
    return applicationRepository.create(data);
  }

  /**
   * Update an application
   */
  async updateApplication(id: string, data: UpdateApplicationData) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new Error("Application not found");
    }

    return applicationRepository.update(id, data);
  }

  /**
   * Delete an application
   */
  async deleteApplication(id: string) {
    const application = await applicationRepository.findById(id);
    if (!application) {
      throw new Error("Application not found");
    }

    return applicationRepository.softDelete(id);
  }

  /**
   * Check if user owns the application
   */
  async checkOwnership(
    applicationId: string,
    userId: string
  ): Promise<boolean> {
    const application = await applicationRepository.findById(applicationId);
    return application?.candidat.userId === userId;
  }
}

export const applicationService = new ApplicationService();
