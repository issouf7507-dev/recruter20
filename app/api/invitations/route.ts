import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound, badRequest } from "@/lib/api-error";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { invitationRepository } from "@/lib/api/invitation/repository";
import { getEffectivePlan } from "@/lib/plans";

const createInvitationSchema = z.object({
  email: z.string().email("Email invalide"),
  role: z.enum(["ADMIN", "USER", "MANAGER", "VIEWER"]),
});

/**
 * GET /api/invitations
 * Récupérer toutes les invitations d'un recruteur
 */
export const GET = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  // Récupérer l'utilisateur complet avec son type
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent voir les invitations");
  }

  // Récupérer le recruteur associé à l'utilisateur
  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruteur) {
    return notFound("Recruteur");
  }

  const invitations = await invitationRepository.findAll(recruteur.id);

  return NextResponse.json({
    success: true,
    data: invitations,
  });
});

/**
 * POST /api/invitations
 * Créer une nouvelle invitation
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  // Récupérer l'utilisateur complet avec son type
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || user.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent créer des invitations");
  }

  // Récupérer le recruteur associé à l'utilisateur
  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruteur) {
    return notFound("Recruteur");
  }

  const body = await request.json();
  const validatedData = createInvitationSchema.parse(body);

  // Vérifier le quota d'utilisateurs du plan (titulaire + collaborateurs + invitations en attente)
  const abonnement = await prisma.abonnement.findUnique({
    where: { recruteurId: recruteur.id },
    select: { plan: true, statut: true },
  });
  const plan = getEffectivePlan(abonnement);

  if (plan.limits.maxUtilisateurs !== null) {
    const [collaborateurs, invitationsEnAttente] = await Promise.all([
      prisma.collaborateur.count({ where: { recruteurId: recruteur.id } }),
      prisma.invitation.count({
        where: { recruteurId: recruteur.id, accepted: false, expiresAt: { gt: new Date() } },
      }),
    ]);
    const utilisateursActuels = 1 + collaborateurs + invitationsEnAttente; // +1 pour le titulaire du compte

    if (utilisateursActuels >= plan.limits.maxUtilisateurs) {
      return forbidden(
        `Limite atteinte : votre plan ${plan.name} autorise au maximum ${plan.limits.maxUtilisateurs} utilisateur(s). Passez à un plan supérieur pour inviter davantage de collaborateurs.`,
      );
    }
  }

  // Créer l'invitation
  const invitation = await invitationRepository.create({
    email: validatedData.email,
    recruteurId: recruteur.id,
    role: validatedData.role,
  });

  return NextResponse.json(
    {
      success: true,
      data: invitation,
      message: "Invitation créée et email envoyé avec succès",
    },
    { status: 201 }
  );
});
