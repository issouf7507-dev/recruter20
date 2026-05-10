import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound } from "@/lib/api-error";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/invitations/[id]
 * Supprimer une invitation
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Vérifier que l'utilisateur est bien un recruteur
  if (user?.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent supprimer des invitations");
  }

  const { id } = await (ctx as Ctx).params;

  // Récupérer le recruteur associé à l'utilisateur
  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruteur) {
    return notFound("Recruteur");
  }

  // Vérifier que l'invitation appartient au recruteur
  const invitation = await prisma.invitation.findUnique({
    where: { id },
  });

  if (!invitation) {
    return notFound("Invitation");
  }

  if (invitation.recruteurId !== recruteur.id) {
    return forbidden("Vous n'avez pas le droit de supprimer cette invitation");
  }

  await prisma.invitation.delete({
    where: { id },
  });

  return NextResponse.json({
    success: true,
    message: "Invitation supprimée avec succès",
  });
});

/**
 * GET /api/invitations/[id]
 * Récupérer une invitation par ID
 */
export const GET = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const { id } = await (ctx as Ctx).params;

  // Récupérer le recruteur associé à l'utilisateur
  const recruteur = await prisma.recruteur.findUnique({
    where: { userId: session.user.id },
  });

  if (!recruteur) {
    return notFound("Recruteur");
  }

  // Importer dynamiquement pour éviter les erreurs circulaires
  const { invitationRepository } = await import(
    "@/lib/api/invitation/repository"
  );
  const invitation = await invitationRepository.findById(id);

  if (!invitation) {
    return notFound("Invitation");
  }

  if (invitation.recruteurId !== recruteur.id) {
    return forbidden("Vous n'avez pas le droit de voir cette invitation");
  }

  return NextResponse.json({
    success: true,
    data: invitation,
  });
});
