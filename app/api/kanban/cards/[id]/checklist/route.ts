import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/kanban/cards/[id]/checklist - Create a checklist item
 */
export const POST = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const cardId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { label, recruteurId } = body as {
    label: string;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  if (!label || label.trim().length === 0) {
    return badRequest("label is required");
  }

  const card = await kanbanRepository.createCheckItem(
    cardId,
    label.trim(),
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
