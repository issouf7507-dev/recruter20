"use server";

import { prisma } from "@/lib/prisma";

export async function getRecruteur(userId: string) {
  const recruteur = await prisma.recruteur.findUnique({
    where: { userId },
    include: { user: true },
  });

  const collaborateur = await prisma.collaborateur.findUnique({
    where: { userId },
    include: { user: true },
  });

  if (collaborateur) {
    return collaborateur;
  }

  return recruteur;
}
