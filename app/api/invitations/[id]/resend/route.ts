import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { resendInvitationEmail } from "@/lib/api/invitation/service.server";
import prisma from "@/lib/prisma";

/**
 * POST /api/invitations/[id]/resend
 * Renvoyer l'email d'invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // Vérifier que l'utilisateur est bien un recruteur
    if (user?.type !== "RECRUTEUR") {
      return NextResponse.json(
        {
          success: false,
          error: "Seuls les recruteurs peuvent renvoyer des invitations",
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Récupérer le recruteur associé à l'utilisateur
    const recruteur = await prisma.recruteur.findUnique({
      where: { userId: session.user.id },
    });

    if (!recruteur) {
      return NextResponse.json(
        { success: false, error: "Recruteur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'invitation appartient au recruteur
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation non trouvée" },
        { status: 404 }
      );
    }

    if (invitation.recruteurId !== recruteur.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous n'avez pas le droit de renvoyer cette invitation",
        },
        { status: 403 }
      );
    }

    await resendInvitationEmail(id);

    return NextResponse.json({
      success: true,
      message: "Email d'invitation renvoyé avec succès",
    });
  } catch (error: any) {
    console.error("Error resending invitation email:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to resend invitation email",
      },
      { status: 500 }
    );
  }
}
