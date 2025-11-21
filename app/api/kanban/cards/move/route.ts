import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { MoveCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/cards/move - Move a card to another column
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const data: MoveCardData & { recruteurId?: string; userId?: string } = body;

    if (!data.cardId || !data.targetColumnId) {
      return NextResponse.json(
        { success: false, error: "cardId and targetColumnId are required" },
        { status: 400 }
      );
    }

    // Use session.user.id as userId if not provided
    const finalUserId = data.userId || session.user.id;

    const card = await kanbanRepository.moveCard(
      data.cardId,
      data.targetColumnId,
      data.newOrder,
      data.recruteurId,
      finalUserId
    );

    const result: ApiResponse<typeof card> = {
      success: true,
      data: card,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error moving card:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to move card",
      },
      { status: 500 }
    );
  }
}

