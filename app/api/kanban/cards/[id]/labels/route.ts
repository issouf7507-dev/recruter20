import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse, KanbanCard } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/kanban/cards/[id]/labels - Add a label to a card
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { labelId, recruteurId } = body as {
    labelId: string;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!labelId) {
    return badRequest("labelId is required");
  }

  const card = await kanbanRepository.addCardLabel(
    cardId,
    labelId,
    recruteurId,
    session.user.id
  );

  const result: ApiResponse<KanbanCard> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/cards/[id]/labels - Remove a label from a card
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { labelId, recruteurId } = body as {
    labelId: string;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!labelId) {
    return badRequest("labelId is required");
  }

  const card = await kanbanRepository.removeCardLabel(
    cardId,
    labelId,
    recruteurId,
    session.user.id
  );

  const result: ApiResponse<KanbanCard> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
