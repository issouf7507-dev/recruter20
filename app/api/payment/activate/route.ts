// app/api/payment/activate/route.ts
// Route de fallback interne — protégée par session.
// La source de vérité reste le webhook (/api/payment/webhook).
import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Seul un utilisateur authentifié peut déclencher l'activation
    await requireSession(req);

    const { reference, forceStatus } = await req.json();

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Référence manquante" },
        { status: 400 },
      );
    }

    // Récupérer le paiement en BDD (créé lors de /initiate)
    const paiement = await prisma.paiementHistory.findUnique({
      where: { reference },
      include: { abonnement: true },
    });

    if (!paiement) {
      return NextResponse.json(
        { success: false, error: "Paiement introuvable en BDD" },
        { status: 404 },
      );
    }

    // Cas échec/expiration
    if (forceStatus && forceStatus !== "completed") {
      const statutEnum = forceStatus === "expired" ? "EXPIRE" : "ECHOUE";
      await prisma.paiementHistory.update({
        where: { reference },
        data: { statut: statutEnum },
      });
      return NextResponse.json({ success: true, statut: statutEnum });
    }

    // Cas succès → activer l'abonnement
    const recruteurId = paiement.abonnement.recruteurId;
    const planEnum = paiement.plan; // PME | BUSINESS | CORPORATE

    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 30);

    // Mettre à jour abonnement → ACTIF
    await prisma.abonnement.update({
      where: { recruteurId },
      data: {
        plan: planEnum,
        statut: "ACTIF",
        dateDebut,
        dateFin,
      },
    });

    // Mettre à jour paiementHistory → COMPLETE
    await prisma.paiementHistory.update({
      where: { reference },
      data: { statut: "COMPLETE" },
    });

    console.log(
      `[Activate] ✅ Abonnement ${planEnum} activé — recruteur ${recruteurId} jusqu'au ${dateFin.toISOString()}`,
    );

    return NextResponse.json({
      success: true,
      amount: paiement.montant,
      plan: planEnum,
    });
  } catch (err) {
    console.error("[Activate] Erreur:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
