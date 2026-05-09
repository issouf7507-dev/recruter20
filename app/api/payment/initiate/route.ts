// app/api/payment/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { initiatePayment } from "@/lib/geniuspay";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
// import { prisma } from "@/lib/prisma";

const PLANS = {
  pro: { id: "pro", name: "Pro", amount: 25000 },
  entreprise: { id: "entreprise", name: "Entreprise", amount: 75000 },
} as const;

type PlanId = keyof typeof PLANS;

export async function POST(req: NextRequest) {
  try {
    // 1. Vérifier l'authentification
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session?.user?.id,
      },
    });

    // // 2. Vérifier que c'est bien un RECRUTEUR
    if (user?.type !== "RECRUTEUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Seuls les recruteurs peuvent souscrire à un abonnement",
        },
        { status: 403 },
      );
    }

    // 3. Récupérer le recruteur depuis la BDD
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
      include: { abonnement: true },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, error: "Profil recruteur introuvable" },
        { status: 404 },
      );
    }

    // 4. Valider le plan demandé
    const body = await req.json();
    const { planId } = body as { planId: PlanId };

    if (!planId || !PLANS[planId]) {
      return NextResponse.json(
        { success: false, error: "Plan invalide" },
        { status: 400 },
      );
    }

    const plan = PLANS[planId];
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // 5. Initier le paiement GeniusPay
    const result = await initiatePayment({
      amount: plan.amount,
      description: `Abonnement Ylsix — Plan ${plan.name}`,
      customer: {
        name:
          recruteur.companyName ||
          `${recruteur.firstName} ${recruteur.lastName}`,
        email: recruteur.email,
        phone: recruteur.phone || undefined,
      },
      success_url: `${appUrl}/paiement/succes`,
      error_url: `${appUrl}/paiement/echec`,
      metadata: {
        recruteur_id: recruteur.id,
        plan_id: planId,
        user_id: session.user.id,
      },
    });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 },
      );
    }

    // 6. Créer l'entrée PaiementHistory en "EN_ATTENTE"
    let abonnement = recruteur.abonnement;
    if (!abonnement) {
      abonnement = await prisma.abonnement.create({
        data: {
          recruteurId: recruteur.id,
          plan: "STARTER",
          statut: "INACTIF",
        },
      });
    }

    

    await prisma.paiementHistory.create({
      data: {
        abonnementId: abonnement.id,
        reference: result.data.reference,
        montant: plan.amount,
        plan: planId === "pro" ? "PRO" : "ENTREPRISE",
        statut: "EN_ATTENTE",
        geniuspayData: result.data as any,
      },
    });

    return NextResponse.json({
      success: true,
      checkout_url: result.data.checkout_url || result.data.payment_url,
      reference: result.data.reference,
    });
  } catch (err) {
    console.error("[API /payment/initiate]", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
