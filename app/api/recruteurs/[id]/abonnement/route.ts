import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withErrorHandler } from "@/lib/api-error";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandler(async (_req, ctx) => {
  const { id: recruteurId } = await (ctx as Ctx).params;

  const abonnement = await prisma.abonnement.findUnique({
    where: { recruteurId },
    select: {
      plan: true,
      statut: true,
      dateDebut: true,
      dateFin: true,
    },
  });

  return NextResponse.json({
    success: true,
    data: abonnement ?? { plan: "DECOUVERTE", statut: "INACTIF", dateDebut: null, dateFin: null },
  });
});
