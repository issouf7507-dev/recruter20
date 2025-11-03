import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { applicationService } from "@/lib/api/candidatures";

/**
 * DELETE /api/candidatures/[id]
 * Supprimer (soft delete) une candidature
 */
export async function DELETE(
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

    const { id } = await params;

    // Vérifier que l'utilisateur est propriétaire
    const isOwner = await applicationService.checkOwnership(
      id,
      session.user.id
    );
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Supprimer via le service
    await applicationService.deleteApplication(id);

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete application",
      },
      { status: error.message === "Application not found" ? 404 : 500 }
    );
  }
}

