import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { experienceService } from "@/lib/api/experiences";

/**
 * PUT /api/experiences/[id]
 * Mettre à jour une expérience
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
    const isOwner = await experienceService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Mettre à jour via le service
    const experience = await experienceService.updateExperience(id, body);

    return NextResponse.json({
      success: true,
      data: experience,
    });
  } catch (error: any) {
    console.error("Error updating experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to update experience" 
      },
      { status: error.message === "Experience not found" ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/experiences/[id]
 * Supprimer une expérience
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
    const isOwner = await experienceService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Supprimer via le service
    await experienceService.deleteExperience(id);

    return NextResponse.json({
      success: true,
      message: "Experience deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting experience:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Failed to delete experience" 
      },
      { status: error.message === "Experience not found" ? 404 : 500 }
    );
  }
}

