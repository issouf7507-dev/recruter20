"use server";

import { prisma } from "@/lib/prisma";

export async function getCandidat(userId: string) {
  return await prisma.candidat.findUnique({
    where: { userId },
    include: {
      candidatCompetences: true,
      // competencesList: true,
      certifications: true,
      niveauEtude: true,

      user: true,
    },
  });
}
