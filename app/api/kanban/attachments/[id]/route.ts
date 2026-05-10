import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ApiResponse } from "@/lib/api/kanban/types";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/kanban/attachments/[id] - Delete an attachment
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

  const card = await kanbanRepository.deleteCardAttachment(id, recruteurId);

  const result: ApiResponse<typeof card> = {
    success: true,
    data: card,
  };

  return NextResponse.json(result);
});
