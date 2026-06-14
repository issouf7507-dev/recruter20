import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/api-auth";
import { withErrorHandler, badRequest } from "@/lib/api-error";
import { kanbanRepository } from "@/lib/api/kanban/repository";
import type { ImportApplicationData, ApiResponse } from "@/lib/api/kanban/types";

export const POST = withErrorHandler(async (req) => {
  const request = req as NextRequest;
  await requireSession(request);

  const body: ImportApplicationData = await request.json();

  if (!body.applicationId || !body.columnId || !body.recruteurId) {
    return badRequest("applicationId, columnId et recruteurId sont requis");
  }

  const card = await kanbanRepository.importApplicationAsCard(
    body.applicationId,
    body.columnId,
    body.recruteurId
  );

  const result: ApiResponse<typeof card> = { success: true, data: card };
  return NextResponse.json(result, { status: 201 });
});
