import prisma from "@/lib/prisma";
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
  }) {
    const { page = 1, limit = 10, recruteurId, search, etat } = params;

    const where: any = {
      deletedAt: null,
    };

    if (recruteurId) {
      where.recruteurId = recruteurId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    if (etat && etat !== "all") {
      where.etat = etat;
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
  }

  /**
   * Get offer by ID
   */
  async findById(id: string) {
    return prisma.jobOffer.findUnique({
      where: { id },
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
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
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
        requirements: data.requirements,
        benefits: data.benefits,
        skills: data.skills,
        recruteurId: data.recruteurId,
        duedate: data.duedate,
        etat: "active",
        salaryCurrency: data.salaryCurrency,
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
        requirements: data.requirements,
        benefits: data.benefits,
        skills: data.skills,
        recruteurId: data.recruteurId,
        duedate: data.duedate,
        etat: data.etat,
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
}

export const jobOfferRepository = new JobOfferRepository();
