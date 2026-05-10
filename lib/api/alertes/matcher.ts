import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type { AlerteEmploi, AlerteMotCle } from "./types";

/**
 * Matcher service - Find job offers matching alert criteria
 */
export class AlerteMatcher {
  /**
   * Find all job offers matching an alert
   * Critères obligatoires : titre + typeContrat
   * Critères optionnels : localisation, experience, salaireMin, salaireMax
   */
  async findMatchingOffers(alerte: AlerteEmploi & { alerteMotsCles?: AlerteMotCle[] }) {
    // Construction des conditions de recherche (filtres SQL simples)
    const conditions: Prisma.JobOfferWhereInput = {
      etat: "active", // Seulement les offres actives
      deletedAt: null,
    };

    // OPTIONNEL : Salaire minimum
    if (alerte.salaireMin) {
      conditions.salaryMax = {
        gte: alerte.salaireMin,
      };
    }

    // OPTIONNEL : Salaire maximum
    if (alerte.salaireMax) {
      conditions.salaryMin = {
        lte: alerte.salaireMax,
      };
    }

    // Recherche des offres (large au départ)
    let offres = await prisma.jobOffer.findMany({
      // where: conditions,
      include: {
        recruteur: {
          select: {
            id: true,
            companyName: true,
            logo: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 200, // Limite à 200 pour filtrer ensuite
    });

    // console.log("alerte", alerte);
    // console.log(
    //   "offres filtered",
    //   offres.filter((offre) => offre.title.includes(alerte.titre))
    // );
    // Filtrage côté application (case-insensitive)
    offres = offres.filter((offre) => {
      // OBLIGATOIRE : Titre
      //   if (alerte.titre && alerte.titre !== "") {
      //     const offreTitle = (offre.title || "").toLowerCase();
      //     const alerteTitre = alerte.titre.toLowerCase();
      //     if (!offreTitle.includes(alerteTitre)) {
      //       return false;
      //     }
      //   }

      //   // OBLIGATOIRE : Type de contrat
      //   if (alerte.typeContrat && alerte.typeContrat !== "") {
      //     const offreType = (offre.type || "").toLowerCase();
      //     const alerteType = alerte.typeContrat.toLowerCase();
      //     if (!offreType.includes(alerteType)) {
      //       return false;
      //     }
      //   }

      //   // OPTIONNEL : Localisation
      //   if (alerte.localisation && alerte.localisation !== "") {
      //     const offreLocation = (offre.location || "").toLowerCase();
      //     const alerteLocation = alerte.localisation.toLowerCase();
      //     if (!offreLocation.includes(alerteLocation)) {
      //       return false;
      //     }
      //   }

      //   // OPTIONNEL : Expérience
      //   if (alerte.experience && alerte.experience !== "") {
      //     const offreExperience = (offre.experience || "").toLowerCase();
      //     const alerteExperience = alerte.experience.toLowerCase();
      //     if (!offreExperience.includes(alerteExperience)) {
      //       return false;
      //     }
      //   }

      if (alerte.titre) {
        if (!offre.title.toLowerCase().includes(alerte.titre.toLowerCase())) {
          return false;
        }
      }

      if (alerte.typeContrat) {
        if (
          !offre.type?.toLowerCase().includes(alerte.typeContrat.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });

    // return offres;

    return offres;
  }

  //   console.log("alerte", alerte);
  /**
   * Get the count of matching offers for an alert
   */
  async getMatchingOffersCount(
    alerte: AlerteEmploi & { alerteMotsCles?: AlerteMotCle[] }
  ): Promise<number> {
    const offers = await this.findMatchingOffers(alerte);
    return offers.length;
  }

  /**
   * Update all alerts with their matching offers count
   * Optimisé pour gérer plusieurs alertes en parallèle
   */
  async updateAllAlertsCount(candidatId: string) {
    const alertes = await prisma.alerteEmploi.findMany({
      where: { candidatId, active: true },
      include: { alerteMotsCles: true },
    });

    // Paralléliser les calculs et mises à jour pour de meilleures performances
    await Promise.all(
      alertes.map(async (alerte) => {
        try {
          const count = await this.getMatchingOffersCount(alerte);
          await prisma.alerteEmploi.update({
            where: { id: alerte.id },
            data: {
              nombreResultats: count,
              derniereMiseAJour: new Date(),
            },
          });
        } catch (error) {
          console.error(
            `Erreur lors de la mise à jour de l'alerte ${alerte.id}:`,
            error
          );
          // Continue avec les autres alertes même en cas d'erreur
        }
      })
    );
  }
}

export const alerteMatcher = new AlerteMatcher();
