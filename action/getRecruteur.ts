"use server";

import prisma from "@/lib/prisma";

export async function getRecruteur(userId: string) {
  return await prisma.recruteur.findUnique({
    where: { userId },
    include: { user: true },
  });
}
