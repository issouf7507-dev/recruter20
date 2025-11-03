import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { formationService } from "@/lib/api/formations";

/**
 * PUT /api/formations/[id]
 * Mettre à jour une formation
 */
export async function PUT(
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
    const body = await request.json();

    // Vérifier que l'utilisateur est propriétaire
    const isOwner = await formationService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Mettre à jour via le service
    const formation = await formationService.updateFormation(id, body);

    return NextResponse.json({
      success: true,
      data: formation,
    });
  } catch (error: any) {
    console.error("Error updating formation:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to update formation" 
      },
      { status: error.message === "Formation not found" ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/formations/[id]
 * Supprimer une formation
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
    const isOwner = await formationService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Supprimer via le service
    await formationService.deleteFormation(id);

    return NextResponse.json({
      success: true,
      message: "Formation deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting formation:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to delete formation" 
      },
      { status: error.message === "Formation not found" ? 404 : 500 }
    );
  }
}

