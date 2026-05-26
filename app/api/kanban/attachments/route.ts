import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateCardAttachmentData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/attachments - Create a new attachment
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body = await request.json();
  const {
    cardId,
    url,
    filename,
    fileType,
    fileSize,
    recruteurId,
    uploadedById,
  }: CreateCardAttachmentData = body;

  if (!cardId || !url || !recruteurId || !uploadedById) {
    return badRequest("Missing required fields");
  }

  const card = await kanbanRepository.createCardAttachment(
    cardId,
    {
      url,
      filename,
      fileType,
      fileSize,
      uploadedById,
    },
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
