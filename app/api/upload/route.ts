import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, forbidden, badRequest } from "@/lib/api-error";
import { documentService } from "@/lib/api/documents";
import prisma from "@/lib/prisma";

/**
 * POST /api/upload
 * Upload un document avec les métadonnées (après upload EdgeStore côté client)
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

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
    return badRequest(
      "Missing required fields: candidatId, fileName, fileUrl, fileType, fileSize, documentType"
    );
  }

  // Vérifier que le candidat appartient à l'utilisateur connecté
  const candidat = await prisma.candidat.findUnique({
    where: { id: candidatId },
  });

  if (!candidat || candidat.userId !== session.user.id) {
    return forbidden();
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
    { status: 201 }
  );
});
