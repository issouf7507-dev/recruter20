import { objectifRepository } from "./repository";

export class ObjectifService {
  async getObjectifsByCandidatId(candidatId: string) {
    return objectifRepository.findByCandidatId(candidatId);
  }

  async getObjectifById(id: string) {
    return objectifRepository.findById(id);
  }

  async createObjectif(data: {
    titre: string;
    description: string;
    categorie: string;
    dateLimite: string;
    progression?: number;
    candidatId: string;
    etapes?: string[];
  }) {
    if (!data.candidatId || !data.titre || !data.dateLimite) {
      throw new Error("Champs obligatoires manquants : candidatId, titre, dateLimite");
    }
    return objectifRepository.create({ ...data, progression: data.progression ?? 0 });
  }

  async updateObjectif(id: string, data: {
    titre?: string;
    description?: string;
    categorie?: string;
    dateLimite?: string;
    progression?: number;
    etapes?: string[];
  }) {
    const existing = await objectifRepository.findById(id);
    if (!existing) throw new Error("Objectif introuvable");
    return objectifRepository.update(id, data);
  }

  async deleteObjectif(id: string) {
    const existing = await objectifRepository.findById(id);
    if (!existing) throw new Error("Objectif introuvable");
    return objectifRepository.delete(id);
  }

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const objectif = await objectifRepository.findById(id);
    return objectif?.candidat?.userId === userId;
  }
}

export const objectifService = new ObjectifService();
