// Route de test uniquement — bloquée en production
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import prisma from "@/lib/prisma";
import type { PlanDefinition } from "@/lib/plans";

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Non disponible en production" }, { status: 403 });
  }

  const session = await requireSession(req);

  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruteur) {
    return NextResponse.json({ error: "Recruteur introuvable" }, { status: 404 });
  }

  const { plan } = (await req.json()) as { plan: PlanDefinition["planType"] };

  const validPlans = ["DECOUVERTE", "PME", "BUSINESS", "CORPORATE"];
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Plan invalide" }, { status: 400 });
  }

  if (plan === "DECOUVERTE") {
    // Réinitialiser à l'état gratuit
    await prisma.abonnement.upsert({
      where: { recruteurId: recruteur.id },
      create: { recruteurId: recruteur.id, plan: "DECOUVERTE", statut: "INACTIF" },
      update: { plan: "DECOUVERTE", statut: "INACTIF", dateDebut: null, dateFin: null },
    });
  } else {
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setFullYear(dateFin.getFullYear() + 10); // 10 ans pour les tests

    await prisma.abonnement.upsert({
      where: { recruteurId: recruteur.id },
      create: { recruteurId: recruteur.id, plan, statut: "ACTIF", dateDebut, dateFin },
      update: { plan, statut: "ACTIF", dateDebut, dateFin },
    });
  }

  return NextResponse.json({ success: true, plan });
}
