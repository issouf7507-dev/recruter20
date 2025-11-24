import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateCardAttachmentData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/attachments - Create a new attachment
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
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
  } catch (error: any) {
    console.error("Error creating attachment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create attachment",
      },
      { status: 500 }
    );
  }
}

