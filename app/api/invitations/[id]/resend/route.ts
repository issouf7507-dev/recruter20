import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, notFound } from "@/lib/api-error";
import { resendInvitationEmail } from "@/lib/api/invitation/service.server";
import prisma from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/invitations/[id]/resend
 * Renvoyer l'email d'invitationaa
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  // Vérifier que l'utilisateur est bien un recruteurss
  if (user?.type !== "RECRUTEUR") {
    return forbidden("Seuls les recruteurs peuvent renvoyer des invitations");
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
    return forbidden("Vous n'avez pas le droit de renvoyer cette invitation");
  }

  await resendInvitationEmail(id);

  return NextResponse.json({
    success: true,
    message: "Email d'invitation renvoyé avec succès",
  });
});
