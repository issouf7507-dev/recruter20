import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateCardDueDateData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/due-dates - Create a new due date
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body = await request.json();
  const { cardId, dueAt, recruteurId }: CreateCardDueDateData = body;

  if (!cardId || !dueAt || !recruteurId) {
    return badRequest("Missing required fields");
  }

  const card = await kanbanRepository.createCardDueDate(
    cardId,
    new Date(dueAt),
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
