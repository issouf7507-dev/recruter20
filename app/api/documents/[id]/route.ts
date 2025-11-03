import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { documentService } from "@/lib/api/documents";

/**
 * DELETE /api/documents/[id]
 * Supprimer un document
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
    const isOwner = await documentService.checkOwnership(id, session.user.id);
    if (!isOwner) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    // Supprimer via le service
    await documentService.deleteDocument(id);

    return NextResponse.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete document",
      },
      { status: error.message === "Document not found" ? 404 : 500 }
    );
  }
}

