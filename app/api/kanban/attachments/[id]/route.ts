import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

/**
 * DELETE /api/kanban/attachments/[id] - Delete an attachment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { recruteurId }: { recruteurId: string } = body;

    if (!recruteurId) {
      return NextResponse.json(
        { success: false, error: "Recruteur ID is required" },
        { status: 400 }
      );
    }

    const card = await kanbanRepository.deleteCardAttachment(id, recruteurId);

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to delete attachment",
      },
      { status: 500 }
    );
  }
}

