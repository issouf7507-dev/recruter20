import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/kanban/cards/[id]/notes - Create a note for a card
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  const session = await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { content, recruteurId } = body as {
    content: string;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!content || content.trim().length === 0) {
    return badRequest("content is required");
  }

  const card = await kanbanRepository.createCardNote(
    cardId,
    content.trim(),
    session.user.id,
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
