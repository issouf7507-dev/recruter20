import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { alerteService } from "@/lib/api/alertes";

/**
 * PUT /api/alertes/[id]
 * Mettre à jour une alerte
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
    const isOwner = await alerteService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Mettre à jour via le service
    const alerte = await alerteService.updateAlerte(id, body);

    return NextResponse.json({
      success: true,
      data: alerte,
    });
  } catch (error: any) {
    console.error("Error updating alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update alert",
      },
      { status: error.message === "Alert not found" ? 404 : 500 }
    );
  }
}

/**
 * DELETE /api/alertes/[id]
 * Supprimer une alerte
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
    const isOwner = await alerteService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Supprimer via le service
    await alerteService.deleteAlerte(id);

    return NextResponse.json({
      success: true,
      message: "Alert deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting alert:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete alert",
      },
      { status: error.message === "Alert not found" ? 404 : 500 }
    );
  }
}
