import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { MoveCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * PATCH /api/kanban/cards/move - Move a card to another column
 */
export const PATCH = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const body = await request.json();
  const data: MoveCardData & { recruteurId?: string; userId?: string } = body;

  if (!data.cardId || !data.targetColumnId) {
    return badRequest("cardId and targetColumnId are required");
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
});
