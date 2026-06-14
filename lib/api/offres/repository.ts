import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";
import type { JobOffer, CreateOfferData } from "./types";

/**
 * Repository for job offers - Database operations
 */
export class JobOfferRepository {
  /**
   * Get all offers with pagination
   */
  async findAll(params: {
    page?: number;
    limit?: number;
    recruteurId?: string;
    search?: string;
    etat?: string;
    location?: string;
    types?: string[];
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency?: string;
    datePosted?: string;
    experience?: string[];
    experienceMin?: number;
    experienceMax?: number;
  }) {
    const {
      page = 1,
      limit = 10,
      recruteurId,
      search,
      etat,
      location,
      types,
      salaryMin,
      salaryMax,
      salaryCurrency,
      datePosted,
      experience,
      experienceMin,
      experienceMax,
    } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
    };

    if (recruteurId) {
      where.recruteurId = recruteurId;
    }

    if (search) {
      where.title = { contains: search };
    }

    if (etat && etat !== "all") {
      if (etat === "expiree") {
        // Une offre est "expirée" si elle est explicitement marquée comme telle,
        // ou si elle est active mais que sa date limite est dépassée.
        where.OR = [
          { etat: "expiree" },
          { etat: "active", duedate: { lt: new Date() } },
        ];
      } else {
        where.etat = etat;
      }
    }

    // Filtre par localisation
    if (location) {
      where.location = { contains: location };
    }

    // Filtre par types de contrat
    if (types && types.length > 0) {
      where.type = { in: types.map((t) => t.toLowerCase()) };
    }

    // Filtre par salaire
    if (salaryMin !== undefined || salaryMax !== undefined) {
      if (salaryMin !== undefined && salaryMax !== undefined) {
        // Fourchette de salaire : l'offre doit chevaucher avec la fourchette demandée
        // L'offre est incluse si sa fourchette chevauche la fourchette demandée
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            // Cas 1: La fourchette de l'offre est complètement dans la fourchette demandée
            {
              AND: [
                { salaryMin: { gte: salaryMin } },
                { salaryMax: { lte: salaryMax } },
              ],
            },
            // Cas 2: La fourchette de l'offre chevauche par le haut
            {
              AND: [
                { salaryMin: { lte: salaryMax } },
                { salaryMax: { gte: salaryMin } },
                { salaryMin: { lt: salaryMin } },
              ],
            },
            // Cas 3: La fourchette de l'offre chevauche par le bas
            {
              AND: [
                { salaryMin: { lte: salaryMax } },
                { salaryMax: { gte: salaryMin } },
                { salaryMax: { gt: salaryMax } },
              ],
            },
            // Cas 4: La fourchette de l'offre contient la fourchette demandée
            {
              AND: [
                { salaryMin: { lte: salaryMin } },
                { salaryMax: { gte: salaryMax } },
              ],
            },
          ],
        });
      } else if (salaryMin !== undefined) {
        // Salaire minimum : l'offre doit avoir un salaire max >= salaryMin
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { salaryMax: { gte: salaryMin } },
            { AND: [{ salaryMin: { gte: salaryMin } }, { salaryMax: null }] },
          ],
        });
      } else if (salaryMax !== undefined) {
        // Salaire maximum : l'offre doit avoir un salaire min <= salaryMax
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { salaryMin: { lte: salaryMax } },
            { AND: [{ salaryMax: { lte: salaryMax } }, { salaryMin: null }] },
          ],
        });
      }
    }

    // Filtre par devise
    if (salaryCurrency) {
      where.salaryCurrency = salaryCurrency;
    }

    // Filtre par date de publication
    if (datePosted && datePosted !== "N'importe quand") {
      const now = new Date();
      let startDate: Date;

      switch (datePosted) {
        case "Aujourd'hui": {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startDate = today;
          break;
        }
        case "3 jours":
          startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "1 semaine":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1 mois":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // Toutes les dates
      }

      if (startDate && startDate.getTime() !== new Date(0).getTime()) {
        where.createdAt = { gte: startDate };
      }
    }

    // Filtre par expérience (champ experience)
    if (experience && experience.length > 0) {
      where.experience = { in: experience };
    }

    // Filtre par années d'expérience (anneesexperience)
    if (experienceMin !== undefined || experienceMax !== undefined) {
      where.AND = where.AND || [];

      if (experienceMin !== undefined && experienceMax !== undefined) {
        // Trouver les offres dont l'expérience requise est dans la plage
        where.AND.push({
          OR: [
            {
              AND: [
                { anneesexperience: { not: null } },
                { anneesexperience: { gte: experienceMin.toString() } },
                { anneesexperience: { lte: experienceMax.toString() } },
              ],
            },
          ],
        });
      } else if (experienceMin !== undefined) {
        // Expérience minimum uniquement
        where.AND.push({
          OR: [
            { anneesexperience: { gte: experienceMin.toString() } },
            { anneesexperience: null },
          ],
        });
      } else if (experienceMax !== undefined) {
        // Expérience maximum uniquement
        where.AND.push({
          OR: [
            { anneesexperience: { lte: experienceMax.toString() } },
            { anneesexperience: null },
          ],
        });
      }
    }

    const [offres, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          recruteur: {
            select: {
              id: true,
              companyName: true,
            },
          },
          applications: {
            include: {
              candidat: {
                include: {
                  user: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    const offresAll = await prisma.jobOffer.findMany({
      where: { recruteurId: recruteurId },
      include: {
        applications: true,
      },
    });
    // const totalAll = offresAll.length;

    return {
      items: offres,
      totalAll: offresAll,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get offer by ID
   */
  async findById(
    id: string,
    params: {
      page?: number;
      limit?: number;
      recruteurId?: string;
      search?: string;
      etat?: string;
      location?: string;
      types?: string[];
      salaryMin?: number;
      salaryMax?: number;
      salaryCurrency?: string;
      datePosted?: string;
      experience?: string[];
    }
  ) {
    const {
      page = 1,
      limit = 10,
      recruteurId,
      search,
      etat,
      location,
      types,
      salaryMin,
      salaryMax,
      salaryCurrency,
      datePosted,
      experience,
    } = params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      deletedAt: null,
    };

    if (recruteurId) {
      where.recruteurId = recruteurId;
    }

    if (search) {
      where.title = { contains: search };
    }

    if (etat && etat !== "all") {
      where.etat = etat;
    }

    // Filtre par localisation
    if (location) {
      where.location = { contains: location };
    }

    // Filtre par types de contrat
    if (types && types.length > 0) {
      where.type = { in: types.map((t) => t.toLowerCase()) };
    }

    // Filtre par salaire
    if (salaryMin !== undefined || salaryMax !== undefined) {
      if (salaryMin !== undefined && salaryMax !== undefined) {
        // Fourchette de salaire : l'offre doit chevaucher avec la fourchette demandée
        // L'offre est incluse si sa fourchette chevauche la fourchette demandée
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            // Cas 1: La fourchette de l'offre est complètement dans la fourchette demandée
            {
              AND: [
                { salaryMin: { gte: salaryMin } },
                { salaryMax: { lte: salaryMax } },
              ],
            },
            // Cas 2: La fourchette de l'offre chevauche par le haut
            {
              AND: [
                { salaryMin: { lte: salaryMax } },
                { salaryMax: { gte: salaryMin } },
                { salaryMin: { lt: salaryMin } },
              ],
            },
            // Cas 3: La fourchette de l'offre chevauche par le bas
            {
              AND: [
                { salaryMin: { lte: salaryMax } },
                { salaryMax: { gte: salaryMin } },
                { salaryMax: { gt: salaryMax } },
              ],
            },
            // Cas 4: La fourchette de l'offre contient la fourchette demandée
            {
              AND: [
                { salaryMin: { lte: salaryMin } },
                { salaryMax: { gte: salaryMax } },
              ],
            },
          ],
        });
      } else if (salaryMin !== undefined) {
        // Salaire minimum : l'offre doit avoir un salaire max >= salaryMin
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { salaryMax: { gte: salaryMin } },
            { AND: [{ salaryMin: { gte: salaryMin } }, { salaryMax: null }] },
          ],
        });
      } else if (salaryMax !== undefined) {
        // Salaire maximum : l'offre doit avoir un salaire min <= salaryMax
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { salaryMin: { lte: salaryMax } },
            { AND: [{ salaryMax: { lte: salaryMax } }, { salaryMin: null }] },
          ],
        });
      }
    }

    // Filtre par devise
    if (salaryCurrency) {
      where.salaryCurrency = salaryCurrency;
    }

    // Filtre par date de publication
    if (datePosted && datePosted !== "N'importe quand") {
      const now = new Date();
      let startDate: Date;

      switch (datePosted) {
        case "Aujourd'hui": {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startDate = today;
          break;
        }
        case "3 jours":
          startDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
          break;
        case "1 semaine":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "1 mois":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // Toutes les dates
      }

      if (startDate && startDate.getTime() !== new Date(0).getTime()) {
        where.createdAt = { gte: startDate };
      }
    }

    // Filtre par expérience
    if (experience && experience.length > 0) {
      where.experience = { in: experience };
    }

    where.id = id;

    const [offres, total] = await Promise.all([
      prisma.jobOffer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          recruteur: {
            select: {
              id: true,
              companyName: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobOffer.count({ where }),
    ]);

    return {
      items: offres,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // return prisma.jobOffer.findUnique({
    //   where: { id },
    //   include: {
    //     recruteur: {
    //       select: {
    //         id: true,
    //         companyName: true,
    //       },
    //     },
    //     applications: {
    //       include: {
    //         candidat: {
    //           include: {
    //             user: {
    //               select: {
    //                 id: true,
    //                 email: true,
    //                 name: true,
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    // });
  }

  /**
   * Create a new offer
   */
  async create(data: {
    title: string;
    company?: string;
    location?: string;
    type?: string;
    salaryMin?: number;
    salaryMax?: number;
    description?: string;
    requirements?: string;
    benefits?: string;
    skills?: string;
    recruteurId: string;
    duedate?: Date;
    salaryCurrency: string;
    logo?: string;
    etat?: "active" | "brouillon";
  }) {
    return prisma.jobOffer.create({
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        description: data.description,
        // requirements: data.requirements,
        // benefits: data.benefits,
        // skills: data.skills,
        recruteurId: data.recruteurId,
        duedate: data.duedate,
        etat: data.etat || "active",
        salaryCurrency: data.salaryCurrency,
        logo: data.logo,
      },
    });
  }

  /**
   * Update an offer
   */
  async update(id: string, data: Partial<JobOffer>) {
    return prisma.jobOffer.update({
      where: { id },
      data: {
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        description: data.description,
        // requirements: data.requirements,
        // benefits: data.benefits,
        // skills: data.skills,
        recruteurId: data.recruteurId,
        duedate: data.duedate,
        etat: data.etat,
        logo: data.logo,
      },
    });
  }

  /**
   * Soft delete an offer
   */
  async delete(id: string) {
    return prisma.jobOffer.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        etat: "deleted",
      },
    });
  }

  async incrementViews(id: string) {
    return prisma.jobOffer.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async findWithApplications(id: string) {
    return prisma.jobOffer.findUnique({
      where: { id },
      include: {
        recruteur: true,
        applications: {
          include: {
            candidat: {
              include: {
                user: { select: { id: true, email: true, name: true } },
              },
            },
          },
        },
      },
    });
  }
}

export const jobOfferRepository = new JobOfferRepository();
