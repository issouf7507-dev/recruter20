import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/geniuspay";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";
// import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-webhook-signature") || "";
  const timestamp = req.headers.get("x-webhook-timestamp") || "";
  const event = req.headers.get("x-webhook-event") || "";

  const rawBody = await req.text();

  // Vérifier la signature
  const isValid = await verifyWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    logger.warn("[Webhook] Signature invalide");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Protection anti-replay (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    return NextResponse.json(
      { error: "Timestamp trop ancien" },
      { status: 400 },
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload invalide" }, { status: 400 });
  }

  const { data } = payload;
  const reference = data?.reference;

  logger.info("[Webhook] Événement reçu", { event, reference });

  switch (event) {
    case "payment.success": {
      await handlePaymentSuccess(data);
      break;
    }
    case "payment.failed": {
      await updatePaiementStatut(reference, "ECHOUE", data);
      break;
    }
    case "payment.expired": {
      await updatePaiementStatut(reference, "EXPIRE", data);
      break;
    }
    default:
      logger.info("[Webhook] Événement ignoré", { event });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(data: any) {
  const { reference, amount, metadata } = data;
  const recruteurId = metadata?.recruteur_id;
  const planId = metadata?.plan_id; // "pro" | "entreprise"

  if (!recruteurId || !planId) {
    logger.error("[Webhook] Metadata manquante", { metadata });
    return;
  }

  const planEnum = planId === "pro" ? "PRO" : "ENTREPRISE";

  // Calculer la date de fin (30 jours)
  const dateDebut = new Date();
  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + 30);

  // Upsert abonnement → ACTIF
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

  // Mettre à jour le PaiementHistory
  await prisma.paiementHistory.update({
    where: { reference },
    data: {
      statut: "COMPLETE",
      geniuspayData: data,
    },
  });

  logger.info("[Webhook] Abonnement activé", { plan: planEnum, recruteurId, dateFin: dateFin.toISOString() });
}

async function updatePaiementStatut(
  reference: string,
  statut: "ECHOUE" | "EXPIRE",
  data: any,
) {
  try {
    await prisma.paiementHistory.update({
      where: { reference },
      data: { statut, geniuspayData: data },
    });
  } catch (err) {
    logger.error("[Webhook] Impossible de mettre à jour le paiement", { reference, error: String(err) });
  }
}
