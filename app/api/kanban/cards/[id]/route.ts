import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { UpdateKanbanCardData, ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/kanban/cards/[id] - Update a card
 */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const id = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const {
    recruteurId,
    userId,
    ...data
  }: UpdateKanbanCardData & { recruteurId: string; userId?: string } = body;

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  // Use session.user.id as userId if not provided
  const finalUserId = userId || session.user.id;

  const card = await kanbanRepository.updateCard(
    id,
    data,
    recruteurId,
    finalUserId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/cards/[id] - Delete a card
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const { id } = await (ctx as Ctx).params;
  const body = await request.json().catch(() => ({}));
  const { recruteurId } = body as { recruteurId?: string };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  await kanbanRepository.deleteCard(id, recruteurId);

  return NextResponse.json({ success: true });
});
