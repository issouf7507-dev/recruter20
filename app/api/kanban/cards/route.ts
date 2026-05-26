import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { CreateKanbanCardData, ApiResponse } from "@/lib/api/kanban/types";

/**
 * POST /api/kanban/cards - Create a new card
 */
export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const body = await request.json();
  const {
    recruteurId,
    userId,
    ...data
  }: CreateKanbanCardData & { recruteurId: string; userId?: string } = body;

  if (!recruteurId || !data.title || !data.columnId) {
    return badRequest("Missing required fields");
  }

  // Use session.user.id as userId if not provided
  const finalUserId = userId || session.user.id;

  const card = await kanbanRepository.createCard(
    recruteurId,
    data,
    finalUserId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
