// app/api/payment/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getPayment } from "@/lib/geniuspay";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get("ref");

  if (!reference) {
    return NextResponse.json(
      { success: false, error: "Référence manquante" },
      { status: 400 },
    );
  }

  // 1. Appeler GeniusPay pour avoir le vrai statut
  const result = await getPayment(reference);

  if (!result.success || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 404 },
    );
  }

  const { status, metadata, amount } = result.data;

  console.log(`[Status] ref=${reference} status=${status}`);

  // 2. Mettre à jour la BDD selon le statut GeniusPay
  if (status === "completed") {
    await handleCompleted({
      reference,
      recruteurId: String(metadata?.recruteur_id ?? ""),
      planId: String(metadata?.plan_id ?? ""),
      amount,
      rawData: result.data,
    });
  } else if (
    status === "failed" ||
    status === "expired" ||
    status === "cancelled"
  ) {
    await handleFailed({ reference, status });
  }
  // pending/processing → on ne touche pas la BDD, le client repolle

  return NextResponse.json({
    success: true,
    status, // "completed" | "failed" | "expired" | "pending" | "processing" | null
    amount,
    metadata,
    completed_at: result.data.completed_at,
  });
}

// ─── Paiement réussi ────────────────────────────────────────────────────────

async function handleCompleted({
  reference,
  recruteurId,
  planId,
  amount,
  rawData,
}: {
  reference: string;
  recruteurId: string;
  planId: string;
  amount: number;
  rawData: any;
}) {
  if (!recruteurId || !planId) {
    console.error("[Status] metadata manquante pour", reference);
    return;
  }

  const planEnum = planId === "pro" ? "PRO" : "ENTREPRISE";
  const dateDebut = new Date();
  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + 30);

  try {
    // Upsert abonnement → ACTIF (idempotent)
    const abonnement = await prisma.abonnement.upsert({
      where: { recruteurId },
      update: {
        plan: planEnum,
        statut: "ACTIF",
        dateDebut,
        dateFin,
      },
      create: {
        recruteurId,
        plan: planEnum,
        statut: "ACTIF",
        dateDebut,
        dateFin,
      },
    });

    // Upsert PaiementHistory → COMPLETE (idempotent)
    await prisma.paiementHistory.upsert({
      where: { reference },
      update: {
        statut: "COMPLETE",
        geniuspayData: rawData,
      },
      create: {
        abonnementId: abonnement.id,
        reference,
        montant: amount,
        plan: planEnum,
        statut: "COMPLETE",
        geniuspayData: rawData,
      },
    });

    console.log(
      `[Status] ✅ Abonnement ${planEnum} activé — recruteur ${recruteurId} jusqu'au ${dateFin.toISOString()}`,
    );
  } catch (err) {
    console.error("[Status] Erreur BDD handleCompleted:", err);
  }
}

// ─── Paiement échoué / expiré ────────────────────────────────────────────────

async function handleFailed({
  reference,
  status,
}: {
  reference: string;
  status: string;
}) {
  const statutEnum = status === "expired" ? "EXPIRE" : "ECHOUE";

  try {
    // Mettre à jour PaiementHistory si elle existe
    await prisma.paiementHistory.updateMany({
      where: { reference },
      data: { statut: statutEnum },
    });

    console.log(`[Status] ❌ Paiement ${reference} → ${statutEnum}`);
  } catch (err) {
    console.error("[Status] Erreur BDD handleFailed:", err);
  }
}
