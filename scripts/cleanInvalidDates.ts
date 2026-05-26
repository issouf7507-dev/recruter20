/**
 * cleanInvalidDates.ts
 *
 * Nettoie les dates invalides ("0000-00-00", NaN) dans la table Experience.
 * À exécuter UNE SEULE FOIS après migration vers le schéma v2.
 *
 * Usage : npx tsx scripts/cleanInvalidDates.ts
 * Environnement : développement uniquement
 */
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma";

if (process.env.NODE_ENV === "production") {
  console.error("❌ Ne jamais exécuter ce script en production !");
  process.exit(1);
}

async function cleanInvalidDates() {
  const experiences = await prisma.experience.findMany();

  for (const exp of experiences) {
    const updates: Prisma.ExperienceUpdateInput = {};

    if (exp.dateDebut && isNaN(new Date(exp.dateDebut).getTime())) {
      updates.dateDebut = new Date("1970-01-01");
    }

    if (exp.dateFin && isNaN(new Date(exp.dateFin).getTime())) {
      updates.dateFin = null;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.experience.update({ where: { id: exp.id }, data: updates });
      console.log(`Nettoyé l'expérience ${exp.id}`);
    }
  }

  console.log("Nettoyage terminé");
}

cleanInvalidDates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
