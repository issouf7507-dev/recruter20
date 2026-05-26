import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/kanban/cards/[id]/members - Add members to a card
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { userIds, recruteurId } = body as {
    userIds: string[];
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return badRequest("userIds array is required");
  }

  const card = await kanbanRepository.addCardMembers(
    cardId,
    userIds,
    recruteurId,
    session.user.id
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/cards/[id]/members - Remove a member from a card
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { userId, recruteurId } = body as {
    userId: string;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!userId) {
    return badRequest("userId is required");
  }

  const card = await kanbanRepository.removeCardMember(
    cardId,
    userId,
    recruteurId,
    session.user.id
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
