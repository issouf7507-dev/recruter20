import prisma from "@/lib/prisma";

export class ObjectifRepository {
  async findByCandidatId(candidatId: string) {
    const objectifs = await prisma.objectifCarriere.findMany({
      where: { candidatId },
      orderBy: { createdAt: "desc" },
      include: { objectifEtapes: true },
    });
    return objectifs.map((o) => ({
      ...o,
      dateLimite: o.dateLimite.toISOString().split("T")[0],
      etapes: o.objectifEtapes.map((e) => e.etape),
    }));
  }

  async findById(id: string) {
    return prisma.objectifCarriere.findUnique({
      where: { id },
      include: { candidat: { select: { userId: true } }, objectifEtapes: true },
    });
  }

  async create(data: {
    titre: string;
    description: string;
    categorie: string;
    dateLimite: string;
    progression: number;
    candidatId: string;
    etapes?: string[];
  }) {
    const objectif = await prisma.objectifCarriere.create({
      data: {
        titre: data.titre,
        description: data.description,
        categorie: data.categorie,
        dateLimite: new Date(data.dateLimite),
        progression: data.progression ?? 0,
        candidatId: data.candidatId,
        objectifEtapes: data.etapes?.length
          ? { create: data.etapes.map((etape) => ({ etape })) }
          : undefined,
      },
      include: { objectifEtapes: true },
    });
    return { ...objectif, etapes: objectif.objectifEtapes.map((e) => e.etape) };
  }

  async update(id: string, data: {
    titre?: string;
    description?: string;
    categorie?: string;
    dateLimite?: string;
    progression?: number;
    etapes?: string[];
  }) {
    if (data.etapes !== undefined) {
      await prisma.objectifEtape.deleteMany({ where: { objectifId: id } });
    }
    const objectif = await prisma.objectifCarriere.update({
      where: { id },
      data: {
        ...(data.titre && { titre: data.titre }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.categorie !== undefined && { categorie: data.categorie }),
        ...(data.dateLimite && { dateLimite: new Date(data.dateLimite) }),
        ...(data.progression !== undefined && { progression: Math.min(100, Math.max(0, data.progression)) }),
        ...(data.etapes !== undefined && data.etapes.length > 0 && {
          objectifEtapes: { create: data.etapes.map((etape) => ({ etape })) },
        }),
      },
      include: { objectifEtapes: true },
    });
    return { ...objectif, etapes: objectif.objectifEtapes.map((e) => e.etape) };
  }

  async delete(id: string) {
    return prisma.objectifCarriere.delete({ where: { id } });
  }
}

export const objectifRepository = new ObjectifRepository();
