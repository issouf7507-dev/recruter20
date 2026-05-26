import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * PATCH /api/kanban/checklist/[id] - Update a checklist item
 */
export const PATCH = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const checkItemId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { label, isDone, recruteurId } = body as {
    label?: string;
    isDone?: boolean;
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  const card = await kanbanRepository.updateCheckItem(
    checkItemId,
    { label, isDone },
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});

/**
 * DELETE /api/kanban/checklist/[id] - Delete a checklist item
 */
export const DELETE = withErrorHandler(async (req, ctx) => {
  const request = req as NextRequest;
  await requireSession(request);

  const checkItemId = (await (ctx as Ctx).params).id;

  const body = await request.json();
  const { recruteurId } = body as {
    recruteurId: string;
  };

  if (!recruteurId) {
    return badRequest("recruteurId is required");
  }

  const card = await kanbanRepository.deleteCheckItem(
    checkItemId,
    recruteurId
  );

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
