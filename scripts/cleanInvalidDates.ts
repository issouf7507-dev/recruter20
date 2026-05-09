// scripts/cleanInvalidDates.ts
// import { PrismaClient } from '@prisma/client'

import prisma from "@/lib/prisma";

// const prisma = new PrismaClient()

async function cleanInvalidDates() {
  const experiences = await prisma.experience.findMany();

  for (const exp of experiences) {
    const updates: any = {};

    if (exp.dateDebut) {
      const startDate = new Date(exp.dateDebut);
      if (isNaN(startDate.getTime())) {
        updates.dateDebut = null;
      }
    }

    if (exp.dateFin) {
      const endDate = new Date(exp.dateFin);
      if (isNaN(endDate.getTime())) {
        updates.dateFin = null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await prisma.experience.update({
        where: { id: exp.id },
        data: updates,
      });
      console.log(`Nettoyé l'expérience ${exp.id}`);
    }
  }

  console.log("Nettoyage terminé");
}

cleanInvalidDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
