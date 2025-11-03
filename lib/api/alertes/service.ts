import { alerteRepository } from "./repository";
import type { CreateAlerteData, UpdateAlerteData } from "./types";

/**
 * Service layer for job alerts - Business logic
 */
export class AlerteService {
  /**
   * Get all alerts for a candidate
   */
  async getAlertesByCandidatId(candidatId: string) {
    return alerteRepository.findByCandidatId(candidatId);
  }

  /**
   * Get alert by ID
   */
  async getAlerteById(id: string) {
    return alerteRepository.findById(id);
  }

  /**
   * Create a new alert
   */
  async createAlerte(data: CreateAlerteData) {
    // Validation
    if (
      !data.candidatId ||
      !data.titre ||
      !data.localisation ||
      !data.frequence
    ) {
      throw new Error(
        "Missing required fields: candidatId, titre, localisation, frequence"
      );
    }

    return alerteRepository.create(data);
  }

  /**
   * Update an alert
   */
  async updateAlerte(id: string, data: UpdateAlerteData) {
    const alerte = await alerteRepository.findById(id);
    if (!alerte) {
      throw new Error("Alert not found");
    }

    return alerteRepository.update(id, data);
  }

  /**
   * Delete an alert
   */
  async deleteAlerte(id: string) {
    const alerte = await alerteRepository.findById(id);
    if (!alerte) {
      throw new Error("Alert not found");
    }

    return alerteRepository.delete(id);
  }

  /**
   * Check if user owns the alert
   */
  async checkOwnership(alerteId: string, userId: string): Promise<boolean> {
    const alerte = await alerteRepository.findById(alerteId);
    return alerte?.candidat.userId === userId;
  }

  /**
   * Toggle alert active status
   */
  async toggleActive(id: string) {
    const alerte = await alerteRepository.findById(id);
    if (!alerte) {
      throw new Error("Alert not found");
    }

    return alerteRepository.update(id, { active: !alerte.active });
  }
}

export const alerteService = new AlerteService();
