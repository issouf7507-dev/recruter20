import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { documentService } from "@/lib/api/documents";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/upload
 * Upload un document avec les métadonnées (après upload EdgeStore côté client)
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { candidatId, fileName, fileUrl, fileType, fileSize, documentType } =
      body;

    // Validation
    if (
      !candidatId ||
      !fileName ||
      !fileUrl ||
      !fileType ||
      !fileSize ||
      !documentType
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: candidatId, fileName, fileUrl, fileType, fileSize, documentType",
        },
        { status: 400 },
      );
    }

    // Vérifier que le candidat appartient à l'utilisateur connecté
    const candidat = await prisma.candidat.findUnique({
      where: { id: candidatId },
    });

    if (!candidat || candidat.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Créer le document via le service
    const document = await documentService.createDocument({
      candidatId,
      fileName,
      fileUrl,
      fileType,
      fileSize,
      documentType,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          document,
          url: fileUrl,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload document",
      },
      { status: error.message?.includes("Missing required") ? 400 : 500 },
    );
  }
}
