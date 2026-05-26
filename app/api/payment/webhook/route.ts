import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/geniuspay";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-webhook-signature") || "";
  const timestamp = req.headers.get("x-webhook-timestamp") || "";
  const event = req.headers.get("x-webhook-event") || "";

  // Vérifier la présence des headers obligatoires
  if (!signature || !timestamp || !event) {
    logger.warn("[Webhook] Headers manquants");
    return NextResponse.json(
      { error: "Required header is not present." },
      { status: 400 },
    );
  }

  const rawBody = await req.text();

  // Vérifier la signature HMAC
  const isValid = verifyWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    logger.warn("[Webhook] Signature invalide", { event });
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Protection anti-replay (5 minutes)
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) {
    logger.warn("[Webhook] Timestamp trop ancien", { timestamp });
    return NextResponse.json({ error: "Timestamp too old" }, { status: 400 });
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
    case "payment.cancelled": {
      await updatePaiementStatut(reference, "ECHOUE", data);
      break;
    }
    case "payment.refunded": {
      await updatePaiementStatut(reference, "REMBOURSE", data);
      break;
    }
    case "webhook.test": {
      logger.info("[Webhook] Test reçu — OK");
      break;
    }
    default:
      logger.info("[Webhook] Événement ignoré", { event });
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentSuccess(data: any) {
  const { reference, metadata } = data;
  const recruteurId = metadata?.recruteur_id;
  const planId = metadata?.plan_id as "pro" | "entreprise" | undefined;

  if (!recruteurId || !planId) {
    logger.error("[Webhook] Metadata manquante", { metadata });
    return;
  }

  const planEnum = planId === "pro" ? "PRO" : "ENTREPRISE";

  const dateDebut = new Date();
  const dateFin = new Date();
  dateFin.setDate(dateFin.getDate() + 30);

  // Activer l'abonnement
  await prisma.abonnement.upsert({
    where: { recruteurId },
    update: { plan: planEnum, statut: "ACTIF", dateDebut, dateFin },
    create: { recruteurId, plan: planEnum, statut: "ACTIF", dateDebut, dateFin },
  });

  // Marquer le paiement comme complété
  try {
    await prisma.paiementHistory.update({
      where: { reference },
      data: { statut: "COMPLETE", geniuspayData: data },
    });
  } catch (err) {
    logger.error("[Webhook] PaiementHistory introuvable", { reference, error: String(err) });
  }

  logger.info("[Webhook] Abonnement activé", {
    plan: planEnum,
    recruteurId,
    dateFin: dateFin.toISOString(),
  });
}

async function updatePaiementStatut(
  reference: string,
  statut: "ECHOUE" | "EXPIRE" | "REMBOURSE",
  data: any,
) {
  if (!reference) {
    logger.warn("[Webhook] Référence manquante pour mise à jour statut", { statut });
    return;
  }
  try {
    await prisma.paiementHistory.update({
      where: { reference },
      data: { statut, geniuspayData: data },
    });
    logger.info("[Webhook] Statut paiement mis à jour", { reference, statut });
  } catch (err) {
    logger.error("[Webhook] Impossible de mettre à jour le paiement", {
      reference,
      statut,
      error: String(err),
    });
  }
}
