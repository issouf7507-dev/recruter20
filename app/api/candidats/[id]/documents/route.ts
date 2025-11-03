import { NextRequest, NextResponse } from "next/server";
import { documentService } from "@/lib/api/documents";

/**
 * GET /api/candidats/[id]/documents
 * Récupérer les documents d'un candidat
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const documents = await documentService.getDocumentsByCandidatId(id);

    return NextResponse.json({
      success: true,
      data: documents,
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

