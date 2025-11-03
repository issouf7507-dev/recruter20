import prisma from "@/lib/prisma";
import type { AlerteEmploi, CreateAlerteData, UpdateAlerteData } from "./types";

/**
 * Repository for job alerts - Database operations
 */
export class AlerteRepository {
  /**
   * Find all alerts for a candidate
   */
  async findByCandidatId(candidatId: string) {
    return prisma.alerteEmploi.findMany({
      where: { candidatId },
      include: {
        alerteMotsCles: {
          select: {
            id: true,
            motCle: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find alert by ID with relations
   */
  async findById(id: string) {
    return prisma.alerteEmploi.findUnique({
      where: { id },
      include: {
        candidat: true,
        alerteMotsCles: true,
      },
    });
  }

  /**
   * Create a new alert
   */
  async create(data: CreateAlerteData): Promise<AlerteEmploi> {
    const { motsCles, ...alerteData } = data;

    const alerte = await prisma.alerteEmploi.create({
      data: {
        candidatId: data.candidatId,
        titre: data.titre,
        localisation: data.localisation,
        typeContrat: data.typeContrat,
        salaireMin: data.salaireMin || null,
        salaireMax: data.salaireMax || null,
        experience: data.experience,
        frequence: data.frequence,
        active: data.active ?? true,
        nombreResultats: 0,
      },
    });

    // Ajouter les mots-clés si fournis
    if (motsCles && motsCles.length > 0) {
      await prisma.alerteMotCle.createMany({
        data: motsCles.map((motCle) => ({
          alerteId: alerte.id,
          motCle,
        })),
      });
    }

    return alerte;
  }

  /**
   * Update an alert
   */
  async update(id: string, data: UpdateAlerteData): Promise<AlerteEmploi> {
    const { motsCles, ...alerteData } = data;

    // Mettre à jour les mots-clés si fournis
    if (motsCles !== undefined) {
      // Supprimer les anciens mots-clés
      await prisma.alerteMotCle.deleteMany({
        where: { alerteId: id },
      });

      // Créer les nouveaux mots-clés
      if (motsCles.length > 0) {
        await prisma.alerteMotCle.createMany({
          data: motsCles.map((motCle) => ({
            alerteId: id,
            motCle,
          })),
        });
      }
    }

    // Mettre à jour l'alerte
    return prisma.alerteEmploi.update({
      where: { id },
      data: {
        titre: alerteData.titre,
        localisation: alerteData.localisation,
        typeContrat: alerteData.typeContrat,
        salaireMin: alerteData.salaireMin ?? undefined,
        salaireMax: alerteData.salaireMax ?? undefined,
        experience: alerteData.experience,
        frequence: alerteData.frequence,
        active: alerteData.active,
        derniereMiseAJour: new Date(),
      },
    });
  }

  /**
   * Delete an alert
   */
  async delete(id: string): Promise<void> {
    await prisma.alerteEmploi.delete({
      where: { id },
    });
  }

  /**
   * Update last check date
   */
  async updateLastCheck(id: string, nombreResultats: number) {
    return prisma.alerteEmploi.update({
      where: { id },
      data: {
        derniereMiseAJour: new Date(),
        nombreResultats,
      },
    });
  }
}

export const alerteRepository = new AlerteRepository();
