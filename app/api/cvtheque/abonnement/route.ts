import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound } from "@/lib/api-error";
import prisma from "@/lib/prisma";

export const GET = withErrorHandler(async (req) => {
  const session = await requireSession(req as NextRequest);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent consulter un abonnement CVthèque");
  }

  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });
  if (!recruteur) return notFound("Profil recruteur");

  const abonnement = await prisma.abonnementCVtheque.findUnique({
    where: { recruteurId: recruteur.id },
    select: { plan: true, statut: true, cvConsultes: true, dateDebut: true, dateFin: true },
  });

  return NextResponse.json({
    success: true,
    data: abonnement ?? { plan: null, statut: "INACTIF", cvConsultes: 0, dateDebut: null, dateFin: null },
  });
});
