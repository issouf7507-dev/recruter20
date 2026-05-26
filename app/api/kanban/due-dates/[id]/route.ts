import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type {
  UpdateCardDueDateData,
  ApiResponse,
} from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/kanban/due-dates/[id] - Update a due date
 */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const { id } = await (ctx as Ctx).params;
  const body = await request.json();
  const {
    dueAt,
    recruteurId,
  }: UpdateCardDueDateData & {
    recruteurId: string;
  } = body;

  if (!dueAt || !recruteurId) {
    return badRequest("Missing required fields");
  }

  const card = await kanbanRepository.updateCardDueDate(
    id,
    new Date(dueAt),
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/due-dates/[id] - Delete a due date
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const { id } = await (ctx as Ctx).params;
  const body = await request.json();
  const { recruteurId }: { recruteurId: string } = body;

  if (!recruteurId) {
    return badRequest("Recruteur ID is required");
  }

  const card = await kanbanRepository.deleteCardDueDate(id, recruteurId);

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
