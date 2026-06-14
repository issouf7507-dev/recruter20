import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    await requireSession(req);

    const { reference, forceStatus } = await req.json();
    if (!reference) {
      return NextResponse.json({ success: false, error: "Référence manquante" }, { status: 400 });
    }

    const paiement = await prisma.paiementCVtheque.findUnique({
      where: { reference },
      include: { abonnement: true },
    });

    if (!paiement) {
      return NextResponse.json({ success: false, error: "Paiement CVthèque introuvable" }, { status: 404 });
    }

    if (forceStatus && forceStatus !== "completed") {
      const statutEnum = forceStatus === "expired" ? "EXPIRE" : "ECHOUE";
      await prisma.paiementCVtheque.update({ where: { reference }, data: { statut: statutEnum } });
      return NextResponse.json({ success: true, statut: statutEnum });
    }

    const recruteurId = paiement.abonnement.recruteurId;
    const planEnum = paiement.plan;

    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 30);

    await prisma.$transaction([
      prisma.abonnementCVtheque.update({
        where: { recruteurId },
        data: { plan: planEnum, statut: "ACTIF", dateDebut, dateFin, cvConsultes: 0 },
      }),
      prisma.paiementCVtheque.update({
        where: { reference },
        data: { statut: "COMPLETE" },
      }),
    ]);

    return NextResponse.json({ success: true, plan: planEnum });
  } catch (err) {
    console.error("[CVtheque Activate]", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
