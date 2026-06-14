import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/geniuspay";

// Next.js App Router lit le body une seule fois — on doit le garder en raw string
// pour vérifier la signature AVANT de le parser en JSON.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");
  const event = req.headers.get("x-webhook-event");

  // 1. Headers obligatoires
  if (!signature || !timestamp || !event) {
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400, detail: "Required header is not present." },
      { status: 400 },
    );
  }

  // 2. Vérification HMAC (timing-safe)
  if (!verifyWebhookSignature(rawBody, signature, timestamp)) {
    console.warn("[Webhook] Signature invalide — event:", event);
    return NextResponse.json(
      { type: "about:blank", title: "Unauthorized", status: 401, detail: "Invalid signature" },
      { status: 401 },
    );
  }

  // 3. Anti-replay : rejet si timestamp > 5 minutes
  const timeDiff = Math.abs(Math.floor(Date.now() / 1000) - parseInt(timestamp, 10));
  if (timeDiff > 300) {
    console.warn("[Webhook] Timestamp trop ancien —", timeDiff, "s");
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400, detail: "Timestamp too old" },
      { status: 400 },
    );
  }

  // 4. Parsing JSON
  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { type: "about:blank", title: "Bad Request", status: 400, detail: "Invalid JSON body" },
      { status: 400 },
    );
  }

  // 5. Dispatch par type d'événement
  try {
    await handleEvent(event, payload);
  } catch (err) {
    console.error("[Webhook] Erreur lors du traitement de l'événement:", event, err);
    // On renvoie 500 → GeniusPay réessaiera automatiquement
    return NextResponse.json(
      { type: "about:blank", title: "Internal Server Error", status: 500, detail: "Failed to process webhook" },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function handleEvent(event: string, payload: any) {
  const data = payload?.data ?? {};
  const reference: string | undefined = data.reference;

  switch (event) {
    case "payment.success":
      await handlePaymentSuccess(reference, data);
      break;

    case "payment.failed":
    case "payment.cancelled":
      await updatePaiementStatut(reference, "ECHOUE");
      break;

    case "payment.expired":
      await updatePaiementStatut(reference, "EXPIRE");
      break;

    case "payment.refunded":
      await updatePaiementStatut(reference, "REMBOURSE");
      break;

    case "webhook.test":
      console.log("[Webhook] Test reçu depuis le dashboard GeniusPay");
      break;

    default:
      console.log("[Webhook] Événement non géré:", event);
  }
}

async function handlePaymentSuccess(reference: string | undefined, data: any) {
  if (!reference) {
    console.warn("[Webhook] payment.success sans référence — ignoré");
    return;
  }

  // Chercher d'abord dans les paiements ATS
  const paiementATS = await prisma.paiementHistory.findUnique({
    where: { reference },
    include: { abonnement: true },
  });

  if (paiementATS) {
    if (paiementATS.statut === "COMPLETE") {
      console.log("[Webhook] Paiement ATS déjà traité:", reference);
      return;
    }

    const recruteurId = paiementATS.abonnement.recruteurId;
    const planEnum = paiementATS.plan;
    const dateDebut = new Date();
    const dateFin = new Date();
    dateFin.setDate(dateFin.getDate() + 30);

    await prisma.$transaction([
      prisma.abonnement.update({
        where: { recruteurId },
        data: { plan: planEnum, statut: "ACTIF", dateDebut, dateFin },
      }),
      prisma.paiementHistory.update({
        where: { reference },
        data: { statut: "COMPLETE", geniuspayData: data },
      }),
    ]);

    console.log(`[Webhook] ✅ ATS ${planEnum} activé — recruteur ${recruteurId}`);
    return;
  }

  // Chercher dans les paiements CVthèque
  const paiementCV = await prisma.paiementCVtheque.findUnique({
    where: { reference },
    include: { abonnement: true },
  });

  if (paiementCV) {
    if (paiementCV.statut === "COMPLETE") {
      console.log("[Webhook] Paiement CVthèque déjà traité:", reference);
      return;
    }

    const recruteurId = paiementCV.abonnement.recruteurId;
    const planEnum = paiementCV.plan;
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
        data: { statut: "COMPLETE", geniuspayData: data },
      }),
    ]);

    console.log(`[Webhook] ✅ CVthèque ${planEnum} activé — recruteur ${recruteurId}`);
    return;
  }

  console.warn("[Webhook] Aucun paiement trouvé pour la référence:", reference);
}

async function updatePaiementStatut(
  reference: string | undefined,
  statut: "ECHOUE" | "EXPIRE" | "REMBOURSE",
) {
  if (!reference) {
    console.warn(`[Webhook] ${statut} sans référence — ignoré`);
    return;
  }

  const [updatedATS, updatedCV] = await Promise.all([
    prisma.paiementHistory.updateMany({
      where: { reference, statut: { not: statut } },
      data: { statut },
    }),
    prisma.paiementCVtheque.updateMany({
      where: { reference, statut: { not: statut } },
      data: { statut },
    }),
  ]);

  if (updatedATS.count + updatedCV.count > 0) {
    console.log(`[Webhook] Paiement ${reference} → ${statut}`);
  }
}
