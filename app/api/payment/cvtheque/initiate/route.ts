import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound, badRequest } from "@/lib/api-error";
import { initiatePayment } from "@/lib/geniuspay";
import prisma from "@/lib/prisma";
import { getCVthequePlan, type CVthequePlanId } from "@/lib/cvtheque-plans";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  if (user?.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent souscrire à la CVthèque Premium");
  }

  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
    include: { abonnementCVtheque: true },
  });
  if (!recruteur) return notFound("Profil recruteur");

  const body = await request.json();
  const { planId } = body as { planId: CVthequePlanId };
  const plan = getCVthequePlan(planId);

  if (!plan) return badRequest("Plan CVthèque invalide");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const result = await initiatePayment({
    amount: plan.price,
    description: `CVthèque Premium Ylsix — Plan ${plan.name}`,
    customer: {
      name: recruteur.companyName || `${recruteur.firstName} ${recruteur.lastName}`,
      email: recruteur.email,
      phone: recruteur.phone || undefined,
    },
    success_url: `${appUrl}/paiement/succes?type=cvtheque`,
    error_url: `${appUrl}/paiement/echec?type=cvtheque`,
    metadata: {
      recruteur_id: recruteur.id,
      cvtheque_plan_id: planId,
      payment_type: "cvtheque",
      user_id: session.user.id,
    },
  });

  if (!result.success || !result.data) {
    return NextResponse.json(
      { success: false, error: result.error ?? "Service de paiement indisponible. Veuillez réessayer." },
      { status: 503 },
    );
  }

  // Créer ou récupérer l'abonnement CVthèque
  let abonnement = recruteur.abonnementCVtheque;
  if (!abonnement) {
    abonnement = await prisma.abonnementCVtheque.create({
      data: {
        recruteurId: recruteur.id,
        plan: "BASIC",
        statut: "INACTIF",
      },
    });
  }

  await prisma.paiementCVtheque.create({
    data: {
      abonnementId: abonnement.id,
      reference: result.data.reference,
      montant: plan.price,
      plan: plan.planType,
      statut: "EN_ATTENTE",
      geniuspayData: result.data as any,
    },
  });

  return NextResponse.json({
    success: true,
    checkout_url: result.data.checkout_url || result.data.payment_url,
    reference: result.data.reference,
  });
});
