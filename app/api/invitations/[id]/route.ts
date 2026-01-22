import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
// import { deleteInvitation } from "@/lib/api/invitation/service";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/invitations/[id]
 * Supprimer une invitation
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
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
          error: "Seuls les recruteurs peuvent supprimer des invitations",
        },
        { status: 403 },
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
        { status: 404 },
      );
    }

    // Vérifier que l'invitation appartient au recruteur
    const invitation = await prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation non trouvée" },
        { status: 404 },
      );
    }

    if (invitation.recruteurId !== recruteur.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous n'avez pas le droit de supprimer cette invitation",
        },
        { status: 403 },
      );
    }

    // await deleteInvitation(id);
    await prisma.invitation.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Invitation supprimée avec succès",
    });
  } catch (error: any) {
    console.error("Error deleting invitation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete invitation",
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/invitations/[id]
 * Récupérer une invitation par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
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
        { status: 404 },
      );
    }

    // Importer dynamiquement pour éviter les erreurs circulaires
    const { invitationRepository } =
      await import("@/lib/api/invitation/repository");
    const invitation = await invitationRepository.findById(id);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: "Invitation non trouvée" },
        { status: 404 },
      );
    }

    if (invitation.recruteurId !== recruteur.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Vous n'avez pas le droit de voir cette invitation",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: invitation,
    });
  } catch (error: any) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch invitation",
      },
      { status: 500 },
    );
  }
}
