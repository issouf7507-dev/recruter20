import prisma from "@/lib/prisma";
import { Candidat, User } from "./types";

/**
 * Repository for candidates - Database operations
 */
export class CandidatRepository {
  /**
   * Search candidates with filters
   */
  async search(params: {
    page?: number;
    limit?: number;
    search?: string;
    lieu?: string;
    experience?: string; // "junior" | "senior" | "expert"
    competences?: string[];
    certifications?: string[];
    domaine?: string;
    niveauEtude?: string[];
    format?: string;
  }) {
    const {
      page = 1,
      limit = 20,
      search,
      lieu,
      experience,
      competences = [],
      certifications = [],
      domaine,
      niveauEtude = [],
      format,
    } = params;

    const where: any = {};

    // Recherche textuelle : on découpe en mots pour que "NIAMKE Motchian christian"
    // matche un candidat dont nom/prénom contiennent chaque mot (pas la phrase entière).
    if (search) {
      const words = search
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0);
      const searchConditions = words.map((word) => ({
        OR: [
          { nom: { contains: word } },
          { prenom: { contains: word } },
          { bio: { contains: word } },
          {
            candidatCompetences: {
              some: {
                competence: { contains: word },
              },
            },
          },
          {
            experiences: {
              some: {
                OR: [
                  { poste: { contains: word } },
                  { entreprise: { contains: word } },
                ],
              },
            },
          },
        ],
      }));
      // Chaque mot doit matcher dans au moins un champ (AND entre les mots)
      where.AND =
        searchConditions.length > 0
          ? searchConditions
          : [
              {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { bio: { contains: search } },
                  {
                    candidatCompetences: {
                      some: { competence: { contains: search } },
                    },
                  },
                  {
                    experiences: {
                      some: {
                        OR: [
                          { poste: { contains: search } },
                          { entreprise: { contains: search } },
                        ],
                      },
                    },
                  },
                ],
              },
            ];
    }

    // Filtre par lieu (ville ou pays)
    if (lieu && lieu !== "all") {
      where.OR = [
        ...(where.OR || []),
        { ville: { contains: lieu } },
        { pays: { contains: lieu } },
      ];
    }

    // Filtre par compétences
    if (competences.length > 0) {
      where.candidatCompetences = {
        some: {
          competence: {
            in: competences.map((c) => c.toLowerCase()),
          },
        },
      };
    }

    // Filtre par domaine
    if (domaine && domaine !== "all") {
      where.domaine = { contains: domaine };
    }

    // Filtre par certifications
    if (certifications.length > 0) {
      where.certifications = {
        some: {
          nom: {
            in: certifications,
          },
        },
      };
    }

    // Filtre par niveau d'étude
    if (niveauEtude.length > 0) {
      where.niveauEtude = {
        some: {
          nom: {
            in: niveauEtude,
          },
        },
      };
    }

    // Filtre par format de CV (vérifier dans les documents)
    if (format && format !== "all") {
      where.documents = {
        some: {
          documentType: "cv",
          fileType: format.toUpperCase(),
        },
      };
    }

    // Calculer l'expérience totale pour chaque candidat
    // On va filtrer après avoir récupéré les données
    const [candidats, total] = await Promise.all([
      prisma.candidat.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
            },
          },
          candidatCompetences: true,
          certifications: true,
          niveauEtude: true,
          experiences: {
            orderBy: { dateDebut: "desc" },
          },
          formations: {
            orderBy: { dateDebut: "desc" },
            take: 1, // Prendre la formation la plus récente
          },
          documents: {
            where: {
              documentType: "cv",
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      prisma.candidat.count({ where }),
    ]);

    // Calculer l'expérience et filtrer si nécessaire
    // Note: This filtering happens after fetching, which may affect pagination accuracy
    // For better performance, consider calculating experience in the database query
    let filteredCandidats = candidats;

    if (experience && experience !== "all") {
      filteredCandidats = candidats.filter((candidat) => {
        const totalYears = this.calculateTotalExperience(candidat.experiences);
        if (experience === "junior") return totalYears >= 0 && totalYears < 4;
        if (experience === "senior") return totalYears >= 4 && totalYears < 7;
        if (experience === "expert") return totalYears >= 7;
        return true;
      });
    }

    // Recalculate total count after filtering
    // Note: This is approximate since we only have the current page
    const filteredTotal = experience ? filteredCandidats.length : total;

    return {
      items: candidats,
      pagination: {
        page,
        limit,
        total: filteredTotal,
        totalPages: Math.ceil(filteredTotal / limit),
      },
    };
  }

  /**
   * Get distinct values for filter facets (all candidates, not only current page)
   */
  async getFacets(): Promise<{
    lieux: string[];
    competences: string[];
    certifications: string[];
  }> {
    const [villesGroup, paysGroup, competencesGroup, certificationsGroup] =
      await Promise.all([
        prisma.candidat.groupBy({
          by: ["ville"],
          where: { ville: { not: null } },
        }),
        prisma.candidat.groupBy({
          by: ["pays"],
        }),
        prisma.candidatCompetence.groupBy({
          by: ["competence"],
        }),
        prisma.certification.groupBy({
          by: ["nom"],
        }),
      ]);

    const lieuxSet = new Set<string>();
    for (const r of villesGroup) {
      const v = typeof r.ville === "string" ? r.ville.trim() : "";
      if (v) lieuxSet.add(v);
    }
    for (const r of paysGroup) {
      const p = typeof r.pays === "string" ? r.pays.trim() : "";
      if (p) lieuxSet.add(p);
    }

    return {
      lieux: Array.from(lieuxSet).sort(),
      competences: competencesGroup
        .map((c) => (typeof c.competence === "string" ? c.competence.trim() : ""))
        .filter(Boolean)
        .sort(),
      certifications: certificationsGroup
        .map((c) => (typeof c.nom === "string" ? c.nom.trim() : ""))
        .filter(Boolean)
        .sort(),
    };
  }

  /**
   * Calculate total years of experience from experiences
   */
  private calculateTotalExperience(experiences: any[]): number {
    if (!experiences || experiences.length === 0) return 0;

    let totalMonths = 0;
    const now = new Date();

    for (const exp of experiences) {
      const start = new Date(exp.dateDebut);
      const end = exp.dateFin ? new Date(exp.dateFin) : now;

      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      totalMonths += months;
    }

    return Math.floor(totalMonths / 12);
  }

  /**
   * Get candidat by ID
   */
  async findById(id: string) {
    return prisma.candidat.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        candidatCompetences: true,
        certifications: true,
        niveauEtude: true,
        experiences: {
          orderBy: { dateDebut: "desc" },
        },
        formations: {
          orderBy: { dateDebut: "desc" },
        },
        documents: true,
      },
    });
  }

  /**
   * Create a new candidat
   */
  async create(data: {}) {
    return null;
  }

  /**
   * Update a candidat
   */
  async update(id: string, data: Partial<Candidat>) {
    // Extraire les compétences pour les gérer séparément
    const { competences, certifications, niveauxEtude, ...candidatData } = data;
    // console.log("niveauxEtude", data);

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

    // Gérer les certifications si elles sont fournies
    if (certifications !== undefined && certifications !== null) {
      // Supprimer les anciennes certifications
      await prisma.certification.deleteMany({
        where: { candidatId: id },
      });
      // Créer les nouvelles certifications
      if (certifications.length > 0) {
        await prisma.certification.createMany({
          data: certifications.map((certification) => ({
            candidatId: id,
            nom: certification,
          })),
        });
      }
    }

    // Gérer le niveau d'étude si il est fourni
    if (niveauxEtude !== undefined && niveauxEtude !== null) {
      // Supprimer l'ancien niveau d'étude
      await prisma.niveauEtude.deleteMany({
        where: { candidatId: id },
      });
      // Créer le nouveau niveau d'étude
      if (niveauxEtude.length > 0) {
        await prisma.niveauEtude.createMany({
          data: niveauxEtude.map((niveau) => ({
            candidatId: id,
            nom: niveau,
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
        linkedinUrl: candidatData.linkedinUrl ?? undefined,
        domaine: candidatData.domaine ?? undefined,
        portfolioUrl: candidatData.portfolioUrl ?? undefined,
      },
      include: {
        candidatCompetences: true, // Inclure les compétences dans la réponse
        certifications: true, // Inclure les certifications dans la réponse
        niveauEtude: true, // Inclure les niveaux d'étude dans la réponse
      },
    });
  }

  /**
   * Soft delete a candidat
   */
  async delete(id: string) {
    return;
  }
}

export const candidatRepository = new CandidatRepository();
